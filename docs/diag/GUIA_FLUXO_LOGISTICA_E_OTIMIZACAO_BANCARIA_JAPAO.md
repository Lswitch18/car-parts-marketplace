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

### 🔹 As 4 Principais Transportadoras de Autopeças no Japão

| Transportadora | Nome em Japonês | Uso Principal no Marketplace DAIG | Prazo de Entrega no Japão |
| :--- | :--- | :--- | :--- |
| **Yamato Transport** | **Kuroneko Yamato (黑猫宅急便)** | Peças pequenas e médias (faróis, volantes, relógios, módulos) | ⚡ **24 horas (no dia seguinte)** na ilha de Honshu |
| **Seino Transportation** | **Seino Unyu (西濃運輸 / カンガルー便)** | Autopeças pesadas, B2B desmanches, rodas, eixos, motores e transmissões | 🚚 **24 a 48 horas** (Forte em galpões e carga comercial) |
| **Sagawa Express** | **Sagawa Kyubin (佐川急便)** | Peças volumosas (para-choques, portas, escapamentos, capôs) | 🚚 **24 a 48 horas** |
| **Japan Post** | **Yu-Pack (日本郵便)** | Encomendas expressas padrão e envios regionais | 📦 **24 a 48 horas** |

---

### 🛵 2.1. Análise de Coleta em Casa / Galpão (集荷 - Shuka Service): Yamato vs. Seino vs. Japan Post

**Dúvida Frequente**: *"A transportadora retira a peça direto na casa do vendedor ou no galpão do desmanche? E a Seino Unyu?"*

**RESPOSTA: SIM! A Yamato, a Seino Unyu e o Japan Post oferecem serviço de Coleta no Endereço / Galpão (集荷 - Shuka).**

```mermaid
graph TD
    A[Venda Confirmada na DAIG] --> B{Tipo de Autopeça & Despacho}
    B -- Peças Pequenas/Médias (até 30kg) --> C[Yamato Kuroneko: Coleta Shuka no Galpão ou Conveniência 24h]
    B -- Peças Pesadas/Motores (30kg a 100kg+) --> D[Seino Unyu / Sagawa: Coleta Shuka de Carga Pesada no Galpão]
    B -- Envios Regionais Padrão --> E[Japan Post: Coleta Shuka ou Agência]
    C --> F[Código de Rastreio (12 dígitos) Gerado no Sistema DAIG]
    D --> F
    E --> F
```

#### 🏆 Comparativo Técnico Completo para o Marketplace DAIG:

| Critério Operacional | 📦 Yamato Transport (Kuroneko Yamato) | 🦘 Seino Transportation (西濃運輸 / カンガルー便) | 📮 Japan Post (Yu-Pack) |
| :--- | :--- | :--- | :--- |
| **Retira na Casa / Galpão? (集荷 - Shuka)** | ✅ **SIM!** Com janela de hora marcada (ex: 8h-12h, 14h-16h, 16h-18h, 18h-21h). | ✅ **SIM! Especialista em galpões de desmanche (Kaitai-gyo), oficinas e coleta residencial.** | ✅ **SIM!** Agendamento via telefone ou site oficial. |
| **Integração de Coleta Automática via API** | 🚀 **IMPECÁVEL (`Yamato B2 Cloud API`)**. O vendedor solicita a coleta no painel DAIG em 1 clique. | 🛠️ **EXCELENTE B2B (`Seino Web API / Kangaroo API`)**. Suporte a expedição comercial e pallets. | ⚠️ Mais burocrático, exige cadastro manual no portal do Japan Post. |
| **Postagem 24 horas por Dia** | 🌙 **SIM!** Pode ser postado a qualquer hora em **7-Eleven** ou **FamilyMart** (24h/365 dias). | 🏢 Coleta direta no galpão ou postagem em filiais/depósitos Seino. | 🕒 Limitado ao horário das agências dos correios (fecham às 17h/19h) e postos Lawson. |
| **Limites de Dimensão e Peso** | 📏 Até **200 cm** (soma L+A+P) e até **30 kg** por caixa. | 🐘 **ALTA CAPACIDADE!** Suporta cargas pesadas (30kg a 100kg+), caixas de câmbio e motores em pallets. | 📏 Até **170 cm** e até **25 kg** no pacote padrão. |

> 💡 **Recomendação Estratégica**:
> 1. **Yamato Kuroneko**: Padrão integrado na DAIG para 90% das autopeças pequenas/médias (com coleta no galpão e conveniências 24h).
> 2. **Seino Unyu (西濃運輸)**: **Parceira B2B Oficial para Desmanches Veiculares** para transporte de motores, transmissões, eixos, suspensões e cargas pesadas retiras diretamente no galpão.
> 3. **Sagawa Express**: Fallback para peças volumosas e para-choques.
> 4. **Japan Post**: Opção secundária.

---

### 💰 2.2. Comparativo de Preço e Tarifas por Envio (Estimativa em JPY ¥)

No Japão, a precificação do frete é tabelada com base no **Tamanho do Pacote (soma L+A+P em cm)**, **Peso (kg)** e rota geográfica (ex: Kanto para Kansai / Tokyo ➔ Osaka):

