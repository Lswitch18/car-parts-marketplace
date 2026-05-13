# SPEC.md - Especificação Técnica: Integração Sagawa Express API (佐川急便)

**Versão:** 1.0  
**Data:** 12 de Maio de 2026  
**Projeto:** Marketplace de Peças Automotivas JDM  
**Objetivo:** Implementar sistema de coleta, entrega e rastreamento via API Sagawa Express

---

## 1. Visão Geral do Projeto

### 1.1 Descrição do Sistema

Sistema de logística integrado ao marketplace que permite:
- Cotação automática de frete baseada em dimensões e região
- Geração de etiquetas de envio (送り状)
- Solicitação de coleta agendada
- Rastreamento em tempo real
- Atualização automática de status

### 1.2 Arquitetura Simplificada

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Frontend      │────►│  Edge Functions   │────►│  Sagawa API     │
│   (React)       │     │  (Supabase)      │     │  (Japan)        │
└─────────────────┘     └──────────────────┘     └─────────────────┘
        │                        │                       │
        ▼                        ▼                       ▼
   pages/Checkout          /functions/shipping         API Real
   pages/Tracking         /functions/sagawa-api         (quando contratar)
```

---

## 2. Schema do Banco de Dados

### 2.1 Tabela: shippings

```sql
CREATE TABLE shippings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Referências
  transaction_id UUID REFERENCES transactions(id) NOT NULL,
  seller_id UUID REFERENCES profiles(id) NOT NULL,
  buyer_id UUID REFERENCES profiles(id) NOT NULL,
  
  -- Dados Sagawa
  sagawa_tracking_number TEXT UNIQUE,
  sagawa_slip_number TEXT,
  label_url TEXT,
  
  -- Status do envio
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending',
    'rate_calculated',
    'label_created',
    'pickup_scheduled',
    'picked_up',
    'in_transit',
    'out_for_delivery',
    'delivered',
    'failed',
    'cancelled'
  )),
  
  -- Dimensões e peso
  package_length_cm INTEGER,
  package_width_cm INTEGER,
  package_height_cm INTEGER,
  package_weight_kg DECIMAL(10,2),
  size_category TEXT,
  
  -- Endereço remetente (seller)
  sender_name TEXT NOT NULL,
  sender_postal_code TEXT NOT NULL,
  sender_address TEXT NOT NULL,
  sender_phone TEXT NOT NULL,
  
  -- Endereço destinatário (buyer)
  receiver_name TEXT NOT NULL,
  receiver_postal_code TEXT NOT NULL,
  receiver_address TEXT NOT NULL,
  receiver_phone TEXT NOT NULL,
  
  -- Taxas
  shipping_cost_yen INTEGER,
  sagawa_fee_yen INTEGER,
  fuel_surcharge_yen INTEGER,
  total_shipping_yen INTEGER,
  
  -- Datas
  pickup_scheduled_at TIMESTAMPTZ,
  pickup_actual_at TIMESTAMPTZ,
  estimated_delivery_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_shippings_transaction_id ON shippings(transaction_id);
