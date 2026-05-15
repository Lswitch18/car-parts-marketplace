#!/bin/bash
# =============================================================================
# TESTE DE INTEGRACAO -- CRUD Completo
# Testa INSERT, GET, UPDATE, DELETE contra o Supabase via Management API
# =============================================================================
set -e

GREEN='\033[0;32m'; RED='\033[0;31m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'

SUPABASE_URL="https://clqubcryhbrjlupkgeva.supabase.co"
PROJECT_REF="clqubcryhbrjlupkgeva"

if [ -z "$SUPABASE_ACCESS_TOKEN" ]; then
    [ -f ".env" ] && source .env 2>/dev/null || true
fi
if [ -z "$SUPABASE_ACCESS_TOKEN" ]; then
    echo -e "${RED}ERRO: SUPABASE_ACCESS_TOKEN nao configurado${NC}"
    echo "  export SUPABASE_ACCESS_TOKEN=sbp_xxx"
    exit 1
fi

MGMT="https://api.supabase.com/v1/projects/$PROJECT_REF"
CT='Content-Type: application/json'

sql() {
    curl -s -X POST "$MGMT/database/query" -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" -H "$CT" \
      -d "$(python3 -c "import json,sys; print(json.dumps({'query': sys.argv[1]}))" "$1")"
}

fnc() {
    curl -s -X GET "$SUPABASE_URL/functions/v1$1" -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" -H "$CT"
}

echo ""; echo "============================================"
echo "  TESTE DE INTEGRACAO -- CRUD Completo"
echo "============================================"; echo ""

P=0; F=0; T=0
ok()   { P=$((P+1)); T=$((T+1)); echo -e "  ${GREEN}[OK] $1${NC}"; }
fail() { F=$((F+1)); T=$((T+1)); echo -e "  ${RED}[FAIL] $1${NC}"; }

S="test-$(date +%s)"
echo -e "${CYAN}Prefixo: $S${NC}"; echo ""
TS=$(date +%s%N)

# ===== 1. LIST ================================================
echo "--- 1. LIST (GET) ---"

N=$(sql "SELECT COUNT(*) as c FROM admin_armazens WHERE nome NOT LIKE 'Ag %'" | python3 -c "import json,sys; print(json.load(sys.stdin)[0]['c'])" 2>/dev/null || echo "0")
[ "$N" -ge 16 ] && ok "admin_armazens: $N CDs" || fail "admin_armazens: esperado >=16, retornou $N"

N=$(sql "SELECT COUNT(*) as c FROM admin_zonas" | python3 -c "import json,sys; print(json.load(sys.stdin)[0]['c'])" 2>/dev/null || echo "0")
[ "$N" -ge 96 ] && ok "admin_zonas: $N zonas" || fail "admin_zonas: esperado >=96, retornou $N"

N=$(sql "SELECT COUNT(*) as c FROM admin_motoristas" | python3 -c "import json,sys; print(json.load(sys.stdin)[0]['c'])" 2>/dev/null || echo "0")
[ "$N" -ge 10 ] && ok "admin_motoristas: $N motoristas" || fail "admin_motoristas: esperado >=10, retornou $N"

N=$(sql "SELECT COUNT(*) as c FROM admin_clientes" | python3 -c "import json,sys; print(json.load(sys.stdin)[0]['c'])" 2>/dev/null || echo "0")
[ "$N" -ge 10 ] && ok "admin_clientes: $N clientes" || fail "admin_clientes: esperado >=10, retornou $N"

N=$(sql "SELECT COUNT(*) as c FROM profiles WHERE role='admin'" | python3 -c "import json,sys; print(json.load(sys.stdin)[0]['c'])" 2>/dev/null || echo "0")
[ "$N" -ge 1 ] && ok "profiles admin: $N admins" || fail "profiles admin: nenhum admin"

N=$(sql "SELECT COUNT(*) as c FROM admin_armazens WHERE largura_m IS NOT NULL" | python3 -c "import json,sys; print(json.load(sys.stdin)[0]['c'])" 2>/dev/null || echo "0")
[ "$N" = "16" ] && ok "admin_armazens dimensoes 3D: 16 CDs" || fail "admin_armazens dimensoes 3D: $N CDs"

# ===== 2. CRUD ================================================
echo ""; echo "--- 2. INSERT + SELECT + UPDATE ---"

# Cliente
CID=$(sql "INSERT INTO admin_clientes (nome, email, telefone, cidade, estado, ativo) VALUES ('Teste $S', '$S@test.com', '11999999999', 'SP', 'SP', true) RETURNING id" | python3 -c "import json,sys; print(json.load(sys.stdin)[0]['id'])" 2>/dev/null || echo "")
[ -n "$CID" ] && ok "INSERT cliente ${CID:0:8}..." || { fail "INSERT cliente falhou"; CID=""; }

