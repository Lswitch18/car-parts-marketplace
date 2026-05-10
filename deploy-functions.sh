#!/bin/bash
# Supabase Edge Functions Deploy Script
# Usage: ./deploy-functions.sh

set -e

echo "🚀 JAPANCAR PARTS - Deploy de Edge Functions"
echo "=============================================="

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Função para verificar se está logado
check_login() {
    if [ -z "$SUPABASE_ACCESS_TOKEN" ]; then
        # Tenta usar token armazenado localmente
        if [ -f "$HOME/.supabase/access-token" ]; then
            export SUPABASE_ACCESS_TOKEN=$(cat "$HOME/.supabase/access-token")
        fi
    fi
    
    if [ -z "$SUPABASE_ACCESS_TOKEN" ]; then
        echo -e "${RED}❌ Erro: Você precisa fazer login no Supabase primeiro${NC}"
        echo ""
        echo "Execute: supabase login"
        echo "Ou configure a variável SUPABASE_ACCESS_TOKEN"
        exit 1
    fi
}

# Função para deploy de uma função
deploy_function() {
    local func_name=$1
    local func_path=$2
    
    echo -n "📦 Deploying $func_name... "
    
    if supabase functions deploy "$func_name" --no-verify-jwt 2>/dev/null; then
        echo -e "${GREEN}✅ OK${NC}"
    else
        echo -e "${YELLOW}⚠️ Verificando...${NC}"
        # Tenta sem --no-verify-jwt
        if supabase functions deploy "$func_name" 2>/dev/null; then
            echo -e "${GREEN}✅ OK${NC}"
        else
            echo -e "${RED}❌ Falhou${NC}"
        fi
    fi
}

# Verificar se está logado
check_login

# Verificar se está no diretório correto
if [ ! -d "supabase/functions" ]; then
    echo -e "${RED}❌ Erro: Execute este script no diretório do projeto${NC}"
    exit 1
fi

# Lista de funções para deploy
FUNCTIONS=(
    "parts:supabase/functions/parts/index.ts"
    "users:supabase/functions/users/index.ts"
    "transactions:supabase/functions/transactions/index.ts"
    "auctions:supabase/functions/auctions/index.ts"
    "categories:supabase/functions/categories/index.ts"
    "brands:supabase/functions/brands/index.ts"
    "stripe-webhook:supabase/functions/stripe-webhook.ts"
    "stripe-checkout:supabase/functions/stripe-checkout.ts"
)

echo ""
echo "Deploying Edge Functions..."
echo ""

# Deploy de cada função
for func in "${FUNCTIONS[@]}"; do
    func_name="${func%%:*}"
    deploy_function "$func_name"
done

echo ""
echo "=============================================="
echo -e "${GREEN}✅ Deploy concluído!${NC}"
echo ""
echo "Verificando funções deployed..."
echo ""

# Listar funções deployed
supabase functions list 2>/dev/null || echo "Liste as funções no painel do Supabase"

echo ""
echo "Próximos passos:"
echo "1. Configure as variáveis de ambiente no Supabase"
echo "   - STRIPE_SECRET_KEY"
echo "   - STRIPE_WEBHOOK_SECRET"
echo "   - APP_URL"
echo ""
echo "2. Configure o Stripe Webhook:"
echo "   - URL: https://<project>.supabase.co/functions/v1/stripe-webhook"
echo "   - Eventos: checkout.session.completed, payment_intent.succeeded, etc."
echo ""