CREATE INDEX idx_shippings_seller_id ON shippings(seller_id);
CREATE INDEX idx_shippings_tracking_number ON shippings(sagawa_tracking_number);
CREATE INDEX idx_shippings_status ON shippings(status);
```

### 2.2 Tabela: shipping_rate_cache

```sql
CREATE TABLE shipping_rate_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_postal_code TEXT NOT NULL,
  receiver_postal_code TEXT NOT NULL,
  size_category TEXT NOT NULL,
  weight_kg DECIMAL(10,2) NOT NULL,
  base_rate_yen INTEGER,
  fuel_surcharge_yen INTEGER,
  total_rate_yen INTEGER,
  rate_valid_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(sender_postal_code, receiver_postal_code, size_category, weight_kg)
);
```

---

## 3. Edge Functions - Especificação

### 3.1 Função Principal: /functions/shipping/index.ts

#### Endpoint 1: Calcular Frete
```
POST /shipping/calculate-rate
```

**Request:**
```json
{
  "seller_id": "uuid",
  "transaction_id": "uuid",
  "package": {
    "length_cm": 40,
    "width_cm": 30,
    "height_cm": 20,
    "weight_kg": 2.5
  },
  "sender_postal_code": "1640001",
  "receiver_postal_code": "1000001"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "size_category": "60",
    "base_rate": 770,
    "fuel_surcharge": 138,
    "total_rate": 908,
    "estimated_days": 1,
    "rate_valid_until": "2026-05-13T23:59:59Z"
  }
}
```

#### Endpoint 2: Criar Etiqueta
```
POST /shipping/create-label
```

**Request:**
```json
{
  "seller_id": "uuid",
  "transaction_id": "uuid",
  "shipping_data": {
    "package": { "length_cm": 40, "width_cm": 30, "height_cm": 20, "weight_kg": 2.5 },
    "sender": { "name": "株式会社GAID", "postal_code": "1640001", "address": "東京都...", "phone": "0332222222" },
    "receiver": { "name": "山田太郎", "postal_code": "1000001", "address": "東京都...", "phone": "09012345678" },
    "delivery_instructions": "壊れ物注意"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "shipping_id": "uuid",
    "tracking_number": "9876543210987",
    "slip_number": "1234567890123",
    "label_url": "https://storage.sagawa.ne.jp/labels/xxx.pdf",
    "pickup_scheduled_at": "2026-05-14T09:00:00Z",
    "estimated_delivery_at": "2026-05-15T18:00:00Z"
  }
}
```

#### Endpoint 3: Solicitar Coleta
```
POST /shipping/request-pickup
```

**Request:**
```json
{
  "shipping_id": "uuid",
  "preferred_date": "2026-05-14",
  "preferred_time_slot": "morning"
}
```

#### Endpoint 4: Rastrear Envio
```
GET /shipping/tracking/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "tracking_number": "9876543210987",
    "status": "in_transit",
    "status_description": "輸送中",
    "last_update": "2026-05-12T14:30:00Z",
    "location": "東京交換センター",
    "estimated_delivery": "2026-05-13T18:00:00Z",
    "events": [
      {
        "timestamp": "2026-05-12T09:00:00Z",
        "status": "picked_up",
        "location": "東京中部支店",
        "description": "集荷完了"
      }
    ]
  }
}
```

---

## 4. API Sagawa - Especificação Técnica

### 4.1 Autenticação

```
Header: Authorization: Bearer {access_token}
Header: X-Api-Key: {api_key}
Header: X-Customer-Id: {customer_id}
Content-Type: application/json
```

### 4.2 Endpoints da API Sagawa

#### Cotação de Frete
```http
POST https://api.sagawa-exp.co.jp/v1/rates
```

#### Criar Etiqueta
```http
POST https://label-api.sagawa-exp.co.jp/v1/labels
```

#### Solicitar Coleta
```http
POST https://api.sagawa-exp.co.jp/v1/pickup
```

#### Rastrear Envio
```http
GET https://api.sagawa-exp.co.jp/v1/trackings/{tracking_number}
```

---

## 5. Tabela de Tamanhos Sagawa

| Tamanho | Dimensões (3辺合計) | Peso Máximo | Preço Estimado (¥) |
|---------|---------------------|-------------|---------------------|
| 60サイズ | ~60cm | 2kg | 650-770 |
| 80サイズ | ~80cm | 5kg | 850-1,000 |
| 100サイズ | ~100cm | 10kg | 1,050-1,300 |
| 140サイズ | ~140cm | 20kg | 1,600-1,900 |
| 160サイズ | ~160cm | 30kg | 1,800-2,100 |
| 170サイズ | ~170cm | 30kg | 2,000-2,300 |
| 200サイズ | ~200cm | 40kg | 3,200-3,500 |
| 260サイズ | ~260cm | 50kg | 5,500-6,000 |

---

## 6. Fluxo de Integração

### 6.1 Fluxo Completo (Happy Path)

```
┌──────────────────────────────────────────────────────────────────────────┐
│                           FLUXO DE ENVIO                                 │
└──────────────────────────────────────────────────────────────────────────┘

