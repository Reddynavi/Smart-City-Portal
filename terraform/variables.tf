variable "aws_region" {
  description = "AWS region for deployment"
  default     = "ap-south-1"
}

variable "instance_type" {
  description = "EC2 instance type"
  default     = "t3.micro"
}

variable "key_name" {
  description = "SSH Key Pair name"
  default     = "smart-city-key"
}

variable "ami_id" {
  description = "Amazon Linux 2023 AMI ID (ap-south-1)"
  default     = "ami-0e12ffc2dd465f6e4"
}

variable "project_name" {
  description = "Project name for tagging"
  default     = "SmartCityPortal"
}
