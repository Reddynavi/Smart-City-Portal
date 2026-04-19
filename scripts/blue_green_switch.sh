#!/bin/bash
# ============================================
# Blue-Green Traffic Switch Script
# Usage: ./blue_green_switch.sh [blue|green]
# ============================================

DIRECTION="${1:-green}"
LISTENER_ARN="${ALB_LISTENER_ARN}"
BLUE_TG_ARN="${BLUE_TARGET_GROUP_ARN}"
GREEN_TG_ARN="${GREEN_TARGET_GROUP_ARN}"
REGION="${AWS_REGION:-ap-south-1}"

if [ "$DIRECTION" = "green" ]; then
    TARGET_ARN=$GREEN_TG_ARN
    echo "🟢 Switching traffic → GREEN"
elif [ "$DIRECTION" = "blue" ]; then
    TARGET_ARN=$BLUE_TG_ARN
    echo "🔵 Rolling back → BLUE"
else
    echo "❌ Usage: $0 [blue|green]"
    exit 1
fi

aws elbv2 modify-listener \
    --listener-arn "$LISTENER_ARN" \
    --default-actions Type=forward,TargetGroupArn="$TARGET_ARN" \
    --region "$REGION"

echo "✅ Traffic switched to $DIRECTION successfully."