1. COMPRADOR заверilha compra
   │
   ▼
2. PÁGINA PaymentCheckout.tsx
   ├── Exibe opções de envio (calculado automaticamente)
   ├── Comprador seleciona dimensões do pacote
   └── Comprador confirma endereço de entrega
   │
   ▼
3. EDGE FUNCTION calculate-rate
   ├── Recebe dados do pacote + CEPs
   ├── Calcula categoria de tamanho
   ├── Consulta API Sagawa para cotação
   ├── Armazena em cache (rate_cache)
   └── Retorna taxa ao frontend
   │
   ▼
4. COMPRADOR confirma pagamento
   ├── Sistema cria transaction (status: 'paid')
   ├── Sistema cria shipping (status: 'pending')
   │
   ▼
5. VENDEDOR é notificado
   ├── DashboardSeller mostra "Enviar produto"
   ├── Vendedor imprime etiqueta
   ├── Vendedor embala produto
   │
   ▼
6. EDGE FUNCTION create-label
   ├── Recebe dados completos de envio
   ├── Chama API Sagawa para criar etiqueta
   ├── Recebe tracking_number + pdf_url
   ├── Salva em database
   └── Atualiza status para 'label_created'
   │
   ▼
7. VENDEDOR agenda coleta
   ├── Solicita coleta via Dashboard
   ├── Define data/horário preferido
   │
   ▼
8. EDGE FUNCTION request-pickup
   ├── Agenda coleta via API Sagawa
   ├── Atualiza status para 'pickup_scheduled'
   │
   ▼
9. SAGAMA recolhe pacote
   ├── Motorista busca na casa do vendedor
   ├── Status atualiza para 'picked_up'
   │
   ▼
10. STATUS AUTOMÁTICO
    ├── in_transit → Movimento entre centros
    ├── out_for_delivery → Saiu para entrega
    ├── delivered → Entregue ao comprador
    │
    ▼
11. WEBHOOK Sagawa (futuro)
    └── Atualiza status automaticamente
```

---

## 7. Componentes Frontend

### 7.1 Componentes Principais

| Componente | Descrição | Props |
|------------|-----------|-------|
| ShippingCalculator | Calcula e exibe opções de envio | sellerId, transactionId, onRateCalculated |
| ShippingLabelCard | Exibe etiqueta + botão download | shipping, onDownload, onPrint |
| TrackingTimeline | Timeline visual do rastreamento | events, currentStatus |
| ShippingAddressForm | Formulário de endereço | address, onChange, onValidate |

### 7.2 Páginas

| Página | Rota | Descrição |
|--------|------|-----------|
| SellerShipments | /seller/shipments | Lista de envios do vendedor |
| BuyerShipments | /buyer/shipments/:id | Detalhe do envio para comprador |
| AdminShipments | /admin/shipments | Painel admin de envios |

---

## 8. Estimativa de Custos (10,000 usuários)

### 8.1 Custos Sagawa

| Cenário | Volume Mensal | Preço Médio | Custo Mensal |
|---------|---------------|-------------|--------------|
| Conservador | 500 envios | ¥800 | ¥400,000 |
| Moderado | 1,000 envios | ¥800 | ¥800,000 |
| Otimista | 2,000 envios | ¥800 | ¥1,600,000 |

### 8.2 Taxas Adicionais

- **Taxa de combustível:** ~18% sobre o frete
- **Regiões remotas (Okinawa, Hokkaido):** +¥200-500 por envio
- **Entrega em horário específico:** +¥200-500

### 8.3 Custos de Desenvolvimento

| Item | Estimativa |
|------|------------|
| Edge Functions | 40-60 horas |
| Frontend (componentes) | 60-80 horas |
| Integração API Sagawa | 20-30 horas |
| **Total desenvolvimento** | 120-170 horas |

---

## 9. Passos de Implementação

### Fase 1: Banco de Dados (Semana 1)
- [ ] Criar tabela `shippings`
- [ ] Criar tabela `shipping_rate_cache`
- [ ] Atualizar tabela `transactions`
- [ ] Criar migrations SQL

### Fase 2: Edge Functions (Semana 2-3)
- [ ] Implementar `/functions/shipping/index.ts`
- [ ] Implementar `/functions/sagawa-api/index.ts`
- [ ] Implementar sistema de cache de taxas
- [ ] Testar com dados mockados

### Fase 3: Frontend (Semana 3-4)
- [ ] Criar ShippingCalculator component
- [ ] Criar ShippingLabelCard component
- [ ] Criar TrackingTimeline component
- [ ] Criar páginas de shipment

### Fase 4: Integração Real (Semana 5-6)
- [ ] Obter credenciais Sagawa (contrato)
- [ ] Configurar variáveis de ambiente
- [ ] Testar com API real
- [ ] Implementar webhook (opcional)

---

## 10. Variáveis de Ambiente

```env
# Sagawa API
SAGAWA_API_URL=https://api.sagawa-exp.co.jp
SAGAWA_LABEL_API_URL=https://label-api.sagawa-exp.co.jp
SAGAWA_API_KEY=your_api_key
SAGAWA_CUSTOMER_ID=your_customer_id
SAGAWA_LOGIN_PASSWORD=your_password

