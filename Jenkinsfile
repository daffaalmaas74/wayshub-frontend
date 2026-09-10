```groovy
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

                        echo "Menjalankan container untuk testing..."

                        docker compose up -d

                        echo "Menunggu aplikasi berjalan..."
                        sleep 10

                        echo "Testing frontend menggunakan wget..."

                        wget --spider --timeout=10 http://localhost:3000

                        if [ \$? -eq 0 ]; then
                            echo "Testing berhasil."
                        else
                            echo "Testing gagal."
                            docker compose down
                            exit 1
                        fi

                        echo "Menghentikan container testing..."
                        docker compose down

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
```
