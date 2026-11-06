variable "project" {
  description = "Name prefix for every resource."
  type        = string
}

variable "alb_dns_name" {
  description = "DNS name of the load balancer CloudFront forwards to."
  type        = string
}
