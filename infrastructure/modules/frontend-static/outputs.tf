output "bucket_name" {
  value = aws_s3_bucket.frontend.bucket
}

output "bucket_arn" {
  value = aws_s3_bucket.frontend.arn
}

output "distribution_id" {
  value = aws_cloudfront_distribution.frontend.id
}

output "distribution_arn" {
  value = aws_cloudfront_distribution.frontend.arn
}

output "domain_name" {
  description = "Host of the frontend, to be used as https://<domain_name>."
  value       = aws_cloudfront_distribution.frontend.domain_name
}
