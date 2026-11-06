variable "project" {
  description = "Name prefix for every resource."
  type        = string
}

variable "alert_email" {
  description = "Subscribes to the alarms. Empty means no subscription. AWS sends a confirmation link that has to be clicked."
  type        = string
  default     = ""
}

variable "ecs_cluster_name" {
  type = string
}

variable "ecs_service_name" {
  type = string
}

variable "rds_instance_id" {
  type = string
}

variable "rds_allocated_storage_gb" {
  type = number
}

variable "alb_arn_suffix" {
  type = string
}

variable "rds_connections_threshold" {
  description = "Connections that raise the alarm."
  type        = number
  default     = 60
}

variable "alb_5xx_threshold" {
  description = "5xx answers per minute that raise the alarm."
  type        = number
  default     = 5
}
