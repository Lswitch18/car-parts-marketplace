# Guia Completo: Contratação Sagawa Express (佐川急便)

**Versão:** 1.0  
**Data:** 12 de Maio de 2026  
**Projeto:** Marketplace de Peças Automotivas JDM  
**Objetivo:** Documentar processo de contratação, custos e integrações

---

## 1. Visão Geral

Este documento detalha o processo completo para contratação dos serviços da **Sagawa Express (佐川急便)**, incluindo:
- Métodos de contato
- Documentos necessários
- Custos estimados
- Prazos de aprovação
- Comparativo com concorrentes

A Sagawa Express é uma das maiores transportadoras do Japão, com forte presença em e-commerce de peças automotivas.

---

## 2. Canais de Contato

### 2.1 Contato Principal - Empresarial

| Canal | Detalhes |
|-------|----------|
| **Website** | https://www2.sagawa-exp.co.jp/contact/logistics/?type=0311 |
| **Telefone** | Verificar escritório regional em: https://www2.sagawa-exp.co.jp/english/branch_search/ |
| **Email** | Não disponível publicamente - usar formulário web |

### 2.2 Formulário Web de Contato

**URL:** https://www2.sagawa-exp.co.jp/contact/logistics/?type=0311

**Template de Mensagem (copiar e colar):**

```
件名: 法人契約暨API連携のお見積もり依頼

本文:
您好 / Hello / Olá

我是株式会社GAID的代表，正在运营一个日本的汽车配件市场平台。

現在我們需要以下服務:
1. 法人契約（法人契約）
2. スマートAPI連携（Smart API Integration）

【会社情報 / Company Information】
- 会社名: 株式会社GAID
- 業種: ECサイト（自動車パーツ）
- 予定|月間出荷数: 1,000〜2,000件
- 配送範囲: 国内全国

【ご質問 / Questions】
1. 法人契約の開始に必要な書類は何ですか？
2. API連携（送り状発行・追跡）の利用申請手順を教えてください
3. 料金のお見積もりをいただけますか？
4. 契約からAPI利用開始までの期間はどれくらいですか？

ご検討よろしくお願いいたします。
```

### 2.3 Contato via Escritório Regional

**Busca de escritório:** https://www2.sagawa-exp.co.jp/english/branch_search/

| Região | Tipo de Contato | Melhor Para |
|--------|----------------|-------------|
| 東京 (Tokyo) | Telefone/Visita | Grandes volumes, reuniões |
| 大阪 (Osaka) | Telefone/Visita | Kansai region |
| 全国 (All Japan) | Formulário Web | Primeiro contato |

---

## 3. Processo de Contratação

### 3.1 Fluxo Completo

```
┌────────────────────────────────────────────────────────────────────────┐
│                    PROCESSO DE CONTRATAÇÃO SAGAMA                     │
└────────────────────────────────────────────────────────────────────────┘

SEMANA 1
├── 1.1 Primeiro contato via formulário web
│       └── URL: https://www2.sagawa-exp.co.jp/contact/logistics/
├── 1.2 Espera de retorno (1-3 dias úteis)
│
SEMANA 2
├── 2.1 Reunião inicial com representante (セールスドライバー)
│       ├── Apresentar volume de negócios
│       ├── Definir necessidades (法人契約 + API)
│       └── Fornecer documentos básicos
├── 2.2 Solicitação de documentos adicionais
│       └── Empresa prepara 法人登記簿謄本 ou 開業届
│
SEMANA 3-4
├── 3.1 Receber proposta comercial
│       ├── Volumes discount
│       ├── Taxas de serviço
│       └── Termos de pagamento
├── 3.2 Negociação de valores (opcional)
│       └── Solicitar discount baseado em volume
│
SEMANA 4-5
├── 4.1 Assinatura do contrato
│       ├── 契約書一式
│       └── スマートクラブ for Business 利用規約
├── 4.2 Receber お客様コード (Customer Code)
│       └── Prazo: 1-2 semanas após registro
│
SEMANA 5-6
├── 5.1 Registro Smart Club for Business
│       └── URL: https://www.sagawa-exp.co.jp/business/smartclub-forbusiness/
├── 5.2 Teste do sistema web (e-飛伝Ⅲ)
│       └── Criar etiquetas de teste
│
SEMANA 6-8
├── 6.1 Solicitar API credentials (se necessário)
│       ├── Smart API (inteligente)
│       └── 送り状発行API
├── 6.2 Receber credenciais API
│       └── Prazo: 1-2 semanas
├── 6.3 Desenvolvimento técnico
│       └── Implementação da integração
│
SEMANA 8-10
├── 7.1 Testes em homologação
├── 7.2 Ajustes finais
└── 7.3 Go-live
```

