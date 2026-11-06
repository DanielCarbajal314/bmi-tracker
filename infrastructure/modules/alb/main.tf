resource "aws_lb" "this" {
  name               = var.project
  load_balancer_type = "application"
  subnets            = var.public_subnet_ids
  security_groups    = [var.security_group_id]
}

resource "aws_lb_target_group" "backend" {
  # name_prefix: a port or protocol change replaces the group, and a fixed name would
  # collide with the old one during the create-before-destroy overlap.
  name_prefix = "app-"
  vpc_id      = var.vpc_id
  target_type = "ip"
  protocol    = "HTTP"
  port        = var.container_port

  deregistration_delay = 30

  health_check {
    path                = var.health_check_path
    matcher             = "200"
    interval            = 30
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 3
  }

  lifecycle {
    create_before_destroy = true
  }
}

# Plain HTTP on purpose: CloudFront terminates TLS in front of it (modules/backend-cdn)
# and the security group only lets CloudFront in.
resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.this.arn
  protocol          = "HTTP"
  port              = 80

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.backend.arn
  }
}
