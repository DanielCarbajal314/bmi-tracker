variable "project" {
  description = "Name prefix for every resource."
  type        = string
}

variable "database_secret_arn" {
  description = "Secrets Manager secret with the database user and password."
  type        = string
}
