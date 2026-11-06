terraform {
  required_version = ">= 1.10"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project   = var.project
      ManagedBy = "terraform"
    }
  }
}

locals {
  backend_image = "${module.ecr.repository_urls["backend"]}:${var.image_tag}"
}

module "network" {
  source = "../../modules/network"

  project  = var.project
  vpc_cidr = var.vpc_cidr
}

module "rds" {
  source = "../../modules/rds"

  project               = var.project
  private_subnet_ids    = module.network.private_subnet_ids
  security_group_id     = module.network.sg_database_id
  db_name               = var.db_name
  master_username       = var.db_username
  instance_class        = var.db_instance_class
  allocated_storage     = var.db_allocated_storage
  multi_az              = var.db_multi_az
  deletion_protection   = var.db_deletion_protection
  skip_final_snapshot   = var.db_skip_final_snapshot
  backup_retention_days = 7
}

module "ecr" {
  source = "../../modules/ecr"

  project = var.project
}

module "iam" {
  source = "../../modules/iam"

  project             = var.project
  database_secret_arn = module.rds.master_user_secret_arn
}

module "alb" {
  source = "../../modules/alb"

  project           = var.project
  vpc_id            = module.network.vpc_id
  public_subnet_ids = module.network.public_subnet_ids
  security_group_id = module.network.sg_alb_id
}

module "backend_cdn" {
  source = "../../modules/backend-cdn"

  project      = var.project
  alb_dns_name = module.alb.dns_name
}

module "frontend_static" {
  source = "../../modules/frontend-static"

  project = var.project
}

module "ecs_backend" {
  source = "../../modules/ecs-backend"

  project             = var.project
  aws_region          = var.aws_region
  image               = local.backend_image
  cpu                 = var.task_cpu
  memory              = var.task_memory
  desired_count       = var.desired_count
  subnet_ids          = module.network.public_subnet_ids
  security_group_id   = module.network.sg_backend_id
  execution_role_arn  = module.iam.execution_role_arn
  target_group_arn    = module.alb.target_group_arn
  database_host       = module.rds.address
  database_port       = module.rds.port
  database_name       = module.rds.db_name
  database_secret_arn = module.rds.master_user_secret_arn
  cors_origins        = "https://${module.frontend_static.domain_name}"
  log_retention_days  = var.log_retention_days

  # The service registers in the target group, which needs the listener to exist.
  depends_on = [module.alb]
}

module "ecs_migrations" {
  source = "../../modules/ecs-migrations"

  project             = var.project
  aws_region          = var.aws_region
  image               = local.backend_image
  execution_role_arn  = module.iam.execution_role_arn
  database_host       = module.rds.address
  database_port       = module.rds.port
  database_name       = module.rds.db_name
  database_secret_arn = module.rds.master_user_secret_arn
  log_retention_days  = var.log_retention_days
}

module "monitoring" {
  source = "../../modules/monitoring"

  project                  = var.project
  alert_email              = var.alert_email
  ecs_cluster_name         = module.ecs_backend.cluster_name
  ecs_service_name         = module.ecs_backend.service_name
  rds_instance_id          = module.rds.identifier
  rds_allocated_storage_gb = module.rds.allocated_storage
  alb_arn_suffix           = module.alb.arn_suffix
}

module "github_oidc" {
  source = "../../modules/github-oidc"

  project                               = var.project
  github_repo                           = var.github_repo
  github_branch                         = var.github_branch
  create_oidc_provider                  = var.create_github_oidc_provider
  ecr_repository_arns                   = values(module.ecr.repository_arns)
  ecs_cluster_name                      = module.ecs_backend.cluster_name
  ecs_cluster_arn                       = module.ecs_backend.cluster_arn
  ecs_service_arn                       = module.ecs_backend.service_arn
  ecs_migrations_task_definition_family = module.ecs_migrations.task_definition_family
  ecs_execution_role_arn                = module.iam.execution_role_arn
  frontend_bucket_arn                   = module.frontend_static.bucket_arn
  frontend_distribution_arn             = module.frontend_static.distribution_arn
}
