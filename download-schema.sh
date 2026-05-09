#!/bin/bash
# =============================================
# SCRIPT PARA BAIXAR SCHEMA DO SUPABASE
# =============================================

echo "=== Baixando Schema do Supabase ==="

# Configuração
PROJECT_REF="clqubcryhbrjlupkgeva"  # Seu Project Ref (do painel Supabase)
OUTPUT_FILE="supabase-full-schema.sql"

# Verificar se está instalado
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI não encontrado!"
    echo "Instalando..."
    
    # Instalação local
    mkdir -p ~/.local/bin
    curl -fsSL https://github.com/supabase/cli/releases/download/v1.142.0/supabase_linux_amd64.tar.gz -o /tmp/supabase.tar.gz
    tar -xzf /tmp/supabase.tar.gz -C ~/.local/bin/
    export PATH="$HOME/.local/bin:$PATH"
fi

# Verificar versão
echo "✅ Supabase CLI: $(supabase --version)"

# Login (abre navegador)
echo "🔐 Fazendo login..."
supabase login

# Linkar projeto
echo "🔗 Linkando projeto: $PROJECT_REF"
supabase link --project-ref $PROJECT_REF

# Baixar schema completo (estrutura + dados)
echo "📥 Baixando schema completo..."
supabase db dump --schema public > "$OUTPUT_FILE"

# Baixar tudo (incluindo auth, extensions, etc)
echo "📥 Baixando schema completo (com auth)..."
supabase db dump > "full-database-dump.sql"

echo ""
echo "=== ✅ CONCLUÍDO! ==="
echo "Arquivos gerados:"
echo "  - $OUTPUT_FILE (schema pública)"
echo "  - full-database-dump.sql (schema completo)"
echo ""
echo "Para ver o conteúdo:"
echo "  head -100 $OUTPUT_FILE"
echo ""
echo "Para importar em outro banco:"
echo "  psql -h seu-host -U seu-usuario -d seu-banco -f $OUTPUT_FILE"