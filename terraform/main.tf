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

# The industry-standard way to get the latest Ubuntu 22.04 AMI dynamically
data "aws_ssm_parameter" "ubuntu_ami" {
  name = "/aws/service/canonical/ubuntu/server/22.04/stable/current/amd64/hvm/ebs-gp2/ami-id"
}

resource "aws_security_group" "ems_sg" {
  name        = "ems-app-security-group-stockholm"
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
  # Use the value fetched from the SSM Parameter Store
  ami                    = data.aws_ssm_parameter.ubuntu_ami.value
  instance_type          = "t3.micro"
  vpc_security_group_ids = [aws_security_group.ems_sg.id]

  user_data = <<-EOF
              #!/bin/bash
              sudo apt-get update -y
              sudo apt-get install -y docker.io
              sudo systemctl start docker
              sudo systemctl enable docker
              sudo usermod -aG docker ubuntu

	      sudo docker run -d --name ems-app -p 8080:8080 vrushabhghodke/em-system-app:latest
              EOF

  tags = {
    Name = "DevSecOps-EMS-App-Server"
  }
}

output "ec2_public_ip" {
  value       = aws_instance.ems_server.public_ip
  description = "Public IP address of the deployed AWS EC2 instance"
}
