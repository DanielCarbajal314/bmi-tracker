output "tfstate_bucket" {
  description = "The state bucket. `make` works the name out from the AWS account by itself."
  value       = aws_s3_bucket.tfstate.bucket
}
