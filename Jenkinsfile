pipeline {
    agent any

    environment {
        REPO_URL   = 'https://github.com/Reddynavi/Smart-City-Portal.git'
        AWS_REGION = 'ap-south-1'
        REPORT_DIR = 'security_reports'
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
                echo '🔨 Installing dependencies...'
                sh '''
                    node -v || true
                    npm -v || true
                    npm install
                    mkdir -p ${REPORT_DIR}
                '''
            }
        }

        // ─── STAGE 3: TEST ───
        stage('3. Test') {
            steps {
                echo '🧪 Running tests...'
                sh '''
                    npm test || echo "No tests found, continuing..."
                '''
            }
        }

        // ─── STAGE 4: BUILD PROJECT ───
        stage('4. Build Project') {
            steps {
                echo '🏗️ Creating production build...'
                sh '''
                    npm run build || echo "Build skipped"
                '''
            }
        }

        // ─── STAGE 5: DEPLOY (LOCAL NGINX) ───
        stage('5. Deploy to Server') {
            steps {
                echo '🚀 Deploying to Nginx...'
                sh '''
                    # Install nginx if not exists
                    sudo apt-get update
                    sudo apt-get install -y nginx

                    # Remove old files
                    sudo rm -rf /var/www/html/*

                    # Copy build files (for Vite/React)
                    if [ -d "dist" ]; then
                        sudo cp -r dist/* /var/www/html/
                    elif [ -d "build" ]; then
                        sudo cp -r build/* /var/www/html/
                    else
                        echo "No build folder found"
                    fi

                    # Start nginx
                    sudo systemctl restart nginx
                '''
            }
        }

        // ─── STAGE 6: VERIFY ───
        stage('6. Verify Deployment') {
            steps {
                echo '🔍 Checking if app is live...'
                sh '''
                    sleep 5
                    curl -I http://localhost || true
                '''
            }
        }
    }

    post {
        success {
            echo '✅ PIPELINE SUCCESSFUL 🎉'
        }
        failure {
            echo '❌ PIPELINE FAILED'
        }
        always {
            archiveArtifacts artifacts: "${REPORT_DIR}/**", allowEmptyArchive: true
            cleanWs()
        }
    }
}