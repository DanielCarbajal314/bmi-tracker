output "domain_name" {
  description = "Host of the API, to be used as https://<domain_name>."
  value       = aws_cloudfront_distribution.api.domain_name
}
