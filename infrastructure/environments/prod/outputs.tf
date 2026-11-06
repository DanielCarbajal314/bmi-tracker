output "frontend_url" {
  description = "Where the app answers."
  value       = "https://${module.frontend_static.domain_name}"
}

output "api_url" {
  description = "Base URL of the API (CloudFront in front of the load balancer). It is VITE_API_BASE_URL."
  value       = "https://${module.backend_cdn.domain_name}"
}

output "frontend_bucket_name" {
  value = module.frontend_static.bucket_name
}

output "frontend_distribution_id" {
  value = module.frontend_static.distribution_id
}

output "github_deploy_role_arn" {
  description = "Role the deploy workflow assumes. It is the AWS_ROLE_ARN variable."
  value       = module.github_oidc.deploy_role_arn
}

output "ecr_repositories" {
  description = "Repository URL of each image."
  value       = module.ecr.repository_urls
}

output "ecs_cluster" {
  value = module.ecs_backend.cluster_name
}

output "ecs_service" {
  value = module.ecs_backend.service_name
}

output "ecs_migrations_family" {
  value = module.ecs_migrations.task_definition_family
}

output "database_endpoint" {
  description = "Database host and port. Reachable from inside the VPC only."
  value       = module.rds.endpoint
}

output "database_secret_arn" {
  description = "Secrets Manager secret holding the database user and password."
  value       = module.rds.master_user_secret_arn
}

output "log_groups" {
  description = "CloudWatch log groups of the backend and of the migrations."
  value       = [module.ecs_backend.log_group_name, module.ecs_migrations.log_group_name]
}
