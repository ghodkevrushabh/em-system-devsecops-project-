terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "eu-north-1"
}

# Creates a free-tier compatible S3 bucket for your app assets
resource "aws_s3_bucket" "devsecops_app_bucket" {
  bucket = "devsecops-ems-storage-bucket-unique-12345" # Must be globally unique
}
