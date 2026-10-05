pipeline {
    agent none

    environment {
        APP_NAME = 'ifs24038-pabwe2026-nextjs'
        SONAR_SCANNER_OPTS = '-Dsonar.projectBaseDir=/workspace'
    }

    stages {
        stage('Checkout') {
            agent {
                docker {
                    image 'oven/bun:alpine'
                    reuseNode true
                }
            }
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            agent {
                docker {
                    image 'oven/bun:alpine'
                    reuseNode true
                }
            }
            steps {
                sh 'bun install'
            }
        }

        stage('Test') {
            agent {
                docker {
                    image 'node:24-alpine'
                    reuseNode true
                }
            }
            steps {
                sh 'npx vitest run --coverage'
            }
        }

        stage('Trivy Security Scan') {
            agent {
                docker {
                    image 'aquasec/trivy:0.74.0'
                    reuseNode true
                }
            }
            steps {
                sh 'trivy fs --format sarif --output trivy-results.sarif .'
            }
        }

        stage('SonarQube Analysis') {
            agent {
                docker {
                    image 'sonarsource/sonar-scanner-cli:latest'
                    args '--network cicd-network'
                    reuseNode true
                }
            }
            steps {
                withSonarQubeEnv('MySonarQubeServer') {
                    sh 'sonar-scanner'
                }
            }
        }

        stage('Quality Gate') {
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('Package Application') {
            agent {
                docker {
                    image 'node:24-alpine'
                    reuseNode true
                }
            }
            steps {
                sh '''
                    apk add --no-cache zip
                    zip -r latest-app.zip . -x "node_modules/*" "coverage/*" ".next/*" ".git/*" "trivy-results.sarif"
                '''
            }
        }

        stage('Publish Application') {
            steps {
                script {
                    def appDir = "/var/jenkins_home/userContent/applications/${env.APP_NAME}/${env.BUILD_ID}"
                    sh "mkdir -p ${appDir}"
                    sh "cp latest-app.zip ${appDir}/latest-app.zip"
                    env.ARTIFACT_URL = "${env.JENKINS_URL}userContent/applications/${env.APP_NAME}/${env.BUILD_ID}/latest-app.zip"
                }
            }
        }

        stage('Deploy Application') {
            agent {
                docker {
                    image 'curlimages/curl:8.15.0'
                    reuseNode true
                }
            }
            steps {
                script {
                    sh """
                        curl -s -X POST "${env.URL_REDEPLOY}" \\
                            -H "Authorization: Bearer ${env.DEPLOY_TOKEN}" \\
                            -H "Content-Type: application/json" \\
                            -d '{"website_id":"${env.WEBSITE_ID}","artifact_url":"${env.ARTIFACT_URL}"}'
                    """

                    timeout(time: 10, unit: 'MINUTES') {
                        waitUntil {
                            def response = sh(
                                script: """
                                    curl -s -X GET "${env.URL_PROGRESS}?website_id=${env.WEBSITE_ID}" \\
                                        -H "Authorization: Bearer ${env.DEPLOY_TOKEN}"
                                """,
                                returnStdout: true
                            ).trim()
                            
                            echo "Deployment progress: ${response}"
                            return response.contains('"status":"SUCCESS"') || response.contains('"SUCCESS"')
                        }
                    }
                }
            }
        }
    }
}

