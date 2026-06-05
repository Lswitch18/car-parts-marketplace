# Proposta de Infraestrutura AWS

## DAIG — Digital A.I. Garage

### Marketplace de Peças Automotivas + Logistix WMS/TMS/OMS

---

**Preparado para:** DAIG  
**Regiões:** us-east-1 (primária) · ap-northeast-1 (Tóquio)  
**Data:** Junho 2026  
**Versão:** 1.0

---

## 1. Escopo do Projeto

| Módulo | Descrição |
|---|---|
| Marketplace | Catálogo, leilões, autenticação, pagamentos Stripe |
| Logistix | WMS/TMS/OMS completo (11 tabelas, 28+ endpoints) |
| App Mobile | Coletor, entregador, agência com scanner e GPS |
| Rastreamento | Página pública /rastreio com SLA e timeline |
| B2B API | Integração com parceiros externos |

---

## 2. Arquitetura Proposta

```
Usuário → CloudFront/CDN → ALB → EKS (k8s) → Pods API/Frontend
                                          → RDS PostgreSQL
                                          → ElastiCache Redis
                                          → S3 (imagens/logs)
```

| Componente | Tecnologia |
|---|---|
| Cluster | Amazon EKS (Kubernetes 1.29) |
| Banco | RDS PostgreSQL 16, Multi-AZ |
| Cache | ElastiCache Redis 7.1 |
| Storage | S3 com criptografia AES-256 |
| Load Balancer | ALB com HTTPS via ACM |
| Segurança | WAF, GuardDuty, Secrets Manager, IRSA |
| Observabilidade | CloudWatch + X-Ray |

---

## 3. Tabela de Preços — us-east-1

| Recurso | Configuração | Custo/mês |
|---|---|---|
| **Infraestrutura de Rede** | | |
| VPC (3 AZs, 3 pub + 3 priv) | Sem custo AWS | $0 |
| NAT Gateway | 3 NATs (1/AZ) | $96 |
| **Cluster EKS** | | |
| Control Plane | Regional, alta disponibilidade | $72 |
| Node group (m5.large × 3) | 2 vCPU, 8 GB, Auto Scaling 1–6 | $127 |
| **Banco de Dados** | | |
| RDS PostgreSQL | db.t3.medium, 20 GB gp3, Multi-AZ | $80 |
| ElastiCache Redis | cache.t3.micro, 0,5 GB | $15 |
| S3 | 10 GB + 1 TB transfer | $5 |
| **Balanceamento** | | |
| ALB | 1 ALB + 3 listeners | $18 |
| ACM | Certificado TLS | $0 |
| **Segurança** | | |
| IAM + IRSA | Menor privilégio | $0 |
| Secrets Manager | 5 segredos | $2 |
| AWS WAF | OWASP Top 10 | $30 |
| GuardDuty | Detecção de ameaças | $5 |
| **Observabilidade** | | |
| CloudWatch | Logs + métricas + alarmes | $10 |
| X-Ray | Tracing distribuído | $5 |
| **CI/CD** | | |
| ECR | 2 GB imagens Docker | $0 |
| **Total us-east-1** | | **$414/mês** |

---

## 4. Tabela de Preços — Tóquio (ap-northeast-1)

| Recurso | Configuração | Custo/mês |
|---|---|---|
| **Infraestrutura de Rede** | | |
| VPC (3 AZs, 3 pub + 3 priv) | Sem custo AWS | $0 |
| NAT Gateway | 3 NATs (1/AZ) — $0,062/h | $134 |
| **Cluster EKS** | | |
| Control Plane | Regional | $73 |
| Node group (m5.large × 3) | 2 vCPU, 8 GB — $0,106/h | $233 |
| **Banco de Dados** | | |
| RDS PostgreSQL | db.t3.medium, 20 GB gp3, Multi-AZ | $112 |
| ElastiCache Redis | cache.t3.micro | $17 |
| S3 | 10 GB + 1 TB transfer | $5 |
| **Balanceamento** | | |
| ALB | 1 ALB + 3 listeners | $22 |
| ACM | Certificado TLS | $0 |
| **Segurança** | | |
| IAM + IRSA | Menor privilégio | $0 |
| Secrets Manager | 5 segredos | $2 |
| AWS WAF | OWASP Top 10 | $30 |
| GuardDuty | Detecção de ameaças | $5 |
| **Observabilidade** | | |
| CloudWatch | Logs + métricas | $15 |
| X-Ray | Tracing | $5 |
| **Total Tóquio** | | **$688/mês** |

---

## 5. Comparativo Regional

| Categoria | us-east-1 | Tóquio | Δ |
|---|---|---|---|
| Rede | $96 | $134 | +40% |
| EKS | $199 | $306 | +54% |
| Dados | $100 | $134 | +34% |
| Segurança | $37 | $37 | 0% |
| Observabilidade | $15 | $20 | +33% |
| **Total** | **$414** | **$688** | **+66%** |

> **Recomendação:** Iniciar em us-east-1 (~$414/mês). Migrar para Tóquio quando houver tráfego real no Japão.

---

## 6. Planos Alternativos

| Plano | us-east-1 | Tóquio | Inclui |
|---|---|---|---|
| **Essencial** | **$374/mês** | **$648/mês** | Sem WAF e GuardDuty |
| **Econômico** | **$250/mês** | **$450/mês** | 1 NAT, Single-AZ RDS, Savings Plans |
| **Teste (8h)** | **~$5,60** | **~$6,72** | Liga/desliga no mesmo dia |

---

## 7. Próximos Passos

1. ✅ Aprovação do orçamento e escolha da região
2. Configuração das credenciais AWS
3. `terraform apply` — provisionamento completo (~15 min)
4. Deploy das imagens Docker via CI/CD
5. Testes de conectividade e validação
6. `terraform destroy` ao final do teste (se aplicável)

---

## 8. Contato

**DAIG — Digital A.I. Garage**  
Marketplace de Peças Automotivas Japonesas  
Logistix — Smart Logistics

---

*Proposta válida por 15 dias. Preços baseados na tabela on-demand da AWS (Junho/2026).*
