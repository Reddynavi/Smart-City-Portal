variable "aws_region" {
  description = "AWS region for deployment"
  default     = "ap-south-1"
}

variable "instance_type" {
  description = "EC2 instance type"
  default     = "t2.micro"
}

variable "key_name" {
  description = "SSH Key Pair name"
  default     = "smart-city-key"
}

variable "ami_id" {
  description = "Amazon Linux 2023 AMI ID (ap-south-1)"
  default     = "ami-0e35ddab05955cf57"
}

variable "project_name" {
  description = "Project name for tagging"
  default     = "SmartCityPortal"
}
