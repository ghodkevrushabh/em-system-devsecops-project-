terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "eu-north-1" # Your exact region
}

# Dynamically finds the correct Ubuntu AMI for eu-north-1
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["098965243132"]

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }
  filter {
    name   = "architecture"
    values = ["x86_64"]
  }
}

resource "aws_security_group" "ems_sg" {
  name        = "ems-app-security-group-stockholm" # Renamed to avoid conflicts
  description = "Allow port 8080 and 22"

  ingress {
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_instance" "ems_server" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = "t3.micro" # Mandatory for eu-north-1
  vpc_security_group_ids = [aws_security_group.ems_sg.id]

  user_data = <<-EOF
              #!/bin/bash
              sudo apt-get update -y
              sudo apt-get install -y docker.io
              sudo systemctl start docker
              sudo systemctl enable docker
              sudo usermod -aG docker ubuntu
              EOF

  tags = {
    Name = "DevSecOps-EMS-App-Server"
  }
}

output "ec2_public_ip" {
  value       = aws_instance.ems_server.public_ip
  description = "Public IP address of the deployed AWS EC2 instance"
}
