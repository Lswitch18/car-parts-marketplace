# JAPANCAR PARTS — Próximos Passos

> **Guia de execução para colocar o projeto em produção.**
> Atualizado: 2026-05-09

---

## 1. Executar Políticas RLS (Hoje)

O script `rls-policies.sql` já está criado. Execute no SQL Editor do Supabase.

**Arquivo:** `rls-policies.sql`

**Ação:** Copiar e executar todo o conteúdo no Supabase SQL Editor.

---

## 2. Configurar Stripe Webhook (Esta Semana)

Precisamos configurar o webhook para processar pagamentos automaticamente.

**O que fazer:**

1. Criar Edge Function `process-payment`
2. Configurar webhook no painel do Stripe
3. Testar com sandbox

**Arquivo de referência:** `supabase/functions/transactions/index.ts`

---

## 3. Implementar Sistema de Transações (Esta Semana)

Fluxo completo de compra/venda:

- [ ] Comprador inicia checkout
- [ ] Stripe retém valor
- [ ] Vendedor envia peça
- [ ] Comprador aprova
- [ ] Sistema transfere para vendedor (menos comissão)

**Arquivo de referência:** `supabase/functions/transactions/index.ts`

---

## 4. Testes de Mensagens (Esta Semana)

O sistema já está implementado. Agora testar com usuários reais.

**Verificar:**

- [ ] Enviar mensagem de comprador para vendedor
- [ ] Responder como vendedor
- [ ] Notificações em tempo real
- [ ] Mobile responsive

---

## 5. Deploy em Produção (Próxima Semana)

**Checklist de deploy:**

- [ ] Upgrade para Vercel Pro (~$17/mês)
- [ ] Upgrade para Supabase Pro (~$30/mês)
- [ ] Configurar domínio japancarparts.jp
- [ ] SSL funcionando
- [ ] Variáveis de ambiente em produção

---

## 6. Fase de Soft Launch (2-4 semanas)

- [ ] Convite para 10 lojistas beta
- [ ] Teste de transações reais
- [ ] Coleta de feedback
- [ ] Correção de bugs

---

## Resumo de Custos (Próximos Passos)

| Fase | Custo |
|------|-------|
| Desenvolvimento (atual) | R$200/semana |
| Produção (Vercel + Supabase) | ~$47/mês |
| Mão de obra manutenção | R$200-400/semana |

---

## Checklist Rápido

| # | Tarefa | Arquivo |
|---|--------|---------|
| 1 | Executar políticas RLS | `rls-policies.sql` |
| 2 | Configurar Stripe webhook | `supabase/functions/transactions/index.ts` |
| 3 | Testar mensagens | `src/pages/Messages.tsx` |
| 4 | Deploy produção | Vercel + Supabase |
| 5 | Soft launch | 10 lojistas beta |

---

*Projeto: JAPANCAR PARTS Marketplace*