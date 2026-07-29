# Guia de Arquitetura Limpa (Clean Architecture & SOLID) - DAIG

Este guia documenta os princípios de **Arquitetura Limpa, Código Limpo (Clean Code) e DRY (Don't Repeat Yourself)** aplicados no ecossistema da plataforma **Digital AIGarage (DAIG)**.

---

## 🏛️ 1. Princípios Fundamentais Aplicados

```
+-------------------------------------------------------------------+
|               CAMADA DE APRESENTAÇÃO (React UI)                   |
|               - TenantDashboard.tsx, Catalog.tsx                  |
+-------------------------------------------------------------------+
                                  |
                                  v (Custom React Hooks)
+-------------------------------------------------------------------+
|               CAMADA DE APLICAÇÃO / ESTADO (React Query)          |
|               - useTenantCore.ts                                  |
+-------------------------------------------------------------------+
                                  |
                                  v (Interfaces puras em TypeScript)
+-------------------------------------------------------------------+
|               CAMADA DE DOMÍNIO / SERVIÇOS (Pure Domain)          |
|               - TenantCoreService.ts                              |
+-------------------------------------------------------------------+
                                  |
                                  v (Infraestrutura)
+-------------------------------------------------------------------+
|               CAMADA DE INFRAESTRUTURA & PERSISTÊNCIA             |
|               - Supabase PostgreSQL, Upstash Redis, Stripe        |
+-------------------------------------------------------------------+
```

### 1. **Single Responsibility Principle (SRP - Princípio da Responsabilidade Única):**
- As **telas (Componentes React)** preocupam-se apenas em renderizar a interface do usuário e capturar cliques.
- Os **Hooks Customizados (`useTenantCore.ts`)** gerenciam reatividade, cache, filtros e toasts.
- O **Serviço de Domínio (`TenantCoreService.ts`)** realiza a lógica de negócios e chamadas ao banco de dados.

### 2. **Don't Repeat Yourself (DRY - Sem Duplicação de Código):**
- Regras de cálculo de KPIs do Estoque, estatísticas de WMS e mutações de publicação em 1-clique estão centralizadas em um único local.
- Qualquer tela do sistema (Seja o Dashboard do Tenant, o aplicativo Mobile do trabalhador ou o Painel do Balcão) reutiliza o mesmo serviço e hook.

### 3. **Dependency Inversion Principle (DIP - Inversão de Dependência):**
- A camada de apresentação não se conecta diretamente a endpoints brutos de banco de dados; ela interage com a interface do serviço de domínio.

---

## 📂 2. Estrutura dos Arquivos Criados

| Arquivo | Função Arquitetural |
| :--- | :--- |
| [`TenantCoreService.ts`](file:///home/lswitch/car-parts-marketplce/src/modules/shared/services/TenantCoreService.ts) | Serviço puro em TypeScript para Estoque, WMS, Ordens de Serviço (O.S.) e Publicação em 1-Clique. |
| [`useTenantCore.ts`](file:///home/lswitch/car-parts-marketplce/src/modules/shared/hooks/useTenantCore.ts) | Hook customizado do React com estado reativo, cache otimista e filtros. |
| [`TenantDashboard.tsx`](file:///home/lswitch/car-parts-marketplce/src/modules/backoffice/pages/TenantDashboard.tsx) | Componente UI limpo de apresentação do Painel do Tenant. |

---

## ✅ 3. Benefícios da Refatoração

1. **Testabilidade:** O serviço `TenantCoreService.ts` pode ser testado com testes unitários em Node.js/Vitest sem necessidade de renderizar componentes React.
2. **Performance:** O uso de atualizações otimistas com React Query em `useTenantCore.ts` proporciona resposta visual instantânea ao alternar a chave de 1-clique do Marketplace.
3. **Manutenibilidade:** Qualquer alteração no fluxo de 1-clique ou no banco de dados exige mudança em apenas 1 arquivo (`TenantCoreService.ts`), eliminando refatorações em cascata.
