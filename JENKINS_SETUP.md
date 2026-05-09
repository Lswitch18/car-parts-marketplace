# Jenkins CI/CD Pipeline

## Docker Setup

### Build e Run

```bash
# Build da imagem
docker-compose -f docker-compose.jenkins.yml build

# Rodar o container
docker-compose -f docker-compose.jenkins.yml up -d

# Acessar Jenkins
# http://localhost:8081
```

## Configuração no Jenkins

### 1. Credenciais (Manage Jenkins → Credentials)

| ID | Tipo | Descrição |
|----|------|-----------|
| `supabase-access-token` | Secret text | Token do Supabase |
| `vercel-token` | Secret text | Token do Vercel |

### 2. Pipeline

1. **New Item** → **Pipeline**
2. Nome: `japancar-parts-deploy`
3. **Pipeline** → **Definition**: Pipeline script from SCM
4. **SCM**: Git
5. **Repository URL**: seu-repositório
6. **Branch**: `*/main`
7. **Script Path**: `Jenkinsfile`

## Pipeline Stages

| Stage | Ação |
|-------|------|
| Checkout | Clona repositório |
| Install | `npm ci` |
| Lint/TypeCheck | `npm run lint` + `npm run typecheck` |
| Build | `npm run build` |
| Deploy Supabase | Deploy Edge Functions |
| Deploy Vercel | Deploy frontend (opcional) |

## Variáveis de Ambiente

- `SUPABASE_PROJECT_REF`: clqubcryhbrjlupkgeva

## Comandos Úteis

```bash
# Rebuild
docker-compose -f docker-compose.jenkins.yml build --no-cache

# Logs
docker-compose -f docker-compose.jenkins.yml logs -f

# Parar
docker-compose -f docker-compose.jenkins.yml down

# Acessar container
docker exec -it jenkins-dind bash
```

## Estrutura de Arquivos

```
├── Dockerfile.jenkins        # Imagen customizada Jenkins
├── docker-compose.jenkins.yml # Orquestração
├── Jenkinsfile              # Pipeline
├── JENKINS_SETUP.md         # Este guia
├── supabase/                # Edge Functions
├── src/                     # Código frontend
└── package.json             # Dependências
```