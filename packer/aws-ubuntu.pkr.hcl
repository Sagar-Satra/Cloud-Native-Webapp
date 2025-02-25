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

# aws_region = "us-east-1" 
variable "aws_region1" {
  description = "AWS region where the instance will be created."
  default     = "us-east-1"
  type        = string
}

# ubuntu_ami_image = "ami-04b4f1a9cf54c11d0"
variable "ubuntu_ami_image1" {
  description = "The AMI ID for the Ubuntu image from AWS."
  default     = "ami-04b4f1a9cf54c11d0"
  type        = string
}

# user_name = "ubuntu"
variable "user_name1" {
  description = "The username for the EC2 instance."
  default     = "ubuntu"
  type        = string
}



source "amazon-ebs" "ubuntu" {
  ami_name      = var.ami_name1
  instance_type = var.instance_type1
  source_ami    = var.ubuntu_ami_image1
  region        = var.aws_region1
  ssh_username  = var.user_name1
}

build {
  name = "Webapp build"
  sources = [
    "source.amazon-ebs.ubuntu",
  ]

  provisioner "file" {
    source      = "../setup.sh"
    destination = "/tmp/setup.sh"
  }

  provisioner "file" {
    source      = "../webapp.zip"
    destination = "/tmp/webapp.zip"
  }

  provisioner "shell" {
    inline = [
      "chmod +x /tmp/setup.sh",
      "sudo /tmp/setup.sh"
    ]
  }

}