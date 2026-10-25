pipeline {
  agent any

  options {
    disableConcurrentBuilds()
    buildDiscarder(logRotator(numToKeepStr: '20'))
  }

  environment {
    REGISTRY   = 'localhost:5000'
    IMAGE      = "${REGISTRY}/cassier-q-web"
    DEPLOY_DIR = '/opt/apps/cassier-q-web'
  }

  stages {
    stage('Build image') {
      steps {
        script {
          env.IMAGE_TAG = env.TAG_NAME ?: "${env.BRANCH_NAME}-${env.BUILD_NUMBER}".replaceAll('[^A-Za-z0-9_.-]', '-')
        }
        sh 'docker build -t $IMAGE:$IMAGE_TAG .'
      }
    }

    // Yang di-deploy: tag (mis. v0.1.1) dan branch production (master; repo ini memakai main).
    stage('Push to registry') {
      when { anyOf { buildingTag(); branch 'master'; branch 'main' } }
      steps {
        sh '''
          docker tag  $IMAGE:$IMAGE_TAG $IMAGE:latest
          docker push $IMAGE:$IMAGE_TAG
          docker push $IMAGE:latest
        '''
      }
    }

    stage('Deploy') {
      when { anyOf { buildingTag(); branch 'master'; branch 'main' } }
      steps {
        sh '''
          if [ ! -x $DEPLOY_DIR/deploy.sh ]; then
            echo "Skip deploy: $DEPLOY_DIR/deploy.sh belum ada"
            exit 0
          fi
          # Blue-green tanpa downtime (lihat deploy/deploy.sh)
          $DEPLOY_DIR/deploy.sh $IMAGE_TAG
        '''
      }
    }
  }

  post {
    always {
      sh 'docker image prune -f || true'
    }
  }
}
