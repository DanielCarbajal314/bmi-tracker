variable "project" {
  description = "Name prefix for every resource."
  type        = string
}

variable "aws_region" {
  type = string
}

variable "image" {
  description = "Backend image to start with. CI owns it afterwards (see the lifecycle block)."
  type        = string
}

variable "cpu" {
  description = "CPU units of the task."
  type        = number
  default     = 256
}

variable "memory" {
  description = "Memory in MiB of the task."
  type        = number
  default     = 512
}

variable "execution_role_arn" {
  type = string
}

variable "database_host" {
  type = string
}

variable "database_port" {
  type = number
}

variable "database_name" {
  type = string
}

variable "database_secret_arn" {
  description = "Secrets Manager secret with the database user and password."
  type        = string
}

variable "log_retention_days" {
  description = "How long CloudWatch keeps the logs."
  type        = number
  default     = 14
}
