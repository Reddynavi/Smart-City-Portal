// ============================================
// Smart City Portal - Jenkins CI/CD Pipeline
// Blue-Green Deployment with Security Scanning
// ============================================

pipeline {
    agent any

    environment {
        REPO_URL        = 'https://github.com/Reddynavi/Smart-City-Portal.git'
        BLUE_IP         = credentials('blue-server-ip')
        GREEN_IP        = credentials('green-server-ip')
        ALB_LISTENER    = credentials('alb-listener-arn')
        BLUE_TG_ARN     = credentials('blue-tg-arn')
        GREEN_TG_ARN    = credentials('green-tg-arn')
        AWS_REGION      = 'ap-south-1'
        ZAP_REPORT      = 'reports/zap-report.html'
        NMAP_REPORT     = 'reports/nmap-report.txt'
        NIKTO_REPORT    = 'reports/nikto-report.html'
        TRIVY_REPORT    = 'reports/trivy-report.txt'
    }

    stages {

        // ─── STAGE 1: CHECKOUT ───
        stage('1. Checkout Code') {
            steps {
                echo '📥 Pulling latest code from GitHub...'
                git branch: 'main', url: "${REPO_URL}"
            }
        }

        // ─── STAGE 2: BUILD & STATIC ANALYSIS ───
        stage('2. Build & Static Analysis') {
            steps {
                echo '🔨 Building application and checking quality...'
                sh '''
                    mkdir -p reports
                    
                    echo "Validating HTML files..."
                    for file in *.html; do
                        if [ -f "$file" ]; then
                            echo "✅ Found: $file"
                        fi
                    done

                    echo "--- HTML Syntax Check ---"
                    for file in *.html; do
                        if grep -q "</html>" "$file"; then
                            echo "✅ $file - Valid HTML structure"
                        else
                            echo "❌ $file - Missing closing tags"
                            exit 1
                        fi
                    done

                    echo "--- JS Syntax Check ---"
                    if command -v node &> /dev/null; then
                        for file in js/*.js; do
                            node --check "$file" && echo "✅ $file - No syntax errors"
                        done
                    fi

                    echo "✅ Build validation complete"
                '''
            }
        }

        // ─── STAGE 3: SECURITY SCAN (DEVSECOPS) ───
        stage('3. Security Scans') {
            steps {
                echo '🔐 Running Security Scans...'
                sh 'mkdir -p reports'
                
                // ── Trivy FS Scan ──
                echo "🛡️ Running Trivy Vulnerability Scan..."
                sh '''
                    if command -v trivy &> /dev/null; then
                        trivy fs --exit-code 0 --severity HIGH,CRITICAL . > ${TRIVY_REPORT}
                        echo "✅ Trivy scan complete. Report: ${TRIVY_REPORT}"
                    else
                        echo "⚠️ Trivy not installed. Skipping."
                    fi
                '''

                // ── OWASP ZAP Scan ──
                echo "🔴 Running OWASP ZAP Scan..."
                sh '''
                    if command -v zap-cli &> /dev/null; then
                        zap-cli quick-scan --self-contained \
                            --start-options '-config api.disablekey=true' \
                            http://${GREEN_IP}/ || true
                        zap-cli report -o ${ZAP_REPORT} -f html || true
                        echo "✅ ZAP scan complete. Report: ${ZAP_REPORT}"
                    else
                        echo "⚠️ ZAP not installed. Running via Docker..."
                        chmod 777 reports
                        docker run --rm -v $(pwd)/reports:/zap/wrk \
                            ghcr.io/zaproxy/zaproxy:stable zap-baseline.py \
                            -t http://${GREEN_IP}/ \
                            -r zap-report.html || true
                        echo "✅ ZAP Docker scan complete"
                    fi
                '''

                // ── Nmap Port Scan ──
                echo "🔵 Running Nmap Scan..."
                sh '''
                    if command -v nmap &> /dev/null; then
                        nmap -sV -sC -oN ${NMAP_REPORT} ${GREEN_IP} || true
                        echo "✅ Nmap scan complete. Report: ${NMAP_REPORT}"
                    else
                        echo "⚠️ Nmap not installed. Skipping."
                    fi
                '''
            }
            post {
                always {
                    archiveArtifacts artifacts: 'reports/**', allowEmptyArchive: true
                }
            }
        }

        // ─── STAGE 4: DEPLOY TO GREEN ───
        stage('4. Deploy to Green') {
            steps {
                echo '🟢 Deploying to Green server...'
                withCredentials([sshUserPrivateKey(credentialsId: 'ec2-ssh-key', keyFileVariable: 'SSH_KEY')]) {
                    sh '''
                        echo "Deploying via Ansible..."
                        ansible-playbook -i ansible/inventory.ini \
                            ansible/deploy_app.yml \
                            --extra-vars "target_env=green" \
                            --private-key ${SSH_KEY} \
                            -e "ansible_ssh_common_args='-o StrictHostKeyChecking=no'" \
                            || {
                                echo "⚠️ Ansible failed. Using SCP fallback..."
                                scp -o StrictHostKeyChecking=no -i ${SSH_KEY} -r *.html css/ js/ public/ ec2-user@${GREEN_IP}:/tmp/smart-city/
                                ssh -o StrictHostKeyChecking=no -i ${SSH_KEY} ec2-user@${GREEN_IP} "sudo cp -r /tmp/smart-city/* /var/www/html/ && sudo systemctl restart httpd"
                            }
                    '''
                }
            }
        }

        // ─── STAGE 5: VERIFY & SWITCH TRAFFIC ───
        stage('5. Traffic Switch') {
            steps {
                withCredentials([
                    string(credentialsId: 'aws-access-key', variable: 'AWS_ACCESS_KEY_ID'),
                    string(credentialsId: 'aws-secret-key', variable: 'AWS_SECRET_ACCESS_KEY')
                ]) {
                    sh '''
                        echo "✅ Verifying Green deployment..."
                        HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://${GREEN_IP}/)
                        if [ "$HTTP_CODE" != "200" ]; then
                            echo "❌ Green server health check FAILED (HTTP $HTTP_CODE)"
                            exit 1
                        fi

                        echo "🔄 Switching ALB traffic to Green..."
                        aws elbv2 modify-listener \
                            --listener-arn ${ALB_LISTENER} \
                            --default-actions Type=forward,TargetGroupArn=${GREEN_TG_ARN} \
                            --region ${AWS_REGION}

                        echo "🔍 Final verification via ALB..."
                        ALB_DNS=$(aws elbv2 describe-load-balancers \
                            --region ${AWS_REGION} \
                            --query "LoadBalancers[0].DNSName" \
                            --output text)
                        
                        echo "🌐 Live URL: http://$ALB_DNS"
                    '''
                }
            }
        }
    }

    post {
        failure {
            echo '🔴 DEPLOYMENT FAILED - Rolling back...'
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
            cleanWs()
        }
    }
}
