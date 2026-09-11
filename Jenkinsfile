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
                        ssh -o StrictHostKeyChecking=no "$FRONTEND_SERVER" << EOF
                        set -e

                        cd "$FRONTEND_DIRECTORY"

                        git pull origin master

                        EOF
                    '''
                }
            }
        }

        stage('Build Image Testing') {
            steps {
                sshagent(['server-frontend']) {
                    sh '''
                        ssh -o StrictHostKeyChecking=no "$FRONTEND_SERVER" << EOF
                        set -e

                        cd "$FRONTEND_DIRECTORY"

                        docker build \
                            -t daffaalmaas74/wayshub-frontend:testing \
                            .

                        EOF
                    '''
                }
            }
        }

        stage('Testing') {
            steps {
                sshagent(['server-frontend']) {
                    sh '''
                        ssh -o StrictHostKeyChecking=no "$FRONTEND_SERVER" << EOF
                        set -e

                        cd "$FRONTEND_DIRECTORY"

                        docker compose down

                        docker rm -f frontend-testing 2>/dev/null || true

                        docker run -d \
                            --name frontend-testing \
                            --network daffaalmaas \
                            -p 3000:3000 \
                            daffaalmaas74/wayshub-frontend:testing

                        sleep 15

                        HTTP_CODE=\$(curl \
                            --max-time 10 \
                            -s \
                            -o /dev/null \
                            -w "%{http_code}" \
                            http://localhost:3000 || true)

                        if [ "\$HTTP_CODE" -ge 100 ] && [ "\$HTTP_CODE" -lt 500 ]; then

                            docker stop frontend-testing
                            docker rm frontend-testing

                        else

                            docker logs frontend-testing || true

                            docker stop frontend-testing || true
                            docker rm frontend-testing || true

                            docker compose up -d --no-build

                            sleep 10

                            OLD_HTTP_CODE=\$(curl \
                                --max-time 10 \
                                -s \
                                -o /dev/null \
                                -w "%{http_code}" \
                                http://localhost:3000 || true)

                            if [ "\$OLD_HTTP_CODE" -lt 100 ] || [ "\$OLD_HTTP_CODE" -ge 500 ]; then
                                docker logs wayshub-frontend || true
                            fi

                            exit 1
                        fi

                        EOF
                    '''
                }
            }
        }

        stage('Build Image Development') {
            steps {
                sshagent(['server-frontend']) {
                    sh '''
                        ssh -o StrictHostKeyChecking=no "$FRONTEND_SERVER" << EOF
                        set -e

                        cd "$FRONTEND_DIRECTORY"

                        docker compose build

                        EOF
                    '''
                }
            }
        }

        stage('Push ke Registry') {
            steps {
                sshagent(['server-frontend']) {
                    sh '''
                        ssh -o StrictHostKeyChecking=no "$FRONTEND_SERVER" << EOF
                        set -e

                        cd "$FRONTEND_DIRECTORY"

                        docker compose push

                        EOF
                    }
                }
            }
        }

        stage('Deploy') {
            steps {
                sshagent(['server-frontend']) {
                    sh '''
                        ssh -o StrictHostKeyChecking=no "$FRONTEND_SERVER" << EOF
                        set -e

                        cd "$FRONTEND_DIRECTORY"

                        docker compose up -d --no-build

                        sleep 10

                        HTTP_CODE=\$(curl \
                            --max-time 10 \
                            -s \
                            -o /dev/null \
                            -w "%{http_code}" \
                            http://localhost:3000 || true)

                        if [ "\$HTTP_CODE" -lt 100 ] || [ "\$HTTP_CODE" -ge 500 ]; then
                            docker logs wayshub-frontend || true
                            exit 1
                        fi

                        EOF
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
