variable "aws_region" {
  description = "Region of the state bucket."
  type        = string
  default     = "us-east-1"
}

variable "project" {
  description = "Name prefix for every resource."
  type        = string
  default     = "bmi-tracker"
}
