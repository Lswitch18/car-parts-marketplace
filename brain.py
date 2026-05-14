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
    "AWS-COST-STUDY.md": {
        "size": 8615,
        "modified": 1778355239.7881644,
        "hash": "81b2ffae26f2eeb21eca7c42c9e3f90f"
    },
    "anota\u00e7\u00e3o": {
        "size": 186,
        "modified": 1778592566.5794954,
        "hash": "d68bca54141737c644856e5e12591914"
    },
    "Dockerfile.jenkins": {
        "size": 324,
        "modified": 1778343579.364174,
        "hash": "cc1d0e586a677b4d3ba4b90b6a578178"
    },
    "package-lock.json": {
        "size": 125176,
        "modified": 1778730055.5164306,
        "hash": "0878368413d1e8d6fa881173611a98d9"
    },
    "tsconfig.json": {
        "size": 657,
        "modified": 1778299587.802882,
        "hash": "cee37d11245240fc77acac0975e29a5a"
    },
    "BUILD-REPORT-GAID-2026-05-10.pdf": {
        "size": 28895,
        "modified": 1778404265.492443,
        "hash": "bbbe36b59416696d97921cd0fff251df"
    },
    "fix-parts-images.sql": {
        "size": 2903,
        "modified": 1778552985.323125,
        "hash": "4df93db2d5a76911a1f7c0641809c380"
    },
    "SAGAWA-CONTRATO-GUIA.pdf": {
        "size": 111404,
        "modified": 1778596802.6554968,
        "hash": "3348d53660f924b9ed60f15548b44d4a"
    },
    "backup-full.sql": {
        "size": 6099,
        "modified": 1778291597.8668823,
        "hash": "c41117ce9a6e0788fb0fe1cf18656bfb"
    },
    "build-output.log": {
        "size": 727,
        "modified": 1778687303.9864867,
        "hash": "e6b44c9af638bd4c3ea6c55725f3bc12"
    },
    "kimi-api": {
        "size": 74,
        "modified": 1778686412.8664868,
        "hash": "920ccd1ed128cd62e9f8157e146c7080"
    },
    "SPEC-SAGAWA.md": {
        "size": 14733,
        "modified": 1778596367.7674787,
        "hash": "02d4a3fede86b7f89fd502ba50091bcd"
    },
    "create-10-ads.sql": {
        "size": 5439,
        "modified": 1778298212.6508818,
        "hash": "e51bb3d52ada002c343d2705697d97ef"
    },
    "SPEC-SAGAWA.pdf": {
        "size": 83058,
        "modified": 1778596384.6394951,
        "hash": "c877437e64814cb6afd94039de01eb3c"
    },
    "docker-compose.jenkins.yml": {
        "size": 388,
        "modified": 1778344398.1961665,
        "hash": "d912f7ed728aeed7a71ad1bbb21448ab"
    },
    "PRESENTACAO-FASE1-PAGAMENTOS-LOGISTICA.pdf": {
        "size": 48967,
        "modified": 1778591469.351492,
        "hash": "0c34aa3722f9b2ba7a4bb6dd8201223b"
    },
    "test-monitor.txt": {
        "size": 5,
        "modified": 1778724573.0444262,
        "hash": "d8e8fca2dc0f896fd7cb4cb0031ba249"
    },
    "vite.config.ts": {
        "size": 179,
        "modified": 1778243528.2685492,
        "hash": "9781fc548154773b168ea218d9bff4ee"
    },
    "brain.py": {
        "size": 27987,
        "modified": 1778730656.200426,
        "hash": "c99541788ebf0301909e856af7b5ad0a"
    },
    "vite.config.js": {
        "size": 196,
        "modified": 1778244229.3365455,
        "hash": "8504b6d963f8dddfea545af4a9dbfa51"
    },
    "update-parts-images.sql": {
        "size": 5338,
        "modified": 1778552019.0146258,
        "hash": "26220d680102c5be86614337fa9f974a"
    },
    "tsconfig.node.json": {
        "size": 212,
        "modified": 1778243533.6725483,
        "hash": "1c139bab5d1a90787cbb951073a5abde"
    },
    "ANALISE-GAID.md": {
        "size": 21416,
        "modified": 1778545632.438792,
        "hash": "cd44fdf1f2b3971f3f6489271c75254e"
    },
    "TECH-RESEARCH-LOW-COST.md": {
        "size": 3870,
        "modified": 1778536769.1481504,
        "hash": "df3ece7b7c91a3e428af91abffbcb0cd"
    },
    "clean_pdf.py": {
        "size": 5099,
        "modified": 1778328853.2944913,
        "hash": "b7c6fb47f0b6a617956505fa59667254"
    },
    "package.json": {
        "size": 906,
        "modified": 1778730054.8204308,
        "hash": "745c3510d0187793c699e053a4c15aca"
    },
    "postcss.config.js": {
        "size": 79,
        "modified": 1778244136.1845484,
        "hash": "470cfd3ee10fbff840b377e769485f3e"
    },
    "SAGAWA-CONTRATO-GUIA.md": {
        "size": 18857,
        "modified": 1778596790.8434935,
        "hash": "ba8c6cd8430aa5519e74198aa1da188c"
    },
    "tsconfig.tsbuildinfo": {
        "size": 1734,
        "modified": 1778730096.5684285,
        "hash": "aa67a3bf96edf0c19c34f4aa48bdd787"
    },
    "PESQUISA-LOGISTICA-JAP\u00c3O.md": {
        "size": 3492,
        "modified": 1778724144.7244265,
        "hash": "b5e3f7155a8c704dc7650532d6408f5e"
    },
    "PROJECT-STATUS.md": {
        "size": 2948,
        "modified": 1778403748.6444423,
        "hash": "b416d0037a57f805636ab84b393d0179"
    },
    "setup-google-oauth.sh": {
        "size": 4216,
        "modified": 1778212428.9972084,
        "hash": "f802dae5e0536f33144c16601c33f35a"
    },
    "tsconfig.node.tsbuildinfo": {
        "size": 42246,
        "modified": 1778244229.5605457,
        "hash": "fd0fb864a3c8c5b5cb70ef8d10d107ff"
    },
    "index.html": {
        "size": 1222,
        "modified": 1778643655.4979262,
        "hash": "5c81532e4d75aaf98c2b9130e2d31981"
    },
    "README.md": {
        "size": 2022,
        "modified": 1778403762.8084424,
        "hash": "ee9617aff5c44aafac81fd7e07742018"
    },
    "implementa\u00e7\u00e3o de IA comesse projeto": {
        "size": 0,
        "modified": 1778690236.8024802,
        "hash": "d41d8cd98f00b204e9800998ecf8427e"
    },
    "tailwind.config.js": {
        "size": 2471,
        "modified": 1778729881.8804176,
        "hash": "1318970a5ee764aab140fddeeeb4f4bb"
    },
    "vite.config.d.ts": {
        "size": 76,
        "modified": 1778244229.5445457,
        "hash": "9fcf75521f4c43fd8b75300e0f63b867"
    },
    "BUILD-REPORT-2026-05-10.md": {
        "size": 838,
        "modified": 1778403591.39244,
        "hash": "68a611a1df9360948049f2b130205532"
    },
    "monitor.log": {
        "size": 8221,
        "modified": 1778730620.8084261,
        "hash": "41cc239216e167b85e9b9ae59159260e"
    },
    "deploy-logistix.sh": {
        "size": 619,
        "modified": 1778725157.6724253,
        "hash": "3eff4715f74a3b25716fb464ba705f82"
    },
    "fetch-car-images.py": {
        "size": 11281,
        "modified": 1778551956.5625997,
        "hash": "ff7933b403e38f894a7bb8408f7906aa"
    },
    "NEXT-STEPS.md": {
        "size": 1663,
        "modified": 1778537443.5011897,
        "hash": "4cf5b4b9f4b4426acf70a3d8e23af8b7"
    },
    "BUILD-REPORT-GAID-2026-05-10-PT.pdf": {
        "size": 29584,
        "modified": 1778404369.4324417,
        "hash": "a282cba1050f614404b76e52df8294d7"
    },
    "update-ads-images.sql": {
        "size": 1690,
        "modified": 1778300106.6948752,
        "hash": "a4c4acc46f6e759715fe4486ac9deabe"
    },
    "Jenkinsfile": {
        "size": 2854,
        "modified": 1778343597.6681738,
        "hash": "d0e2bc054469ce96c79d5ab8aeb67ce3"
    },
    "test-kimi-env.js": {
        "size": 3170,
        "modified": 1778697386.938484,
        "hash": "4a29bbdfabf749c2f16c0a1a24706300"
    },
    "BUILD-REPORT-GAID-2026-05-10-JA.pdf": {
        "size": 61724,
        "modified": 1778404369.4484417,
        "hash": "dd8f5d27a1444451ecead6bb0a5d69b3"
    },
    "monitor.py": {
        "size": 4645,
        "modified": 1778698937.618479,
        "hash": "0aad45b66db1d1340327459a1aae5e59"
    },
    "download-schema.sh": {
        "size": 1609,
        "modified": 1778291578.4548821,
        "hash": "3ee0a35697494f2b702005ca8b6329ea"
    },
    "COST-PROJECTION-10K-USERS.md": {
        "size": 2660,
        "modified": 1778536669.115136,
        "hash": "74380210783530747edbcb27a2a074d2"
    },
    "PRESENTACAO-FASE1-PAGAMENTOS-LOGISTICA.md": {
        "size": 11672,
        "modified": 1778591006.6954935,
        "hash": "27951b5ad2036e5462bf32da164e038f"
    },
    "deploy-functions.sh": {
        "size": 2974,
        "modified": 1778403788.1564429,
        "hash": "ef529789673369bede21899f714f59b7"
    },
    "vercel.json": {
        "size": 80,
        "modified": 1778643657.5139263,
        "hash": "6411d2fbb5f0e00aaff0ca0ded84e0b6"
    },
    "md2pdf_convert.py": {
        "size": 7620,
        "modified": 1778210307.0892053,
        "hash": "296883d7caf9d86b1f798e82538ea03e"
    },
    "project-reports/BUILD-REPORT-GAID-2026-05-10-JA.md": {
        "size": 3173,
        "modified": 1778404335.3084426,
        "hash": "a994d0b599d370c00c2809d6ab5b006a"
    },
    "project-reports/BUILD-REPORT-GAID-2026-05-10.pdf": {
        "size": 28895,
        "modified": 1778404236.9364378,
        "hash": "bbbe36b59416696d97921cd0fff251df"
    },
    "project-reports/BUILD-REPORT-GAID-2026-05-10.md": {
        "size": 2505,
        "modified": 1778404118.3204377,
        "hash": "c77bf2e7adc2b82c7673e0000c1ca3be"
    },
    "project-reports/BUILD-REPORT-2026-05-10.pdf": {
        "size": 33576,
        "modified": 1778399583.8124416,
        "hash": "02bdce0f748c29cdd7799ba5d596bf2a"
    },
    "project-reports/BUILD-REPORT-GAID-2026-05-10-PT.md": {
        "size": 2644,
        "modified": 1778404324.9844427,
        "hash": "4b6b5085e6d749ae8e1bf05d9af8aff4"
    },
    "project-reports/BUILD-REPORT-2026-05-10.md": {
        "size": 1862,
        "modified": 1778403583.49244,
        "hash": "841e1ca7c78dd2481bc8c07c5ca93115"
    },
    "project-reports/BUILD-REPORT-GAID-2026-05-10-PT.pdf": {
        "size": 29584,
        "modified": 1778404345.8684425,
        "hash": "a282cba1050f614404b76e52df8294d7"
    },
    "project-reports/BUILD-REPORT-GAID-2026-05-10-JA.pdf": {
        "size": 61724,
        "modified": 1778404349.4684427,
        "hash": "dd8f5d27a1444451ecead6bb0a5d69b3"
    },
    "src/index.css": {
        "size": 4463,
        "modified": 1778644350.3979237,
        "hash": "10d18f138f4cf49a13587d0fc23421e7"
    },
    "src/main.tsx": {
        "size": 631,
        "modified": 1778243552.4525485,
        "hash": "145c6ceb990d443691567823cec65fbb"
    },
    "src/vite-env.d.ts": {
        "size": 201,
        "modified": 1778244843.5325506,
        "hash": "16c5173f27fbb846bae733ed9ec9f4cb"
    },
    "src/App.tsx": {
        "size": 2679,
        "modified": 1778708771.3944898,
        "hash": "193672adef833648312ad7e0b0959896"
    },
    "src/stores/favoriteStore.ts": {
        "size": 1205,
        "modified": 1778243577.9725485,
        "hash": "a3de439381b1694ffecd1cc7821c4ab9"
    },
    "src/stores/authStore.ts": {
        "size": 4835,
        "modified": 1778728995.504428,
        "hash": "3ce8566cba9b459c741053496f10bbb9"
    },
    "src/pages/Home.tsx": {
        "size": 14919,
        "modified": 1778646214.2339249,
        "hash": "44a70603b5f4792df2985b1523776083"
    },
    "src/pages/Register.tsx": {
        "size": 8226,
        "modified": 1778403717.7924407,
        "hash": "69950be04ab4b8c7b32a2450cae080e9"
    },
    "src/pages/Dashboard.tsx": {
        "size": 21350,
        "modified": 1778647617.0699282,
        "hash": "761fa226a2150e4e1375bf888f682127"
    },
    "src/pages/Login.tsx": {
        "size": 7311,
        "modified": 1778645537.9819236,
        "hash": "4e5aed5265583c7f3d6d403a56f01275"
    },
    "src/pages/Favorites.tsx": {
        "size": 4230,
        "modified": 1778299966.8948832,
        "hash": "60ed38e24963c9379470ec64e97cc4c3"
    },
    "src/pages/ProductDetail.tsx": {
        "size": 7385,
        "modified": 1778647229.8259249,
        "hash": "99905fede54d1d5a719237cb56a1e4bc"
    },
    "src/pages/Catalog.tsx": {
        "size": 13932,
        "modified": 1778688002.8384864,
        "hash": "5c6d8599ef89f4425485a069374cf44e"
    },
    "src/pages/CreateListing.tsx": {
        "size": 14596,
        "modified": 1778391073.2364438,
        "hash": "101b4982d5d01a8560c1c3d6f4446cc8"
    },
    "src/pages/Messages.tsx": {
        "size": 17828,
        "modified": 1778647229.913925,
        "hash": "343067ef8bdb0c44e4f012d9956cd936"
    },
    "src/pages/Profile.tsx": {
        "size": 6232,
        "modified": 1778244922.756551,
        "hash": "7f246d6a15b0627e0fea704977152eb3"
    },
    "src/pages/PaymentCheckout.tsx": {
        "size": 17744,
        "modified": 1778647229.877925,
        "hash": "b11a9181c57d29843722cb9e89cf2dd5"
    },
    "src/pages/admin/Dashboard.tsx": {
        "size": 22435,
        "modified": 1778641407.2139273,
        "hash": "9356d5ba39d3d2a38eef2fcdb385c693"
    },
    "src/pages/admin/TransactionManagement.tsx": {
        "size": 13027,
        "modified": 1778299748.8508852,
        "hash": "654945951b110ea91e6cd1036176e65b"
    },
    "src/pages/admin/LogistixDashboard.tsx": {
        "size": 16918,
        "modified": 1778698724.1904898,
        "hash": "63acf8a73cfa789d62d950ff63386a58"
    },
    "src/pages/admin/LogistixPage.tsx": {
        "size": 13309,
        "modified": 1778729975.4044259,
        "hash": "2df6336613c785d3097258c7b7bb8989"
    },
    "src/pages/admin/UserManagement.tsx": {
        "size": 9610,
        "modified": 1778299748.8548853,
        "hash": "d477960b8c3203626c38166e3b4a1190"
    },
    "src/pages/admin/logistix/index.html": {
        "size": 6335,
        "modified": 1778708307.6744852,
        "hash": "a8417c11e5fd4ecbf223ae25acf294b8"
    },
    "src/pages/admin/logistix/js/app.js": {
        "size": 4244,
        "modified": 1778707057.4424891,
        "hash": "4d9686b0876d0dc89bd370131e781e14"
    },
    "src/pages/admin/logistix/js/api.js": {
        "size": 5532,
        "modified": 1778709371.3964167,
        "hash": "2364307b57f4a3127a100f4d0085d1d6"
    },
    "src/pages/admin/logistix/js/utils.js": {
        "size": 3985,
        "modified": 1778707057.4224892,
        "hash": "f97bbc5270aad304849cd73c060b57b7"
    },
    "src/pages/admin/logistix/js/pages/usuarios.js": {
        "size": 6984,
        "modified": 1778707057.4224892,
        "hash": "cf3730adead0933a290ce24ac41f0b54"
    },
    "src/pages/admin/logistix/js/pages/clientes.js": {
        "size": 4177,
        "modified": 1778707057.434489,
        "hash": "ddd6c6d38c2d35b212d7e54d97a25ee8"
    },
    "src/pages/admin/logistix/js/pages/configuracoes.js": {
        "size": 2725,
        "modified": 1778707057.4424891,
        "hash": "2c4c559f5f5ad6fd3d715ae3612d424b"
    },
    "src/pages/admin/logistix/js/pages/entregas.js": {
        "size": 2509,
        "modified": 1778707057.4424891,
        "hash": "02ab2873d60137f5330611771c4f2904"
    },
    "src/pages/admin/logistix/js/pages/estoque.js": {
        "size": 3168,
        "modified": 1778707057.4424891,
        "hash": "43f8ab3e8a79258f45a20970223c3b5d"
    },
    "src/pages/admin/logistix/js/pages/auditoria.js": {
        "size": 1883,
        "modified": 1778707057.434489,
        "hash": "c80a4cab84a007d5faff18e667d18415"
    },
    "src/pages/admin/logistix/js/pages/pedidos.js": {
        "size": 6558,
        "modified": 1778707057.4424891,
        "hash": "8d58023ba226eeedce3b7a7ddd8dd65b"
    },
    "src/pages/admin/logistix/js/pages/ocorrencias.js": {
        "size": 2187,
        "modified": 1778707057.4424891,
        "hash": "b2163cb6ef8ec1ebc67c8b6c7ad9e20e"
    },
    "src/pages/admin/logistix/js/pages/relatorios.js": {
        "size": 6879,
        "modified": 1778707057.4424891,
        "hash": "df5a44a34b0727104f62c0f80c96a534"
    },
    "src/pages/admin/logistix/js/pages/dashboard.js": {
        "size": 12627,
        "modified": 1778707057.434489,
        "hash": "f9b0e2aeaf6b47bb7558c5c559de24e3"
    },
    "src/pages/admin/logistix/js/pages/armazens.js": {
        "size": 4115,
        "modified": 1778707057.4424891,
        "hash": "678cea4b80f28a69ee73d0492d1bc1dd"
    },
    "src/pages/admin/logistix/js/pages/setores.js": {
        "size": 3385,
        "modified": 1778707057.426489,
        "hash": "f0d67c18795bfb7550f099de565cf38a"
    },
    "src/pages/admin/logistix/js/pages/coletas.js": {
        "size": 1006,
        "modified": 1778707057.4424891,
        "hash": "c86473aebeeb521953ce81c628194082"
    },
    "src/pages/admin/logistix/js/pages/transportes.js": {
        "size": 4322,
        "modified": 1778707057.4424891,
        "hash": "6b79f5dcc89c1680b1d40ed5a497f30b"
    },
    "src/pages/admin/logistix/js/pages/transferencias.js": {
        "size": 2680,
        "modified": 1778707057.4424891,
        "hash": "39ad22a46b4a5de8d2a104df42236e07"
    },
    "src/pages/admin/logistix/css/styles.css": {
        "size": 18770,
        "modified": 1778707057.414489,
        "hash": "91c36a7a013308a6ba845a03150aafcd"
    },
    "src/hooks/useAnalytics.ts": {
        "size": 3869,
        "modified": 1778395740.7964454,
        "hash": "206fb7eb105a3b009425e3e002727199"
    },
    "src/hooks/useTranslation.ts": {
        "size": 140,
        "modified": 1778354941.8481557,
        "hash": "fb27f181db37fe9bb71a1919b87aed3c"
    },
    "src/types/index.ts": {
        "size": 1470,
        "modified": 1778249139.832548,
        "hash": "480c249ad18a55d1696f43397fe47710"
    },
    "src/components/PurchaseFlow.tsx": {
        "size": 9884,
        "modified": 1778644765.945924,
        "hash": "e01805551feb3638e3fdcad1a85cbdb5"
    },
    "src/components/ProtectedRoute.tsx": {
        "size": 732,
        "modified": 1778401952.3204453,
        "hash": "0344c204fc7ec6a09b449e9a03d93dd5"
    },
    "src/components/ChatPopup.tsx": {
        "size": 20895,
        "modified": 1778403004.1404467,
        "hash": "929bdc6c83da7ce44bb1dd90dd5c4fe2"
    },
    "src/components/LanguageDetector.tsx": {
        "size": 1932,
        "modified": 1778257227.2765508,
        "hash": "8a1c33483bd973cc024c8eaf43779ab5"
    },
    "src/components/AdminRoute.tsx": {
        "size": 3691,
        "modified": 1778729390.2964218,
        "hash": "be6e50ac8ae330a71a13ecbe85781ac4"
    },
    "src/components/GaidLogo.tsx": {
        "size": 5048,
        "modified": 1778644801.7899237,
        "hash": "bf52a53f6a83c8dc09ec5592e38c02a2"
    },
    "src/components/SimulateSale.tsx": {
        "size": 6281,
        "modified": 1778644725.7659202,
        "hash": "6d46b7d1923bb57c34a72c9a56e0e5c9"
    },
    "src/components/layout/Header.tsx": {
        "size": 12913,
        "modified": 1778723936.6084278,
        "hash": "c51d81d04cfee80d7a01877a9c85e7c5"
    },
    "src/components/layout/Footer.tsx": {
        "size": 4807,
        "modified": 1778554057.3314762,
        "hash": "018c16bd2272e557babdee0f2c14dc4c"
    },
    "src/components/layout/Layout.tsx": {
        "size": 514,
        "modified": 1778646525.5539212,
        "hash": "7d122b483f2db09e4ca9c56fe146e536"
    },
    "src/components/logistix/NeonCharts.tsx": {
        "size": 5618,
        "modified": 1778729908.284417,
        "hash": "f65a8135f4c7a0fc3890ad403c7920ac"
    },
    "src/components/logistix/NeonKPI.tsx": {
        "size": 3141,
        "modified": 1778729918.8244176,
        "hash": "cb5344161a37e2f6afc2b2c9a3610409"
    },
    "src/components/logistix/LogistixSidebar.tsx": {
        "size": 4241,
        "modified": 1778729947.9164202,
        "hash": "e3cf16bdd6ff8e53f0b973108a54ddcd"
    },
    "src/components/logistix/LogisticsMap.tsx": {
        "size": 5404,
        "modified": 1778729936.6764188,
        "hash": "f0eab5127c04705a624c440f6895a2f1"
    },
    "src/components/admin/analytics/RevenueChart.tsx": {
        "size": 3055,
        "modified": 1778354942.6961555,
        "hash": "44d6bc36e14a7ecf5d90782a0b87cdb6"
    },
    "src/components/admin/analytics/index.ts": {
        "size": 259,
        "modified": 1778354086.600169,
        "hash": "9652cdcc58c56a93bc72779c241629c2"
    },
    "src/components/admin/analytics/TopSellersChart.tsx": {
        "size": 2865,
        "modified": 1778354943.1801555,
        "hash": "4be28578005c2a94e597698b87bceed2"
    },
    "src/components/admin/analytics/TransactionStatus.tsx": {
        "size": 3361,
        "modified": 1778354944.1001554,
        "hash": "049fb5fb6e81750b5e1bd50cb5944458"
    },
    "src/components/admin/analytics/CategoryChart.tsx": {
        "size": 2754,
        "modified": 1778354942.2681556,
        "hash": "311c1d2659e8e6afe09b6bd768876c62"
    },
    "src/components/admin/analytics/UserGrowthChart.tsx": {
        "size": 3600,
        "modified": 1778354943.7201555,
        "hash": "0093b5d6432518096b867ed5ccc7285a"
    },
    "src/lib/constants.ts": {
        "size": 3340,
        "modified": 1778646191.3219247,
        "hash": "051d5136aa8b17b5f18e93316c352de6"
    },
    "src/lib/supabaseErrorHandler.ts": {
        "size": 3089,
        "modified": 1778249513.9325483,
        "hash": "fee891a53a2c2eba069b98b7d2863fee"
    },
    "src/lib/supabase.ts": {
        "size": 5461,
        "modified": 1778728920.736428,
        "hash": "b58c8d13860d06f19631069434d7fb7a"
    },
    "src/lib/adminApi.ts": {
        "size": 6405,
        "modified": 1778698643.0984852,
        "hash": "359c2870cca57cf5a9461b30b04a5e32"
    },
    "src/lib/api.ts": {
        "size": 7773,
        "modified": 1778390840.0604486,
        "hash": "91da8ac6116cb569be106cc9c2efe849"
    },
    "src/lib/i18n.tsx": {
        "size": 19330,
        "modified": 1778403633.5684395,
        "hash": "4411ea1e2a49b62ad0b820aaf8f6282a"
    },
    "supabase/fix-profiles-rls.sql": {
        "size": 614,
        "modified": 1778727960.944427,
        "hash": "d8e9eaed4a9f3a3f5deae49a2907b5d1"
    },
    "supabase/config.toml": {
        "size": 6014,
        "modified": 1778337494.1784892,
        "hash": "8c610ccf62c3e4003410c15c47043b2f"
    },
    "supabase/seed.sql": {
        "size": 0,
        "modified": 1778337494.1784892,
        "hash": "d41d8cd98f00b204e9800998ecf8427e"
    },
    "supabase/fix-profiles-rls-v2.sql": {
        "size": 798,
        "modified": 1778728032.4164243,
        "hash": "4309bca43af04212f8e58ee9bdd66978"
    },
    "supabase/seed-logistix-data.sql": {
        "size": 3482,
        "modified": 1778727844.1084294,
        "hash": "bb8e62c3227b0b3c6b2b33419d82abe3"
    },
    "supabase/config.json": {
        "size": 766,
        "modified": 1778327905.9424908,
        "hash": "02721d92ddb37fde495967cad7f0c853"
    },
    "supabase/functions/stripe-checkout.ts": {
        "size": 8502,
        "modified": 1778340589.2841704,
        "hash": "65f353df3f8eadad10a29b4f6413d7d4"
    },
    "supabase/functions/README.md": {
        "size": 1702,
        "modified": 1778327881.438491,
        "hash": "9ca3e4cd3b337d5f6bcd20dabc02b24a"
    },
    "supabase/functions/stripe-webhook.ts": {
        "size": 5080,
        "modified": 1778332114.0744827,
        "hash": "db639ff2311a5396d3faaf336652f4fd"
    },
    "supabase/functions/logistix-sync/index.ts": {
        "size": 7058,
        "modified": 1778730557.5124266,
        "hash": "0853728bd6892ff6a3e6ddbe6a149e3d"
    },
    "supabase/functions/analytics/index.ts": {
        "size": 5104,
        "modified": 1778395731.740446,
        "hash": "a56882ef55edcf0e90fa464b37898314"
    },
    "supabase/functions/categories/index.ts": {
        "size": 4552,
        "modified": 1778327861.022491,
        "hash": "7b0a982c9da6a7bfc5625dcb8f70c0a0"
    },
    "supabase/functions/parts/index.ts": {
        "size": 6704,
        "modified": 1778327799.2224922,
        "hash": "0c43ed61778256e095b49176bf1f873e"
    },
    "supabase/functions/users/index.ts": {
        "size": 6843,
        "modified": 1778327814.514492,
        "hash": "18fd4823093eadba1ed0252b47a9140d"
    },
    "supabase/functions/logistix-b2b/index.ts": {
        "size": 12785,
        "modified": 1778730667.3764262,
        "hash": "9011837705dc69ed74544505f2dbf9be"
    },
    "supabase/functions/stripe-checkout/index.ts": {
        "size": 8578,
        "modified": 1778340821.3681724,
        "hash": "136ecf556bc9e0daf0e814e2cd765f5f"
    },
    "supabase/functions/utils/base.ts": {
        "size": 2075,
        "modified": 1778327773.694492,
        "hash": "d39d5443c7dd09d6323d9e434cc77ced"
    },
    "supabase/functions/utils/health.ts": {
        "size": 457,
        "modified": 1778327892.066491,
        "hash": "52d523dbf1fd0867714b00ccef5f8de4"
    },
    "supabase/functions/utils/validators.ts": {
        "size": 2263,
        "modified": 1778327784.1784923,
        "hash": "25202cd32d0630a2d8824e0f9d6a77fc"
    },
    "supabase/functions/transactions/index.ts": {
        "size": 10155,
        "modified": 1778327834.926492,
        "hash": "2c3fb6d3cb8ea865eec9f78a8e3791c2"
    },
    "supabase/functions/notifications/index.ts": {
        "size": 1552,
        "modified": 1778390195.744443,
        "hash": "e24a7a5efd38c87b4783bf9e138d3f72"
    },
    "supabase/functions/analyze-part/index.ts": {
        "size": 2828,
        "modified": 1778390868.4684484,
        "hash": "08f2f52f38ade01362a44b5a60b693ae"
    },
    "supabase/functions/brands/index.ts": {
        "size": 3314,
        "modified": 1778327870.9144912,
        "hash": "bd3114d8bec84a8d1cdd30cd063f0718"
    },
    "supabase/functions/stripe-webhook/index.ts": {
        "size": 5080,
        "modified": 1778340165.284175,
        "hash": "db639ff2311a5396d3faaf336652f4fd"
    },
    "supabase/functions/admin/index.ts": {
        "size": 31233,
        "modified": 1778709828.7884307,
        "hash": "9a3f1df470d32ec7354a86f840e26afd"
    },
    "supabase/functions/auctions/index.ts": {
        "size": 10214,
        "modified": 1778327850.9744914,
        "hash": "c60d1c801526d1e246b908956aed53d7"
    },
    "supabase/migrations/logistix-schema-complete.sql": {
        "size": 5593,
        "modified": 1778726641.416425,
        "hash": "b24149e16bc3e8d2db1f0082ed8818bc"
    },
    "supabase/migrations/fix-rls.sql": {
        "size": 1955,
        "modified": 1778726886.2044277,
        "hash": "8ef4e17b455da783007f06f52aa12e28"
    },
    "supabase/migrations/b2b-tables.sql": {
        "size": 2874,
        "modified": 1778730580.2924263,
        "hash": "040201af6f106e13a7dea2bded8136af"
    },
    "scripts/createUsers.ts": {
        "size": 1845,
        "modified": 1778249980.7885504,
        "hash": "2b7683a19d07b9396d9f454a93fea0e1"
    },
    "public/icons.svg": {
        "size": 5031,
        "modified": 1778210480.689214,
        "hash": "3b4fcfcf393eca4d264dca4a4663bc37"
    },
    "public/favicon.svg": {
        "size": 9522,
        "modified": 1778210480.6812139,
        "hash": "7e840862161341271697daa99a40d76b"
    }
}

last_updated = "2026-05-14"
