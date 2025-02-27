packer {
  required_plugins {
    amazon = {
      version = ">= 1.0.0, < 2.0.0"
      source  = "github.com/hashicorp/amazon"
    }
  }
}

variable "ami_name1" {
  description = "The name of the AMI to be created."
  default     = "csye6225-webapp-ami"
  type        = string
}

variable "instance_type1" {
  description = "EC2 instance type."
  default     = "t2.micro"
  type        = string
}

variable "aws_region1" {
  description = "AWS region where the instance will be created."
  default     = "us-east-1"
  type        = string
}

variable "ubuntu_ami_image1" {
  description = "The AMI ID for the Ubuntu image from AWS."
  default     = "ami-04b4f1a9cf54c11d0"
  type        = string
}

variable "ssh_username1" {
  description = "The username for the EC2 instance."
  default     = "ubuntu"
  type        = string
}

# Define GitHub Secrets for sensitive credentials
variable "mysql_user" {
  description = "MySQL username"
  type        = string
  default     = "root"
}

variable "mysql_password" {
  description = "MySQL user password"
  default     = "password"
  type        = string
}

variable "mysql_host" {
  description = "MySQL host"
  default     = "localhost"
  type        = string
}

variable "db_name" {
  description = "Database name"
  default     = "cloud_native"
  type        = string
}

variable "app_port" {
  description = "app port"
  default     = "8080"
  type        = string
}

# variable "account_ids1" {
#   description = "AWS account IDs that can use the AMI"
#   type        = list(string)
#   default     = ["904233096435"]
# }

variable "account_ids1" {
  type    = string
  default = "180294191701"
}

locals {
  split_array = split(",", var.account_ids1)
}

source "amazon-ebs" "ubuntu" {
  ami_name      = var.ami_name1
  instance_type = var.instance_type1
  source_ami    = var.ubuntu_ami_image1
  region        = var.aws_region1
  ssh_username  = var.ssh_username1

  aws_polling {
    delay_seconds = 120
    max_attempts  = 50
  }
  ssh_timeout = "10m"

  launch_block_device_mappings {
    delete_on_termination = true
    device_name           = "/dev/sda1"
    volume_size           = 8
    volume_type           = "gp2"
  }

  ami_users = local.split_array

  tags = {
    Name        = "csye6225-webapp-ami"
    Description = "AMI for CSYE6225 web application"
  }
}

# launch_block_device_mappings {
#   delete_on_termination = true
#   device_name           = "/dev/sda1" 
#   volume_size           = 8
#   volume_type           = "gp2"
# }


build {
  name = "Webapp build"
  sources = [
    "source.amazon-ebs.ubuntu",
  ]

  provisioner "file" {
    source      = "../../webapp"
    destination = "/tmp/webapp"
  }

  provisioner "shell" {
    inline = [
      # Update & upgrade system
      "echo 'Updating system packages...'",
      "sudo apt-get update -y",
      "sudo apt-get upgrade -y",
    ]
  }

  provisioner "shell" {
    inline = [
      # Install MySQL and other dependencies
      "echo 'Installing MySQL and other packages service...'",
      "sudo apt-get install -y mysql-server unzip pkg-config libmysqlclient-dev",
      "sudo systemctl enable mysql",
      "sudo systemctl start mysql"
    ]
  }

  provisioner "shell" {
    inline = [
      # Alter MySQL root password and create database if not exists
      "echo 'Altering MySQL root password and ensuring database exists...'",
      "sudo mysql -u root -p${var.mysql_password} -e \"ALTER USER '${var.mysql_user}'@'${var.mysql_host}' IDENTIFIED WITH mysql_native_password BY '${var.mysql_password}';\"",
      "sudo mysql -u root -p${var.mysql_password} -e \"CREATE DATABASE IF NOT EXISTS ${var.db_name};\"",
      "echo 'MySQL root password altered and database created if not exists'"
    ]
  }

  provisioner "shell" {
    inline = [
      # Install Node.js
      "echo 'Installing Node.js...'",
      "curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -",
      "sudo apt install -y nodejs",
    ]
  }

  provisioner "shell" {
    inline = [
      # Create a Linux user for the application
      "echo 'Creating non-login Linux user...'",
      "sudo groupadd csye6225",
      "sudo useradd -m -g csye6225 -s /usr/sbin/nologin csye6225",
    ]
  }

  provisioner "shell" {
    inline = [
      # Setup application directory
      "echo 'Setting up application directory...'",
      "sudo mkdir -p /opt/csye6225/webapp",

      # Copy application files
      "echo 'Copying application files...'",
      "sudo cp -r /tmp/webapp/* /opt/csye6225/webapp/",

      # Set ownership and permissions
      "echo 'Setting ownership and permissions for application files...'",
      "sudo chown -R csye6225:csye6225 /opt/csye6225/webapp",
      "sudo chmod -R 755 /opt/csye6225/webapp",

      # Create .env file with environment variables
      # Set environment variables for MySQL connection
      "echo 'Setting environment variables for MySQL connection...'",
      "echo 'export DB_USERNAME=${var.mysql_user}' >> /opt/csye6225/webapp/.env",
      "echo 'export DB_PASSWORD=${var.mysql_password}' >> /opt/csye6225/webapp/.env",
      "echo 'export HOST=${var.mysql_host}' >> /opt/csye6225/webapp/.env",
      "echo 'export DB_NAME=${var.db_name}' >> /opt/csye6225/webapp/.env",
      "echo 'export PORT=${var.app_port}' >> /opt/csye6225/webapp/.env",
    ]
  }

  provisioner "shell" {
    inline = [
      # Change to app directory and install dependencies
      "cd /opt/csye6225/webapp || exit",
      "echo 'Installing application dependencies...'",
      "sudo -u csye6225 npm install"
    ]
  }

  provisioner "shell" {
    inline = [
      # copying systemd service file
      "sudo cp /tmp/webapp/packer/app.service /etc/systemd/system/app.service",
      "sudo systemctl daemon-reload",
      "sudo systemctl enable app",
      "sudo systemctl start app"
    ]
  }

}
