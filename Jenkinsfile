pipeline {
agent any

environment {
    FRONTEND_SERVER    = credentials('ip-frontend-server')
    FRONTEND_DIRECTORY = credentials('directory-frontend')
    DISCORD_WEBHOOK    = credentials('discord-webhook')

    TESTING_IMAGE = 'daffaalmaas74/wayshub-frontend:testing'
    DEPLOY_IMAGE  = 'daffaalmaas74/wayshub-frontend:development'
}

stages {

    stage('Pull Code Baru') {
        steps {
            sshagent(['server-frontend']) {
                sh '''
                    ssh -o StrictHostKeyChecking=no "$FRONTEND_SERVER" << EOF

                    cd "$FRONTEND_DIRECTORY"

                    git pull origin master

                    EOF
                '''
            }
        }
    }

    stage('Build Image') {
        steps {
            sshagent(['server-frontend']) {
                sh '''
                    ssh -o StrictHostKeyChecking=no "$FRONTEND_SERVER" << EOF

                    cd "$FRONTEND_DIRECTORY"

                    docker build \
                        -t "$TESTING_IMAGE" \
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

                    cd "$FRONTEND_DIRECTORY"

                    docker rm -f frontend-testing 2>/dev/null || true

                    docker run -d \
                        --name frontend-testing \
                        --network daffaalmaas \
                        -p 3000:3000 \
                        "$TESTING_IMAGE"

                    sleep 15

                    HTTP_CODE=\$(curl \
                        --max-time 10 \
                        -s \
                        -o /dev/null \
                        -w "%{http_code}" \
                        http://localhost:3000)

                    if [ "\$HTTP_CODE" -ge 100 ] && [ "\$HTTP_CODE" -lt 500 ]; then

                        echo "Testing berhasil dengan HTTP \$HTTP_CODE"

                        docker stop frontend-testing
                        docker rm frontend-testing

                    else

                        echo "Testing gagal dengan HTTP \$HTTP_CODE"

                        docker logs frontend-testing

                        docker stop frontend-testing || true
                        docker rm frontend-testing || true

                        echo "Menjalankan kembali image production sebelumnya..."

                        docker compose up -d

                        exit 1

                    fi

                    EOF
                '''
            }
        }
    }

    stage('Push Image') {
        steps {
            sshagent(['server-frontend']) {
                sh '''
                    ssh -o StrictHostKeyChecking=no "$FRONTEND_SERVER" << EOF

                    cd "$FRONTEND_DIRECTORY"

                    docker tag \
                        "$TESTING_IMAGE" \
                        "$DEPLOY_IMAGE"

                    docker login \
                        -u "$DOCKER_USERNAME" \
                        -p "$DOCKER_TOKEN"

                    docker push "$DEPLOY_IMAGE"

                    EOF
                '''
            }
        }
    }

    stage('Deploy') {
        steps {
            sshagent(['server-frontend']) {
                sh '''
                    ssh -o StrictHostKeyChecking=no "$FRONTEND_SERVER" << EOF

                    cd "$FRONTEND_DIRECTORY"

                    docker compose pull

                    docker compose down

                    docker compose up -d

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
