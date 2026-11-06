resource "aws_cloudwatch_log_group" "backend" {
  name              = "/ecs/${var.project}-backend"
  retention_in_days = var.log_retention_days
}

resource "aws_ecs_cluster" "this" {
  name = var.project
}

resource "aws_ecs_task_definition" "backend" {
  family                   = "${var.project}-backend"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = var.cpu
  memory                   = var.memory
  execution_role_arn       = var.execution_role_arn

  runtime_platform {
    operating_system_family = "LINUX"
    cpu_architecture        = "X86_64"
  }

  container_definitions = jsonencode([
    {
      name         = "backend"
      image        = var.image
      essential    = true
      portMappings = [{ containerPort = var.container_port }]

      environment = [
        { name = "NODE_ENV", value = "production" },
        { name = "PORT", value = tostring(var.container_port) },
        { name = "DB_HOST", value = var.database_host },
        { name = "DB_PORT", value = tostring(var.database_port) },
        { name = "DB_NAME", value = var.database_name },
        { name = "DB_SSL", value = "true" },
        { name = "CORS_ORIGINS", value = var.cors_origins },
      ]

      secrets = [
        { name = "DB_USER", valueFrom = "${var.database_secret_arn}:username::" },
        { name = "DB_PASSWORD", valueFrom = "${var.database_secret_arn}:password::" },
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = aws_cloudwatch_log_group.backend.name
          awslogs-region        = var.aws_region
          awslogs-stream-prefix = "backend"
        }
      }
    }
  ])

  # CI registers a new revision on every deploy (describe the current one, swap the image,
  # register), so Terraform never sees the image that is really running. Without this, an
  # unrelated `terraform apply` would put back the image of its own state.
  # To change variables, secrets, cpu or memory: drop this block, apply, put it back.
  lifecycle {
    ignore_changes = [container_definitions]
  }
}

resource "aws_ecs_service" "backend" {
  name            = "${var.project}-backend"
  cluster         = aws_ecs_cluster.this.id
  task_definition = aws_ecs_task_definition.backend.arn
  desired_count   = var.desired_count
  launch_type     = "FARGATE"

  health_check_grace_period_seconds = 60
  wait_for_steady_state             = true

  deployment_circuit_breaker {
    enable   = true
    rollback = true
  }

  network_configuration {
    subnets          = var.subnet_ids
    security_groups  = [var.security_group_id]
    assign_public_ip = var.assign_public_ip
  }

  load_balancer {
    target_group_arn = var.target_group_arn
    container_name   = "backend"
    container_port   = var.container_port
  }

  # Same reason as above: CI moves the service to the new revision with `update-service`.
  lifecycle {
    ignore_changes = [task_definition]
  }
}
