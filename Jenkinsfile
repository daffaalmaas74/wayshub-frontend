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
                        set -e

                        cd ${FRONTEND_DIRECTORY}
                        git pull origin master

                        exit
                        EOF
                    """
                }
            }
        }

        stage('testing aplikasi') {
            steps {
                sshagent(['server-frontend']) {
                    sh """
                        ssh -o StrictHostKeyChecking=no ${FRONTEND_SERVER} << EOF
                        set -e

                        cd ${FRONTEND_DIRECTORY}

                        docker compose run --rm frontend npm test -- --watchAll=false

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
                        set -e

                        cd ${FRONTEND_DIRECTORY}
                        docker compose build

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
                        set -e

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
                        set -e

                        cd ${FRONTEND_DIRECTORY}
                        docker compose down
                        docker compose pull
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
                description: "wayshub-frontend berhasil di-test, di-build, di-push, dan di-deploy.",
                result: "SUCCESS"
            )
        }

        failure {
            discordSend(
                webhookURL: DISCORD_WEBHOOK,
                title: "Jenkins Build FAILED",
                description: "wayshub-frontend gagal pada proses CI/CD.",
                result: "FAILURE"
            )
        }
    }
}
