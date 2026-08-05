---
name: japan-legal-tax-compliance
description: Diretrizes jurídicas, tributárias e regulatórias do Japão para autopeças, desmanche veicular (Kobutsu-sho & Kaitai-gyo), imposto de consumo JCT (10%), Invoice System (Tekikaku Seikyusho), retenção e pagamentos bancários Zengin/Stripe.
---

# 🇯🇵 Japan Legal & Tax Compliance Skill (DAIG Auto Parts)

Esta skill estabelece as diretrizes obrigatórias de conformidade jurídica, regulatória e fiscal para a operação de marketplace, SaaS e gestão de desmanches de veículos no Japão.

---

## 🏛️ 1. Licenciamento Regulatório do Desmanche no Japão

### 🔹 Licença de Antiguidades & Segunda Mão (古物商許可證 - Kobutsu-sho)
- Toda empresa ou indivíduo comercializando autopeças usadas no Japão deve registrar e exibir o **Número de Licença Kobutsu-sho** emitido pela comissão de segurança pública da prefeitura local (ex: 東京都公安委員会 第123456789012号).
- O sistema deve validar e exibir este registro nos perfis de vendedores B2B e nos comprovantes de transação.

### 🔹 Lei de Reciclagem Automotiva (自動車リサイクル法 - Automobile Recycling Law)
- Operadores de desmanche devem possuir licença de desmontagem (*Kaitai-gyo* 解体業許可) e coleta de fluídos (*Fluorocarbon Collection / Airbag Recovery*).
- Todo veículo processado deve gerar uma certidão de baixa e reciclagem com o código do chassi (VIN/Chassi) para o sistema nacional do Ministério do Território, Infraestrutura, Transporte e Turismo do Japão (MLIT / 国土交通省).

---

## 💴 2. Sistema Tributário do Japão (JCT & Invoice System)

### 🔹 Imposto sobre Consumo do Japão (消費税 - Japanese Consumption Tax 10%)
- Alíquota padrão: **10%** sobre a venda de autopeças e serviços no mercado interno do Japão.
- Exibição de preços: Conforme a lei de exibição de preço total (*Sogaku Hyoji* 総額表示), os preços devem exibir a discriminação clara do valor bruto incluindo imposto em JPY (ex: `¥ 45,000 (税込)`).

### 3. Sistema de Fatura Qualificada (インボイス制度 - Qualified Invoice System)
- Todo vendedor cadastrado no sistema deve informar seu **Número de Registro T+13 dígitos** (ex: `T1234567890123`).
- Os comprovantes de venda gerados pelo sistema (*Tekikaku Seikyusho* 適格請求書) devem obrigatoriamente conter:
  1. Nome e Número T do Emissor (Vendedor).
  2. Data da Transação e Descrição da Peça/Serviço.
  3. Valor Bruto sem Imposto, Valor do JCT (10%) e Valor Total com Imposto (税込).
  4. Nome do Comprador.

---

## 🏦 4. Pagamentos Bancários no Japão & Repasses Stripe Connect

- **Formato de Conta Bancária Japonesa (Zengin System)**:
  - Nome da Instituição Bancária (ex: ゆうちょ銀行, 三菱UFJ銀行, 三井住友銀行).
  - Código da Agência (支店コード 3 dígitos) e Nome da Agência.
  - Tipo de Conta: **Ordinary / Futsu (普通預金)** ou **Current / Toza (当座預金)**.
  - Número da Conta (7 dígitos) e Nome do Titular em Kana Katakana de Meio Largura (*Katakana* 口座名義).
- **Repasses Stripe Connect**:
  - Repasses automatizados utilizando `payment_intent_data.transfer_data.destination` com reconciliação de tarifas e emissão de relatório tributário anual.
