---
name: stripe-connect-specialists
description: Skill especialista em arquitetura Stripe Connect, cobranças em custódia Escrow, repasses JPY no Japão, transferências via API (transfers.create), tratamento de webhooks, liquidação bancária Zengin e resolução de erros de pagamento.
---

# 💳 Stripe Connect Specialist Skill (DAIG Marketplace & SaaS)

Esta skill define o padrão mestre de arquitetura, integração de APIs, segurança financeira e tratamento de repasses no **Stripe Connect** para o Marketplace DAIG e sistema SaaS de Desmanches no Japão.

---

## 🏛️ 1. Arquitetura Stripe Connect (Modelos de Cobrança)

No Stripe Connect, existem 3 tipos principais de contas conectadas e 3 modos de movimentação de fundos. No Marketplace DAIG, utilizamos a arquitetura **Destination Charges com Custódia Escrow (Separate Charges & Transfers)**.

### 🔹 Tipos de Conta Connect
1. **Custom Connect**: A plataforma controla 100% da experiência de onboarding, interface de usuário, coleta de documentos e repasses bancários via API.
2. **Express Connect**: O vendedor utiliza um painel co-branded da Stripe para onboarding simplificado e gestão de conta bancária.
3. **Standard Connect**: O vendedor possui uma conta Stripe independente e autoriza o app da plataforma via OAuth.

### 🔹 Modos de Movimentação Financeira

```
[ Comprador ] ──( Cartão / Konbini )──► [ Conta da Plataforma DAIG ]
                                                      │
                                                      ├─► [ Comissão DAIG (ex: 10%) ]
                                                      └─( stripe.transfers.create )─► [ Conta Connect do Vendedor ]
```

- **Destination Charges**: O pagamento é cobrado diretamente indicando a conta de destino no checkout (`transfer_data.destination = acct_...`).
- **Separate Charges & Transfers (Modelo DAIG Escrow)**:
  1. A compra é efetuada e o valor entra na conta principal da **Plataforma DAIG**.
  2. O dinheiro fica em **Custódia Escrow** garantindo que o comprador receba e inspecione a autopeça JDM.
  3. Ao confirmar a entrega (ou ao clicar em *"Liberar Repasse 💸"*), a plataforma executa `stripe.transfers.create({ amount, currency: 'jpy', destination: sellerAccountId, transfer_group })`.

---

## 💴 2. Regras de Repasse Bancário no Japão (Stripe JPY & Zengin System)

### 🔹 Janelas de Liquidação (Payout Holding Periods)

| Etapa | Tempo de Processamento | Descrição |
| :--- | :--- | :--- |
| **Plataforma ➔ Stripe Connect** | ⚡ **Imediato (0 segundos)** | O disparo via `stripe.transfers.create` transfere os fundos da plataforma para o vendedor instantaneamente no Stripe. |
| **1º Repasse Bancário (First Payout)** | 🗓️ **7 a 14 dias corridos** | Trava de segurança global da Stripe para novas contas verificadas antes do primeiro depósito em banco físico. |
| **Repasses Futuros (Rolling Schedule)** | 🗓️ **4 dias úteis (T+4)** | Tempo de conversão de `Pending Balance` (Saldo Pendente) para `Available Balance` (Saldo Disponível no Japão). |
| **Transferência Zengin (Banco Físico)** | 🏦 **Semanal ou Diário** | Depósito enviado do Stripe para bancos japoneses (ex: ゆうちょ銀行 Yucho Bank, MUFG, SMBC). |

---

## ⚡ 3. Código de Referência para Disparo de Transferência (Edge Function Deno / Node)

Toda liberação de repasse deve utilizar validações rigorosas antes de chamar a API da Stripe:

