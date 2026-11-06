variable "project" {
  description = "Name prefix for every repository."
  type        = string
}

variable "repository_names" {
  description = "One repository per image."
  type        = list(string)
  default     = ["backend"]
}

variable "max_images" {
  description = "Images kept per repository."
  type        = number
  default     = 20
}