# Storage (para etiquetas PDF)
SAGAMA_STORAGE_BUCKET=shipping-labels
```

---

## 11. Códigos de Status de Envio

| Status | Descrição JP | Descrição PT |
|--------|--------------|--------------|
| pending | 保留中 | Aguardando |
| rate_calculated | 料金計算済 | Taxa calculada |
| label_created | 送り状作成済 | Etiqueta criada |
| pickup_scheduled | 集荷予定済 | Coleta agendada |
| picked_up | 集荷完了 | Coletado |
| in_transit | 輸送中 | Em trânsito |
| out_for_delivery | 配達中 | Em entrega |
| delivered | 配達完了 | Entregue |
| failed | 配達失敗 | Falha na entrega |
| cancelled | キャンセル | Cancelado |

---

## 12. Considerações Importantes

### 12.1 Regras de Negócio

1. **Dimensões:** O tamanho é determinado pela soma dos 3 lados (length + width + height)
2. **Peso:** Se peso > 30kg, usar categoria especial (ラージサイズ)
3. **Endereços:** Usar CEPs japoneses de 7 dígitos (sem hífen)
4. **Horário coleta:** Não disponível entre 01:00-05:00 JST
5. **Validade taxa:** Taxas são válidas por 24 horas

### 12.2 Campos Obrigatórios para Etiqueta

| Campo | Descrição | Limite |
|-------|-----------|--------|
| 届先氏名 | Nome destinatário | 25 caracteres |
| 届先住所 | Endereço destinatário | 75 caracteres |
| 届先郵便番号 | CEP destinatário | 7 dígitos |
| 届先電話番号 | Telefone destinatário | 20 caracteres |
| 依頼主氏名 | Nome remetente | 25 caracteres |
| 依頼主住所 | Endereço remetente | 75 caracteres |
| 依頼主郵便番号 | CEP remetente | 7 dígitos |
| 依頼主電話番号 | Telefone remetente | 20 caracteres |

---

## 13. Roadmap de Contratação Sagawa

### 13.1 Contato Inicial
- Website: https://www2.sagawa-exp.co.jp/contact/logistics/?type=0311
- Indicar: "法人契約を検討しています" + "API連携也需要"

### 13.2 Documentos Necessários
| Documento | Empresa | MEI |
|-----------|---------|-----|
| 法人登記簿謄本 | ✅ | ❌ |
| 開業届 | ❌ | ✅ |
| Informações bancárias | ✅ | ✅ |

### 13.3 Prazo Estimado
- Reunião inicial: Semana 1
- Obtenção お客様コード: 1-2 semanas
- Credenciais API: 2-4 semanas
- **Total:** 4-6 semanas

---

*Documento criado para fins de desenvolvimento. Aguardando contratação do serviço Sagawa para testes com API real.*
