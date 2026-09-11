pipeline {
    agent any

    environment {
        FRONTEND_SERVER    = credentials('ip-frontend-server')
        FRONTEND_DIRECTORY = credentials('directory-frontend')
        DISCORD_WEBHOOK    = credentials('discord-webhook')
    }

    stages {

        stage('Pull Code Baru') {
            steps {
                sshagent(['server-frontend']) {
                    sh '''
                        ssh -o StrictHostKeyChecking=no "$FRONTEND_SERVER" "
                            set -e

                            cd '$FRONTEND_DIRECTORY'

                            git pull origin master
                        "
                    '''
                }
            }
        }

        stage('Build Image Testing') {
            steps {
                sshagent(['server-frontend']) {
                    sh '''
                        ssh -o StrictHostKeyChecking=no "$FRONTEND_SERVER" "
                            set -e

                            cd '$FRONTEND_DIRECTORY'

                            docker build \
                                -t daffaalmaas74/wayshub-frontend:testing \
                                .
                        "
                    '''
                }
            }
        }

        stage('Testing') {
            steps {
                sshagent(['server-frontend']) {
                    sh '''
                        ssh -o StrictHostKeyChecking=no "$FRONTEND_SERVER" "
                            set -e

                            cd '$FRONTEND_DIRECTORY'

                            # Stop production container sementara
                            docker compose down

                            # Bersihkan container testing jika masih ada
                            docker rm -f frontend-testing 2>/dev/null || true

                            # Jalankan image testing
                            docker run -d \
                                --name frontend-testing \
                                --network daffaalmaas \
                                -p 3000:3000 \
                                daffaalmaas74/wayshub-frontend:testing

                            echo 'Waiting for frontend testing...'
                            sleep 15

                            # Health check menggunakan wget
                            if wget \
                                --timeout=10 \
                                --tries=1 \
                                -q \
                                -O /dev/null \
                                http://localhost:3000; then

                                echo 'Frontend testing SUCCESS'

                                docker stop frontend-testing
                                docker rm frontend-testing

                            else

                                echo 'Frontend testing FAILED'

                                docker logs frontend-testing || true

                                docker stop frontend-testing || true
                                docker rm frontend-testing || true

                                echo 'Starting previous production container...'

                                docker compose up -d --no-build

                                exit 1
                            fi
                        "
                    '''
                }
            }
        }

        stage('Build Image Development') {
            steps {
                sshagent(['server-frontend']) {
                    sh '''
                        ssh -o StrictHostKeyChecking=no "$FRONTEND_SERVER" "
                            set -e

                            cd '$FRONTEND_DIRECTORY'

                            docker compose build
                        "
                    '''
                }
            }
        }

        stage('Push ke Registry') {
            steps {
                sshagent(['server-frontend']) {
                    sh '''
                        ssh -o StrictHostKeyChecking=no "$FRONTEND_SERVER" "
                            set -e

                            cd '$FRONTEND_DIRECTORY'

                            docker compose push frontend
                        "
                    '''
                }
            }
        }

        stage('Deploy') {
            steps {
                sshagent(['server-frontend']) {
                    sh '''
                        ssh -o StrictHostKeyChecking=no "$FRONTEND_SERVER" "
                            set -e

                            cd '$FRONTEND_DIRECTORY'

                            docker compose up -d --no-build
                        "
                    '''
                }
            }
        }
    }

    post {

        success {
            discordSend(
                webhookURL: DISCORD_WEBHOOK,
                title: "Jenkins Build SUCCESS",
                description: "wayshub-frontend berhasil di-build, di-test, di-push & deploy.",
                result: "SUCCESS"
            )
        }

        failure {
            discordSend(
                webhookURL: DISCORD_WEBHOOK,
                title: "Jenkins Build FAILED",
                description: "wayshub-frontend gagal di-build, testing, push atau deploy.",
                result: "FAILURE"
            )
        }
    }
}
