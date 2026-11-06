# Infrastructure

Terraform for AWS. Run every command from the repository root through `make`: Terraform and the AWS CLI run in the `terraform` and `aws` containers of `docker-compose.yml`, which read AWS credentials from the environment (`AWS_ACCESS_KEY_ID`, ...) or from `~/.aws` (`AWS_PROFILE`).

## Layout

- `bootstrap/` creates the S3 bucket that holds the Terraform state. Its first apply uses local state, because the bucket cannot hold its own state before it exists; the same `make` run then moves that state into the bucket (`bootstrap-migrate-state`, once), so no state file has to be kept by hand. The bucket is named `<project>-tfstate-<account id>`, and `make` works the name out from your AWS credentials (`TF_STATE_BUCKET=` overrides it).
- `modules/` are reusable pieces (`network`, `rds`, `ecr`, `iam`, `alb`, `backend-cdn`, `frontend-static`, `ecs-backend`, `ecs-migrations`, `monitoring`, `github-oidc`). They are never applied on their own.
- `environments/prod/` is the root module that wires the modules together, with its state in the bucket.

What runs: the frontend is a private S3 bucket behind CloudFront. The backend is a Fargate service behind an ALB; the ALB only accepts CloudFront's addresses, and a second CloudFront distribution puts HTTPS in front of it, since there is no domain. The database is RDS PostgreSQL in private subnets. Migrations are a one-shot ECS task. CloudWatch alarms notify `alert_email`, when set.

## Create everything

```bash
make infra-apply      # one confirmation, at the end
```

That one command:

1. Creates the state bucket and moves the bootstrap state into it (first time only; no prompt).
2. Connects the prod root to that bucket.
3. Creates the ECR repository.
4. Builds the backend image and pushes it, only while the repository is empty: the ECS service cannot start without an image. From then on CI owns the images.
5. Shows the plan for everything else and applies it after you answer `yes`. RDS and CloudFront make it take 10 to 20 minutes.

It needs AWS credentials with enough permissions, Docker running, and an `origin` remote in git: the deploy role trusts the GitHub repository that `make` reads from it. `terraform.tfvars` is optional (copy `environments/prod/terraform.tfvars.example`):

- `alert_email`: who receives the CloudWatch alarms. Empty means nobody; AWS sends a confirmation link to click.
- `create_github_oidc_provider = false`: when the account already has GitHub's identity provider (only one is allowed).
- `github_repo`: only when it is not the `origin` remote.

Then:

```bash
make gh-vars          # prints the GitHub repository variables
```

1. Set the printed values as repository variables (Settings > Secrets and variables > Actions > Variables).
2. Publish the first release: push to `main`, or run the Deploy workflow by hand. It runs the migrations and publishes the frontend; until then the backend is up on an empty database and the frontend bucket is empty.
3. Commit the `infrastructure/bootstrap/backend.tf` that the first run wrote, so a fresh clone finds the state in the bucket. The local `bootstrap/terraform.tfstate` left behind can be deleted.

Running `make infra-apply` again later is safe: it re-applies bootstrap (no changes), skips the image, and applies whatever changed.

## Deploying

A push to `main` runs `.github/workflows/ci.yml`; when its three checks pass, the `deploy` job calls `.github/workflows/deploy.yml`. Every deploy step is written inline in that file:

1. Builds the backend image and pushes it as the commit SHA. A tag that already exists is not pushed again.
2. Registers a task definition revision with the new image for the migrations task and for the backend.
3. Runs the migrations task to completion. A failure stops the deploy here, before the service is touched.
4. Moves the backend service to the new revision, waits until it is stable and checks that ECS did not roll it back.
5. Calls `/health` through the API's CloudFront address.
6. Builds the static frontend with `VITE_API_BASE_URL`, syncs it to S3 and invalidates CloudFront.

Terraform is not part of that. Infrastructure changes are applied by hand:

```bash
make infra-plan
make infra-apply
```

Because CI registers its own task definition revisions, the task definitions ignore later changes to `container_definitions` and the service ignores `task_definition` (`lifecycle { ignore_changes }` in `modules/ecs-backend` and `modules/ecs-migrations`). To change environment variables, secrets, cpu or memory of a task: drop the block, run `make infra-apply IMAGE_TAG=<the running tag>`, put the block back. Find the running tag with:

```bash
docker compose run --rm aws ecs describe-task-definition --task-definition bmi-tracker-backend \
  --query 'taskDefinition.containerDefinitions[0].image'
```

Migrations run while the previous tasks still serve traffic, so each one has to work with the old code too: add a column before the code uses it, drop it in a later release.

## Rolling back

Revert the commit on `main`: the push deploys the previous code. Migrations are not reverted: undo one with a new migration.

## Security notes

- The deploy role (`modules/github-oidc`) trusts only workflow runs on `github_branch` of `github_repo` (newer repositories carry the immutable owner and repository ids in the token subject, `repo:owner@123/name@456:...`, so the policy accepts both forms), and can only push to the backend repository, run the migrations task, update the backend service and publish the frontend. The deploy job must not declare a GitHub `environment`: that changes the token subject and the role would refuse it.
- The ALB security group accepts only CloudFront's managed prefix list, so the API cannot be reached over plain HTTP from anywhere else.
- Tasks run in public subnets with a public IP, to pull images and read secrets without a NAT gateway; their security group only accepts the ALB. The database accepts only the tasks.
- The database has `deletion_protection` on. To destroy it: set `db_deletion_protection = false`, apply, then `make infra-destroy`. The ECR repository and the frontend bucket are emptied on destroy; the state bucket has `prevent_destroy`.
- Branch protection is not in the repository: require the `backend`, `frontend` and `infra` checks on `main` in the GitHub settings.
