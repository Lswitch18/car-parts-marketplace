# Estudo Comparativo: Supabase + Vercel vs AWS Serverless

> **Este documento analisa a diferença de custos entre a infraestrutura atual (Supabase + Vercel) e uma alternativa baseada em AWS com serverless e auto-scaling.** O objetivo é determinar qual opção é mais econômica para o projeto JAPANCAR PARTS.

---

## 1. Resumo Executivo

| Aspecto | Supabase + Vercel | AWS Serverless |
|---------|-------------------|----------------|
| **Custo Mensal (início)** | ~$59 USD | ~$45-80 USD |
| **Custo Mensal (crescimento)** | Escala junto | Pode ficar mais barato ou mais caro |
| **Complexidade de setup** | Baixa (pronto em horas) | Alta (semanas de configuração) |
| **Manutenção** | Gerenciado (0 manutenção) | Parcialmente gerenciado |
| **Curva de aprendizado** | Baixa | Alta |
| **Escalabilidade** | Automática | Automática (Lambda + Aurora) |

### Recomendação
**Supabase + Vercel é mais barato e mais simples** para o stage inicial do projeto. AWS serverless só se torna vantagem competitiva em escala muito grande (>100k usuários ativos/mês) ou quando há necessidade de personalização extrema.

---

## 2. Custos Detalhados — Opção Atual (Supabase + Vercel)

### 2.1 Custos Mensais (Mês 1-3)

| Serviço | Plano | Recursos | Custo (USD) |
|----------|-------|-----------|-------------|
| **Vercel Pro** | Pro | CDN, deploy, analytics | $17 |
| **Supabase Pro** | DB 8GB, Auth, Storage 100GB, Realtime | $30 |
| **SendGrid** | Starter | 100k emails/mês | $10 |
| **Domínio (.jp)** | Registro anual (~$30/ano) | ~$2 |
| **TOTAL** | | | **$59/mês** |

### 2.2 Detalhamento Supabase Pro

| Recurso | Incluído | Valor |
|---------|----------|-------|
| Database (PostgreSQL) | 8 GB storage, 50 GB bandwidth | incluso |
| Auth | Usuários ilimitados | incluso |
| Storage | 100 GB | incluso |
| Realtime | 200 conexões simultâneas | incluso |
| Edge Functions | 2M invocações/mês | incluso |
| Backup | 7 dias automático | incluso |

---

## 3. Custos Detalhados — AWS Serverless

### 3.1 Componentes Necessários

Para substituir Supabase + Vercel, precisaríamos:

| Serviço AWS |替代 | Descrição |
|-------------|-----|------------|
| **Lambda** | Edge Functions | Código serverless |
| **API Gateway** | API Layer | Endpoint HTTP |
| **Aurora Serverless** | PostgreSQL | Banco de dados serverless |
| **S3** | Storage | Armazenamento de imagens |
| **CloudFront** | CDN | CDN para assets |
| **Cognito** | Auth | Autenticação |
| **Route 53** | DNS |DNS (~$0.50/mês) |
| **CloudWatch** | Logs | Monitoramento |

### 3.2 Custos AWS — Cenário Inicial (1-3 meses)

Supondo 50k usuários, 50 vendas/mês, 100k requests/mês:

| Serviço | Cálculo | Custo (USD) |
|---------|---------|-------------|
| **Lambda** | 100K req × $0.0000002 | $0.02 |
| **Lambda Duration** | 100K × 0.05GB-s × $0.0000167 | $0.08 |
| **API Gateway (HTTP)** | 100K × $0.000001 | $0.10 |
| **Aurora Serverless** | 2 ACUs mínimo × 730h | $16-50* |
| **S3** | 10 GB storage | $0.23 |
| **S3 Transfer** | 5 GB out | $0.45 |
| **CloudFront** | 10 GB transfer | ~$1.00 |
| **Cognito** | 50K MAU × $0.0055 | $0 |
| **CloudWatch Logs** | ~5 GB | $2.50 |
| **Route 53** | 1 hosted zone | $0.50 |
| **TOTAL** | | **~$21-55/mês** |

*Aurora Serverless tem custo mínimo mesmo sem uso. Para workload pequeno, provisioned pode sair mais barato.

### 3.3 Custos AWS — Crescimento (Mês 6)

Supondo 5k usuários, 500 vendas/mês, 2M requests/mês:

| Serviço | Cálculo | Custo (USD) |
|---------|---------|-------------|
| **Lambda** | 2M × $0.0000002 | $0.40 |
| **Lambda Duration** | 2M × 0.05GB-s × $0.0000167 | $1.67 |
| **API Gateway (HTTP)** | 2M × $0.000001 | $2.00 |
| **Aurora Serverless** | 4 ACUs | $32-80 |
| **S3** | 50 GB storage | $1.15 |
| **S3 Transfer** | 50 GB out | $4.50 |
| **CloudFront** | 50 GB transfer | ~$5.00 |
| **CloudWatch Logs** | 50 GB | $25.00 |
| **TOTAL** | | **~$71-119/mês** |

### 3.4 Custos AWS — Escala (Mês 12)

Supondo 20k usuários, 2k vendas/mês, 10M requests/mês:

