resource "aws_ecr_repository" "this" {
  for_each = toset(var.repository_names)

  name = "${var.project}/${each.key}"
  # Tags are commit SHAs, so a tag never changes meaning once pushed.
  image_tag_mutability = "IMMUTABLE"
  # `make infra-destroy` has to work with images inside.
  force_delete = true

  image_scanning_configuration {
    scan_on_push = true
  }
}

resource "aws_ecr_lifecycle_policy" "this" {
  for_each = aws_ecr_repository.this

  repository = each.value.name

  policy = jsonencode({
    rules = [{
      rulePriority = 1
      description  = "Keep the ${var.max_images} most recent images"
      selection = {
        tagStatus   = "any"
        countType   = "imageCountMoreThan"
        countNumber = var.max_images
      }
      action = { type = "expire" }
    }]
  })
}
