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

	stage('2. Build App and Static Code Analysis (SonarQube)') {
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

	stage('4. Cost Estimation (Infracost)') {
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

        stage('5. Infrastructure Plan (Terraform)') {
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

        stage('6. Manual Approval Gate') {
            steps {
                input message: 'Review Infracost report and Terraform Plan. Approve infrastructure provisioning?', ok: 'Approve'
            }
        }

        stage('7. Infrastructure Apply (Terraform)') {
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


	stage('8. Docker Build & Trivy Scan') {
            steps {
                // Pass explicit path to Dockerfile (-f) and build context
                sh 'docker build -t vrushabhghodke/em-system-app:latest -f employee-management/Dockerfile employee-management'
                sh 'trivy image --timeout 15m --severity HIGH,CRITICAL vrushabhghodke/em-system-app:latest'
            }
        }

	stage('9. Push Image to Docker Hub') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'docker-hub-credentials', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    sh 'echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin'
                    sh 'docker push vrushabhghodke/em-system-app:latest'
                }
            }
        }

	stage('10. Deploy to AWS Cloud EC2') {
            environment {
                AWS_ACCESS_KEY_ID     = credentials('aws-access-key')
                AWS_SECRET_ACCESS_KEY = credentials('aws-secret-key')
            }
            steps {
                script {
                    dir('terraform') {
                        def ec2_ip = sh(script: "terraform output -raw ec2_public_ip", returnStdout: true).trim()
                        echo "EC2 Instance Public IP: ${ec2_ip}"
                        echo "Application Cloud Deployment Complete!"
                        echo "Access your live app at: http://${ec2_ip}:8080"
                    }
                }
            }
        }
    }
}
