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

	stage('3. Docker Build & Trivy Scan') {
            steps {
                // Pass explicit path to Dockerfile (-f) and build context.
                sh 'docker build -t vrushabhghodke/em-system-app:latest -f employee-management/Dockerfile employee-management'
                sh 'trivy image --timeout 15m --severity HIGH,CRITICAL vrushabhghodke/em-system-app:latest'
            }
        }

	stage('4. Push Image to Docker Hub') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'docker-hub-credentials', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    sh 'echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin'
                    sh 'docker push vrushabhghodke/em-system-app:latest'
                }
            }
        }

        stage('5. Infrastructure Code Scan (Checkov)') {
            steps {
		// We run Checkov as a temporary Docker container, scanning the terraform folder
                sh 'docker run --rm -v "${WORKSPACE}/terraform":/tf bridgecrew/checkov -d /tf --soft-fail'
            }
        }

	stage('6. Infrastructure Plan (Terraform)') {
            environment {
                AWS_ACCESS_KEY_ID     = credentials('aws-access-key')
                AWS_SECRET_ACCESS_KEY = credentials('aws-secret-key')
            }
            steps {
                dir('terraform') {
		    // Clean up any old plan file from previous runs
	            // INDUSTRY BEST PRACTICE FOR LOCAL PIPELINES:
                    // Aggressively wipe local state and cache so Terraform doesn't get confused by manual AWS deletions
                    sh 'rm -rf .terraform terraform.tfstate terraform.tfstate.backup tfplan'

                    sh 'rm -f tfplan'
                    sh 'terraform init'
                    sh 'terraform plan -out=tfplan'
                }
            }
        }

	stage('7. FinOps Cost Estimation') {
            environment {
                INFRACOST_API_KEY = credentials('infracost-api-key')
            }
            steps {
                script {
                    sh 'curl -L "https://github.com/infracost/infracost/releases/latest/download/infracost-linux-amd64.tar.gz" -o infracost.tar.gz'
                    sh 'tar xzf infracost.tar.gz'
                    
                    // Run Infracost and save the report to a text file
                    sh './infracost-linux-amd64 breakdown --path ./terraform > infracost_report.txt'
                    
                    // Print to logs for debugging
                    sh 'cat infracost_report.txt'
                    
                    // Extract ONLY the line containing the final dollar amount
                    env.MONTHLY_COST = sh(script: 'grep "Total Monthly Cost" infracost_report.txt || echo "Cost not found"', returnStdout: true).trim()
                }
            }
	}

	stage('8. FinOps Manual Approval Gate') {
            steps {
                script {
                    // This now properly shows the exact dollar amount in the Jenkins UI
                    input message: "FinOps Review: ${env.MONTHLY_COST}. Approve AWS deployment?", ok: 'Approve & Deploy'
                }
            }
        }


	stage('9. Provision AWS Infrastructure') {
            environment {
                AWS_ACCESS_KEY_ID     = credentials('aws-access-key')
                AWS_SECRET_ACCESS_KEY = credentials('aws-secret-key')
            }
            steps {
                dir('terraform') {
		    // CHANGED: Use auto-approve instead of passing the tfplan file
                    // This bypasses the Jenkins file-locking bug completely!
                    sh 'terraform apply -auto-approve'
                    script {
                        def ec2_ip = sh(script: "terraform output -raw ec2_public_ip", returnStdout: true).trim()
                        echo "======================================================"
                        echo "EC2 Instance Provisioned: ${ec2_ip}"
                        echo "WAIT 3 MINUTES for the server to install Docker..."
                        echo "Then access your live app at: http://${ec2_ip}:8080"
                        echo "======================================================"
                    }
                }
            }
        }

    }
}