### 3.2 Detalhamento por Etapa

#### ETAPA 1: Contato Inicial (Dias 1-7)

| Ação | Responsável | Prazo |
|------|-------------|-------|
| Preencher formulário web | Cliente | 30 min |
| Aguardar retorno | Sagawa | 1-3 dias |
| Responder perguntas adicionais | Cliente | 1 dia |

#### ETAPA 2: Reunião e Documentos (Dias 8-21)

| Ação | Responsável | Prazo |
|------|-------------|-------|
| Reunião com representante | Ambos | 1-2 horas |
| Entrega de documentos | Cliente | 1 semana |
| Análise pela Sagawa | Sagawa | 3-5 dias |

#### ETAPA 3: Proposta Comercial (Dias 22-35)

| Ação | Responsável | Prazo |
|------|-------------|-------|
| Elaboração de proposta | Sagawa | 1-2 semanas |
| Revisão e negociação | Cliente | 3-5 dias |
| Aprovação final | Cliente | 1 dia |

#### ETAPA 4: Assinatura e Ativação (Dias 36-49)

| Ação | Responsável | Prazo |
|------|-------------|-------|
| Assinatura do contrato | Cliente | 1 dia |
| Processamento interno | Sagawa | 1-2 semanas |
| Emissão do お客様コード | Sagawa | 3-5 dias |

#### ETAPA 5: API e Testes (Dias 50-70)

| Ação | Responsável | Prazo |
|------|-------------|-------|
| Solicitar credenciais API | Cliente | 1 dia |
| Emissão das credenciais | Sagawa | 1-2 semanas |
| Desenvolvimento técnico | Cliente | 2-4 semanas |
| Testes | Cliente | 1 semana |

---

## 4. Documentos Necessários

### 4.1 Para Empresas (株式会社)

| Documento | Necessário | Observações |
|-----------|------------|-------------|
| 法人登記簿謄本 | ✅ Sim | Registro corporativo oficial |
| 定款 (公司章程) | ❌ Não | Apenas se solicitado |
| 請求書サンプル | ❌ Não | Apenas para verificação |
| 銀行口座情報 | ✅ Sim | Para configuração de pagamento |
| 朱印が必要 (carimbo) | ✅ Sim | Contratos usam carimbo oficial |

### 4.2 Para MEI/Individual (個人事業主)

| Documento | Necessário | Observações |
|-----------|------------|-------------|
| 開業届 | ✅ Sim | Certificado de abertura de negócios |
| 青色申告書 (opcional) | ❌ Não | Para discounts |
| 銀行口座情報 | ✅ Sim | Para configuração de pagamento |

### 4.3 Obtenção do 開業届 (Para MEI)

Se você é MEI e ainda não tem 開業届:

1. Acessar: https://www.nta.go.jp/taxes/shiraberu/taxanswershoten/shimmoto.htm
2. Baixar formulário de 開業届
3. Preencher com dados pessoais e negócios
4. Entregar na Receita Federal local ou enviar pelos correios

---

## 5. Custos e Preços

### 5.1 Custos Diretos - Frete

#### Tabela de Preços Sagawa (60サイズ - 参考)

| Região | Preço Individual | Preço法人 (estimado) | Discount |
|--------|-----------------|----------------------|----------|
| 東京→東京 | ¥770 | ¥650-700 | ~15% |
| 東京→大阪 | ¥990 | ¥850-900 | ~15% |
| 東京→名古屋 | ¥880 | ¥750-800 | ~15% |
| 東京→福岡 | ¥1,210 | ¥1,000-1,100 | ~15% |
| 東京→北海道 | ¥1,320 | ¥1,100-1,200 | ~15% |
| 東京→沖縄 | ¥1,650 | ¥1,400-1,500 | ~15% |

#### Tabela Completa de Tamanhos (法人)

