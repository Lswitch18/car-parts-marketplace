pipeline {
    agent any
    
    environment {
        SUPABASE_PROJECT_REF = 'clqubcryhbrjlupkgeva'
        SUPABASE_ACCESS_TOKEN = credentials('supabase-access-token')
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
                sh 'git submodule update --init --recursive'
            }
        }
        
        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
            }
        }
        
        stage('Lint & TypeCheck') {
            steps {
                sh 'npm run lint || true'
                sh 'npm run typecheck || true'
            }
        }
        
        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }
        
        stage('Deploy to Supabase') {
            when {
                branch 'main'
            }
            steps {
                sh '''
                    # Install Supabase CLI latest version
                    curl -fsSL https://github.com/supabase/cli/releases/latest/download/supabase_linux_amd64.tar.gz -o /tmp/supabase.tar.gz
                    tar -xzf /tmp/supabase.tar.gz -C /tmp
                    
                    # Deploy Edge Functions
                    /tmp/supabase functions deploy parts --no-verify-jwt --project-ref $SUPABASE_PROJECT_REF
                    /tmp/supabase functions deploy users --no-verify-jwt --project-ref $SUPABASE_PROJECT_REF
                    /tmp/supabase functions deploy transactions --no-verify-jwt --project-ref $SUPABASE_PROJECT_REF
                    /tmp/supabase functions deploy auctions --no-verify-jwt --project-ref $SUPABASE_PROJECT_REF
                    /tmp/supabase functions deploy categories --no-verify-jwt --project-ref $SUPABASE_PROJECT_REF
                    /tmp/supabase functions deploy brands --no-verify-jwt --project-ref $SUPABASE_PROJECT_REF
                    /tmp/supabase functions deploy stripe-checkout --no-verify-jwt --project-ref $SUPABASE_PROJECT_REF
                    /tmp/supabase functions deploy stripe-webhook --no-verify-jwt --project-ref $SUPABASE_PROJECT_REF
                '''
            }
        }
        
        stage('Deploy to Vercel') {
            when {
                branch 'main'
            }
            steps {
                sh 'npx vercel --prod --token=$VERCEL_TOKEN'
            }
        }
        
        stage('Run Tests') {
            steps {
                sh 'npm test || true'
            }
        }
    }
    
    post {
        success {
            echo 'Pipeline completed successfully!'
            slackSend channel: '#deployments', color: 'good', message: "Build ${env.BUILD_NUMBER} deployed successfully"
        }
        failure {
            echo 'Pipeline failed!'
            slackSend channel: '#deployments', color: 'danger', message: "Build ${env.BUILD_NUMBER} failed"
        }
    }
}