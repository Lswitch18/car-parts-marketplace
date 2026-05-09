# Jenkins CI/CD Pipeline

## Pré-requisitos

1. **Jenkins instalado** - ou usar Docker:
   ```bash
   docker-compose -f docker-compose.jenkins.yml up -d
   ```

2. **Plugins necessários:**
   - Docker Pipeline
   - Slack Notification
   - Git

3. **Credenciais no Jenkins:**
   - `supabase-access-token` - Token do Supabase (secret text)
   - `vercel-token` - Token do Vercel (secret text)

## Configuração

### 1. Criar Credential do Supabase

1. Acesse Jenkins → Credentials → Add Credential
2. Tipo: **Secret text**
3. ID: `supabase-access-token`
4. Secret: Cole o token do arquivo `.supabase-token`

### 2. Criar Pipeline

1. Jenkins → New Item → Pipeline
2. Nome: `japancar-parts-deploy`
3. Configuração:
   - GitHub project: URL do repositório
   - Pipeline: Definition → Pipeline script from SCM
   - SCM: Git
   - Repository URL: seu-repositorio
   - Branch: `*/main`

### 3. Variáveis de Ambiente

Adicione no Jenkinsfile:
- `SUPABASE_PROJECT_REF`: clqubcryhbrjlupkgeva

## Stages do Pipeline

| Stage | Descrição |
|-------|-----------|
| Checkout | Clona o repositório |
| Install | Instala dependências npm |
| Lint/TypeCheck | Verifica código |
| Build | Faz build de produção |
| Deploy Supabase | Deploy Edge Functions |
| Deploy Vercel | Deploy frontend |
| Tests | Executa testes |

## Executar Manualmente

```bash
# Build local
npm run build

# Deploy functions ( requer token)
export SUPABASE_ACCESS_TOKEN=$(cat .supabase-token)
./deploy-functions.sh
```

## Troubleshooting

### Erro de versão Docker
```bash
# Atualizar CLI do Supabase
curl -fsSL https://github.com/supabase/cli/releases/latest/download/supabase_linux_amd64.tar.gz -o /tmp/supabase.tar.gz
tar -xzf /tmp/supabase.tar.gz -C /tmp
```

### Token não encontrado
Verificar se a credential está com o nome correto: `supabase-access-token`