| Tamanho | Peso | Kanto→Kanto | Kanto→Kansai | Kanto→Kyushu |
|---------|------|-------------|--------------|--------------|
| 60サイズ | 2kg | ¥650-700 | ¥850-900 | ¥1,000-1,100 |
| 80サイズ | 5kg | ¥850-950 | ¥1,050-1,150 | ¥1,200-1,300 |
| 100サイズ | 10kg | ¥1,050-1,150 | ¥1,250-1,400 | ¥1,400-1,550 |
| 140サイズ | 20kg | ¥1,600-1,750 | ¥1,800-2,000 | ¥2,000-2,200 |
| 160サイズ | 30kg | ¥1,800-2,000 | ¥2,000-2,200 | ¥2,200-2,500 |

### 5.2 Taxas Adicionais

| Serviço | Taxa | Observações |
|---------|------|-------------|
| Taxa de combustível | 18% | Varia conforme preço do petróleo |
| Entraga horário específico | +¥200-500 | Manhã, tarde, agendado |
| Região remota | +¥200-500 | Ilhas离岛 |
| Refrigerado (クール) | +¥275-1,320 | Conforme tamanho |
| 代引き (COD) | +¥300-500 | Taxa de coleta de pagamento |
| 持ち込み割引 | -¥100 | Desconto por levar à escritório |

### 5.3 Custos Administrativos

| Serviço | Custo | Observações |
|---------|-------|-------------|
| スマートクラブ for Business | Grátis | Registro gratuito |
| e-飛伝Ⅲ (sistema web) | Grátis | Para membros Smart Club |
| スマートAPI | Grátis | Custo de API é gratuito |
| 送り状発行API | Grátis | Requer contrato separado |
| Sistema de etiquetas (terceiros) | ¥5,000+/mês | Opcional - ex: TEMPOSTAR |

### 5.4 Custos de Desenvolvimento (Estimativa)

| Item | Estimativa (JPY) | Estimativa (BRL*) |
|------|-----------------|------------------|
| Edge Functions | ¥500,000-800,000 | R$18,000-29,000 |
| Frontend components | ¥800,000-1,200,000 | R$29,000-43,000 |
| Integração API | ¥300,000-500,000 | R$11,000-18,000 |
| Testes e ajustes | ¥200,000-300,000 | R$7,000-11,000 |
| **Total** | **¥1,800,000-2,800,000** | **R$65,000-100,000** |

*Taxa de câmbio参考: 1 BRL ≈ 27 JPY (maio 2026)*

---

## 6. Estimativa de Custos Mensais (10,000 usuários)

### 6.1 Cenário Conservador (500 envios/mês)

| Item | Cálculo | Custo Mensal |
|------|---------|--------------|
| Frete base | 500 × ¥750 | ¥375,000 |
| Taxa combustível (18%) | ¥375,000 × 0.18 | ¥67,500 |
| Regiões remotas | 50 × ¥300 | ¥15,000 |
| **Subtotal** | | **¥457,500** |
| Discount volume (5%) | ¥375,000 × 0.05 | -¥18,750 |
| **Total** | | **¥438,750** (~R$16,250) |

### 6.2 Cenário Moderado (1,000 envios/mês)

| Item | Cálculo | Custo Mensal |
|------|---------|--------------|
| Frete base | 1,000 × ¥750 | ¥750,000 |
| Taxa combustível (18%) | ¥750,000 × 0.18 | ¥135,000 |
| Regiões remotas | 100 × ¥300 | ¥30,000 |
| **Subtotal** | | **¥915,000** |
| Discount volume (10%) | ¥750,000 × 0.10 | -¥75,000 |
| **Total** | | **¥840,000** (~R$31,100) |

### 6.3 Cenário Otimista (2,000 envios/mês)

| Item | Cálculo | Custo Mensal |
|------|---------|--------------|
| Frete base | 2,000 × ¥750 | ¥1,500,000 |
| Taxa combustível (18%) | ¥1,500,000 × 0.18 | ¥270,000 |
| Regiões remotas | 200 × ¥300 | ¥60,000 |
| **Subtotal** | | **¥1,830,000** |
| Discount volume (15%) | ¥1,500,000 × 0.15 | -¥225,000 |
| **Total** | | **¥1,605,000** (~R$59,400) |

---

## 7. Prazos de Aprovação

### 7.1 Timeline Detalhada

