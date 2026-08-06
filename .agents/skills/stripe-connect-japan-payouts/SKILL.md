---
name: stripe-connect-japan-payouts
description: Diretrizes técnicas e operacionais de repasses Stripe Connect no Japão, custódia Escrow, liquidação JPY, janelas de retenção (First Payout Delay), Instant Payouts e APIs de transferência para vendedores de autopeças.
---

# 💴 Stripe Connect Japan Payouts & Escrow Architecture (DAIG Auto Parts)

Esta skill estabelece a arquitetura técnica, regras operacionais e diretrizes financeiras para a gestão de **Transferências (Plataforma → Vendedor)** e **Repasses Bancários (Stripe → Banco do Vendedor)** no Japão.

---

## 💡 1. Conceito Fundamental: Transferência vs Repasse Bancário

É crucial diferenciar os dois fluxos de movimento financeiro no Stripe Connect:

| Conceito | O que é? | Quem controla / Quando ocorre? | Pode ser disparado imediatamente? |
| :--- | :--- | :--- | :--- |
| **Transfer (`stripe.transfers.create`)** | Movimentação dos fundos da **Conta da Plataforma (DAIG)** para a **Conta Stripe Connect do Vendedor**. | **A Plataforma DAIG**. Ocorre após o pagamento do comprador ou na confirmação de entrega do produto. | **SIM!** A plataforma pode disparar via API a qualquer momento (Liberação Escrow). |
| **Payout (`stripe.payouts.create`)** | Transferência bancária da **Conta Stripe (Disponível)** para a **Conta Bancária Física (ex: ゆうちょ銀行 Yucho Bank)**. | **Stripe + Calendário Bancário Zengin**. Depende do ciclo do Stripe (Semanal/Diário) e da janela de retenção. | **Depende**. Requer saldo no status `Available` e conta verificada. |

---

## ⏱️ 2. Janelas de Retenção & Payout Schedule no Japão (Stripe JPY)

### 🔹 1. Primeiro Repasse Bancário (First Payout Holding Period)
- **Regra do Stripe**: Quando uma nova conta Stripe/Connect realiza seu **primeiro repasse bancário**, o Stripe aplica uma retenção de segurança obrigatória de **7 a 14 dias corridos** para análise de risco, prevenção de fraudes e verificação de identidade.
- **Mensagem no Dashboard**: *"Estamos preparando seu primeiro repasse... pode demorar mais para chegar ao seu banco. Chegar até 10 de ago."*
- **Após o primeiro repasse**: Os repasses futuros passam para o fluxo normal configurado (diário ou semanal).

### 🔹 2. Janela Padrão de Liquidação no Japão (Rolling Payout Schedule)
- **Restrição Oficial da API Stripe no Japão**:
  - A API da Stripe retorna erro ao tentar definir `interval: 'daily'` para merchants no Japão (*"The payout interval 'daily' is not available for merchants in JP"*).
  - **Solução Recomendada: Repasse Manual Sob Demanda (`interval: 'manual'`)**:
    - Ao configurar `settings[payouts][schedule][interval] = 'manual'`, o usuário desativa a trava semanal (segunda-feira) e passa a ter o saldo liberado **sob demanda a qualquer momento**.
- **Alocação de Saldo (`Pending` vs `Available`)**:
  - Quando o comprador paga via Cartão de Crédito ou Konbini, o dinheiro entra primeiro como **`Pending Balance`** (Saldo Pendente).
  - No Japão (JPY), o tempo de conversão de `Pending` para `Available` (Disponível) é de **4 dias úteis (T+4)** (`delay_days: 4`).
- **Frequência de Payout**:
  - **Manual / Sob Demanda (`manual`)**: O vendedor (ou a plataforma) pode disparar o saque para a conta bancária Zengin no momento em que desejar, sem esperar pela semana seguinte.
  - **Semanal (`weekly`)**: Envio automático programado (ex: toda segunda-feira).

---

## ⚡ 3. Posso Disparar o Repasse Imediatamente ao Vendedor?

### 🔹 Para a Conta Stripe Connect do Vendedor (Escrow Release via API):
**SIM! 100% sob controle da Plataforma DAIG.**
No modelo de Custódia Escrow do Marketplace DAIG:
1. O comprador realiza o pagamento do pedido de autopeça JDM.
2. O valor total fica retido na conta da Plataforma DAIG.
3. Quando o comprador recebe e valida a peça (ou o admin clica em *"Liberar Repasse Vendedor 💸"* no painel):
   - A Edge Function/Backend executa `stripe.transfers.create({ amount: netAmount, destination: sellerStripeAccountId, transfer_group: orderId })`.
   - O saldo entra **imediatamente** na conta Connect do vendedor.

### 🔹 Para a Conta Bancária Física do Vendedor (TED/Zengin Bank):
- O vendedor pode solicitar um Payout manual (`stripe.payouts.create`) dentro da Dashboard dele (ou a plataforma via Express/Custom Connect), **DESDE QUE**:
  1. A conta Stripe já tenha superado o prazo do **Primeiro Repasse (First Payout)**.
  2. O valor já esteja liquidado no saldo **Disponível (`Available`)**.

---

## 🛠️ 4. Implementação Técnica Recomendada (Stripe Edge Function)

```typescript
import Stripe from 'https://esm.sh/stripe@14.10.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2023-10-16',
});

// Endpoint: Liberar Repasse ao Vendedor (Escrow Release)
export async function releaseSellerPayout(transaction: {
  id: string;
  amount: number;
  sellerStripeAccountId: string;
  commissionRate: number; // ex: 10%
}) {
  const amountJpy = Math.round(transaction.amount);
  const platformFee = Math.round(amountJpy * (transaction.commissionRate / 100));
  const sellerNetJpy = amountJpy - platformFee;

  // 1. Transferir o valor líquido para a conta Connect do Vendedor no Japão
  const transfer = await stripe.transfers.create({
    amount: sellerNetJpy,
    currency: 'jpy',
    destination: transaction.sellerStripeAccountId,
    transfer_group: `ORDER_${transaction.id}`,
    description: `Repasse Venda Autopeça DAIG #${transaction.id.slice(0, 8)}`,
  });

  return {
    transferId: transfer.id,
    sellerNet: sellerNetJpy,
    platformFee: platformFee,
  };
}
```

---

## 📊 5. Checklist de Verificação de Saldos e Solução de Dúvidas

1. **Por que o valor aparece como "Em breve / Chegar até 10 de ago"?**
   - Trata-se da regra de segurança de **Primeiro Repasse Bancário** do Stripe para novas contas.
2. **O vendedor já recebeu o dinheiro no sistema DAIG?**
   - Se o status no painel for `💸 Repassado (Stripe Connect)`, a transferência interna da plataforma para a conta Connect dele foi realizada com sucesso.
3. **Como acelerar o recebimento no banco do vendedor?**
   - Após o 1º repasse, configurar a conta Stripe Connect em modo de repasse diário (*Daily Payouts T+4*) ou acionar *Instant Payouts* caso o cartão de débito seja elegível no Japão.
