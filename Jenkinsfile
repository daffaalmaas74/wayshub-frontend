pipeline {
    agent any

    environment {
        FRONTEND_SERVER    = credentials('ip-frontend-server')
        FRONTEND_DIRECTORY = credentials('directory-frontend')
        DISCORD_WEBHOOK    = credentials('discord-webhook')
    }

    stages {

        stage('pull code baru') {
            steps {
                sshagent(['server-frontend']) {
                    sh """
                        ssh -o StrictHostKeyChecking=no ${FRONTEND_SERVER} << EOF
                        cd ${FRONTEND_DIRECTORY}
                        git pull origin master
                        exit
                        EOF
                    """
                }
            }
        }

        stage('build aplikasi') {
            steps {
                sshagent(['server-frontend']) {
                    sh """
                        ssh -o StrictHostKeyChecking=no ${FRONTEND_SERVER} << EOF
                        cd ${FRONTEND_DIRECTORY}
                        docker compose build
                        exit
                        EOF
                    """
                }
            }
        }

        stage('testing') {
            steps {
                sshagent(['server-frontend']) {
                    sh """
                        ssh -o StrictHostKeyChecking=no ${FRONTEND_SERVER} << EOF
                        cd ${FRONTEND_DIRECTORY}

                        docker run --rm -d \\
                            --name frontend-testing \\
                            -p 3001:3000 \\
                            daffaalmaas74/wayshub-frontend:development

                        sleep 10

                        if wget --spider --timeout=10 http://localhost:3000; then
                            :
                        else
                            docker stop frontend-testing || true
                            exit 1
                        fi

                        docker stop frontend-testing

                        exit
                        EOF
                    """
                }
            }
        }

        stage('push ke registry') {
            steps {
                sshagent(['server-frontend']) {
                    sh """
                        ssh -o StrictHostKeyChecking=no ${FRONTEND_SERVER} << EOF
                        cd ${FRONTEND_DIRECTORY}
                        docker compose push
                        exit
                        EOF
                    """
                }
            }
        }

        stage('deploy') {
            steps {
                sshagent(['server-frontend']) {
                    sh """
                        ssh -o StrictHostKeyChecking=no ${FRONTEND_SERVER} << EOF
                        cd ${FRONTEND_DIRECTORY}
                        docker compose down
                        docker compose up -d
                        exit
                        EOF
                    """
                }
            }
        }
    }

    post {
        success {
            discordSend(
                webhookURL: DISCORD_WEBHOOK,
                title: "Jenkins Build SUCCESS",
                description: "wayshub-frontend berhasil di-build, di-test & deploy.",
                result: "SUCCESS"
            )
        }

        failure {
            discordSend(
                webhookURL: DISCORD_WEBHOOK,
                title: "Jenkins Build FAILED",
                description: "wayshub-frontend gagal di-build, test atau deploy.",
                result: "FAILURE"
            )
        }
    }
}
