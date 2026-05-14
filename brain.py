"""
Brain - Central de Conhecimento do Projeto
"""

import os
import hashlib
from datetime import datetime
from pathlib import Path

PROJECT_INFO = {
    "name": "thedaig",
    "display_name": "TheDAIG - The DAIG Marketplace",
    "description": "Marketplace de peças automotivas japonesas + WMS Logistix + API B2B",
    "tech_stack": ["TypeScript", "React", "Vite", "Tailwind", "Supabase", "Google OAuth", "Stripe", "Recharts", "Leaflet", "Zustand", "React Query"],
    "supabase": {
        "project_ref": "clqubcryhbrjlupkgeva",
        "url": "https://clqubcryhbrjlupkgeva.supabase.co",
        "env_keys": ["SUPABASE_ACCESS_TOKEN", "SUPABASE_SERVICE_ROLE_KEY", "VITE_SUPABASE_ANON_KEY"]
    },
    "modules": ["Marketplace", "Admin WMS (Logistix)", "B2B API", "Pagamentos Stripe"],
    "logistix_tables": ["admin_pedidos", "admin_entregas", "admin_armazens", "admin_clientes",
                        "admin_estoque", "admin_transportes", "admin_rastreamento", "admin_ocorrencias",
                        "admin_coletas", "admin_transferencias", "admin_setores", "admin_cargos",
                        "admin_permissoes", "admin_auditoria", "admin_configuracoes", "admin_recebimentos",
                        "admin_performance_diaria"],
    "edge_functions": ["admin", "logistix-sync", "logistix-b2b", "transactions", "parts", "users",
                       "analytics", "categories", "brands", "auctions", "stripe-checkout",
                       "stripe-webhook", "notifications", "analyze-part"],
    "logistix_frontend_pages": {
        "Dashboard": "src/pages/admin/LogistixDashboard.tsx",
        "Pedidos": "src/pages/admin/logistix/PedidosPage.tsx",
        "Rastreamento": "src/pages/admin/logistix/RastreamentoPage.tsx",
        "Entregas": "src/pages/admin/logistix/EntregasPage.tsx",
        "Coletas": "src/pages/admin/logistix/ColetasPage.tsx",
        "Transferências": "src/pages/admin/logistix/TransferenciasPage.tsx",
        "Estoque": "src/pages/admin/logistix/EstoquePage.tsx",
        "Armazéns": "src/pages/admin/logistix/ArmazensPage.tsx",
        "Transportes": "src/pages/admin/logistix/TransportesPage.tsx",
        "Ocorrências": "src/pages/admin/logistix/OcorrenciasPage.tsx",
        "Clientes": "src/pages/admin/logistix/ClientesPage.tsx",
        "Relatórios": "src/pages/admin/logistix/RelatoriosPage.tsx",
        "Configurações": "src/pages/admin/logistix/ConfigPage.tsx",
    }
}

def get_file_info(path: str) -> dict | None:
    try:
        p = Path(path)
        if not p.exists() or not p.is_file():
            return None
        stat = p.stat()
        with open(p, 'rb') as f:
            h = hashlib.md5(f.read()).hexdigest()
        return {
            "size": stat.st_size,
            "modified": datetime.fromtimestamp(stat.st_mtime).isoformat(),
            "hash": h,
        }
    except:
        return None

def get_project_stats() -> dict:
    src_files = list(Path("src").rglob("*.ts*")) + list(Path("src").rglob("*.js*"))
    supabase_files = list(Path("supabase").rglob("*.ts")) + list(Path("supabase").rglob("*.sql"))
    return {
        "total_src_files": len(src_files),
        "total_supabase_functions": len(list(Path("supabase/functions").iterdir())) if Path("supabase/functions").exists() else 0,
        "total_sql_migrations": len(list(Path("supabase/migrations").glob("*.sql"))) if Path("supabase/migrations").exists() else 0,
    }

if __name__ == "__main__":
    import json
    print(json.dumps({
        "project": PROJECT_INFO,
        "stats": get_project_stats(),
        "last_updated": datetime.now().isoformat(),
    }, indent=2, ensure_ascii=False))
else:
    stats = get_project_stats()
    PROJECT_INFO["stats"] = stats
