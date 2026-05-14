# Pesquisa: Empresas de Logística Japonesas para Integração

## Resumo das Opções

### 1. Yamato Transport (ヤマト運輸)
**Status:** ⭐ Recomendado para integração

| Serviço | Descrição | Custo |
|---------|-----------|-------|
| **B2クラウドAPI** | Emissão de etiquetas de envio | Por demanda (negociação) |
| **配送連携API** | Integração completa para e-commerce (etiquetas, coleta, rastreamento) | Pago |
| **クロネコメンバーズAPI** | Serviços de horário de entrega, mudança de endereço | Grátis |

**Vantagens:**
- Maior rede de logística no Japão (41.000+ pontos)
- APIs bem documentadas via YBM For Developers
- Suporte a coleta em conveniências (FamilyMart, etc)

**Desvantagens:**
- Processo de aprovação leva ~3 meses
- Requer contrato corporativo
- Documentação apenas em japonês

---

### 2. Sagawa Express (佐川急便)
**Status:** ⭐ Recomendado para integração

| Serviço | Descrição | Custo |
|---------|-----------|-------|
| **スマートAPI** | Integração completa (etiquetas, rastreamento) | Grátis (requer desenvolvimento) |

**Vantagens:**
- API gratuita (apenas custo de desenvolvimento)
- Integração mais simples que Yamato
- Boa documentação

**Desvantagens:**
- Requer contrato corporativo com Sagawa
- Processo de申请 (~1-2 meses)

---

### 3. Seino (西濃運輸)
**Status:** ⚠️ Limitado

| Serviço | Descrição | Custo |
|---------|-----------|-------|
| **webサービス** | Serviços web (rastreamento, coleta) | Grátis para usuários registrados |
| **Tracking API** | Apenas rastreamento via serviços de terceiros | Variável |

**Vantagens:**
- Foco em logística B2B
- Bom para cargas grandes

**Desvantagens:**
- API pública limitada
- Necessita serviços de terceiros para tracking completo

---

## Opções Alternativas (Sem necessidade de contrato direto)

### 1. Ship&co
- **O que é:** Plataforma agregadora de shipping
- **Supported carriers:** Yamato, Sagawa, Japan Post, FedEx, UPS, DHL
- **Custo:** Assinatura mensal (~$50-100/mês)
- **Vantagem:** Uma API para múltiplas transportadoras

### 2. AfterShip
- **O que é:** API de rastreamento multi-carrier
- **Supported carriers:** 1.200+ carriers incluindo Yamato Japan
- **Custo:** Assinatura baseada em volume

### 3. TrackingMore / 17TRACK
- **O que é:** APIs de rastreamento
- **Vantagem:** Integração rápida sem contratos diretos

---

## Recomendação para Logistix

### Fase 1: Rastreamento (Imediato)
Implementar rastreamento via **AfterShip** ou **TrackingMore** para:
- Yamato (taqbin-jp)
- Sagawa
- Japan Post

### Fase 2: Emissão de Etiquetas (Médio prazo)
Integrar com **Ship&co** ou APIs diretas:
1. Aplicar para スマートAPI da Sagawa (mais rápido)
2. Aplicar para B2クラウドAPI da Yamato (mais completo)

### Fase 3: Integração Completa (Longo prazo)
Desenvolver integração direta com APIs nativas:
- Yamato: 配送連携API
- Sagawa: スマートAPI

---

## Próximos Passos Sugeridos

1. ✅ **Agora:** Testar AfterShip/TrackingMore para rastreamento
2. 📋 **Este mês:** Aplicar para Sagawa スマートAPI (gratuito)
3. 📋 **Próximo mês:** Aplicar para Yamato B2クラウドAPI (mais funcionalidades)

---

## Links Úteis

- Yamato YBM For Developers: https://business.kuronekoyamato.co.jp/service/lineup/business_members/api/
- Sagawa スマートAPI: https://www.sagawa-exp.co.jp/smart-api/
- Ship&co: https://www.shipandco.com/
- AfterShip: https://www.aftership.com/