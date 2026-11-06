# There is no domain, so the load balancer has no certificate and cannot speak HTTPS. The
# frontend is served over HTTPS, and a browser blocks calls from an https:// page to an
# http:// API, so CloudFront goes in front: it answers HTTPS with its own *.cloudfront.net
# certificate and talks plain HTTP to the load balancer, which only accepts CloudFront.
resource "aws_cloudfront_distribution" "api" {
  enabled     = true
  comment     = "${var.project} API: HTTPS in front of the load balancer"
  price_class = "PriceClass_100"

  origin {
    domain_name = var.alb_dns_name
    origin_id   = "backend-alb"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "http-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  default_cache_behavior {
    allowed_methods        = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "backend-alb"
    viewer_protocol_policy = "redirect-to-https"

    # An API, not static content: never cache, and forward everything (the Origin header
    # included, which the backend's CORS check needs).
    cache_policy_id          = "4135ea2d-6df8-44a3-9df3-4b5a84be39ad" # Managed-CachingDisabled
    origin_request_policy_id = "216adef6-5c7f-47e4-b989-5492eafa07d3" # Managed-AllViewer
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }
}
