pipeline {
  agent any

  options {
    timestamps()
    disableConcurrentBuilds()
  }

  parameters {
    string(name: 'EC2_HOST', defaultValue: '', description: 'Public IPv4 or DNS name of the EC2 instance')
    string(name: 'EC2_USER', defaultValue: 'ec2-user', description: 'SSH user (ec2-user for Amazon Linux; ubuntu for Ubuntu AMI)')
    string(name: 'DOCKER_REGISTRY', defaultValue: 'docker.io', description: 'Registry host (docker.io or your ECR registry URL)')
    string(name: 'IMAGE_NAMESPACE', defaultValue: '', description: 'Docker Hub username/org, OR ECR registry host only (e.g. 123456789012.dkr.ecr.us-east-1.amazonaws.com)')
    string(name: 'IMAGE_NAME', defaultValue: 'sahayak-backend', description: 'Repository/image name (same segment after the slash for both Docker Hub and ECR)')
    string(name: 'APP_HOST_PORT', defaultValue: '8000', description: 'Host port on EC2 mapped to the container (app listens on 8000 inside the container)')
    string(name: 'CONTAINER_NAME', defaultValue: 'sahayak-backend', description: 'Docker container name on EC2')
    string(name: 'REMOTE_ENV_FILE', defaultValue: '/home/ec2-user/backend.env', description: 'Path on EC2 to a --env-file with secrets (Mongo URI, JWT, API keys). Adjust path if EC2_USER is not ec2-user.')
    booleanParam(name: 'SKIP_DEPLOY', defaultValue: false, description: 'Build and push only; do not SSH to EC2')
  }

  environment {
    DOCKER_BUILDKIT = '1'
    // Jenkins Credentials IDs — create these in Jenkins (see comments at bottom of file).
    DOCKER_REGISTRY_CREDS_ID = 'docker-hub-credentials'
    EC2_SSH_CREDS_ID = 'ec2-backend-deploy-key'
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Tests (if configured)') {
      steps {
        script {
          def pkg = readJSON file: 'backend/package.json'
          def testScript = pkg.scripts?.test ?: ''
          if (!testScript || testScript.contains('no test specified') || testScript.contains('exit 1')) {
            echo 'Skipping tests: package.json has no real test script yet. Add one to run tests here.'
          } else {
            dir('backend') {
              sh 'npm ci'
              sh 'npm test'
            }
          }
        }
      }
    }

    stage('Docker build') {
      steps {
        dir('backend') {
          script {
            env.IMAGE_TAG = "${env.BUILD_NUMBER}"
            def repo = "${params.IMAGE_NAMESPACE.trim()}/${params.IMAGE_NAME.trim()}".replaceAll('//+', '/').replaceAll('^/+', '')
            env.IMAGE_REPO = repo
            env.FULL_IMAGE = "${repo}:${env.IMAGE_TAG}"
            sh """
              docker build --pull -t '${env.FULL_IMAGE}' -t '${repo}:latest' .
            """
          }
        }
      }
    }

    stage('Docker push') {
      when {
        expression { return params.IMAGE_NAMESPACE?.trim() }
      }
      steps {
        withCredentials([usernamePassword(credentialsId: "${env.DOCKER_REGISTRY_CREDS_ID}", usernameVariable: 'REG_USER', passwordVariable: 'REG_PASS')]) {
          script {
            def registry = params.DOCKER_REGISTRY.trim()
            if (registry == 'docker.io' || registry.isEmpty()) {
              sh '''
                echo "$REG_PASS" | docker login -u "$REG_USER" --password-stdin docker.io
              '''
            } else {
              sh """
                echo "\$REG_PASS" | docker login -u "\$REG_USER" --password-stdin '${registry}'
              """
            }
            sh """
              docker push '${env.FULL_IMAGE}'
              docker push '${env.IMAGE_REPO}:latest'
            """
          }
        }
      }
    }

    stage('Deploy to EC2 (SSH)') {
      when {
        allOf {
          expression { return !params.SKIP_DEPLOY }
          expression { return params.EC2_HOST?.trim() }
          expression { return params.IMAGE_NAMESPACE?.trim() }
        }
      }
      steps {
        sshagent(credentials: ["${env.EC2_SSH_CREDS_ID}"]) {
          sh """
            ssh -o StrictHostKeyChecking=accept-new ${params.EC2_USER}@${params.EC2_HOST} \\
              'export IMAGE="${env.FULL_IMAGE}" CNAME="${params.CONTAINER_NAME}" HPORT="${params.APP_HOST_PORT}" ENVFILE="${params.REMOTE_ENV_FILE}"; bash -s' <<'REMOTE_SCRIPT'
set -euo pipefail
docker pull "\$IMAGE"
docker stop "\$CNAME" 2>/dev/null || true
docker rm "\$CNAME" 2>/dev/null || true
docker run -d \\
  --name "\$CNAME" \\
  --restart unless-stopped \\
  -p "\$HPORT":8000 \\
  --env-file "\$ENVFILE" \\
  "\$IMAGE"
docker image prune -f --filter "until=168h" || true
REMOTE_SCRIPT
          """
        }
      }
    }
  }

  post {
    failure {
      echo 'Pipeline failed — check Docker registry credentials, IMAGE_NAMESPACE, and EC2 SSH/env file path.'
    }
  }
}

/*
  Jenkins setup (brief):

  1) Credentials
     - docker-hub-credentials: Username + Password (Docker Hub PAT recommended over account password).
       For ECR pushes, replace the Docker push login step with: aws ecr get-login-password | docker login ...
     - ec2-backend-deploy-key: SSH private key credential (matching the EC2 key pair).

  2) Jenkins agent needs Docker CLI/socket access to build and push.

  3) On EC2, create REMOTE_ENV_FILE (e.g. /home/ec2-user/backend.env) with KEY=value lines matching your local .env.

  4) Private registry pulls on EC2: docker login is NOT run over SSH in this pipeline (avoids passing secrets through SSH).
      - Docker Hub public repo: no extra setup.
      - Docker Hub private repo: SSH to EC2 once and docker login, OR attach an IAM/instance role and use ECR + ec2 pull.

  5) ECR: IMAGE_NAMESPACE = account.dkr.ecr.region.amazonaws.com, IMAGE_NAME = repo name; adjust Docker push login to use
     aws ecr get-login-password. Prefer an EC2 instance profile that allows ecr:GetAuthorizationToken + ecr:BatchGetImage on that repo.
*/
