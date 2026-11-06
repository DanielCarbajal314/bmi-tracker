resource "aws_cloudwatch_log_group" "migrations" {
  name              = "/ecs/${var.project}-migrations"
  retention_in_days = var.log_retention_days
}

# A one-shot task, with no service: CI runs it to completion before it moves the backend to
# the new image (.github/workflows/deploy.yml). It is the backend image with another command.
resource "aws_ecs_task_definition" "migrations" {
  family                   = "${var.project}-migrations"
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
      name      = "migrations"
      image     = var.image
      essential = true
      command   = ["bun", "run", "migration:run"]

      environment = [
        { name = "NODE_ENV", value = "production" },
        { name = "DB_HOST", value = var.database_host },
        { name = "DB_PORT", value = tostring(var.database_port) },
        { name = "DB_NAME", value = var.database_name },
        { name = "DB_SSL", value = "true" },
      ]

      secrets = [
        { name = "DB_USER", valueFrom = "${var.database_secret_arn}:username::" },
        { name = "DB_PASSWORD", valueFrom = "${var.database_secret_arn}:password::" },
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = aws_cloudwatch_log_group.migrations.name
          awslogs-region        = var.aws_region
          awslogs-stream-prefix = "migrations"
        }
      }
    }
  ])

  # CI registers a new revision with the image it just pushed on every deploy.
  lifecycle {
    ignore_changes = [container_definitions]
  }
}
