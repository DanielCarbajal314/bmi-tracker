output "identifier" {
  value = aws_db_instance.this.identifier
}

output "address" {
  value = aws_db_instance.this.address
}

output "port" {
  value = aws_db_instance.this.port
}

output "endpoint" {
  value = aws_db_instance.this.endpoint
}

output "db_name" {
  value = aws_db_instance.this.db_name
}

output "allocated_storage" {
  value = aws_db_instance.this.allocated_storage
}

output "master_user_secret_arn" {
  description = "Secrets Manager secret holding the master user and password."
  value       = aws_db_instance.this.master_user_secret[0].secret_arn
}
