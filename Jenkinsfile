pipeline {
    agent any

    environment {
        DOCKERHUB_CREDENTIALS = credentials('docker-credentials')
        SONAR_TOKEN          = credentials('sonarqube-token')
	INFRACOST_API_KEY	= credentials('infracost-api-key')
        REGISTRY             = 'docker.io'
        IMAGE_NAME           = 'vrushabhghodke/em-system-app'
        IMAGE_TAG            = "${BUILD_NUMBER}"
    }

    stages {
        stage('1. Checkout Code') {
            steps {
                git branch: 'main', url: 'https://github.com/ghodkevrushabh/em-system-devsecops-project-.git'
            }
        }

	stage('2. Static Code Analysis (SonarQube)') {
            steps {
                withSonarQubeEnv('SonarQube') {
                    dir('employee-management') { // (Keep whatever folder name you used)
                        sh 'JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64 mvn clean verify sonar:sonar -DskipTests'
                    }
                }
            }
        }

        stage('3. Infrastructure Code Scan (Checkov)') {
            steps {
                sh 'checkov -d ./terraform --soft-fail'
            }
        }

	stage('3. Cost Estimation (Infracost)') {
            environment {
                INFRACOST_API_KEY = credentials('infracost-api-key')
                CI = 'true'
            }
            steps {
                // 1. Download the latest release tarball directly into the pipeline workspace
                sh 'curl -L "https://github.com/infracost/infracost/releases/latest/download/infracost-linux-amd64.tar.gz" -o infracost.tar.gz'
                // 2. Extract the binary
                sh 'tar xzf infracost.tar.gz'
                // 3. Run the breakdown using the FRESH local binary
                sh './infracost-linux-amd64 breakdown --path ./terraform --format table'
            }
        }

        stage('4. Infrastructure Plan (Terraform)') {
            environment {
                AWS_ACCESS_KEY_ID     = credentials('aws-access-key')
                AWS_SECRET_ACCESS_KEY = credentials('aws-secret-key')
            }
            steps {
                dir('terraform') {
                    sh 'terraform init'
                    sh 'terraform plan -out=tfplan'
                }
            }
        }

        stage('5. Manual Approval Gate') {
            steps {
                input message: 'Review Infracost report and Terraform Plan. Approve infrastructure provisioning?', ok: 'Approve'
            }
        }

        stage('6. Infrastructure Apply (Terraform)') {
            environment {
                AWS_ACCESS_KEY_ID     = credentials('aws-access-key')
                AWS_SECRET_ACCESS_KEY = credentials('aws-secret-key')
            }
            steps {
                dir('terraform') {
                    sh 'terraform apply -auto-approve tfplan'
                }
            }
        }

	stage('7. Docker Build & Trivy Scan') {
            steps {
                dir('employee-management') {
                    // Builds the image. Version tag must match what we push/run later
                    sh 'docker build -t vrushabhghodke/em-system-app:20 .'
                    // Scans the image we just built
                    sh 'trivy image --severity HIGH,CRITICAL vrushabhghodke/em-system-app:20'
                }
            }
        }

        stage('8. Simplified Local Deploy (Option A)') {
            steps {
                script {
                    // 1. Remove any old version of the app running on port 8080
                    sh 'docker stop ems-app || true'
                    sh 'docker rm ems-app || true'

                    // 2. Run the new image (from Step 7) directly on Jenkins server
                    sh 'docker run -d --name ems-app -p 8080:8080 vrushabhghodke/em-system-app:20'
                    echo "Application is live! Access it at http://:8080"
                }
            }
        }
        stage('Docker Build') {
            steps {
                sh "docker build -t ${IMAGE_NAME}:${IMAGE_TAG} ."
            }
        }

        stage('Vulnerability Scan (Trivy)') {
            steps {
                sh "trivy image --exit-code 0 --severity HIGH,CRITICAL ${IMAGE_NAME}:${IMAGE_TAG}"
            }
        }

        stage('Push Image to Container Registry') {
            steps {
                sh "echo $DOCKERHUB_CREDENTIALS_PSW | docker login -u $DOCKERHUB_CREDENTIALS_USR --password-stdin"
                sh "docker push ${IMAGE_NAME}:${IMAGE_TAG}"
            }
        }

        stage('Deploy to Kubernetes (K3s)') {
            steps {
                withKubeConfig(credentialsId: 'k3s-kubeconfig') {
                    sh "kubectl set image deployment/your-app-deployment ems-container=${IMAGE_NAME}:${IMAGE_TAG}"
                }
            }
        }

        stage('Dynamic Security Testing (OWASP ZAP)') {
            steps {
                sh '''
                docker run -t --network host owasp/zap2docker-stable zap-baseline.py \
                  -t http://<VM_4_IP>:<APP_PORT> -r zap_report.html || true
                '''
            }
        }
    }

    post {
        always {
            cleanWs()
        }
    }
}