```typescript
import Stripe from 'https://esm.sh/stripe@14.10.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2023-10-16',
});

export async function executeStripeTransfer(params: {
  transactionId: string;
  grossAmountJpy: number;
  commissionRate: number; // ex: 10%
  sellerStripeAccountId: string;
}) {
  const { transactionId, grossAmountJpy, commissionRate, sellerStripeAccountId } = params;

  // 1. Validação de Conta Conectada
  if (!sellerStripeAccountId || !sellerStripeAccountId.startsWith('acct_')) {
    throw new Error('Vendedor não possui uma conta Stripe Connect válida (acct_...) vinculada.');
  }

  // 2. Cálculo dos Valores em JPY
  const commissionAmount = Math.round(grossAmountJpy * (commissionRate / 100));
  const sellerNetJpy = grossAmountJpy - commissionAmount;

  if (sellerNetJpy <= 0) {
    throw new Error('O valor líquido do repasse deve ser maior que zero em JPY.');
  }

  // 3. Chamada da API Oficial da Stripe (transfers.create)
  const transfer = await stripe.transfers.create({
    amount: sellerNetJpy,
    currency: 'jpy',
    destination: sellerStripeAccountId,
    transfer_group: `TX_${transactionId}`,
    description: `Repasse Venda Autopeça DAIG #${transactionId.slice(0, 8)}`,
    metadata: {
      transaction_id: transactionId,
      commission_rate: `${commissionRate}%`,
      platform_fee_jpy: commissionAmount,
    },
  });

  return {
    success: true,
    transferId: transfer.id,
    amountTransferred: transfer.amount,
    destination: transfer.destination,
  };
}
```

---

## 🔔 4. Tratamento de Webhooks Obrigatórios do Stripe Connect

O servidor de webhooks da DAIG (`supabase/functions/stripe-webhook`) deve escutar e processar os seguintes eventos:

1. **`account.updated`**:
   - Atualiza no banco Supabase se a conta Connect do vendedor completou os requisitos de onboarding (`stripe_onboarding_complete: account.details_submitted`).
2. **`transfer.created`**:
   - Registra o `stripe_transfer_id` na transação correspondente.
3. **`payout.paid`**:
   - Notifica o vendedor via e-mail/notificação push de que o dinheiro foi depositado no banco físico dele no Japão.
4. **`payout.failed`**:
   - Alerta a equipe de suporte sobre inconsistência nos dados bancários Zengin do vendedor (ex: código de agência ou Katakana incorreto).

---

## 🛡️ 5. Resolução de Erros Comuns e Tratamento de Exceções

| Erro da API Stripe | Causa | Solução |
| :--- | :--- | :--- |
| `balance_insufficient` | O saldo disponível na conta da plataforma é inferior ao valor da transferência. | Aguardar a liquidação dos cartões de crédito dos compradores ou recarregar a conta principal. |
| `account_invalid` / `account_closed` | A conta Connect do vendedor está inativa ou suspensa. | Solicitar ao vendedor que acesse o link de Onboarding e atualize os documentos de identidade. |
| `transfers_not_allowed` | A conta Connect não concluiu a verificação de identidade no Japão. | O vendedor precisa enviar o documento de identidade (Zainichi Card / Passaporte) no Stripe. |
| `invalid_bank_account` | Os dados da conta Zengin (banco, agência, Katakana) foram rejeitados pelo banco japonês. | Corrigir a agência de 3 dígitos, número de conta de 7 dígitos e titular em Katakana de meio largura. |

---

## 📋 6. Regras de Interface e UX (Frontend Shift-Left Validation)

1. **Validação Antes do Clique**:
   - Os botões de *"Liberar Repasse Vendedor 💸"* devem verificar previamente se o vendedor possui `stripe_account_id` configurado.
2. **Estado de Loading sutil**:
   - Exibir *"Processando Stripe..."* com spinner durante a requisição para evitar múltiplos cliques duplicados.
3. **Confirmação baseada em Evidência**:
   - O badge visual de status só deve mudar para `💸 Repassado (Stripe Connect)` se a resposta da API contiver um `transferId` real e válido (`tr_...`).
