# Estudo de Arquitetura SaaS Multi-Tenant Escalável (SaaS-First ERP/WMS + Marketplace Opcional em 1 Clique)

## 📌 1. Visão Geral do Modelo de Negócio (SaaS Gestão + Marketplace Omnichannel)

O sistema **Digital AIGarage (DAIG)** opera com a estratégia **SaaS-First (Gestão Primeiro, Marketplace Opcional)**:

1. **Foco Principal (Software de Gestão ERP/WMS/O.S.):**
   * Oferecido como software de gestão interna privada para Desmanches, Autopeças e Oficinas (Empresa A, Empresa B...).
   * Cada empresa utiliza o sistema exclusivamente para controlar **Estoque, Prateleiras WMS, Impressão de Etiquetas QR Code, Ordens de Serviço (O.S.), Cadastro de Clientes e Entrada por Nota/Desmonte**.
   * Os dados e peças do estoque da empresa são **100% privados** e visíveis apenas para os funcionários da própria empresa.

2. **Diferencial de Vendas (Canal Opcional no Marketplace DAIG em 1 Clique):**
   * Caso a empresa queira vender uma peça para o mercado público (nacional ou exportação JDM), basta ativar a chave **"Publicar no Marketplace DAIG"** com **1 único clique**.
   * Ao ser vendida no Marketplace, a plataforma retém a comissão (10%), processa a custódia (Escrow) e **dá baixa automática e instantânea no estoque interno do sistema de gestão da empresa**.

---

## 🏛️ 2. Arquitetura do Sistema (Gestão Privada + Ponte para Marketplace)

```
+-----------------------------------------------------------------------------------+
|                            PAINEL PRIVADO DE GESTÃO DO TENANT                     |
|                            (Empresa A - Desmanche & Autopeças)                    |
|                                                                                   |
|  [Estoque Interno] <---> [Impressão Etiquetas QR] <---> [Ordens de Serviço (O.S)]|
|                                     |                                             |
|                                     v                                             |
|                     [Botão: "Publicar no Marketplace" (1-Clique)]                 |
+-----------------------------------------------------------------------------------+
                                      |
                                      | (Se ativado = TRUE)
                                      v
+-----------------------------------------------------------------------------------+
|                        MARKETPLACE CENTRAL PÚBLICO (DAIG)                         |
|                                                                                   |
|  - Visível para Compradores B2C/B2B no Japão e Exportação Global                  |
|  - Pagamento com Custódia Escrow (Stripe Connect + Konbini)                        |
|  - Baixa Automática no Estoque Interno da Empresa A após confirmação de venda     |
+-----------------------------------------------------------------------------------+
```

---

## 🔒 3. Estrutura de Isolação de Dados (Visibilidade Pública vs Privada)

No banco de dados PostgreSQL (Supabase/Neon), a isolação entre a **gestão privada do tenant** e a **publicação pública no marketplace** é controlada via flag de visibilidade e políticas RLS.

### Esquema SQL de Visibilidade Híbrida:

```sql
-- Tabela de Peças do Estoque de Gestão
CREATE TABLE parts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  oem_code TEXT,
  cost_price NUMERIC(12, 2), -- Preço de custo (PRIVADO da empresa)
  sale_price NUMERIC(12, 2) NOT NULL, -- Preço de venda interno
  warehouse_location TEXT, -- Localização interna: "Prateleira B3"
  qr_code_label TEXT UNIQUE, -- Código da etiqueta física
  
  -- 🔘 CHAVE DE 1-CLIQUE PARA DIVULGAÇÃO
  is_published_to_marketplace BOOLEAN DEFAULT FALSE,
  marketplace_published_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Política RLS 1: Apenas os funcionários do Tenant enxergam suas peças de gestão privada
CREATE POLICY tenant_private_inventory ON parts
  FOR ALL
  USING (tenant_id = (SELECT auth.jwt() ->> 'tenant_id')::uuid);

-- Política RLS 2: Qualquer comprador enxerga peças que tiveram a chave de 1-Clique ativada
CREATE POLICY public_marketplace_feed ON parts
  FOR SELECT
  USING (is_published_to_marketplace = TRUE);
```

---

## 📦 4. Módulos do Sistema de Gestão Interna (ERP/WMS)

Cada empresa utiliza o software no seu dia a dia operacional:

1. **🏷️ Gestão de Prateleiras e Etiquetas QR Code:**
   * Entrada de peças desmontadas $\rightarrow$ Geração e impressão imediata de etiqueta térmica com QR Code $\rightarrow$ Mapeamento de corredor/prateleira.
2. **🚗 Ordens de Serviço (O.S.) & Atendimento ao Cliente:**
   * Abertura de O.S. para veículos em manutenção na oficina $\rightarrow$ Vinculação de peças do próprio estoque com abate automático de saldo.
3. **🤖 IA de Catalogação Interna (30 segundos):**
   * O funcionário tira a foto para o estoque interno da empresa $\rightarrow$ A IA preenche os dados técnicos, compatibilidade veicular e sugere o valor de mercado.
4. **📊 Relatórios Financeiros Privados:**
   * Margem de lucro por peça, giro de estoque, curva ABC de peças mais vendidas no balcão e relatório de O.S. concluídas.

---

## 🛒 5. O Fluxo da Venda no Marketplace (Divulgação em 1 Clique)

```
[1. Peça cadastrada na Gestão Privada]
               |
               v
[2. Empresa clica em "Publicar no Marketplace DAIG"]
               |
               v
[3. Peça fica visível no app/site público da DAIG]
               |
               v
[4. Comprador realiza o pagamento em JPY (Stripe Escrow / Konbini)]
               |
               v
[5. Evento Webhook confirma a venda] ---> [Abate automático no estoque interno da Empresa]
                                    ---> [Notificação no painel de gestão para envio]
```

---

## ✅ 6. Vantagens Competitivas deste Modelo

1. **Barreira de Entrada Baixa:** A empresa compra o software para resolver a bagunça do seu estoque interno e O.S. sem a pressão de ter que vender online imediatamente.
2. **Efeito de Rede (Network Effect):** Conforme mais oficinas e desmanches usam o software de gestão, a DAIG acumula o **maior catálogo unificado de autopeças do Japão**.
3. **Monetização Dupla:** 
   * Receita recorrente com assinaturas de gestão (SaaS B2B: ¥60.000 JPY/mês).
   * Receita variável com comissões de marketplace (10%) quando a empresa decide vender pelo canal da DAIG.
