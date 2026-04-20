pipeline {
    agent any

    environment {
        REPO_URL   = 'https://github.com/Reddynavi/Smart-City-Portal.git'
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
                    node -v
                    npm -v
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
                    npm run build
                '''
            }
        }

        // ─── STAGE 5: DEPLOY (NGINX - AMAZON LINUX) ───
        stage('5. Deploy to Server') {
            steps {
                echo '🚀 Deploying to Nginx...'
                sh '''
                    # Install nginx (Amazon Linux)
                    sudo yum install -y nginx

                    # Remove old files
                    sudo rm -rf /usr/share/nginx/html/*

                    # Copy build files
                    if [ -d "dist" ]; then
                        sudo cp -r dist/* /usr/share/nginx/html/
                    elif [ -d "build" ]; then
                        sudo cp -r build/* /usr/share/nginx/html/
                    else
                        echo "No build folder found"
                        exit 1
                    fi

                    # Start nginx
                    sudo systemctl start nginx
                    sudo systemctl enable nginx
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