if [ -n "$CID" ]; then
  NOME=$(sql "SELECT nome FROM admin_clientes WHERE id='$CID'" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d[0]['nome'])" 2>/dev/null || echo "")
  [ -n "$NOME" ] && ok "SELECT cliente -> $NOME" || fail "SELECT cliente falhou"

  sql "UPDATE admin_clientes SET nome='Atualizado $S' WHERE id='$CID'" > /dev/null
  N2=$(sql "SELECT nome FROM admin_clientes WHERE id='$CID'" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d[0]['nome'])" 2>/dev/null || echo "")
  [[ "$N2" == *"Atualizado"* ]] && ok "UPDATE cliente -> $N2" || fail "UPDATE cliente falhou"
fi

# Armazem
AID=$(sql "INSERT INTO admin_armazens (nome, cidade, estado, pais, endereco, capacidade) VALUES ('Teste CD $S', 'Yokohama', 'Kanagawa', 'JP', '1-1-1', 1000) RETURNING id" | python3 -c "import json,sys; print(json.load(sys.stdin)[0]['id'])" 2>/dev/null || echo "")
[ -n "$AID" ] && ok "INSERT armazem ${AID:0:8}..." || { fail "INSERT armazem falhou"; AID=""; }

if [ -n "$AID" ]; then
  sql "UPDATE admin_armazens SET capacidade=2000 WHERE id='$AID'" > /dev/null
  CAP=$(sql "SELECT capacidade FROM admin_armazens WHERE id='$AID'" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d[0]['capacidade'])" 2>/dev/null || echo "0")
  [ "$CAP" = "2000" ] && ok "UPDATE armazem cap -> $CAP" || fail "UPDATE armazem falhou"
fi

# Pedido (depende de cliente + armazem)
if [ -n "$CID" ] && [ -n "$AID" ]; then
  PID=$(sql "INSERT INTO admin_pedidos (codigo, cliente_id, armazem_origem_id, destino_cidade, destino_estado, valor, status) VALUES ('TEST-$S', '$CID', '$AID', 'Tokyo', 'JP', 10000, 'pendente') RETURNING id" | python3 -c "import json,sys; print(json.load(sys.stdin)[0]['id'])" 2>/dev/null || echo "")
  [ -n "$PID" ] && ok "INSERT pedido ${PID:0:8}..." || fail "INSERT pedido falhou"

  if [ -n "$PID" ]; then
    sql "UPDATE admin_pedidos SET status='em_transito' WHERE id='$PID'" > /dev/null
    STS=$(sql "SELECT status FROM admin_pedidos WHERE id='$PID'" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d[0]['status'])" 2>/dev/null || echo "")
    [ "$STS" = "em_transito" ] && ok "UPDATE pedido status -> $STS" || fail "UPDATE pedido status falhou"
  fi
fi

# Transporte
TID=$(sql "INSERT INTO admin_transportes (placa, modelo, motorista, status, capacidade_kg) VALUES ('PLC-$S', 'Veiculo $S', 'Motorista $S', 'ativo', 1500) RETURNING id" | python3 -c "import json,sys; print(json.load(sys.stdin)[0]['id'])" 2>/dev/null || echo "")
[ -n "$TID" ] && ok "INSERT transporte ${TID:0:8}..." || fail "INSERT transporte falhou"

if [ -n "$TID" ]; then
  sql "UPDATE admin_transportes SET capacidade_kg=2000 WHERE id='$TID'" > /dev/null
  TC=$(sql "SELECT capacidade_kg FROM admin_transportes WHERE id='$TID'" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d[0]['capacidade_kg'])" 2>/dev/null || echo "0")
  [ "$TC" = "2000" ] && ok "UPDATE transporte cap -> $TC" || fail "UPDATE transporte falhou"
fi

# Ocorrencia
OID=$(sql "INSERT INTO admin_ocorrencias (tipo, descricao, status) VALUES ('teste', 'Teste $S', 'aberto') RETURNING id" | python3 -c "import json,sys; print(json.load(sys.stdin)[0]['id'])" 2>/dev/null || echo "")
[ -n "$OID" ] && ok "INSERT ocorrencia ${OID:0:8}..." || fail "INSERT ocorrencia falhou"

if [ -n "$OID" ]; then
  sql "UPDATE admin_ocorrencias SET status='resolvido' WHERE id='$OID'" > /dev/null
  OS=$(sql "SELECT status FROM admin_ocorrencias WHERE id='$OID'" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d[0]['status'])" 2>/dev/null || echo "")
  [ "$OS" = "resolvido" ] && ok "UPDATE ocorrencia status -> $OS" || fail "UPDATE ocorrencia falhou"
fi

