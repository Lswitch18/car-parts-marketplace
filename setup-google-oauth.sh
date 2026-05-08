#!/bin/bash
# Google OAuth Setup Script para JAPANCAR PARTS
# Execute: bash setup-google-oauth.sh

set -e

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}=== Google OAuth Setup para JAPANCAR PARTS ===${NC}\n"

# Verificar se gcloud está instalado
if ! command -v gcloud &> /dev/null; then
    echo -e "${YELLOW}gcloud não encontrado. Instalando...${NC}"
    
    # Instalar Google Cloud CLI
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        apt-get update && apt-get install -y apt-transport-https gnupg
        echo "deb [signed-by=/usr/share/keyrings/cloud.google.gpg] https://packages.cloud.google.com/apt cloud-sdk main" | tee /etc/apt/sources.list.d/google-cloud-sdk.list
        curl https://packages.cloud.google.com/apt/doc/apt-key.gpg | apt-key --keyring /usr/share/keyrings/cloud.google.gpg add -
        apt-get update && apt-get install -y google-cloud-cli
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        brew install google-cloud-sdk
    fi
fi

echo -e "${GREEN}1. Autentique com Google Cloud:${NC}"
echo "   Execute: gcloud auth login"
gcloud auth login

echo -e "\n${GREEN}2. Defina o projeto (ou crie um novo):${NC}"
echo "   gcloud projects list"
echo "   gcloud config set project SEU_PROJECT_ID"

echo -e "\n${GREEN}3. Crie o OAuth Client ID via CLI:${NC}"

PROJECT_ID="SEU_PROJECT_ID"  # Substitua pelo seu project ID
CLIENT_NAME="japancar-parts-oauth"

echo "   # Criar OAuth credentials"
gcloud oauth2-client-credentials create \
    --project=$PROJECT_ID \
    --display-name="$CLIENT_NAME" \
    --scopes="https://www.googleapis.com/auth/userinfo.email,https://www.googleapis.com/auth/userinfo.profile"

echo -e "\n${GREEN}4. Obter as credenciais:${NC}"
gcloud oauth2-client-credentials list --project=$PROJECT_ID

echo -e "\n${YELLOW}NOTA: Para criar via API REST, use o script Python abaixo.${NC}"

# ============================================
# Script alternativo: via API REST
# ============================================

cat > create_oauth_client.py << 'EOF'
#!/usr/bin/env python3
"""
Criar OAuth Client ID via Google Cloud API
Execute: python3 create_oauth_client.py
"""

import requests
import json
from google.auth import default
from google.auth.transport.requests import Request

# Config
PROJECT_ID = "SEU_PROJECT_ID"  # Substitua
CLIENT_NAME = "JAPANCAR PARTS"
REDIRECT_URIS = [
    "https://clqubcryhbrjlupkgeva.supabase.co/auth/v1/callback",
    "http://localhost:5173"
]

def get_access_token():
    """Obtém token de acesso para API do Google Cloud"""
    credentials, project = default()
    credentials.refresh(Request())
    return credentials.token

def create_oauth_client():
    """Cria OAuth Client ID"""
    access_token = get_access_token()
    
    url = f"https://oauth2.googleapis.com/v2/userinfo"
    headers = {
        "Authorization": f"Bearer {access_token}",
    }
    
    # Verificar se está autenticado
    response = requests.get(url, headers=headers)
    if response.status_code != 200:
        print("Erro de autenticação. Execute: gcloud auth login")
        return
    
    print(f"Autenticado como: {response.json().get('email')}")
    
    # Criar OAuth Client
    # Nota: A API direta não permite criar OAuth Clients facilmente
    # Recomendo usar: https://console.cloud.google.com/apis/credentials/oauthclient
    
    print("\nPara criar o OAuth Client:")
    print("1. Acesse: https://console.cloud.google.com/apis/credentials/oauthclient")
    print("2. Selecione 'Web application'")
    print(f"3. Nome: {CLIENT_NAME}")
    print("4. Adicione URIs de redirecionamento:")
    for uri in REDIRECT_URIS:
        print(f"   - {uri}")
    print("\nApós criar, copie o Client ID e Client Secret")

if __name__ == "__main__":
    create_oauth_client()
EOF

echo -e "\n${GREEN}Script Python criado: create_oauth_client.py${NC}"
echo "Execute com: python3 create_oauth_client.py (requer gcloud SDK)"

echo -e "\n${GREEN}=== Alternativa: Instalar via Snap ===${NC}"
echo "   sudo snap install google-cloud-sdk --classic"
echo "   gcloud auth login"

echo -e "\n${GREEN}=== Após ter o Client ID ===${NC}"
echo "Configure no Supabase Dashboard > Authentication > Providers > Google"
