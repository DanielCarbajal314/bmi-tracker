# The state lives in the bucket that bootstrap/ creates. Bucket, key and region are passed at
# init time by `make infra-init`.
terraform {
  backend "s3" {}
}