# Entrega (depende de pedido)
if [ -n "$PID" ]; then
  EID=$(sql "INSERT INTO admin_entregas (pedido_id, status) VALUES ('$PID', 'pendente') RETURNING id" | python3 -c "import json,sys; print(json.load(sys.stdin)[0]['id'])" 2>/dev/null || echo "")
  [ -n "$EID" ] && ok "INSERT entrega ${EID:0:8}..." || fail "INSERT entrega falhou"

  if [ -n "$EID" ]; then
    sql "UPDATE admin_entregas SET status='entregue' WHERE id='$EID'" > /dev/null
    ES=$(sql "SELECT status FROM admin_entregas WHERE id='$EID'" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d[0]['status'])" 2>/dev/null || echo "")
    [ "$ES" = "entregue" ] && ok "UPDATE entrega status -> $ES" || fail "UPDATE entrega falhou"
  fi
fi

# Estoque
E2ID=$(sql "INSERT INTO admin_estoque (produto, sku, quantidade, armazem_id) VALUES ('Teste $S', 'SKU-$S', 50, 'a0000001-0000-0000-0000-000000000001') RETURNING id" | python3 -c "import json,sys; print(json.load(sys.stdin)[0]['id'])" 2>/dev/null || echo "")
[ -n "$E2ID" ] && ok "INSERT estoque ${E2ID:0:8}..." || fail "INSERT estoque falhou"

if [ -n "$E2ID" ]; then
  sql "UPDATE admin_estoque SET quantidade=100 WHERE id='$E2ID'" > /dev/null
  EQ=$(sql "SELECT quantidade FROM admin_estoque WHERE id='$E2ID'" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d[0]['quantidade'])" 2>/dev/null || echo "0")
  [ "$EQ" = "100" ] && ok "UPDATE estoque qtd -> $EQ" || fail "UPDATE estoque falhou"
fi

# ===== 3. DELETE ===============================================
echo ""; echo "--- 3. DELETE (cleanup) ---"

for tbl in admin_entregas admin_ocorrencias admin_estoque admin_transportes admin_pedidos admin_armazens admin_clientes; do
  sql "DELETE FROM $tbl WHERE id::text LIKE '%${S}%' OR nome LIKE '%$S%' OR modelo LIKE '%$S%' OR produto LIKE '%$S%' OR placa LIKE '%$S%' OR email LIKE '%$S%' OR codigo LIKE 'TEST-$S' OR descricao LIKE '%$S%'" > /dev/null 2>&1 || true
done
sql "DELETE FROM admin_clientes WHERE email LIKE '%$S%'" > /dev/null 2>&1 || true

sleep 0.5
RM=$(sql "SELECT COUNT(*) as c FROM admin_clientes WHERE email LIKE '%$S%'" | python3 -c "import json,sys; print(json.load(sys.stdin)[0]['c'])" 2>/dev/null || echo "?")
[ "$RM" = "0" ] && ok "Cleanup: OK" || fail "Cleanup: $RM registros restantes"

# ===== 4. Edge Functions =======================================
echo ""; echo "--- 4. Edge Functions ---"

fnc "/logistics/wms/zones?armazem_id=a0000001-0000-0000-0000-000000000001" | \
  python3 -c "import json,sys; d=json.load(sys.stdin); assert d.get('success'); assert len(d['data'])>=5" 2>/dev/null && \
  ok "logistics/wms/zones: 5+ zonas" || fail "logistics/wms/zones falhou"

fnc "/logistics/wms/layout/a0000001-0000-0000-0000-000000000001" | \
  python3 -c "import json,sys; d=json.load(sys.stdin); assert 'data' in d; assert 'armazem' in d['data']" 2>/dev/null && \
  ok "logistics/wms/layout: armazem+zonas" || fail "logistics/wms/layout falhou"

fnc "/logistics/dashboard" | \
  python3 -c "import json,sys; d=json.load(sys.stdin); assert d.get('success') or 'data' in d" 2>/dev/null && \
  ok "logistics/dashboard OK" || fail "logistics/dashboard falhou"

fnc "/logistics/wms/inventory?armazem_id=a0000001-0000-0000-0000-000000000001" | \
  python3 -c "import json,sys; d=json.load(sys.stdin); assert d.get('success') or 'data' in d" 2>/dev/null && \
  ok "logistics/wms/inventory OK" || fail "logistics/wms/inventory falhou"

# ===== RESUMO ==================================================
echo ""
echo "============================================"
D=$(( ($(date +%s%N) - TS) / 1000000 ))
if [ "$F" -eq 0 ]; then
    echo -e "${GREEN} $T/$T testes passaram em ${D}ms${NC}"
else
    echo -e "${YELLOW} $P/$T passaram, $F falhas em ${D}ms${NC}"
fi
echo "============================================"
echo ""
exit $F
