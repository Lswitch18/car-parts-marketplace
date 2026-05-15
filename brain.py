"""
Brain - Central de Conhecimento do Projeto
"""

import os
import hashlib
from datetime import datetime
from pathlib import Path

PROJECT_INFO = {
    "name": "thedaig",
    "display_name": "DAIG — Digital A.I. Garage",
    "description": "Marketplace de peças automotivas japonesas + Logistix (WMS/TMS/OMS) + App Mobile + API B2B",
    "tech_stack": [
        "TypeScript", "React 18", "Vite 5", "Tailwind 3", "Supabase (PostgreSQL + Edge Functions)",
        "Google OAuth", "Stripe", "Recharts", "Leaflet", "Zustand", "React Query v5",
        "html5-qrcode", "JsBarcode", "qrcode", "Lucide React",
    ],
    "deploy": {
        "frontend": "Vercel",
        "database": "Supabase (PostgreSQL)",
        "backend": "Supabase Edge Functions (Deno)",
        "url": "https://car-parts-marketplace-sage.vercel.app",
    },
    "supabase": {
        "project_ref": "clqubcryhbrjlupkgeva",
        "url": "https://clqubcryhbrjlupkgeva.supabase.co",
        "env_keys": ["SUPABASE_ACCESS_TOKEN", "SUPABASE_SERVICE_ROLE_KEY", "VITE_SUPABASE_ANON_KEY", "VITE_SUPABASE_URL"],
    },
    "modules": [
        "Marketplace (catálogo, vendas, autenticação)",
        "Logistix WMS/TMS/OMS (logística completa)",
        "App Mobile (coletor + entregador + agência)",
        "Rastreamento Público",
        "B2B API (parceiros externos)",
        "Pagamentos Stripe",
    ],
    "edge_functions": [
        # Principal
        "admin (681 linhas) — CRUD de toda a gestão Logistix",
        "logistics (570+ linhas) — OMS/TMS/WMS/Dropoff/Tracking/GPS",
        # Apoio
        "logistix-sync — ponte marketplace → logistix",
        "logistix-b2b — API para parceiros externos",
        # Marketplace
        "parts", "users", "transactions", "auctions", "categories", "brands",
        "stripe-checkout", "stripe-webhook", "notifications", "analyze-part", "analytics",
    ],
    "logistix_v2_tables": [
        "admin_shipments (shipments com código de rastreamento)",
        "admin_packages (itens com código de barras)",
        "admin_dropoffs (recebimento em agências parceiras)",
        "admin_rotas (first mile, line haul, last mile)",
        "admin_rotas_paradas (paradas ordenadas da rota)",
        "admin_motoristas (10 motoristas Yamato/Sagawa/SENIO/DAIG)",
        "admin_zonas (recebimento, picking, expedição)",
        "admin_inventario (inventário por zona)",
        "admin_sla_config (prazos por etapa)",
        "admin_sla_log (log de cumprimento)",
        "admin_gps_log (rastreamento GPS de motoristas)",
    ],
    "logistix_tables_originais": [
        "admin_pedidos", "admin_entregas", "admin_armazens", "admin_clientes",
        "admin_estoque", "admin_transportes", "admin_rastreamento", "admin_ocorrencias",
        "admin_coletas", "admin_transferencias", "admin_setores", "admin_cargos",
        "admin_permissoes", "admin_auditoria", "admin_configuracoes", "admin_recebimentos",
        "admin_performance_diaria", "admin_usuarios_armazens",
    ],
    "logistix_frontend_pages": {
        "Dashboard": "src/pages/admin/LogistixDashboard.tsx",
        "Pedidos": "src/pages/admin/logistix/PedidosPage.tsx",
        "Rastreamento": "src/pages/admin/logistix/TrackingPage.tsx",
        "Etiquetas": "src/pages/admin/logistix/EtiquetasPage.tsx (NOVO)",
        "Drop-offs": "src/pages/admin/logistix/DropoffPage.tsx (NOVO)",
        "WMS": "src/pages/admin/logistix/WMSPage.tsx (NOVO)",
        "Mapa": "src/pages/admin/logistix/MapaPage.tsx (NOVO)",
        "Entregas": "src/pages/admin/logistix/EntregasPage.tsx",
        "Coletas": "src/pages/admin/logistix/ColetasPage.tsx",
        "Transferências": "src/pages/admin/logistix/TransferenciasPage.tsx",
        "Estoque": "src/pages/admin/logistix/EstoquePage.tsx",
        "Armazéns": "src/pages/admin/logistix/ArmazensPage.tsx",
        "Transportes": "src/pages/admin/logistix/TransportesPage.tsx",
        "Ocorrências": "src/pages/admin/logistix/OcorrenciasPage.tsx",
        "Usuários": "src/pages/admin/logistix/UsuariosPage.tsx",
        "Clientes": "src/pages/admin/logistix/ClientesPage.tsx",
        "Relatórios": "src/pages/admin/logistix/RelatoriosPage.tsx",
        "Configurações": "src/pages/admin/logistix/ConfigPage.tsx",
    },
    "mobile_pages": {
        "Admin Mobile": "src/pages/mobile/MobileApp.tsx",
        "Coletas Mobile": "src/pages/mobile/MobileColetas.tsx",
        "Entregas Mobile": "src/pages/mobile/MobileEntregas.tsx",
        "CD Mobile": "src/pages/mobile/MobileCD.tsx",
        "Worker App": "src/pages/mobile/WorkerApp.tsx (coletor/entregador)",
        "Worker Coletas": "src/pages/mobile/WorkerColetas.tsx (escaneamento, lote, GPS)",
        "Worker Entregas": "src/pages/mobile/WorkerEntregas.tsx (escaneamento, recebedor)",
        "Agência": "src/pages/mobile/AgenciaPage.tsx (drop-off) (NOVO)",
        "QR Install": "src/pages/mobile/QRInstallPage.tsx",
    },
    "tracking_publico": {
        "rota": "/rastreio",
        "descricao": "Página pública de rastreamento (sem login)",
        "features": "Busca por código, timeline, alerta de atraso, barra SLA",
    },
    "dados_reais": {
        "cds_japoneses": 16,
        "agencias_parceiras": 10,
        "clientes_japoneses": 15,
        "pedidos_reais": "22 (#JP-PED + #INU)",
        "coletas_pendentes": "~8",
        "entregas_pendentes": "~6",
        "motoristas": "10 (Yamato/Sagawa/SENIO/DAIG)",
    },
    "features_entregues": {
        "1_sql_tables": "11 novas tabelas (shipments, packages, rotas, motoristas, dropoffs, sla, gps)",
        "2_edge_function_logistics": "28+ endpoints (OMS/TMS/WMS/Dropoff/Tracking/GPS)",
        "3_admin_etiquetas": "Geração em lote, ZPL impressora térmica, CODE128, QR code",
        "4_dropoff": "Mobile agência + admin drop-offs",
        "5_wms": "Receber, separar, cross-docking, inventário por zona",
        "6_tracking": "Página pública /rastreio, previsão de atraso, SLA",
        "7_mapa_gps": "Mapa Leaflet com motoristas em tempo real",
        "8_app_worker": "Coletor/entregador com scanner, Maps/Waze, GPS, batch scan",
    },
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
