variable "project" {
  description = "Name prefix for every resource."
  type        = string
}

variable "vpc_cidr" {
  description = "Address range of the VPC."
  type        = string
  default     = "10.0.0.0/16"
}

variable "container_port" {
  description = "Port the backend listens on."
  type        = number
  default     = 3000
}
