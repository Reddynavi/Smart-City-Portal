#!/bin/bash
# ============================================
# CloudWatch Monitoring Setup
# Smart City Portal - EC2 Monitoring
# ============================================

set -e
REGION="${1:-ap-south-1}"
LOG_GROUP="/smart-city-portal"

echo "📊 Setting up CloudWatch Monitoring..."

# Install CloudWatch Agent
sudo yum install -y amazon-cloudwatch-agent 2>/dev/null || \
sudo apt-get install -y amazon-cloudwatch-agent 2>/dev/null || true

# CloudWatch Agent Config
sudo tee /opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json > /dev/null <<EOF
{
  "agent": {
    "metrics_collection_interval": 60,
    "run_as_user": "root"
  },
  "logs": {
    "logs_collected": {
      "files": {
        "collect_list": [
          {
            "file_path": "/var/log/httpd/access_log",
            "log_group_name": "${LOG_GROUP}/apache-access",
            "log_stream_name": "{instance_id}"
          },
          {
            "file_path": "/var/log/httpd/error_log",
            "log_group_name": "${LOG_GROUP}/apache-error",
            "log_stream_name": "{instance_id}"
          },
          {
            "file_path": "/var/log/messages",
            "log_group_name": "${LOG_GROUP}/system",
            "log_stream_name": "{instance_id}"
          }
        ]
      }
    }
  },
  "metrics": {
    "namespace": "SmartCityPortal",
    "metrics_collected": {
      "cpu": {
        "measurement": ["cpu_usage_idle", "cpu_usage_user", "cpu_usage_system"],
        "metrics_collection_interval": 60
      },
      "mem": {
        "measurement": ["mem_used_percent", "mem_available_percent"],
        "metrics_collection_interval": 60
      },
      "disk": {
        "measurement": ["disk_used_percent"],
        "resources": ["/"],
        "metrics_collection_interval": 60
      },
      "net": {
        "measurement": ["net_bytes_sent", "net_bytes_recv"],
        "metrics_collection_interval": 60
      }
    }
  }
}
EOF

# Start CloudWatch Agent
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
    -a fetch-config -m ec2 -s \
    -c file:/opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json

echo "✅ CloudWatch Agent started"

# Create Log Groups
aws logs create-log-group --log-group-name "${LOG_GROUP}/apache-access" --region $REGION 2>/dev/null || true
aws logs create-log-group --log-group-name "${LOG_GROUP}/apache-error" --region $REGION 2>/dev/null || true
aws logs create-log-group --log-group-name "${LOG_GROUP}/system" --region $REGION 2>/dev/null || true

# Set retention to 30 days
for group in apache-access apache-error system; do
    aws logs put-retention-policy \
        --log-group-name "${LOG_GROUP}/${group}" \
        --retention-in-days 30 \
        --region $REGION 2>/dev/null || true
done

# Create CPU Alarm
aws cloudwatch put-metric-alarm \
    --alarm-name "SmartCity-HighCPU" \
    --alarm-description "Alert when CPU > 80%" \
    --metric-name CPUUtilization \
    --namespace AWS/EC2 \
    --statistic Average \
    --period 300 \
    --threshold 80 \
    --comparison-operator GreaterThanThreshold \
    --evaluation-periods 2 \
    --region $REGION 2>/dev/null || true

echo "✅ CloudWatch Alarms created"
echo "✅ CloudWatch setup complete!"
echo "📈 View metrics: https://console.aws.amazon.com/cloudwatch"
