pipeline {
    agent any

    environment {
        FRONTEND_SERVER    = credentials('ip-frontend-server')
        FRONTEND_DIRECTORY = credentials('directory-frontend')
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
            withCredentials([
                string(
                    credentialsId: 'discord-webhook',
                    variable: 'DISCORD_WEBHOOK'
                )
            ]) {
                discordSend(
                    webhookURL: DISCORD_WEBHOOK,
                    title: "Jenkins Build SUCCESS",
                    description: "wayshub-frontend berhasil di-build & deploy.",
                    result: "SUCCESS"
                )
            }
        }

        failure {
            withCredentials([
                string(
                    credentialsId: 'discord-webhook',
                    variable: 'DISCORD_WEBHOOK'
                )
            ]) {
                discordSend(
                    webhookURL: DISCORD_WEBHOOK,
                    variable: 'DISCORD_WEBHOOK'
                )
            }
        }
    }
}
