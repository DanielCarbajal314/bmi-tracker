variable "aws_region" {
  description = "Region everything is created in."
  type        = string
  default     = "us-east-1"
}

variable "project" {
  description = "Name prefix for every resource."
  type        = string
  default     = "bmi-tracker"
}

variable "image_tag" {
  description = "Tag of the backend image the tasks start with. `make` passes IMAGE_TAG. CI moves the running image on from there, and the task definitions ignore later changes."
  type        = string

  validation {
    condition     = length(var.image_tag) > 0
    error_message = "image_tag must not be empty."
  }
}

variable "alert_email" {
  description = "Receives the CloudWatch alarms. Optional: left empty, the alarms exist but notify nobody. AWS sends a confirmation link to click."
  type        = string
  default     = ""
}

variable "github_repo" {
  description = "owner/repo allowed to deploy through OIDC. `make` reads it from the origin remote of git; terraform.tfvars overrides it."
  type        = string

  validation {
    condition     = can(regex("^[^/]+/[^/]+$", var.github_repo))
    error_message = "github_repo must look like owner/repo. Give git an origin remote, or set github_repo in terraform.tfvars."
  }
}

variable "github_branch" {
  description = "Branch allowed to deploy."
  type        = string
  default     = "main"
}

variable "create_github_oidc_provider" {
  description = "Create GitHub's identity provider. An account can have only one: set false if it already exists."
  type        = bool
  default     = true
}

variable "vpc_cidr" {
  description = "Address range of the VPC."
  type        = string
  default     = "10.0.0.0/16"
}

variable "desired_count" {
  description = "How many copies of the backend task run."
  type        = number
  default     = 1
}

variable "task_cpu" {
  description = "CPU units of the backend task."
  type        = number
  default     = 256
}

variable "task_memory" {
  description = "Memory in MiB of the backend task."
  type        = number
  default     = 512
}

variable "log_retention_days" {
  description = "How long CloudWatch keeps the container logs."
  type        = number
  default     = 14
}

variable "db_name" {
  description = "Name of the database the app uses."
  type        = string
  default     = "bmi"
}

variable "db_username" {
  description = "Master user of the database. The password is generated and kept in Secrets Manager."
  type        = string
  default     = "bmi"
}

variable "db_instance_class" {
  description = "Size of the database instance."
  type        = string
  default     = "db.t4g.micro"
}

variable "db_allocated_storage" {
  description = "Database storage in GiB."
  type        = number
  default     = 20
}

variable "db_multi_az" {
  description = "Run a standby copy of the database in another zone."
  type        = bool
  default     = false
}

variable "db_deletion_protection" {
  description = "Refuse to delete the database. Turn it off, apply, then destroy."
  type        = bool
  default     = true
}

variable "db_skip_final_snapshot" {
  description = "Skip the snapshot taken when the database is destroyed."
  type        = bool
  default     = false
}
