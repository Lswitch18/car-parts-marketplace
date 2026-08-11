# 🚚 Guia de Logística, Rastreio e Otimização de Repasses Bancários no Japão

**Digital A.I. Garage (DAIG) • Marketplace de Autopeças JDM**  
**Data**: 11 de Agosto de 2026  
**Objetivo**: Explicação simples e direta do fluxo testado, logística de entrega pelos correios japoneses e estratégias para acelerar depósitos bancários.

---

## 📌 1. O que foi Testado e Aprovado (Status Atual)

Concluímos com sucesso o teste do **Ciclo de Pagamento e Liquidação Bancária**:

```
[ Comprador Paga JP¥ 100 ]
  ├── 1. Plataforma DAIG retém comissão (Lucro Líquido = JP¥ 6)
  ├── 2. Stripe Connect repassa 90% (JP¥ 90) para o Vendedor
  └── 3. O banco japonês recebeu o dinheiro no banco físico em 5 dias! ✅
```

---

## 📦 2. O que Falta Testar: Envio pelos Correios e Rastreamento

Após a compra, entra em cena a etapa de **Logística e Entrega da Peça Automotiva**.

```mermaid
graph LR
    A[1. Venda Confirmada] --> B[2. Vendedor Embala a Peça]
    B --> C[3. Despacho nos Correios Yamato/Sagawa]
    C --> D[4. Inserção do Código de Rastreio]
    D --> E[5. Transporte no Japão 24h a 48h]
    E --> F[6. Confirmação de Entrega & Liberação Escrow]
```

### 🔹 As 3 Principais Transportadoras do Japão

| Transportadora | Nome em Japonês | Uso Principal no Marketplace DAIG | Prazo de Entrega no Japão |
| :--- | :--- | :--- | :--- |
| **Yamato Transport** | **Kuroneko Yamato (黑猫宅急便)** | Peças pequenas e médias (faróis, volantes, relógios, módulos) | ⚡ **24 horas (no dia seguinte)** na ilha de Honshu |
| **Sagawa Express** | **Sagawa Kyubin (佐川急便)** | Peças volumosas e pesadas (para-choques, portas, escapamentos, motores) | 🚚 **24 a 48 horas** |
| **Japan Post** | **Yu-Pack (日本郵便)** | Encomendas expressas padrão e envios regionais | 📦 **24 a 48 horas** |

### 🔹 Como Funciona o Código de Rastreamento (Denpyo Bangou)

1. O vendedor leva o pacote à agência do correio ou loja de conveniência (7-Eleven / FamilyMart / Lawson).
2. Ele recebe um código de 12 dígitos (**伝票番号 - Denpyo Bangou**), ex: `3847-1928-4019`.
3. O vendedor clica em *"Informar Envio"* no painel DAIG, seleciona a transportadora e cola o código.
4. O comprador e a plataforma acompanham o rastreamento em tempo real.

---

## 🔒 3. Como Funciona a Proteção Escrow e Liberação do Repasse

O dinheiro repassado ao vendedor fica protegido até a garantia de entrega:

* **Modo A - Liberação pelo Comprador**:
  * Ao receber o pacote em casa, o comprador abre a caixa, inspeciona a peça e clica em *"Confirmar Recebimento & Peça OK"*.
  * O dinheiro é liberado imediatamente na conta do vendedor.
* **Modo B - Liberação Automática por Rastreio (Auto-Release)**:
  * A plataforma conecta com a API de rastreamento da transportadora.
  * Quando o correio marca o status como **"Entregue" (配達完了 - Haitatsu Kanryo)**, o sistema aguarda **48 horas** (carência para o cliente verificar a peça) e libera o repasse automaticamente se não houver reclamação.

---

## ⚡ 4. Como Tornar as Transações Bancárias Mais Rápidas no Japão?

O primeiro teste levou **5 dias** porque era a **primeira movimentação da conta no Stripe** (regra de segurança global chamada *First Payout Delay*).

Existem **4 formas comprovadas de acelerar os saques**:

### 1. Fim da Trava do 1º Repasse (Agora será mais rápido!)
* O 1º repasse exige de 5 a 10 dias de análise pelo banco central e Stripe.
* **A partir do 2º repasse**, a conta entra no fluxo normal e o saldo cai muito mais rápido.

### 2. Repasses Manuais Sob Demanda (`interval: 'manual'`)
* Em vez de esperar pelo depósito automático de toda segunda-feira, a conta pode ser configurada para **Saque Sob Demanda**.
* Assim que o dinheiro vira saldo disponível (`Available`), o vendedor ou a plataforma clica em *"Sacar para o Banco"* e a transferência é enviada no mesmo dia.

### 3. Stripe Instant Payouts (Transferência em Minutos - 24 horas por dia!)
* O Stripe disponibiliza no Japão o recurso **Instant Payouts** utilizando o cartão de débito do vendedor.
* O dinheiro disponível no Stripe é transferido para o banco físico em **menos de 30 minutos**, 24 horas por dia, 7 dias por semana (inclusive aos sábados, domingos e feriados).

### 4. Ciclo de Liquidação Diária (Daily Payouts)
* Após acumular histórico de vendas sem contestações, a janela de retenção diminui para **depósitos diários automáticos via Rede Zengin**.

---

## 🏁 5. Resumo Executivo para a Equipe

1. **O teste financeiro foi um sucesso absoluto**: R$ / ¥100 transacionados, comissão calculada, repasse efetuado e dinheiro depositado na conta bancária no Japão em 5 dias.
2. **Próximo teste sugerido**: Simular a inserção do rastreio Yamato e a confirmação de entrega do comprador.
3. **Produção acelerada**: Com o encerramento do 1º repasse de teste, as operações em produção terão saques acelerados e opção de transferência instantânea em minutos!
