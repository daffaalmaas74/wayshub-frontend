def secret = 'daffaalmaas'
def server = 'daffaalmaas@20.211.26.186'
def directory = 'wayshub-frontend'
def branch = 'master'

pipeline{
    agent any
    stage ('pull code baru'){
	steps{
		sshagent([secret]){
			sh """ssh -o StrictHostKeyChecking=no ${server} << EOF
			cd ${directory}
			git pull origin ${master}
			exit
			EOF"""
		}
	}
    }

    stage ('build aplikasi'){
	steps{
		sshagent([secret]) {
		sh """ssh -o StrictHostKeyChecking=no ${server} << EOF
		cd $({directory}
		docker compose build
		exit
		EOF"""
		}
	}
    }
    stage ('push ke registry'){
        steps{
                sshagent([secret]) {
                sh """ssh -o StrictHostKeyChecking=no ${server} << EOF
                cd $({directory}
                daffaalmaas74/wayshub-frontend:latest
                exit
                EOF"""
		}
	}
    }
    stage ('deploy'){
        steps{
                sshagent([secret]) {
                sh """ssh -o StrictHostKeyChecking=no ${server} << EOF
                cd $({directory}
		docker compose down
                docker compose up -d
                exit
                EOF"""
                }
        }
    }
    
