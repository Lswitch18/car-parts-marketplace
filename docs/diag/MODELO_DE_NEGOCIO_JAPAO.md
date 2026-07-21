# Digital AIGarage (DAIG) - Modelo de Negócio (Focado no Japão)

## 📌 1. Sumário Executivo
A **Digital AIGarage (DAIG)** é um marketplace e ecossistema tecnológico focado no mercado automotivo do Japão (JDM - Japan Domestic Market), conectando oficinas, lojas especializadas de autopeças (B2B) e entusiastas/compradores finais (B2C).

Com um modelo fundado na **confiança do ecossistema japonês**, a plataforma integra pagamento em dinheiro via **Konbini** (Lojas de Conveniência), custódia segura financeira (**Escrow via Stripe Connect**), inteligência de compatibilidade por código OEM/Chassi e sistema integrado de armazenagem e transporte (**Logistix WMS**).

---

## 💰 2. Fontes de Receita (Monetização)

### 2.1 Taxa de Comissão sobre Vendas (Take Rate B2C/B2B)
* **Taxa da Plataforma:** **10%** sobre o valor bruto de cada transação de autopeças realizada na plataforma.
* **Modelo de Liquidação:** A plataforma retém a taxa de 10% + tarifas de meio de pagamento (Stripe 2.9% + ¥30) e repassa os **90% líquidos (`seller_net`)** para o saldo da conta Stripe Connect do vendedor assim que o comprador confirma a entrega do item.

### 2.2 Assinaturas de Softwares B2B (Logistix WMS Partnership)
* **Plano Lojas e Desmontantes (Shakai/Oficinas):** **¥ 60.000 JPY / mês**
  * Acesso completo ao painel Logistix WMS.
  * API Key dedicada para integração de inventário em lote.
  * Mapeamento de prateleira por QR Code e rastreamento de frete automatizado.

### 2.3 Serviços de Visão Computacional e Renderização 3D (AI Engine)
* **Digitalização de Peças em 3D (Image-to-3D):** **¥ 500 JPY por modelo gerado**
  * Criação automática do arquivo 3D interativo para anúncios de alto valor (rodas, motores, turbinas, kits aerodinâmicos).

---

## 🛒 3. Estrutura de Pagamentos Locais (Adaptação ao Japão)

No Japão, a preferência por métodos de pagamento difere significativamente do mercado ocidental:

| Método de Pagamento | % de Uso no Japão | Integração na DAIG |
| :--- | :--- | :--- |
| **Konbini (Lojas de Conveniência)** | **35%** | Integrado via Stripe (7-Eleven, Lawson, FamilyMart). Validade de 3 dias no caixa. |
| **Apple Pay & Google Pay** | **30%** | Detecção automática via Stripe Checkout no Safari / Chrome. |
| **Cartões de Crédito (JCB, Visa, Mastercard)** | **25%** | Suporte total com criptografia PCI-DSS de nível 1. |
| **Transferência Bancária (Furikomi)** | **10%** | Suportado para contratos de grande porte B2B. |

---

## 🛡️ 4. Sistema de Custódia Segura (Escrow Model)

Para superar a desconfiança em compras online de peças usadas/usadas de alta performance, a DAIG opera com **Custódia Total**:
1. O dinheiro do comprador é depositado em conta de custódia na moeda **JPY (¥)**.
2. O vendedor é notificado para embalar e despachar a peça.
3. O comprador inspeciona a peça recebida.
4. O valor é liberado automaticamente ao vendedor. Se houver divergência, o valor permanece retido e a mediação da DAIG é acionada.

---

## 🌏 5. Expansão para Exportação JDM (Cross-Border Export)
O mercado global tem demanda massiva por peças autênticas do Japão (EUA, Austrália, Europa, América Latina). 
A DAIG atua como ponte para compradores internacionais adquirirem peças raras direto do Japão com frete internacional e desembaraço aduaneiro integrado via Logistix WMS.
