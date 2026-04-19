# ============================================
# Terraform Outputs
# ============================================

output "blue_server_ip" {
  description = "Public IP of the Blue EC2 instance"
  value       = aws_instance.blue.public_ip
}

output "green_server_ip" {
  description = "Public IP of the Green EC2 instance"
  value       = aws_instance.green.public_ip
}

output "alb_dns_name" {
  description = "DNS name of the Application Load Balancer"
  value       = aws_lb.main.dns_name
}

output "blue_target_group_arn" {
  description = "ARN of the Blue Target Group"
  value       = aws_lb_target_group.blue.arn
}

output "green_target_group_arn" {
  description = "ARN of the Green Target Group"
  value       = aws_lb_target_group.green.arn
}

output "alb_listener_arn" {
  description = "ARN of the ALB Listener"
  value       = aws_lb_listener.http.arn
}

output "vpc_id" {
  description = "VPC ID"
  value       = aws_vpc.main.id
}

output "jenkins_server_ip" {
  description = "Public IP of the Jenkins CI/CD instance"
  value       = aws_instance.jenkins.public_ip
}
