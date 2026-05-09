pipeline {
    agent any
    
    environment {
        SUPABASE_PROJECT_REF = 'clqubcryhbrjlupkgeva'
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
                sh 'git submodule update --init --recursive || true'
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
        
        stage('Deploy Supabase Functions') {
            when {
                branch 'main'
            }
            steps {
                withCredentials([string(credentialsId: 'supabase-access-token', variable: 'SUPABASE_ACCESS_TOKEN')]) {
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
        }
        
        stage('Deploy to Vercel') {
            when {
                branch 'main'
            }
            steps {
                withCredentials([string(credentialsId: 'vercel-token', variable: 'VERCEL_TOKEN')]) {
                    sh 'npx vercel --prod --token=$VERCEL_TOKEN || true'
                }
            }
        }
    }
    
    post {
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed!'
        }
    }
}