| Serviço | Cálculo | Custo (USD) |
|---------|---------|-------------|
| **Lambda** | 10M × $0.0000002 | $2.00 |
| **Lambda Duration** | 10M × 0.05GB-s × $0.0000167 | $8.33 |
| **API Gateway (HTTP)** | 10M × $0.000001 | $10.00 |
| **Aurora Serverless** | 8 ACUs | $64-150 |
| **S3** | 200 GB storage | $4.60 |
| **S3 Transfer** | 200 GB out | $18.00 |
| **CloudFront** | 200 GB transfer | ~$18.00 |
| **CloudWatch Logs** | 200 GB | $100.00 |
| **NAT Gateway** | ~50 GB | $2.25 |
| **TOTAL** | | **~$227-313/mês** |

---

## 4. Comparação de Custos

### 4.1 Tabela Comparativa

| Cenário | Supabase + Vercel | AWS Serverless | Diferença |
|---------|-------------------|----------------|------------|
| **Início (M1-3)** | $59 | $21-55 | AWS ~$4-38 mais barato |
| **Crescimento (M6)** | $59 | $71-119 | AWS ~$12-60 mais caro |
| **Escala (M12)** | $80-100* | $227-313 | AWS ~$147-213 mais caro |
| **Custo por usuário** | $0.059 | $0.011-0.046 | Varia conforme escala |

*Supabase pode precisar upgrade para Enterprise

### 4.2 Por que AWS fica mais caro em escala?

1. **Aurora Serverless**: Custo mínimo alto ($16-50/mês mesmo vazio)
2. **CloudWatch Logs**: Caro com muito tráfego ($100+/mês no scale)
3. **NAT Gateway**: Necessário para chamadas externas (Stripe, etc)
4. **Sem integração nativa**: Cada serviço écobrado separadamente

### 4.3 Custos Escondidos no AWS

| Serviço Oculto | Impacto |
|----------------|---------|
| **CloudWatch Logs** | Pode ser 20-30% da conta |
| **NAT Gateway** | Se Lambda precisar acessar APIs externas |
| **Data Transfer** | Custos saem rápido com muito tráfego |
| **API Gateway** | 5-15% do total (se usar REST API) |
| **X-Ray** | Se habilitado, ~5% extra |

---

## 5. Vantagens e Desvantagens

### 5.1 Supabase + Vercel

| ✅ Vantagens | ❌ Desvantagens |
|-------------|-----------------|
| Setup em horas | Custos podem subir rápido em escala |
| Tudo integrado (DB + Auth + Storage + Realtime) | Menos flexibilidade para customização |
| Previsível (custo fixo/mês) | Vendor lock-in |
| Suporte excelente | Plano Enterprise fica caro |
| Japan region disponível | |
| 0 manutenção | |

### 5.2 AWS Serverless

| ✅ Vantagens | ❌ Desvantagens |
|-------------|-----------------|
| Pay-per-use real (escala 0) | Complexidade de configuração |
| Controles granulares | Curva de aprendizado íngreme |
| Potencialmente mais barato em altíssima escala | Custos escondidos |
| Qualquer serviço AWS disponível | Manutenção de múltiplos serviços |
| Sem vendor lock-in | Debugging distribuído é difícil |

---

## 6. Cenário de Break-even (onde AWS compensa)

AWS Serverless só compensa quando:
- **Volume muito alto** (>500k requests/mês)
- **Uso erratico** (muito tráfego em bursts, períodos de ociosidade)
- **Necessidade de serviços AWS específicos** (SQS, DynamoDB, etc)

**Para o JAPANCAR PARTS**, o cenário atual (10k-50k usuários, 50-500 vendas/mês) o Supabase é mais econômico e simples.

---

## 7. Alternativas de Custo Menor

Se o objetivo é reduzir custos, considere:

| Alternativa | Custo Est. | Nota |
|--------------|-----------|------|
| **Supabase Free** + Vercel Free | $0-10/mês | Limites são baixos |
| **Supabase Team** ($599/mês) + Vercel | ~$650/mês | Para equipe maior |
| **Railway** + Render | $20-40/mês | Alternativa ao Supabase |
| **DigitalOcean App Platform** | $20-50/mês | Similar ao Vercel |
| **Cloudflare Pages** + Workers | $0-20/mês | Muito barato, mas limitado |

---

## 8. Recomendação Final

### Para o JAPANCAR PARTS no estágio atual:

**Manter Supabase + Vercel** pelos motivos:

1. ✅ Custo-benefício superior em escala inicial
2. ✅ Setup em horas vs semanas no AWS
3. ✅ Japan region = latência baixa para usuários
4. ✅ Tudo integrado = menos headaches
5. ✅ Supabase Pro ($30) já inclui:
   - DB PostgreSQL 8GB
   - Auth
   - Storage 100GB
   - Realtime
   - Edge Functions
   - Backup

6. ✅ Vercel Pro ($17) já inclui:
   - CDN global
   - Deploy automático
   - Analytics
   - SSL

### Quando considerar migrar para AWS:

- Quando a fatura do Supabase passar de $200/mês
- Quando precisar de serviços AWS específicos
- Quando precisar de controle granular

---

## 9. Próximos Passos para Otimização de Custos

1. **Agora**: Manter Supabase Pro + Vercel Pro (~$59/mês)
2. **Quando growth**: Monitorar uso, fazer upgrade se necessário
3. **High scale**: Reavaliar AWS se custo Supabase > $200/mês

---

*Estudo elaborado em: 2026-05-09*
*Projeto: JAPANCAR PARTS Marketplace*