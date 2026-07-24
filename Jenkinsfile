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
        stage('Checkout Code') {
            steps {
                git branch: 'main', url: 'https://github.com/ghodkevrushabh/em-system-devsecops-project-.git'
            }
        }

	stage('Static Code Analysis (SonarQube)') {
            steps {
                withSonarQubeEnv('SonarQube') {
                    dir('employee-management') { // (Keep whatever folder name you used)
                        sh 'JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64 mvn clean verify sonar:sonar -DskipTests'
                    }
                }
            }
        }

        stage('Infrastructure Code Scan (Checkov)') {
            steps {
                sh 'checkov -d ./terraform --soft-fail'
            }
        }

	stage('Cost Estimation (Infracost)') {
            environment {
                INFRACOST_API_KEY = credentials('infracost-api-key')
                CI = 'true'
            }
            steps {
                // 1. Download the latest release tarball directly into the pipeline workspace
                sh 'curl -L "https://github.com/infracost/infracost/releases/latest/download/infracost-linux-amd64.tar.gz" -o infracost.tar.gz'
                
                // 2. Extract the binary
                sh 'tar xzf infracost.tar.gz'
                
                // 3. Run the breakdown using the FRESH local binary (notice the ./ before infracost)
                sh './infracost-linux-amd64 breakdown --path ./terraform --format table'
            }
        }
        stage('Terraform Plan & Apply') {
            steps {
                dir('./terraform') {
                    sh 'terraform init'
                    sh 'terraform plan -out=tfplan'
                    sh 'terraform apply -auto-approve tfplan'
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
