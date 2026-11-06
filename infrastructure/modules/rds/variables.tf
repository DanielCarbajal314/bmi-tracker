variable "project" {
  description = "Name prefix for every resource."
  type        = string
}

variable "private_subnet_ids" {
  description = "Subnets the database lives in."
  type        = list(string)
}

variable "security_group_id" {
  description = "Security group that lets the backend reach PostgreSQL."
  type        = string
}

variable "engine_version" {
  description = "PostgreSQL major version."
  type        = string
  default     = "17"
}

variable "instance_class" {
  description = "Size of the database instance."
  type        = string
  default     = "db.t4g.micro"
}

variable "allocated_storage" {
  description = "Database storage in GiB."
  type        = number
  default     = 20
}

variable "db_name" {
  description = "Name of the database the app uses."
  type        = string
  default     = "bmi"
}

variable "master_username" {
  description = "Master user. The password is generated and kept in Secrets Manager."
  type        = string
  default     = "bmi"
}

variable "multi_az" {
  description = "Run a standby copy of the database in another zone."
  type        = bool
  default     = false
}

variable "backup_retention_days" {
  description = "How long automated backups are kept."
  type        = number
  default     = 7
}

variable "deletion_protection" {
  description = "Refuse to delete the database. Turn it off, apply, then destroy."
  type        = bool
  default     = true
}

variable "skip_final_snapshot" {
  description = "Skip the snapshot taken when the database is destroyed."
  type        = bool
  default     = false
}
