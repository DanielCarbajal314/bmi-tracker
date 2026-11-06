variable "project" {
  description = "Name prefix for every resource."
  type        = string
}

variable "github_repo" {
  description = "owner/repo allowed to assume the deploy role."
  type        = string
}

variable "github_branch" {
  description = "Branch whose workflow runs may assume the role. Pull requests and other branches cannot."
  type        = string
  default     = "main"
}

variable "create_oidc_provider" {
  description = "Create GitHub's identity provider. An account can have only one: set false if it already exists."
  type        = bool
  default     = true
}

variable "ecr_repository_arns" {
  type = list(string)
}

variable "ecs_cluster_name" {
  type = string
}

variable "ecs_cluster_arn" {
  type = string
}

variable "ecs_service_arn" {
  type = string
}

variable "ecs_migrations_task_definition_family" {
  type = string
}

variable "ecs_execution_role_arn" {
  type = string
}

variable "frontend_bucket_arn" {
  type = string
}

variable "frontend_distribution_arn" {
  type = string
}
