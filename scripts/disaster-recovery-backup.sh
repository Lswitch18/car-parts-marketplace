#!/bin/bash
# ==============================================================================
# DISASTER RECOVERY BACKUP - Supabase
# ==============================================================================
# Este script cria um snapshot completo (Schema + Dados de todas as tabelas)
# do banco de dados de produção para cenários de Disaster Recovery.
# ==============================================================================

PROJECT_REF="clqubcryhbrjlupkgeva"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="supabase/backups/snapshot_$TIMESTAMP"

echo "🛡️ Iniciando rotina de Backup de Disaster Recovery..."
echo "📂 Criando diretório: $BACKUP_DIR"
mkdir -p "$BACKUP_DIR"

# Verifica se o Supabase CLI está instalado
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI não encontrado. Por favor, instale usando: npm install -g supabase"
    exit 1
fi

echo "🔐 Verificando autenticação e link com o projeto de produção ($PROJECT_REF)..."
# Linka o projeto (Se SUPABASE_ACCESS_TOKEN estiver no .env, não pedirá senha)
supabase link --project-ref "$PROJECT_REF" || echo "Aviso: Talvez você precise rodar 'supabase login' se a variável SUPABASE_ACCESS_TOKEN não estiver no ambiente."

echo "⏳ [1/2] Extraindo o Schema do banco de dados (Estrutura, RLS, Functions)..."
supabase db dump --linked -f "$BACKUP_DIR/schema_$TIMESTAMP.sql"

if [ $? -eq 0 ]; then
    echo "✅ Schema salvo com sucesso em $BACKUP_DIR/schema_$TIMESTAMP.sql"
else
    echo "❌ Erro ao baixar o Schema."
    exit 1
fi

echo "⏳ [2/2] Extraindo os Dados (Records) de todas as tabelas..."
supabase db dump --linked --data-only -f "$BACKUP_DIR/data_$TIMESTAMP.sql"

if [ $? -eq 0 ]; then
    echo "✅ Dados salvos com sucesso em $BACKUP_DIR/data_$TIMESTAMP.sql"
else
    echo "❌ Erro ao baixar os Dados."
    exit 1
fi

echo "🗜️ Compactando o Snapshot para arquivamento frio..."
tar -czvf "supabase/backups/snapshot_$TIMESTAMP.tar.gz" -C "supabase/backups" "snapshot_$TIMESTAMP"

echo ""
echo "================================================================="
echo "🎉 DISASTER RECOVERY SNAPSHOT CONCLUÍDO COM SUCESSO!"
echo "================================================================="
echo "O seu backup completo foi compactado em:"
echo "👉 supabase/backups/snapshot_$TIMESTAMP.tar.gz"
echo ""
echo "Instruções de Restauração (Restore):"
echo "1. Descompacte o arquivo."
echo "2. Rode o schema: psql -h <host> -U postgres -d postgres -f schema_$TIMESTAMP.sql"
echo "3. Insira os dados: psql -h <host> -U postgres -d postgres -f data_$TIMESTAMP.sql"
echo "================================================================="
