/**
 * JAPANCAR PARTS - Supabase Edge Functions
 * 
 * API Serverless para gestão do marketplace
 * 
 * ENDPOINTS:
 * -----------
 * 
 * PARTS (Anúncios)
 * GET  /parts/list          - Lista peças com filtros
 * GET  /parts/{id}         - Detalhes de uma peça
 * POST /parts              - Criar nova peça (auth)
 * 
 * USERS (Perfis)
 * GET  /users/me           - Perfil do usuário logado
 * GET  /users/{id}         - Perfil público de usuário
 * PUT  /users/me           - Atualizar perfil (auth)
 * 
 * TRANSACTIONS
 * GET  /transactions/list  - Lista transações
 * GET  /transactions/{id}  - Detalhes de transação
 * POST /transactions       - Criar transação (auth)
 * PUT  /transactions/{id}  - Atualizar status (auth)
 * GET  /transactions/calculate?amount=X - Calcular taxas
 * 
 * AUCTIONS (Leilões)
 * GET  /auctions/active    - Leilões ativos
 * GET  /auctions/list      - Lista todos os leilões
 * GET  /auctions/{id}      - Detalhes do leilão
 * POST /auctions           - Criar leilão (auth)
 * POST /auctions/bid       - Dar lance (auth)
 * 
 * CATEGORIES
 * GET  /categories         - Lista categorias
 * GET  /categories/{id}    - Detalhes de categoria
 * 
 * BRANDS
 * GET  /brands             - Lista marcas
 * GET  /brands/{id}        - Detalhes de marca + modelos
 * 
 * UTILS
 * GET  /health             - Health check
 * 
 * AUTHENTICATION:
 * ---------------
 * Todas as APIs que requerem auth precisam do header:
 * Authorization: Bearer <JWT_TOKEN>
 * 
 * TAXAS:
 * -------
 * Comissão: 10%
 * Stripe: 2.9% + ¥30 por transação
 */

export const apiVersion = '1.0.0';
export const projectName = 'JAPANCAR PARTS';
export const lastUpdated = '2026-05-09';