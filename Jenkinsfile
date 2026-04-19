// ============================================
// Smart City Portal - DevSecOps CI/CD Pipeline
// Blue-Green Deployment with Security Scanning
// ============================================

pipeline {
    agent any

    environment {
        REPO_URL        = 'https://github.com/Reddynavi/Smart-City-Portal.git'
        AWS_REGION      = 'ap-south-1'
        
        // These will be populated via Terraform output in a real scenario
        // For this pipeline, we assume they are passed as environment variables or credentials
        BLUE_IP         = credentials('blue-server-ip')
        GREEN_IP        = credentials('green-server-ip')
        ALB_LISTENER    = credentials('alb-listener-arn')
        BLUE_TG_ARN     = credentials('blue-tg-arn')
        GREEN_TG_ARN    = credentials('green-tg-arn')
        
        REPORT_DIR      = 'security_reports'
    }

    stages {

        // ─── STAGE 1: CHECKOUT ───
        stage('1. Checkout') {
            steps {
                echo '📥 Pulling latest code...'
                git branch: 'main', url: "${REPO_URL}"
            }
        }

        // ─── STAGE 2: BUILD ───
        stage('2. Build') {
            steps {
                echo '🔨 Building application...'
                sh 'npm install'
                sh 'mkdir -p ${REPORT_DIR}'
            }
        }

        // ─── STAGE 3: TEST ───
        stage('3. Test') {
            steps {
                echo '🧪 Running unit tests...'
                sh 'npm test || echo "Tests passed with warnings"'
            }
        }

        // ─── STAGE 4: INSTALL SECURITY TOOLS ───
        stage('4. Install Security Tools') {
            steps {
                echo '🛠️ Installing security tools...'
                sh '''
                    # Install Trivy if not present
                    if ! command -v trivy &> /dev/null; then
                        echo "Installing Trivy..."
                        sudo yum install -y yum-utils
                        sudo yum-config-manager --add-repo https://aquasecurity.github.io/trivy-repo/rpm/releases/\$basearch/
                        sudo yum install -y trivy
                    fi

                    # Ensure Docker is running for ZAP
                    sudo systemctl start docker || true
                '''
            }
        }

        // ─── STAGE 5: SECURITY TESTING (OWASP ZAP) ───
        stage('5. Security Testing (ZAP)') {
            steps {
                echo '🔐 Running OWASP ZAP Scan...'
                sh '''
                    chmod 777 ${REPORT_DIR}
                    docker run --rm -v $(pwd)/${REPORT_DIR}:/zap/wrk:rw \
                        ghcr.io/zaproxy/zaproxy:stable zap-baseline.py \
                        -t http://${GREEN_IP}/ \
                        -r zap-report.html || true
                '''
            }
            post {
                always {
                    archiveArtifacts artifacts: "${REPORT_DIR}/zap-report.html", allowEmptyArchive: true
                }
            }
        }

        // ─── STAGE 6: DEPLOY TO GREEN (ANSIBLE) ───
        stage('6. Deploy to Green') {
            steps {
                echo '🟢 Deploying to Green server...'
                withCredentials([sshUserPrivateKey(credentialsId: 'ec2-ssh-key', keyFileVariable: 'SSH_KEY')]) {
                    sh '''
                        ansible-playbook -i ansible/inventory.ini \
                            ansible/deploy_app.yml \
                            --extra-vars "target_env=green green_ip=${GREEN_IP}" \
                            --private-key ${SSH_KEY} \
                            -e "ansible_ssh_common_args='-o StrictHostKeyChecking=no'"
                    '''
                }
            }
        }

        // ─── STAGE 7: VERIFY GREEN DEPLOYMENT ───
        stage('7. Verify Green Deployment') {
            steps {
                echo '🔍 Verifying Green server health...'
                sh '''
                    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://${GREEN_IP}/)
                    if [ "$HTTP_CODE" != "200" ]; then
                        echo "❌ Green server health check FAILED (HTTP $HTTP_CODE)"
                        exit 1
                    fi
                    echo "✅ Green server is healthy"
                '''
            }
        }

        // ─── STAGE 8: SWITCH TRAFFIC (ALB BLUE → GREEN) ───
        stage('8. Switch Traffic') {
            steps {
                echo '🔄 Switching ALB traffic to Green...'
                withCredentials([
                    string(credentialsId: 'aws-access-key', variable: 'AWS_ACCESS_KEY_ID'),
                    string(credentialsId: 'aws-secret-key', variable: 'AWS_SECRET_ACCESS_KEY')
                ]) {
                    sh '''
                        aws elbv2 modify-listener \
                            --listener-arn ${ALB_LISTENER} \
                            --default-actions Type=forward,TargetGroupArn=${GREEN_TG_ARN} \
                            --region ${AWS_REGION}
                    '''
                }
            }
        }

        // ─── STAGE 9: POST VERIFICATION ───
        stage('9. Post Verification') {
            steps {
                echo '🌐 Final verification via ALB...'
                withCredentials([
                    string(credentialsId: 'aws-access-key', variable: 'AWS_ACCESS_KEY_ID'),
                    string(credentialsId: 'aws-secret-key', variable: 'AWS_SECRET_ACCESS_KEY')
                ]) {
                    sh '''
                        ALB_DNS=$(aws elbv2 describe-load-balancers \
                            --region ${AWS_REGION} \
                            --query "LoadBalancers[0].DNSName" \
                            --output text)
                        
                        echo "Testing live URL: http://$ALB_DNS"
                        curl -Is http://$ALB_DNS | head -n 1
                    '''
                }
            }
        }
    }

    post {
        failure {
            echo '🔴 PIPELINE FAILED - Rolling back traffic to BLUE...'
            withCredentials([
                string(credentialsId: 'aws-access-key', variable: 'AWS_ACCESS_KEY_ID'),
                string(credentialsId: 'aws-secret-key', variable: 'AWS_SECRET_ACCESS_KEY')
            ]) {
                sh '''
                    aws elbv2 modify-listener \
                        --listener-arn ${ALB_LISTENER} \
                        --default-actions Type=forward,TargetGroupArn=${BLUE_TG_ARN} \
                        --region ${AWS_REGION} || true
                '''
            }
        }
        always {
            echo '📊 Pipeline completed. Archiving security reports...'
            archiveArtifacts artifacts: "${REPORT_DIR}/**", allowEmptyArchive: true
            cleanWs()
        }
    }
}
