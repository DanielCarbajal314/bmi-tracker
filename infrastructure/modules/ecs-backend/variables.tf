variable "project" {
  description = "Name prefix for every resource."
  type        = string
}

variable "aws_region" {
  type = string
}

variable "image" {
  description = "Backend image to start with. CI owns it afterwards (see the lifecycle blocks)."
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

variable "desired_count" {
  description = "How many copies of the task run."
  type        = number
  default     = 1
}

variable "container_port" {
  description = "Port the backend listens on."
  type        = number
  default     = 3000
}

variable "subnet_ids" {
  description = "Subnets the tasks run in."
  type        = list(string)
}

variable "assign_public_ip" {
  description = "Give each task a public IP so it can reach ECR and Secrets Manager without a NAT gateway."
  type        = bool
  default     = true
}

variable "security_group_id" {
  description = "Security group of the tasks."
  type        = string
}

variable "execution_role_arn" {
  type = string
}

variable "target_group_arn" {
  description = "Load balancer target group the service registers in."
  type        = string
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

variable "cors_origins" {
  description = "Origins allowed to call the API from a browser, comma separated."
  type        = string
}

variable "log_retention_days" {
  description = "How long CloudWatch keeps the logs."
  type        = number
  default     = 14
}
