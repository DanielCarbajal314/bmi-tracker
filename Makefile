COMPOSE := docker compose

# Deployment settings, shared with the tool containers through the environment.
AWS_REGION ?= us-east-1
PROJECT ?= bmi-tracker
IMAGE_TAG ?= $(shell git rev-parse HEAD 2>/dev/null || echo local)
# owner/repo of GitHub, read from the origin remote. The deploy role trusts that repository.
GITHUB_REPO ?= $(shell git remote get-url origin 2>/dev/null | sed -E 's|\.git$$||; s|^.*[:/]([^/:]+/[^/:]+)$$|\1|')
TF_STATE_BUCKET ?=
export AWS_REGION PROJECT IMAGE_TAG GITHUB_REPO

# CI has no terminal, so docker compose must not ask for one.
TF := $(COMPOSE) run --rm $(if $(CI),-T) terraform
# Same, always without a terminal: for outputs a command substitution reads.
TF_QUIET := $(COMPOSE) run --rm -T terraform
AWS_CLI := $(COMPOSE) run --rm -T aws
BOOTSTRAP := -chdir=bootstrap
PROD := -chdir=environments/prod

# The state bucket is named <project>-tfstate-<account id> (infrastructure/bootstrap/main.tf), so
# its name is worked out from the AWS credentials, and only when a target needs it.
# TF_STATE_BUCKET overrides it.
ACCOUNT_ID = $(shell $(AWS_CLI) sts get-caller-identity --query Account --output text 2>/dev/null)
STATE_BUCKET = $(or $(TF_STATE_BUCKET),$(PROJECT)-tfstate-$(or $(strip $(ACCOUNT_ID)),$(error Could not read the AWS account: check your credentials, or pass TF_STATE_BUCKET=<bucket>)))

# Both roots keep their state in that bucket, each under its own key.
BOOTSTRAP_BACKEND = -backend-config="bucket=$(STATE_BUCKET)" \
	-backend-config="key=$(PROJECT)/bootstrap/terraform.tfstate" \
	-backend-config="region=$(AWS_REGION)" \
	-backend-config="use_lockfile=true"
PROD_BACKEND = -backend-config="bucket=$(STATE_BUCKET)" \
	-backend-config="key=$(PROJECT)/prod/terraform.tfstate" \
	-backend-config="region=$(AWS_REGION)" \
	-backend-config="use_lockfile=true"

# `validate` initialises a root without its backend. Giving it a data directory of its own keeps
# that from disconnecting the root from its remote state, which `plan` and `apply` would then lose.
VALIDATE_BOOTSTRAP := $(COMPOSE) run --rm $(if $(CI),-T) -e TF_DATA_DIR=/infra/bootstrap/.terraform-validate terraform $(BOOTSTRAP)
VALIDATE_PROD := $(COMPOSE) run --rm $(if $(CI),-T) -e TF_DATA_DIR=/infra/environments/prod/.terraform-validate terraform $(PROD)

.DEFAULT_GOAL := help

.PHONY: help env build up dev down clean logs ps migrate migration-generate \
	migration-create migration-revert migration-show db-shell backend-shell frontend-shell \
	typecheck backend-typecheck frontend-typecheck \
	lint backend-lint \
	test backend-test backend-test-unit backend-test-int frontend-test \
	format format-check backend-image frontend-build \
	infra-fmt infra-validate bootstrap-init bootstrap-plan bootstrap-apply bootstrap-migrate-state \
	infra-init infra-plan infra-apply first-image infra-destroy infra-output gh-vars

help: ## Show this help
	@awk 'BEGIN {FS = ":.*## "} /^[a-zA-Z_-]+:.*## / {printf "  %-22s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

env: ## Create .env from .env.example if it does not exist
	@test -f .env || (cp .env.example .env && echo "created .env from .env.example")

build: env ## Build the images
	$(COMPOSE) build

up: env ## Start database, migrations, backend and frontend in the background
	$(COMPOSE) up -d --build

dev: env ## Start everything in the foreground with logs
	$(COMPOSE) up --build

down: ## Stop the containers (keeps database data)
	$(COMPOSE) down

clean: ## Stop the containers and DELETE the database volume
	$(COMPOSE) down -v --remove-orphans

logs: ## Follow the logs of every service
	$(COMPOSE) logs -f

ps: ## List containers
	$(COMPOSE) ps

migrate: build ## Run pending migrations
	$(COMPOSE) run --rm migrate

migration-show: build ## List migrations and whether they ran
	$(COMPOSE) run --rm migrate bun run migration:show

migration-revert: build ## Revert the last migration
	$(COMPOSE) run --rm migrate bun run migration:revert

migration-generate: build ## Diff entities against the database: make migration-generate name=AddFoo
	@test -n "$(name)" || (echo "usage: make migration-generate name=<MigrationName>" && exit 1)
	$(COMPOSE) run --rm migrate bun run migration:generate src/migrations/$(name)

migration-create: build ## Create an empty migration: make migration-create name=AddFoo
	@test -n "$(name)" || (echo "usage: make migration-create name=<MigrationName>" && exit 1)
	$(COMPOSE) run --rm --no-deps migrate bun run migration:create src/migrations/$(name)

db-shell: ## Open psql in the database container
	$(COMPOSE) exec database sh -c 'psql -U "$$POSTGRES_USER" -d "$$POSTGRES_DB"'

backend-shell: build ## Open a shell in a backend container
	$(COMPOSE) run --rm --no-deps backend sh

frontend-shell: build ## Open a shell in a frontend container
	$(COMPOSE) run --rm --no-deps frontend sh

typecheck: backend-typecheck frontend-typecheck ## Typecheck backend and frontend

backend-typecheck: build ## Typecheck the backend
	$(COMPOSE) run --rm --no-deps backend bun run typecheck