| Tamanho / Categoria | Exemplo de Autopeça JDM | 📦 Yamato Kuroneko | 📮 Japan Post (Yu-Pack) | 🦘 Seino Unyu (西濃) | 🚚 Sagawa Express |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Tamanho 60** (< 60cm, até 2kg) | Módulos ECU, relógios, manoplas, emblemas | **~JP¥ 940** | **~JP¥ 870** 🌟 | **~JP¥ 920** | **~JP¥ 910** |
| **Tamanho 80** (< 80cm, até 5kg) | Volantes, retrovisores, bombas de combustível | **~JP¥ 1.230** | **~JP¥ 1.130** | **~JP¥ 1.150** | **~JP¥ 1.180** |
| **Tamanho 100** (< 100cm, até 10kg) | Faróis, lanternas, alternadores, pinças de freio | **~JP¥ 1.530** | **~JP¥ 1.450** | **~JP¥ 1.400** | **~JP¥ 1.490** |
| **Tamanho 120** (< 120cm, até 15kg) | Radiadores, coletores, discos de freio pesados | **~JP¥ 1.850** | **~JP¥ 1.770** | **~JP¥ 1.700** | **~JP¥ 1.810** |
| **Tamanho 140-160** (< 160cm, até 25kg) | Amortecedores completos, escapamentos pequenos | **~JP¥ 2.510** | **~JP¥ 2.450** | **~JP¥ 2.200** 🌟 | **~JP¥ 2.480** |
| **Tamanho 180-200** (< 200cm, até 30kg) | Rodas com pneu, para-choques médios | **~JP¥ 3.720** | ❌ Excede limite | **~JP¥ 3.100** 🌟 | **~JP¥ 3.500** |
| **Carga Pesada / B2B** (30kg a 100kg+) | Motors V6/I4, caixas de câmbio, eixos | ❌ Excede limite | ❌ Excede limite | **~JP¥ 4.500 a ¥8.500** 🏆 (Melhor Preço!) | **~JP¥ 6.000 a ¥9.500** |

#### 📊 Resumo de Análise de Custo-Benefício:

1. **Peças Pequenas e Leves (< 80cm)**: **Japan Post (Yu-Pack)** é cerca de ~JP¥ 70 a ¥100 JPY mais barato por envio. Porém, a **Yamato** empata em benefício devido à postagem 24 horas por dia em lojas 7-Eleven / FamilyMart.
2. **Peças Padrão de Marketplace (80cm a 120cm)**: **Yamato Kuroneko** possui o melhor equilíbrio entre tarifa competitiva, velocidade de entrega em 24h e integração de API com a DAIG.
3. **Autopeças Pesadas e Volumosas (> 30kg ou Pallets)**: **Seino Transportation (西濃運輸)** é disparada a **MPOIS ECONÔMICA**, economizando até **30% a 40%** no frete B2B para desmanches veiculares.

### 🔹 Como Funciona o Código de Rastreamento (Denpyo Bangou)

1. O vendedor despacha o pacote via Coleta no Galpão (**Shuka**) ou entrega na loja de conveniência (**7-Eleven / FamilyMart**).
2. Ele recebe o código de 12 dígitos (**伝票番号 - Denpyo Bangou**), ex: `3847-1928-4019`.
3. O vendedor clica em *"Informar Envio"* no painel DAIG, seleciona a transportadora e cola o código.
4. O comprador e a plataforma acompanham o rastreamento em tempo real.

---

## 🔒 3. Como Funciona a Proteção Escrow e Liberação do Repasse

O dinheiro repassado ao vendedor fica protegido até a garantia de entrega:

* **Modo A - Liberação pelo Comprador**:
  * Ao receber o pacote em casa, o comprador abre a caixa, inspeciona a peça e clica em *"Confirmar Recebimento & Peça OK"*.
  * O dinheiro é liberado imediatamente para a **Conta Stripe Connect do Vendedor**.
* **Modo B - Liberação Automática por Rastreio (Auto-Release)**:
  * A plataforma conecta com a API de rastreamento da transportadora.
  * Quando o correio marca o status como **"Entregue" (配達完了 - Haitatsu Kanryo)**, o sistema aguarda **48 horas** (carência para o cliente verificar a peça) e libera o repasse automaticamente se não houver reclamação.

---

### 💳 3.1. Pré-Requisito Obrigatório: Conta Stripe Connect & Banco Cadastrado

Para que o vendedor consiga sacar o dinheiro para o seu banco físico no Japão, existe um passo inicial fundamental:

```mermaid
graph TD
    A[1. Venda Concluída] --> B[2. Dinheiro entra na Conta Stripe Connect do Vendedor]
    B --> C{Vendedor Criou Conta Stripe Connect?}
    C -- Não --> D[Pendente: Vendedor clica no Link de Onboarding no Painel DAIG]
    C -- Sim --> E[3. Dados Bancários Zengin Validados]
    E --> F[4. Depósito Automático no Banco Físico do Vendedor JPY]
```

1. **Conta Stripe Connect do Vendedor**:
   * O valor do repasse (90%) sai da conta principal da DAIG e entra primeiro na **Conta Stripe Connect do Vendedor**.
2. **Onboarding & Cadastro Bancário Japonês (Zengin System)**:
   * O vendedor **precisa criar/vincular sua conta no Stripe Connect** através do botão no painel da sua loja na DAIG.
   * No formulário do Stripe Express/Connect, ele insere os dados da sua conta bancária no Japão:
     * **Nome do Banco** (ex: ゆうちょ銀行 Yucho Bank, MUFG, SMBC)
     * **Código da Agência (3 dígitos)**
     * **Número da Conta (7 dígitos)**
     * **Nome do Titular em Katakana** (Hankaku Katakana - exatamente igual ao cadastro do banco no Japão).
3. **Saque para o Banco Físico**:
   * Uma vez liberado o repasse (Modo A ou B) e com a conta bancária cadastrada no Stripe Connect, o saldo cai diretamente na conta física do vendedor no Japão.

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