| Etapa | Prazo | Acumulado |
|-------|-------|-----------|
| Retorno do primeiro contato | 1-3 dias | 1-3 dias |
| Reunião inicial | 3-7 dias após contato | 4-10 dias |
| Obtenção de documentos | 1-7 dias | 5-17 dias |
| Análise e proposta | 7-14 dias | 12-31 dias |
| Negociação | 3-7 dias | 15-38 dias |
| Assinatura do contrato | 1-3 dias | 16-41 dias |
| Emissão お客様コード | 7-14 dias | 23-55 dias |
| Registro Smart Club | 1-2 dias | 24-57 dias |
| Credenciais API | 7-14 dias | 31-71 dias |
| Desenvolvimento técnico | 14-28 dias | 45-99 dias |

### 7.2 Cenários de Prazo

| Cenário | Prazo Mínimo | Prazo Típico | Prazo Máximo |
|---------|--------------|--------------|--------------|
| **Processo completo** | 6 semanas | 8-10 semanas | 14+ semanas |
| **法人契約 apenas** | 3 semanas | 4-6 semanas | 8 semanas |
| **API apenas** | 2 semanas | 3-4 semanas | 6 semanas |

### 7.3 Fatores que Aceleram o Processo

1. ✅ Documentos completos no primeiro contato
2. ✅ Respostas rápidas às perguntas da Sagawa
3. ✅ Volume de negócios claro e definido
4. ✅ Visitação presencial ao escritório
5. ✅ Uso de intermediários (ex: 助ネコ, TEMPOSTAR)

### 7.4 Fatores que Atrasam o Processo

1. ❌ Documentos incompletos
2. ❌ Necessidade de negociação prolongada
3. ❌ Volume de negócios não definido
4. ❌ Comunicação por email apenas
5. ❌ Problemas com validação de documentos

---

## 8. Comparativo com Concorrentes

### 8.1 Comparação de Preços (60サイズ, Kanto→Kanto)

| Transportadora | Preço Individual | Preço法人 | Discount Disponíveis |
|----------------|------------------|-----------|----------------------|
| **佐川急便** | ¥770 | ¥650-700 | 持ち込み,法人,大口 |
| ヤマト運輸 | ¥930 | ¥750-850 | クロネコメンバーズ,持ち込み |
| 日本郵便 (ゆうパック) | ¥810 | ¥750-800 | アプリ,持ち込み |

### 8.2 Comparativo de Serviços

| Aspecto | Sagawa | Yamato | Japan Post |
|---------|--------|--------|------------|
| **Rede de coleta** | Boa | Excelente | Muito boa |
| **API Integration** | ✅ Excelente | ✅ Boa | ✅ Média |
| **代引き (COD)** | ✅ | ✅ | ✅ |
| **Coleta agendada** | ✅ | ✅ | ❌ |
| **Maiores tamanhos** | ✅ (260サイズ) | ✅ (200サイズ) | ✅ (170サイズ) |
| **Email tracking** | ✅ | ✅ | ✅ |
| **App mobile** | ✅ | ✅ | ✅ |

### 8.3 Recomendação por Cenário

| Cenário | Recomendação |理由 |
|---------|--------------|-----|
| Peças automotivas (60-120サイズ) | **Sagawa** | Melhor preço para este tamanho |
| Documentos/pequenos itens | Japan Post | Mais barato, boa rede |
| Peças frágeis/valiosas | Yamato | Melhor serviço de proteção |
| Alto volume + API | Sagawa | Melhor integração API |
| Cobertura nacional | Todos | Cobertura similar |

---

## 9. Modelo de Email para Primeiro Contato

### 9.1 Email em Japonês

```
件名: 法人契約暨API連携のお見積もり依頼（株式会社GAID）

株式会社佐川急便 御中

いつもお世話になっております。

私は自動車のOEM・中古パーツを取り扱うECプラットフォーム「GAID」
を運営しております株式会社GAIDの担当者でございます。

現在、以下のサービスについてお問い合わせがございます：

【お問いわせ内容】
1. 法人契約のお見積もり
2. スマートAPI（送り状発行・追跡連携）の利用申請
3. e-飛伝Ⅲ integration

【会社情報】
- 会社名: 株式会社GAID
- 業種: ECサイト（自動車パーツ販売）
- 所在地: 東京都中野区
- 予定月間出荷数: 1,000〜2,000件
- 主な配送エリア: 国内全国

【ご質問】
1. 法人契約の開始に必要な書類は何ですか？
2. API連携（スマートAPI）の利用申請手順を教えてください
3. 法人契約の場合の料金优惠について教えてください
4. 契約からAPI利用開始までの標準期間はどれくらいですか？

お忙しいところ恐れ入りますが、ご検討いただけますと幸いです。

联系方式:
担当者: [Nome]
TEL: [Telefone]
Email: [Email]
HP: https://gaid.jp

よろしくお願いいたします。
```

