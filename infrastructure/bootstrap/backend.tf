# The bucket this root creates also holds the state of this root.
terraform {
  backend "s3" {}
}