frontend-typecheck: build ## Typecheck the frontend
	$(COMPOSE) run --rm --no-deps frontend bun run typecheck

lint: backend-lint ## Lint the backend

backend-lint: build ## Lint the backend with ESLint (no warnings allowed)
	$(COMPOSE) run --rm --no-deps backend bun run lint

test: backend-test frontend-test ## Run every test suite

backend-test: build ## Backend unit and integration tests
	$(COMPOSE) run --rm backend bun run test

backend-test-unit: build ## Backend unit tests (no database)
	$(COMPOSE) run --rm --no-deps backend bun run test:unit

backend-test-int: build ## Backend integration tests (database bmi_test, created on demand)
	$(COMPOSE) run --rm backend bun run test:int

frontend-test: build ## Frontend unit tests
	$(COMPOSE) run --rm --no-deps frontend bun run test

format: build ## Format the frontend with Prettier
	$(COMPOSE) run --rm --no-deps frontend bun run format

format-check: build ## Check the frontend formatting
	$(COMPOSE) run --rm --no-deps frontend bun run format:check

backend-image: ## Build the production backend image, to check its Dockerfile
	docker build --target prod --tag bmi-backend:prod-check ./backend

frontend-build: build ## Typecheck and bundle the frontend, to check the production build
	$(COMPOSE) run --rm --no-deps frontend bun run build

infra-fmt: ## Format the Terraform files
	$(TF) fmt -recursive

infra-validate: ## Check formatting and validate both Terraform roots (no AWS access needed)
	$(TF) fmt -check -recursive
	$(VALIDATE_BOOTSTRAP) init -backend=false -input=false
	$(VALIDATE_BOOTSTRAP) validate
	$(VALIDATE_PROD) init -backend=false -input=false
	$(VALIDATE_PROD) validate

bootstrap-init: ## Initialise bootstrap: local state until its backend.tf exists, the state in S3 after
	$(TF) $(BOOTSTRAP) init -input=false $(if $(wildcard infrastructure/bootstrap/backend.tf),-reconfigure $(BOOTSTRAP_BACKEND))

bootstrap-plan: bootstrap-init ## Show what bootstrap would create: the S3 bucket for the Terraform state
	$(TF) $(BOOTSTRAP) plan

bootstrap-apply: bootstrap-init ## Create the state bucket and move the bootstrap state into it (AUTO_APPROVE=true skips the prompt)
	$(TF) $(BOOTSTRAP) apply $(if $(AUTO_APPROVE),-auto-approve)
	@$(MAKE) --no-print-directory bootstrap-migrate-state

bootstrap-migrate-state: ## Move the bootstrap state into its bucket; bootstrap-apply already does it, once
	@if [ -f infrastructure/bootstrap/backend.tf ]; then \
		echo "The bootstrap state already lives in S3."; \
	else \
		printf '%s\n' '# The bucket this root creates also holds the state of this root.' 'terraform {' '  backend "s3" {}' '}' > infrastructure/bootstrap/backend.tf && \
		$(TF) $(BOOTSTRAP) init -migrate-state -force-copy -input=false $(BOOTSTRAP_BACKEND); \
	fi

infra-init: ## Connect the prod root to its S3 state; the bucket is worked out from your AWS account
	$(TF) $(PROD) init -reconfigure -input=false $(PROD_BACKEND)

infra-plan: ## Show what Terraform would change in prod
	$(TF) $(PROD) plan

infra-apply: ## Create or update all of prod: state bucket, ECR, first image, the rest (AUTO_APPROVE=true skips the prompt)
	@$(MAKE) --no-print-directory bootstrap-apply AUTO_APPROVE=true
	@$(MAKE) --no-print-directory infra-init
	$(TF) $(PROD) apply -target=module.ecr -auto-approve
	@$(MAKE) --no-print-directory first-image
	$(TF) $(PROD) apply $(if $(AUTO_APPROVE),-auto-approve)

# The ECS service cannot start without an image, so the first one is built and pushed here.
# Once the repository has any image, CI owns them and this does nothing.
first-image:
	@registry=$(ACCOUNT_ID).dkr.ecr.$(AWS_REGION).amazonaws.com; \
	repository=$(PROJECT)/backend; \
	count=$$($(AWS_CLI) ecr list-images --repository-name $$repository --query 'length(imageIds)' --output text); \
	if [ "$$count" != "0" ]; then echo "ECR already has an image: CI owns it from here"; exit 0; fi; \
	echo "Building and pushing the first image: $$registry/$$repository:$(IMAGE_TAG)"; \
	$(AWS_CLI) ecr get-login-password | docker login --username AWS --password-stdin $$registry && \
	docker build --platform linux/amd64 --target prod --tag $$registry/$$repository:$(IMAGE_TAG) backend && \
	docker push $$registry/$$repository:$(IMAGE_TAG)

infra-destroy: ## Destroy prod (turn db_deletion_protection off and apply first)
	$(TF) $(PROD) destroy

infra-output: ## Print the URLs and the other outputs of prod
	$(TF) $(PROD) output

gh-vars: ## Print the GitHub Actions variables to set, read from the Terraform outputs
	@echo "AWS_REGION=$(AWS_REGION)"
	@echo "AWS_ROLE_ARN=$$($(TF_QUIET) $(PROD) output -raw github_deploy_role_arn)"
	@echo "FRONTEND_BUCKET=$$($(TF_QUIET) $(PROD) output -raw frontend_bucket_name)"
	@echo "FRONTEND_DISTRIBUTION_ID=$$($(TF_QUIET) $(PROD) output -raw frontend_distribution_id)"
	@echo "VITE_API_BASE_URL=$$($(TF_QUIET) $(PROD) output -raw api_url)"