### 9.2 Email em Português (para referência)

```
Assunto: Solicitação de cotação - Contrato corporativo + Integração API (Sagawa Express)

Prezados Srs. Sagawa Express,

Somos a empresa GAID, operamos uma plataforma de e-commerce de peças automotivas JDM no Japão.

Gostaria de solicitar informações sobre:

1. Contrato corporativo para envios mensais de 1,000-2,000 pacotes
2. Integração API para geração de etiquetas e rastreamento
3. Sistema e-飛伝Ⅲ para emissão de documentos de envio

Informações da empresa:
- Razão Social: GAID Corporation
- Localização: Tóquio, Japão
- Volume estimado: 1,000-2,000 envíos/mês
- Cobertura: Todo o Japão

Por favor, informem:
- Documentos necessários para contrato
- Processo de申请 de API
- Descontos por volume
- Prazos de ativação

Atenciosamente,
[Nome]
GAID Corporation
```

---

## 10. Checklist de Preparação

### 10.1 Antes do Primeiro Contato

- [ ] Definir volume estimado de envios mensais
- [ ] Identificar principais regiões de entrega
- [ ] Listar tipos/tamanhos de produtos mais发货
- [ ] Preparar informações da empresa
- [ ] Definir se necesita API ou apenas sistema web

### 10.2 Documentos a Preparar

**Para Empresa (株式会社):**
- [ ] 法人登記簿謄本 (3 meses récents)
- [ ] 銀行口座情報
- [ ] 朱印 (carimbo oficial)
- [ ]名片 (cartão de visitas)

**Para MEI (個人事業主):**
- [ ] 開業届 copia
- [ ] 銀行口座情報
- [ ] Número de telefone de contato

### 10.3 Após Receber Proposta

- [ ] Revisar termos de pagamento (typically 月末締め翌月末払い)
- [ ] Verificar condições de cancelamento
- [ ] Confirmar politica de discount por volume
- [ ] Verificar suporte técnico disponível
- [ ] Pedir contato de suporte em caso de problemas

---

## 11. Contatos de Emergência e Suporte

### 11.1 Suporte Sagawa

| Tipo | Contato |
|------|---------|
| **Suporte geral** | https://www.sagawa-exp.co.jp/english/business/ |
| **Rastreamento** | https://www.sagawa-exp.co.jp/english/send/ |
| **Buscar escritório** | https://www2.sagawa-exp.co.jp/english/branch_search/ |

### 11.2 Alternativas - Sistemas de Terceiros

Se o processo direto for muito complexo, considerar intermediários:

| Sistema | Descrição | Custo |
|--------|-----------|-------|
| **Ship&co** | Plataforma de shipping com API Sagawa integrada | Plan paid após trial |
| **TEMPOSTAR** | Sistema de gerenciamento multi-EC | ¥10,000+/mês |
| **助ネコ** | Sistema de注文管理 com integração Sagawa | ¥5,000+/mês |
| **GoQSystem** | Sistema de gerenciamento com API Sagawa | ¥8,000+/mês |

---

## 12. Resumo Executivo

### 12.1 Números-Chave

| Item | Valor |
|------|-------|
| **Prazo total (estimado)** | 8-10 semanas |
| **Custo de开发** | ¥1.8M-2.8M |
| **Custo mensal (1k envíos)** | ¥800,000-850,000 |
| **Discount por volume** | 10-15% |
| **Tempo retorno primeiro contato** | 1-3 dias |

### 12.2 Próximos Passos Imediatos

1. ☐ Enviar email de contato (usar template acima)
2. ☐ Aguardar retorno (1-3 dias)
3. ☐ Preparar documentos da empresa
4. ☐ Agendar reunião com representante
5. ☐ Solicitar proposta comercial formal

### 12.3 Contato Rápido

```
📧 Formulário: https://www2.sagawa-exp.co.jp/contact/logistics/?type=0311
🌐 Website: https://www.sagawa-exp.co.jp/english/business/
📞 Suporte: https://www2.sagawa-exp.co.jp/english/branch_search/
```

---

*Documento criado em 12 de Maio de 2026 para o projeto Marketplace de Peças Automotivas JDM.*
