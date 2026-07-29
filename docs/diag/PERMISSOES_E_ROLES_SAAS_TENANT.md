# Matriz de Roles (Funções) e Permissões do SaaS Multi-Tenant (DAIG)

Este documento especifica o modelo **RBAC (Role-Based Access Control)** para os usuários empresariais do serviço SaaS Multi-Tenant da plataforma **Digital AIGarage (DAIG)**.

---

## 🎭 1. Roles (Funções) do Tenant

```
                                  +---------------------------------------+
                                  |     TENANT ADMIN (Dono / Diretor)     |
                                  |     - Acesso Total + Financeiro       |
                                  +---------------------------------------+
                                                      |
                  +-----------------------------------+-----------------------------------+
                  |                                   |                                   |
                  v                                   v                                   v
+-----------------------------------+ +-----------------------------------+ +-----------------------------------+
|  TENANT MANAGER (Gerente/WMS)     | |  TENANT MECHANIC (Mecânico)       | |  TENANT OPERATOR (Balcão/Caixa) |
|  - Estoque, Prateleira, IA, QR    | |  - Ordens de Serviço (O.S.)      | |  - Busca de Peças & PDV Balcão   |
|  - Publicação 1-Clique Marketplace| |  - Reserva de Peças na O.S.      | |  - Leitura de QR Code           |
+-----------------------------------+ +-----------------------------------+ +-----------------------------------+
```

---

## 📊 2. Matriz de Permissões por Função

| Módulo / Funcionalidade | `tenant_admin` (Dono) | `tenant_manager` (Gerente WMS) | `tenant_mechanic` (Mecânico) | `tenant_operator` (Balcão) |
| :--- | :---: | :---: | :---: | :---: |
| **Configurações do Tenant & Faturamento** | ✅ Total | ❌ Sem Acesso | ❌ Sem Acesso | ❌ Sem Acesso |
| **Convidar / Remover Usuários do Tenant** | ✅ Total | ❌ Sem Acesso | ❌ Sem Acesso | ❌ Sem Acesso |
| **Relatórios Financeiros & Margem de Custo** | ✅ Total | ⚠️ Parcial | ❌ Sem Acesso | ❌ Sem Acesso |
| **Catalogação por IA (30 Segundos)** | ✅ Total | ✅ Total | ⚠️ Leitura | ✅ Total |
| **Gestão de Estoque & Prateleiras WMS** | ✅ Total | ✅ Total | ⚠️ Leitura | ⚠️ Leitura |
| **Impressão de Etiquetas QR Code** | ✅ Total | ✅ Total | ❌ Sem Acesso | ✅ Total |
| **Divulgação Marketplace em 1-Clique** | ✅ Total | ✅ Total | ❌ Sem Acesso | ❌ Sem Acesso |
| **Abertura & Edição de Ordens de Serviço (O.S.)** | ✅ Total | ✅ Total | ✅ Total | ⚠️ Somente Consulta |
| **Baixa de Peças por Venda de Balcão (PDV)** | ✅ Total | ✅ Total | ❌ Sem Acesso | ✅ Total |

---

## 💻 3. Definição de Tipos em TypeScript (`src/modules/shared/types/index.ts`)

```typescript
export type TenantRole = 
  | 'tenant_admin'    // Dono / Diretor do Desmanche ou Oficina
  | 'tenant_manager'  // Gerente de Estoque / WMS
  | 'tenant_mechanic' // Mecânico / Técnico de Manutenção
  | 'tenant_operator';// Atendente de Balcão / Caixa

export interface TenantUserMember {
  id: string;
  tenant_id: string;
  user_id: string;
  role: TenantRole;
  is_primary_owner: boolean;
  user?: User;
  created_at: string;
}

export type TenantPermission = 
  | 'manage_tenant'       // Editar dados da empresa e assinatura
  | 'manage_users'        // Convidar e alterar funções de membros
  | 'view_financials'     // Ver preço de custo e lucro líquido
  | 'manage_inventory'    // Adicionar/editar peças e prateleiras
  | 'publish_marketplace' // Alternar chave de 1-clique para o Marketplace
  | 'manage_work_orders'  // Criar e atualizar Ordens de Serviço (O.S.)
  | 'print_qr_labels';    // Imprimir etiquetas térmicas
```

---

## 🔒 4. Validação no PostgreSQL com Row Level Security (RLS)

O banco de dados Supabase valida a role do membro do tenant através da função `has_tenant_permission()`:

```sql
CREATE OR REPLACE FUNCTION public.has_tenant_permission(
  target_tenant_id UUID,
  required_permission TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM public.tenant_users
  WHERE tenant_id = target_tenant_id AND user_id = auth.uid();

  IF user_role IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Admin tem acesso total
  IF user_role = 'tenant_admin' THEN
    RETURN TRUE;
  END IF;

  -- Gerente de Estoque pode gerenciar inventário e publicar em 1-clique
  IF user_role = 'tenant_manager' AND required_permission IN ('manage_inventory', 'publish_marketplace', 'print_qr_labels', 'manage_work_orders') THEN
    RETURN TRUE;
  END IF;

  -- Mecânico pode gerenciar Ordens de Serviço
  IF user_role = 'tenant_mechanic' AND required_permission IN ('manage_work_orders') THEN
    RETURN TRUE;
  END IF;

  -- Operador de Balcão pode imprimir etiquetas e consultar estoque
  IF user_role = 'tenant_operator' AND required_permission IN ('print_qr_labels') THEN
    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;
```
