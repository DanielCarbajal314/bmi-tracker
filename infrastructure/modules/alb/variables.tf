variable "project" {
  description = "Name prefix for every resource."
  type        = string
}

variable "vpc_id" {
  type = string
}

variable "public_subnet_ids" {
  type = list(string)
}

variable "security_group_id" {
  description = "Security group of the load balancer."
  type        = string
}

variable "container_port" {
  description = "Port the backend listens on."
  type        = number
  default     = 3000
}

variable "health_check_path" {
  description = "Path the load balancer polls on the backend."
  type        = string
  default     = "/health"
}
