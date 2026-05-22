"""
Brain - Central de Conhecimento do Projeto
Mantém um registro das estruturas e dados do projeto
Atualizado automaticamente pelo monitor.py
"""

import os
from datetime import datetime

PROJECT_INFO = {
    "name": "car-parts-marketplce",
    "type": "Marketplace de peças automotivas + Admin WMS Logistix",
    "tech_stack": ["Python", "TypeScript", "React", "Vite", "Tailwind", "Supabase", "Google OAuth", "Stripe", "Recharts"],
    "admin_wms": {
        "name": "Logistix",
        "description": "WMS Dashboard - Smart Logistics (admin interno)",
        "frontend": "React + Tailwind + Recharts + Lucide",
        "backend": "Supabase Edge Functions (Deno/TypeScript)",
        "database": "PostgreSQL via Supabase (tabelas admin_*)",
        "routes": {
            "dashboard": "KPIs, donut chart, line chart, tabela de pedidos recentes",
            "pedidos": "CRUD completo com paginação e filtros",
            "clientes": "CRUD com busca",
            "armazens": "Gestão de CDs (5 armazéns)",
            "entregas": "Controle de entregas e transportes",
            "estoque": "Inventário por armazém",
            "ocorrencias": "Incidentes e tracking",
            "configuracoes": "Chave-valor do sistema",
            "auditoria": "Log de ações administrativas"
        },
        "auth": "Supabase Auth + role admin no profile",
        "seed_login": "admin@logistix.com / adminadmin"
    },
    "modules": ["Marketplace", "Admin WMS (Logistix)", "Pagamentos Stripe", "Analytics GAID", "i18n multi-idioma", "CI/CD Jenkins"]
}

FILES = {
    "createUsers.ts": {
        "size": 1845,
        "modified": 1778249980.7885504,
        "hash": "2b7683a19d07b9396d9f454a93fea0e1"
    },
    "brain.py": {
        "size": 2601,
        "modified": 1779396501.842971,
        "hash": "ebbed62a99b1e88a7b09c31e2dacae55"
    },
    "test-api.sh": {
        "size": 11132,
        "modified": 1778879284.6828218,
        "hash": "2ef00ff4f930298a9212107c3c3cba29"
    },
    "clean_pdf.py": {
        "size": 5099,
        "modified": 1778328853.2944913,
        "hash": "b7c6fb47f0b6a617956505fa59667254"
    },
    "fetch-car-images.py": {
        "size": 11281,
        "modified": 1778551956.5625997,
        "hash": "ff7933b403e38f894a7bb8408f7906aa"
    },
    "monitor.py": {
        "size": 4645,
        "modified": 1778698937.618479,
        "hash": "0aad45b66db1d1340327459a1aae5e59"
    },
    "md2pdf_convert.py": {
        "size": 7620,
        "modified": 1778210307.0892053,
        "hash": "296883d7caf9d86b1f798e82538ea03e"
    }
}

last_updated = "2026-05-21"
