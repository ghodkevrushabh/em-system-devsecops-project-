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

# Firewall rule: Allow web traffic on port 8080 and SSH on port 22
resource "aws_security_group" "ems_sg" {
  name        = "ems-app-security-group"
  description = "Allow port 8080 for application and 22 for SSH"

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

# AWS EC2 Server (This gives Infracost a fixed compute cost to calculate!)
resource "aws_instance" "ems_server" {
  ami                    = "ami-0c7217cdde317cfec" # Ubuntu 22.04 LTS
  instance_type          = "t2.micro"              # Infracost will calculate ~$8-10/month
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
