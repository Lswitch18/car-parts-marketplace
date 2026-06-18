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
    "anota\u00e7\u00e3o": {
        "size": 351,
        "modified": 1779247558.3445654,
        "hash": "437ba07746ffbdf36482738741926876"
    },
    "Dockerfile.jenkins": {
        "size": 324,
        "modified": 1778343579.364174,
        "hash": "cc1d0e586a677b4d3ba4b90b6a578178"
    },
    "package-lock.json": {
        "size": 205295,
        "modified": 1778867875.4668105,
        "hash": "7e7f845be2bd26482215ab6e279cdf06"
    },
    "tsconfig.json": {
        "size": 655,
        "modified": 1778767366.0071764,
        "hash": "12ea398b332bf1f409436e40efa022d6"
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
        "size": 539,
        "modified": 1779999439.2327504,
        "hash": "259d538b4ccabf0bafd1cb596543f5ef"
    },
    "brain.py": {
        "size": 7693,
        "modified": 1779935389.6983097,
        "hash": "714941bb2222483d89cd9842e80d80ca"
    },
    "vite.config.js": {
        "size": 636,
        "modified": 1780149420.3851748,
        "hash": "86cd72e1c988c0beed9d230d917a1213"
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
    "package.json": {
        "size": 1250,
        "modified": 1779930990.9144092,
        "hash": "dcd353e41c28a25a1b59b548d1588df0"
    },
    "postcss.config.js": {
        "size": 79,
        "modified": 1778244136.1845484,
        "hash": "470cfd3ee10fbff840b377e769485f3e"
    },
    "tsconfig.tsbuildinfo": {
        "size": 4027,
        "modified": 1780149757.3371685,
        "hash": "0ec36d1a8935748e6ef172c5cb92f395"
    },
    "PESQUISA-LOGISTICA-JAP\u00c3O.md": {
        "size": 3492,
        "modified": 1778724144.7244265,
        "hash": "b5e3f7155a8c704dc7650532d6408f5e"
    },
    "setup-google-oauth.sh": {
        "size": 4216,
        "modified": 1778212428.9972084,
        "hash": "f802dae5e0536f33144c16601c33f35a"
    },
    "tsconfig.node.tsbuildinfo": {
        "size": 141879,
        "modified": 1780149420.6411748,
        "hash": "b3ae9b220a79df6b625ecdd78ca86071"
    },
    "index.html": {
        "size": 1901,
        "modified": 1778790309.1751683,
        "hash": "ee03a14dfecf94f5a56f1ebf572953a9"
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
        "size": 3174,
        "modified": 1779812593.3025339,
        "hash": "0551a35ceff24fd338f1047e5ad12dab"
    },
    "vite.config.d.ts": {
        "size": 76,
        "modified": 1778790067.4031696,
        "hash": "9fcf75521f4c43fd8b75300e0f63b867"
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
    "BUILD-REPORT-GAID-2026-05-10-PT.pdf": {
        "size": 29584,
        "modified": 1778404369.4324417,
        "hash": "a282cba1050f614404b76e52df8294d7"
    },
    "RELATORIO_MELHORIAS.pdf": {
        "size": 40587,
        "modified": 1778731635.5084183,
        "hash": "8be09cc5f625314500e26378cf7646d5"
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
    "download-schema.sh": {
        "size": 1609,
        "modified": 1778291578.4548821,
        "hash": "3ee0a35697494f2b702005ca8b6329ea"
    },
    "deploy-functions.sh": {
        "size": 2986,
        "modified": 1778856071.6634386,
        "hash": "61c3863cfe8830335d4c6b634d261558"
    },
    "vercel.json": {
        "size": 80,
        "modified": 1778643657.5139263,
        "hash": "6411d2fbb5f0e00aaff0ca0ded84e0b6"
    },
    "docs/AWS-COST-STUDY.md": {
        "size": 8615,
        "modified": 1778355239.7881644,
        "hash": "81b2ffae26f2eeb21eca7c42c9e3f90f"
    },
    "docs/RELATORIO_MELHORIAS.md": {
        "size": 5907,
        "modified": 1778731754.6844292,
        "hash": "48cb7c2829697ea03ae756297f310631"
    },
    "docs/DIFERENCIAIS-TECNOLOGICOS.pdf": {
        "size": 28728,
        "modified": 1779761973.439381,
        "hash": "3e95a9efc9d245ae96a0d3dc20a39441"
    },
    "docs/APRESENTACAO-INVESTIDOR copy.pdf": {
        "size": 38500,
        "modified": 1779762992.8874104,
        "hash": "0525a8b3d7926b537531126eac72b644"
    },
    "docs/SPEC-SAGAWA.md": {
        "size": 14733,
        "modified": 1778596367.7674787,
        "hash": "02d4a3fede86b7f89fd502ba50091bcd"
    },
    "docs/APRESENTACAO-INVESTIDOR.pdf": {
        "size": 37395,
        "modified": 1779763671.5833898,
        "hash": "8c4a9015de20419814cdf1c645a2d6ea"
    },
    "docs/ANALISE-GAID.md": {
        "size": 21416,
        "modified": 1778545632.438792,
        "hash": "cd44fdf1f2b3971f3f6489271c75254e"
    },
    "docs/TECH-RESEARCH-LOW-COST.md": {
        "size": 3870,
        "modified": 1778536769.1481504,
        "hash": "df3ece7b7c91a3e428af91abffbcb0cd"
    },
    "docs/DIFERENCIAIS-TECNOLOGICOS.md": {
        "size": 3858,
        "modified": 1779761952.027382,
        "hash": "5ada2704ae59c8a759dca249a2032cb5"
    },
    "docs/APRESENTACAO-INVESTIDOR.md": {
        "size": 7163,
        "modified": 1779763648.907395,
        "hash": "acec8ceddf6a4094be036f032a565057"
    },
    "docs/SAGAWA-CONTRATO-GUIA.md": {
        "size": 18857,
        "modified": 1778596790.8434935,
        "hash": "ba8c6cd8430aa5519e74198aa1da188c"
    },
    "docs/PROJECT-STATUS.md": {
        "size": 2948,
        "modified": 1778403748.6444423,
        "hash": "b416d0037a57f805636ab84b393d0179"
    },
    "docs/BUILD-REPORT-2026-05-10.md": {
        "size": 838,
        "modified": 1778403591.39244,
        "hash": "68a611a1df9360948049f2b130205532"
    },
    "docs/NEXT-STEPS.md": {
        "size": 1663,
        "modified": 1778537443.5011897,
        "hash": "4cf5b4b9f4b4426acf70a3d8e23af8b7"
    },
    "docs/COST-PROJECTION-10K-USERS.md": {
        "size": 2660,
        "modified": 1778536669.115136,
        "hash": "74380210783530747edbcb27a2a074d2"
    },
    "docs/PRESENTACAO-FASE1-PAGAMENTOS-LOGISTICA.md": {
        "size": 11672,
        "modified": 1778591006.6954935,
        "hash": "27951b5ad2036e5462bf32da164e038f"
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
        "size": 13476,
        "modified": 1780149931.7891693,
        "hash": "6ea896b7c7f619118b24b507d8db8ed2"
    },
    "src/main.tsx": {
        "size": 1928,
        "modified": 1778789120.7631693,
        "hash": "9ad46eafe0aad4e0e4895e6a02c1b419"
    },
    "src/vite-env.d.ts": {
        "size": 201,
        "modified": 1778244843.5325506,
        "hash": "16c5173f27fbb846bae733ed9ec9f4cb"
    },
    "src/App.tsx": {
        "size": 4897,
        "modified": 1780443510.3247266,
        "hash": "5b0637bef01f0463ba0ddddbe2276c8a"
    },
    "src/stores/favoriteStore.ts": {
        "size": 1217,
        "modified": 1778767583.087173,
        "hash": "f0469cc70c620df1bd35f1895178bae4"
    },
    "src/stores/authStore.ts": {
        "size": 8211,
        "modified": 1780452738.0287375,
        "hash": "4751a3b915a9c2cc887fad147c92856e"
    },
    "src/pages/Home.tsx": {
        "size": 25114,
        "modified": 1780411209.1287172,
        "hash": "a5b32e61a3dd1c34feca02b1c279d496"
    },
    "src/pages/CarList.tsx": {
        "size": 14525,
        "modified": 1779303795.2157018,
        "hash": "1b4015b7f5d0f13c2f218a30809f9ee7"
    },
    "src/pages/ImmersiveExperience.tsx": {
        "size": 16577,
        "modified": 1779925177.8984015,
        "hash": "fe3761e917d3cf47793a21cd2193e941"
    },
    "src/pages/Register.tsx": {
        "size": 7282,
        "modified": 1780415979.2807248,
        "hash": "351587cceab1948025f642d6409a0692"
    },
    "src/pages/Dashboard.tsx": {
        "size": 26259,
        "modified": 1779913852.7016559,
        "hash": "5f1377c5dd0ba7e10e9969499a8d8a13"
    },
    "src/pages/Login.tsx": {
        "size": 6463,
        "modified": 1780415954.3047264,
        "hash": "ecae1d88b93f5ff0aab63a113206bc42"
    },
    "src/pages/Favorites.tsx": {
        "size": 4230,
        "modified": 1778299966.8948832,
        "hash": "60ed38e24963c9379470ec64e97cc4c3"
    },
    "src/pages/ProductDetail.tsx": {
        "size": 9020,
        "modified": 1779303735.539705,
        "hash": "a7a9cae0a17746c523255aea806ac61b"
    },
    "src/pages/MotionFramePage.tsx": {
        "size": 16241,
        "modified": 1779132569.8575718,
        "hash": "d16d1b5ffd4d3447b8077a4be4deaf35"
    },
    "src/pages/TrackingPublico.tsx": {
        "size": 10590,
        "modified": 1778811375.5306227,
        "hash": "3a665197c27391ec3459d8e54b241d3f"
    },
    "src/pages/Catalog.tsx": {
        "size": 34817,
        "modified": 1780422653.5687323,
        "hash": "7c3fd5dd76ab1b8018d2cbd65135e186"
    },
    "src/pages/CreateListing.tsx": {
        "size": 14689,
        "modified": 1779930990.9264092,
        "hash": "00d1ab53c185b1b84b5f62087a9c96db"
    },
    "src/pages/Auctions.tsx": {
        "size": 44619,
        "modified": 1780170932.4451416,
        "hash": "684768feb15bc5470298a3f3383b2b64"
    },
    "src/pages/Messages.tsx": {
        "size": 21114,
        "modified": 1779303715.5757053,
        "hash": "446adf2079f3fc21c0234e88d26e70a9"
    },
    "src/pages/HomeLanding.tsx": {
        "size": 29565,
        "modified": 1779925065.766402,
        "hash": "af0d035cd2c7d8d69f4d01fb6c983273"
    },
    "src/pages/Profile.tsx": {
        "size": 6627,
        "modified": 1779303675.0477052,
        "hash": "e0d1d7292556a6fdb7e21f4ff87edf26"
    },
    "src/pages/PaymentCheckout.tsx": {
        "size": 15246,
        "modified": 1779303722.983705,
        "hash": "d8b4956e261684a429914b77c4525941"
    },
    "src/pages/mobile/WorkerColetas.tsx": {
        "size": 22821,
        "modified": 1778811904.762613,
        "hash": "cea88e8e8457786b513b548eda5445a8"
    },
    "src/pages/mobile/MobileApp.tsx": {
        "size": 688,
        "modified": 1778778853.0871668,
        "hash": "1e6671c1d4ef428112c9c55566584ec3"
    },
    "src/pages/mobile/AgenciaPage.tsx": {
        "size": 6846,
        "modified": 1778810710.7786179,
        "hash": "70f32d1b1d7c7a15480723a9c4a228e8"
    },
    "src/pages/mobile/MobileColetas.tsx": {
        "size": 5634,
        "modified": 1778778819.0671682,
        "hash": "3ede193e0526ce35e81c6a6deb0b6371"
    },
    "src/pages/mobile/MobileDashboard.tsx": {
        "size": 3927,
        "modified": 1778778797.543169,
        "hash": "d053cf5a5c27e2c37b6eea5477aef960"
    },
    "src/pages/mobile/MobileEntregas.tsx": {
        "size": 6028,
        "modified": 1778778833.283168,
        "hash": "50721bc4906bbbf1aa92b36bd1150a51"
    },
    "src/pages/mobile/WorkerEntregas.tsx": {
        "size": 18108,
        "modified": 1778795832.0431657,
        "hash": "786208ba938626562fa21518638ad9b9"
    },
    "src/pages/mobile/WorkerApp.tsx": {
        "size": 2755,
        "modified": 1778788559.1271727,
        "hash": "6a7f2e2b1463b3d603cd1a58358786cd"
    },
    "src/pages/mobile/QRInstallPage.tsx": {
        "size": 2962,
        "modified": 1778788050.6711714,
        "hash": "4a3e80482e5c8a7ef397c2d7a935be90"
    },
    "src/pages/mobile/MobileCD.tsx": {
        "size": 4576,
        "modified": 1778778845.4631674,
        "hash": "8c52d3972f0c65fb3b44895d89e4f8b5"
    },
    "src/pages/admin/ImageTo3D.tsx": {
        "size": 27205,
        "modified": 1779466106.5370305,
        "hash": "1912fc40feebf0e9021fc5cbe3d08379"
    },
    "src/pages/admin/TransactionManagement.tsx": {
        "size": 13140,
        "modified": 1778855902.4034452,
        "hash": "5726dae2c33f1cab09f4d0bd4c68825a"
    },
    "src/pages/admin/LogistixDashboard.tsx": {
        "size": 29928,
        "modified": 1779974418.5407524,
        "hash": "ffd5cfb37f291d39bcc2f59d13f0be6e"
    },
    "src/pages/admin/UserManagement.tsx": {
        "size": 9610,
        "modified": 1778299748.8548853,
        "hash": "d477960b8c3203626c38166e3b4a1190"
    },
    "src/pages/admin/logistix/OcorrenciasPage.tsx": {
        "size": 9363,
        "modified": 1778767524.503092,
        "hash": "0836cc253f67cd7dbcc6cc26d7218696"
    },
    "src/pages/admin/logistix/PedidoDetail.tsx": {
        "size": 8770,
        "modified": 1778876942.8788226,
        "hash": "392836391742aa728dd29ed483de02fe"
    },
    "src/pages/admin/logistix/ConfigPage.tsx": {
        "size": 3819,
        "modified": 1778764152.7791643,
        "hash": "7e97d08a73021f33125344f90897fc1b"
    },
    "src/pages/admin/logistix/EstoquePage.tsx": {
        "size": 9287,
        "modified": 1778767523.7350917,
        "hash": "d67902535acfbb35e4576d4e7be93063"
    },
    "src/pages/admin/logistix/UsuariosPage.tsx": {
        "size": 15273,
        "modified": 1778778472.5071692,
        "hash": "923c3cbd4ad98316ea1e9a3aa551ec8c"
    },
    "src/pages/admin/logistix/ClientesPage.tsx": {
        "size": 9766,
        "modified": 1778767521.1190915,
        "hash": "1d82d2c8e30db30104fdd2985f3300e0"
    },
    "src/pages/admin/logistix/RelatoriosPage.tsx": {
        "size": 6614,
        "modified": 1778764146.4871643,
        "hash": "8f071db1e003a37290d28d16fe31db86"
    },
    "src/pages/admin/logistix/EntregasPage.tsx": {
        "size": 12544,
        "modified": 1778767522.8950915,
        "hash": "6a9a626c384c86a528f2325f03f5d064"
    },
    "src/pages/admin/logistix/RastreamentoPage.tsx": {
        "size": 10271,
        "modified": 1778767526.1950922,
        "hash": "a069cf464505edd5f4201e7a5dbc69a9"
    },
    "src/pages/admin/logistix/TrackingPage.tsx": {
        "size": 5972,
        "modified": 1778793095.8271658,
        "hash": "9d1b282cf97216ed5d9e30fe77134f50"
    },
    "src/pages/admin/logistix/PedidosPage.tsx": {
        "size": 16251,
        "modified": 1778793037.199166,
        "hash": "731bad1fd79971f66ab90c40327c0dab"
    },
    "src/pages/admin/logistix/TransportesPage.tsx": {
        "size": 8663,
        "modified": 1778767527.6550925,
        "hash": "bd907c4c618e93fd2fa551fa5fd240e0"
    },
    "src/pages/admin/logistix/ArmazensPage.tsx": {
        "size": 13874,
        "modified": 1778773016.5511646,
        "hash": "39b1970f489bb50e8d47e8b0c2a222e8"
    },
    "src/pages/admin/logistix/TransferenciasPage.tsx": {
        "size": 6994,
        "modified": 1778767526.9430923,
        "hash": "a7e2981daa9399368437f7fc7131c8f4"
    },
    "src/pages/admin/logistix/WMSPage.tsx": {
        "size": 8566,
        "modified": 1778811066.4786189,
        "hash": "e98f74fa1ee9b56d3dc5b576e0f0629f"
    },
    "src/pages/admin/logistix/MapaPage.tsx": {
        "size": 5114,
        "modified": 1778813262.0026248,
        "hash": "2baf973bd88fec8a2b28d713c8473ce8"
    },
    "src/pages/admin/logistix/ColetasPage.tsx": {
        "size": 9900,
        "modified": 1778877869.8628206,
        "hash": "7e6df40a671dd446f155b660c6f85396"
    },
    "src/pages/admin/logistix/DropoffPage.tsx": {
        "size": 4679,
        "modified": 1778810460.6946244,
        "hash": "38d7a72a4c8951c4f1ad2372ffaef7bb"
    },
    "src/pages/admin/logistix/Armazem3DPage.tsx": {
        "size": 15618,
        "modified": 1778872512.5828276,
        "hash": "de4fb926fae9b7df20409faa0e4dfe71"
    },
    "src/pages/admin/logistix/EtiquetasPage.tsx": {
        "size": 10931,
        "modified": 1778810048.9746282,
        "hash": "21f8fb2b3bab21bca983c23ada802d61"
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
        "size": 3661,
        "modified": 1780170693.44514,
        "hash": "5df5699c4c07a033d28034643e1d1949"
    },
    "src/components/ParticleField.tsx": {
        "size": 4442,
        "modified": 1780149952.6651707,
        "hash": "ca47f252b0c596ef97e2720e9cc7c480"
    },
    "src/components/PurchaseFlow.tsx": {
        "size": 9766,
        "modified": 1778767507.1831665,
        "hash": "1538442a6826865d970fd883fc679b91"
    },
    "src/components/MotionFrameScene.tsx": {
        "size": 7735,
        "modified": 1779132539.3815718,
        "hash": "f56fd060d4a5128a573443726c61e9f3"
    },
    "src/components/ProtectedRoute.tsx": {
        "size": 1042,
        "modified": 1780444891.8926969,
        "hash": "bd75eb7afa1b00a3e690ee9b4e152612"
    },
    "src/components/PWARegister.tsx": {
        "size": 226,
        "modified": 1778781048.6911688,
        "hash": "aa5ea86cfeb5cade1984e898e3c4c87a"
    },
    "src/components/ChatPopup.tsx": {
        "size": 24209,
        "modified": 1779303698.7997053,
        "hash": "97701b87d9cbb28f8aec53a60313002e"
    },
    "src/components/LanguageDetector.tsx": {
        "size": 1932,
        "modified": 1778257227.2765508,
        "hash": "8a1c33483bd973cc024c8eaf43779ab5"
    },
    "src/components/GaidLogo.tsx": {
        "size": 5999,
        "modified": 1780412187.9767294,
        "hash": "bb6ad789b9e98fe62b2c71ca1ae284f2"
    },
    "src/components/ExplodedCarScene.tsx": {
        "size": 9676,
        "modified": 1779398634.8189712,
        "hash": "590251456638b79f1d81d24a2e6ba18c"
    },
    "src/components/SimulateSale.tsx": {
        "size": 6223,
        "modified": 1778855893.803446,
        "hash": "044016204578f2adf3ceecbe8d9873b5"
    },
    "src/components/ImmersiveCarScene.tsx": {
        "size": 16459,
        "modified": 1779925201.622403,
        "hash": "95e06322735d499aa081ffe4597f6a69"
    },
    "src/components/mobile/MobileLayout.tsx": {
        "size": 2493,
        "modified": 1778778776.4951692,
        "hash": "2ac740a98552aecfd4624d1f11f5b8b5"
    },
    "src/components/mobile/ScannerCamera.tsx": {
        "size": 10401,
        "modified": 1778806619.118621,
        "hash": "f2922a7e0de50cabada51825f9789b44"
    },
    "src/components/mobile/WorkerLayout.tsx": {
        "size": 2828,
        "modified": 1778780382.0111685,
        "hash": "6438c9cb59c28773d25e592048e59fa4"
    },
    "src/components/layout/Header.tsx": {
        "size": 28174,
        "modified": 1780433853.1487315,
        "hash": "8324c1d1be145d716566d3f581c03035"
    },
    "src/components/layout/Footer.tsx": {
        "size": 5093,
        "modified": 1779303787.0717018,
        "hash": "6af088ab0493fbd4382033a8f953d6e1"
    },
    "src/components/layout/Layout.tsx": {
        "size": 328,
        "modified": 1780431453.424724,
        "hash": "cef19e0f82fb9135db8639ecffcbcc46"
    },
    "src/components/logistix/ErrorState.tsx": {
        "size": 1492,
        "modified": 1780001348.9207532,
        "hash": "ed41e47cc06abe3b013701a65dc62202"
    },
    "src/components/logistix/WarehouseScene.tsx": {
        "size": 15499,
        "modified": 1778871266.3428266,
        "hash": "481c4a1eef02e4c4c3d41247c1b60340"
    },
    "src/components/logistix/ZoneBottomSheet.tsx": {
        "size": 7019,
        "modified": 1780001457.6087527,
        "hash": "2947e0d3116fea50e105561d2a5ec7d3"
    },
    "src/components/logistix/NotificationCenter.tsx": {
        "size": 6170,
        "modified": 1780001379.3727534,
        "hash": "9176264a2bd7fe191760ca498ac609bf"
    },
    "src/components/logistix/PageHeader.tsx": {
        "size": 2171,
        "modified": 1780000690.0407524,
        "hash": "460e46b1d7a146fafe63f9457c268847"
    },
    "src/components/logistix/GlobalSearch.tsx": {
        "size": 9405,
        "modified": 1780001420.6327536,
        "hash": "edb6543281c8b1c454214f530ffa61b2"
    },
    "src/components/logistix/GestureHint.tsx": {
        "size": 3077,
        "modified": 1780001479.7527528,
        "hash": "ecf3042b35ee432fcef3d98b8fca6b79"
    },
    "src/components/logistix/EmptyState.tsx": {
        "size": 1723,
        "modified": 1780000702.4407525,
        "hash": "06dcf3448e991750997c506c5d6fcd5b"
    },
    "src/components/admin/LabelPrint.tsx": {
        "size": 4519,
        "modified": 1778792618.8551664,
        "hash": "9a1d211aa7d8e4d268d70cb57b7a19fe"
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
    "src/lib/distance.ts": {
        "size": 2429,
        "modified": 1778796029.4951649,
        "hash": "2da14f9ba9199fab5659dbbb443f236c"
    },
    "src/lib/logisticsApi.ts": {
        "size": 6041,
        "modified": 1778865547.3188298,
        "hash": "3db39c3651b381b78d0f8506cd4b97d1"
    },
    "src/lib/constants.ts": {
        "size": 7465,
        "modified": 1779930990.9144092,
        "hash": "323671edfccf176315300fb429031fe9"
    },
    "src/lib/supabaseErrorHandler.ts": {
        "size": 3089,
        "modified": 1778249513.9325483,
        "hash": "fee891a53a2c2eba069b98b7d2863fee"
    },
    "src/lib/supabase.ts": {
        "size": 5090,
        "modified": 1780416094.640668,
        "hash": "b9347a7c8758e3cc7d1fd982e06ec451"
    },
    "src/lib/partsApi.ts": {
        "size": 1700,
        "modified": 1779924978.4744,
        "hash": "42b3ea11e64986434af0ba478fcb779e"
    },
    "src/lib/adminApi.ts": {
        "size": 7943,
        "modified": 1779974433.1047533,
        "hash": "1fb6c753f54ca1c36d6bcb55568a3d74"
    },
    "src/lib/fees.ts": {
        "size": 1030,
        "modified": 1778764662.6271725,
        "hash": "3e1c050f1f7fc0ddb0f84a9e98ed26d7"
    },
    "src/lib/useGpsTracking.ts": {
        "size": 2550,
        "modified": 1778811701.7266285,
        "hash": "0a00bf6cf92a899d241f5094b99e56cc"
    },
    "src/lib/api.ts": {
        "size": 8743,
        "modified": 1780442551.5447342,
        "hash": "4ad8441e82a04e6a10fcb219c967ec2d"
    },
    "src/lib/mobileApi.ts": {
        "size": 3544,
        "modified": 1778792598.9631677,
        "hash": "a951d654b4ea0744ea9fe0e684d8103f"
    },
    "src/lib/geo.ts": {
        "size": 458,
        "modified": 1778781065.839169,
        "hash": "4c77c373c23a0f2d4942bc8e5ca8dd73"
    },
    "src/lib/i18n.tsx": {
        "size": 19330,
        "modified": 1778403633.5684395,
        "hash": "4411ea1e2a49b62ad0b820aaf8f6282a"
    },
    "src/__tests__/api-crud.spec.ts": {
        "size": 17744,
        "modified": 1778878910.438818,
        "hash": "b17c9f7eb3439e85bb31a68b6711fd70"
    },
    "src/__tests__/adminApi.test.ts": {
        "size": 10165,
        "modified": 1778778172.4031694,
        "hash": "ad9fe471593c90521c5c3e79f3e44af2"
    },
    "src/__tests__/integration.spec.ts": {
        "size": 11969,
        "modified": 1780416102.9806638,
        "hash": "d56c7c0e9b4f72c1d3db0ce2a866c0fb"
    },
    "src/__tests__/fees.test.ts": {
        "size": 1427,
        "modified": 1778767322.8071747,
        "hash": "254ec59b0d802a1ab337c5a750b1f717"
    },
    "supabase/seed-parts.sql": {
        "size": 7808,
        "modified": 1779920171.8504205,
        "hash": "07ba03f16c3daff3ba165f6580b18ebf"
    },
    "supabase/seed-jp-data.sql": {
        "size": 16148,
        "modified": 1778772718.5751605,
        "hash": "55fcd9bb0b125071d19bd7aa7cb63b27"
    },
    "supabase/optimize-catalog.sql": {
        "size": 282,
        "modified": 1779924619.8383877,
        "hash": "8305455c1a21893bc75f23223f31a95a"
    },
    "supabase/seed-jp-logistics.sql": {
        "size": 3274,
        "modified": 1778777694.4111667,
        "hash": "9c4a59771c1592f64bad4ef819253af5"
    },
    "supabase/seed-tommsanje.sql": {
        "size": 2460,
        "modified": 1779920313.090406,
        "hash": "9753babf8081b81e3f89205bc5016e87"
    },
    "supabase/enable-realtime.sql": {
        "size": 179,
        "modified": 1780148877.0571542,
        "hash": "0639d5857c527c375edc0b02a3cc22a7"
    },
    "supabase/fix-profiles-rls.sql": {
        "size": 614,
        "modified": 1778727960.944427,
        "hash": "d8e9eaed4a9f3a3f5deae49a2907b5d1"
    },
    "supabase/create-storage-bucket.sql": {
        "size": 1037,
        "modified": 1779926207.3903813,
        "hash": "afceb501c8f86a34e9d6eb55797a8b81"
    },
    "supabase/remove-br-cds.sql": {
        "size": 454,
        "modified": 1778773462.8871691,
        "hash": "1f3602852f18d7551d3a8bd43e5263c3"
    },
    "supabase/config.toml": {
        "size": 6569,
        "modified": 1778767727.9111714,
        "hash": "e59e227e02ffb2231258894e7b038bf2"
    },
    "supabase/seed.sql": {
        "size": 0,
        "modified": 1778337494.1784892,
        "hash": "d41d8cd98f00b204e9800998ecf8427e"
    },
    "supabase/seed-zonas.sql": {
        "size": 14278,
        "modified": 1778871860.1228251,
        "hash": "77ce7e8e4bf2bf445d16bc807f90dc8b"
    },
    "supabase/config.toml.bak": {
        "size": 6014,
        "modified": 1778767711.419168,
        "hash": "8c610ccf62c3e4003410c15c47043b2f"
    },
    "supabase/fix-profiles-rls-v2.sql": {
        "size": 798,
        "modified": 1778728032.4164243,
        "hash": "4309bca43af04212f8e58ee9bdd66978"
    },
    "supabase/seed-real-jp-orders.sql": {
        "size": 10208,
        "modified": 1778779469.1311696,
        "hash": "376c65cab26e0314f0c6f832e1f7a813"
    },
    "supabase/seed-logistix-data.sql": {
        "size": 3482,
        "modified": 1778727844.1084294,
        "hash": "bb8e62c3227b0b3c6b2b33419d82abe3"
    },
    "supabase/functions/README.md": {
        "size": 1702,
        "modified": 1778327881.438491,
        "hash": "9ca3e4cd3b337d5f6bcd20dabc02b24a"
    },
    "supabase/functions/logistix-sync/index.ts": {
        "size": 4984,
        "modified": 1778777891.9471664,
        "hash": "c836fea2afc26f2f3acbb9dad2ecbaa5"
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
    "supabase/functions/generate-3d/index.ts": {
        "size": 2594,
        "modified": 1779465830.9890368,
        "hash": "c83feb05a7730e74a401431b0f1c2753"
    },
    "supabase/functions/parts/index.ts": {
        "size": 7278,
        "modified": 1779924963.146399,
        "hash": "1e22677f3a1e68aa697e6e4ac8981dbe"
    },
    "supabase/functions/users/index.ts": {
        "size": 6843,
        "modified": 1778327814.514492,
        "hash": "18fd4823093eadba1ed0252b47a9140d"
    },
    "supabase/functions/logistics/index.ts": {
        "size": 30003,
        "modified": 1778865538.1748307,
        "hash": "d2c6ebf81ea82f6cdf8a8912e6b34b64"
    },
    "supabase/functions/logistics/_shared/cors.ts": {
        "size": 561,
        "modified": 1778808103.4426212,
        "hash": "e40f1e91b778321f749153bcb08713c4"
    },
    "supabase/functions/logistix-b2b/index.ts": {
        "size": 8950,
        "modified": 1778731478.0004199,
        "hash": "35e3fd0de12b161d3308ca8b68eb5aee"
    },
    "supabase/functions/stripe-checkout/index.ts": {
        "size": 9375,
        "modified": 1780170759.3011417,
        "hash": "ffb95769ebd820fa7b1cc3f40b9460c2"
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
    "supabase/functions/utils/redis.ts": {
        "size": 1536,
        "modified": 1779924924.5063984,
        "hash": "b6bf4aab3fee35a919671e7525f7a1e2"
    },
    "supabase/functions/transactions/index.ts": {
        "size": 11619,
        "modified": 1778855744.551447,
        "hash": "b852293b938a74b6221abf6556a6abc6"
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
        "size": 10665,
        "modified": 1780170767.4811418,
        "hash": "c07634de1a02e3e70d405a1dabd61597"
    },
    "supabase/functions/admin/index.ts": {
        "size": 40877,
        "modified": 1778882444.0108147,
        "hash": "17452606531a3dfac267ad5ece4158ae"
    },
    "supabase/functions/auctions/index.ts": {
        "size": 21820,
        "modified": 1780170746.6011398,
        "hash": "08e9e68ff6268f70329c2cc50232f15d"
    },
    "supabase/migrations/logistix-schema-complete.sql": {
        "size": 5593,
        "modified": 1778726641.416425,
        "hash": "b24149e16bc3e8d2db1f0082ed8818bc"
    },
    "supabase/migrations/stripe-checkout-fix.sql": {
        "size": 618,
        "modified": 1778855717.0594475,
        "hash": "bf437a27d5ece2f85178a346459a5b75"
    },
    "supabase/migrations/add-messages-transaction-id.sql": {
        "size": 1166,
        "modified": 1778764692.7351732,
        "hash": "06c74895eddc4f8308e63660a42d8514"
    },
    "supabase/migrations/logistics-v2.sql": {
        "size": 12615,
        "modified": 1778807964.0306246,
        "hash": "e985671b5ffaaa0b0fe6ae7d31af3a49"
    },
    "supabase/migrations/logistix-custos.sql": {
        "size": 1905,
        "modified": 1778882172.5188234,
        "hash": "024091dc3da2a0278b84ddaef47647f1"
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
    "supabase/migrations/auctions-payment.sql": {
        "size": 2033,
        "modified": 1780170706.6291409,
        "hash": "238c9707085025576b95945b6fc6c3ef"
    },
    "supabase/migrations/armazem-3d-dimensoes.sql": {
        "size": 4376,
        "modified": 1778865527.098831,
        "hash": "5f560f7a49f0f9184a3a79329044caa4"
    },
    "scripts/createUsers.ts": {
        "size": 1845,
        "modified": 1778249980.7885504,
        "hash": "2b7683a19d07b9396d9f454a93fea0e1"
    },
    "scripts/brain.py": {
        "size": 2601,
        "modified": 1779396521.0989711,
        "hash": "d7c421f55aeeff1e0d32c69c424c7693"
    },
    "scripts/test-api.sh": {
        "size": 11132,
        "modified": 1778879284.6828218,
        "hash": "2ef00ff4f930298a9212107c3c3cba29"
    },
    "scripts/clean_pdf.py": {
        "size": 5099,
        "modified": 1778328853.2944913,
        "hash": "b7c6fb47f0b6a617956505fa59667254"
    },
    "scripts/fetch-car-images.py": {
        "size": 11281,
        "modified": 1778551956.5625997,
        "hash": "ff7933b403e38f894a7bb8408f7906aa"
    },
    "scripts/monitor.py": {
        "size": 4652,
        "modified": 1780505104.144829,
        "hash": "a49c0de489e638600ebcf3e7426a4ffc"
    },
    "scripts/md2pdf_convert.py": {
        "size": 7620,
        "modified": 1778210307.0892053,
        "hash": "296883d7caf9d86b1f798e82538ea03e"
    },
    "public/carbon_frame_bike.glb": {
        "size": 3395040,
        "modified": 1779247219.304569,
        "hash": "6939cbc923d371c27adabed8953c3752"
    },
    "public/sports_car_exploded.obj": {
        "size": 1605,
        "modified": 1779156371.1775715,
        "hash": "0b724b1e2778dd472e934eff44c62f95"
    },
    "public/labels-data.json": {
        "size": 688,
        "modified": 1778807097.790622,
        "hash": "a2c2827ed070688d2f9c81de2f14016b"
    },
    "public/test-qr.html": {
        "size": 3649,
        "modified": 1778806831.2666223,
        "hash": "291a28bd3fd27ab219ed32fc4968a3e7"
    },
    "public/icons.svg": {
        "size": 5031,
        "modified": 1778210480.689214,
        "hash": "3b4fcfcf393eca4d264dca4a4663bc37"
    },
    "public/favicon.svg": {
        "size": 2311,
        "modified": 1779812772.646534,
        "hash": "5b18c835821b3206ccbea6afbb512111"
    },
    "public/lamborghini_aventador.glb": {
        "size": 1928792,
        "modified": 1779247126.412569,
        "hash": "35c9c832ae53b5811c613ecc10980f6b"
    },
    "public/manifest.json": {
        "size": 564,
        "modified": 1778781020.2151692,
        "hash": "253035b6489559ab8246752910130b45"
    },
    "public/car_engine_scan.glb": {
        "size": 30500176,
        "modified": 1779161890.2499304,
        "hash": "c328d301056572cce00d86d510888bb7"
    },
    "public/engineering_car_exploded.obj": {
        "size": 2804,
        "modified": 1779156709.6495717,
        "hash": "cf2beec2dbd261aa7efe3c517ff75782"
    },
    "public/sw.js": {
        "size": 747,
        "modified": 1780407501.756718,
        "hash": "18a93c312d310813263c6eafe978a45f"
    },
    "public/test-labels.html": {
        "size": 14249,
        "modified": 1778807406.0946264,
        "hash": "c89c10a05ea0c3c638700eade53daa40"
    },
    "public/wheel_hydraulics.glb": {
        "size": 7828704,
        "modified": 1779247129.4085689,
        "hash": "6dc69bb15750868ae76e2791191a5c04"
    },
    "public/toy_car.glb": {
        "size": 5422412,
        "modified": 1779247065.1125686,
        "hash": "7bee65587717abc2a905f47890a6e0a8"
    },
    "public/car_model.glb": {
        "size": 433948,
        "modified": 1779247125.520569,
        "hash": "de32f1c72cf9616d9bb3357662cb5742"
    },
    "public/littlest_tokyo.glb": {
        "size": 4133072,
        "modified": 1779247220.2605689,
        "hash": "2a6181dbb4859544e4f29dd5f4e15e34"
    },
    "public/icons/icon.svg": {
        "size": 2342,
        "modified": 1779813104.0505342,
        "hash": "280b0dedc439407d2c658c181c2db252"
    },
    "docker/owaspzap/Dockerfile": {
        "size": 168,
        "modified": 1780441861.5847313,
        "hash": "86091df21fd0c5572a38dc20b97c252a"
    }
}

last_updated = "2026-06-18"

RECENT_COMMITS = [
    {"hash": "9796922", "message": "feat: implement real transactional email sending via Resend API in notifications edge function and invoke from driver cadastro"},
    {"hash": "02557ab", "message": "feat: add email registration field and mock confirmation email with Android APK install link to onboarding"},
    {"hash": "316e8b7", "message": "feat: integrate Capacitor and initialize Android platform for dedicated native APK builds"},
    {"hash": "3d89c13", "message": "feat: implement dedicated WorkerLogin driver credentials authentication page and resolve lint warnings in tests"},
    {"hash": "9150273", "message": "refactor: adjust collection updates to pass biometrics and signature base64 in API payloads for production readiness"},
    {"hash": "419655e", "message": "feat: Driver registration, face biometrics verification and signature pad with admin dashboard monitoring"},
    {"hash": "19b4a40", "message": "feat: implement Shopee-style logistics pipeline (First-Mile check-in, WMS Triagem, TMS Route dispatcher, and Telemetry tower)"},
    {"hash": "6f96e9d", "message": "style: restyle all logistix sub-pages and dashboard to dark void and neon theme"},
    {"hash": "8176c7a", "message": "fix(kpis): resolve exact count destructuring bug & feat: integrate stripe recurring checkout for B2B contracts"},
    {"hash": "9855757", "message": "feat: implement multi-language legal contracts (PT, EN, JA), PDF generator, and automated B2B key activation"},
    {"hash": "703d4c4", "message": "test: add unit tests for WMS/TMS logisticsApi status and pipeline updates"},
    {"hash": "cc0974a", "message": "fix: route logistics tracking internally via SPA tab state to prevent window.open connection resets"},
    {"hash": "d6a5a40", "message": "design: replace MapaPage OSM Leaflet maps with lightweight status text list"},
    {"hash": "e32e197", "message": "fix: change reviewer/reviewee query relations to match reviewed_id column name in production reviews table"},
    {"hash": "5b99fb8", "message": "fix: resolve schema cache relationship issue between reviews and profiles"},
    {"hash": "0ecdb80", "message": "design: redesign ReviewManagement.tsx with premium neo-brutalist styling, tags, and search filters"},
    {"hash": "8d9c818", "message": "fix: import and initialize useI18n in LogistixDashboard to fix reference error"},
    {"hash": "995a6fa", "message": "design: update logo to high resolution clean version without glow"},
    {"hash": "272887a", "message": "test: add unit tests for adminApi.usuarios endpoints"},
    {"hash": "03b959a", "message": "fix: route user role and profiles updates through admin edge function"},
    {"hash": "ed477ba", "message": "feat: add address and phone data sections to rapid moderation popup modal"},
    {"hash": "9f8b310", "message": "feat: implement interactive user row clicks with moderation card, financial summaries and couriers info"},
    {"hash": "c197b65", "message": "fix: resolve ReferenceError by moving userParts declaration after state hooks"},
    {"hash": "88ce062", "message": "feat: add interactive ads list and moderation card to user details sidebar"},
    {"hash": "72bfced", "message": "fix: resolve select().catch is not a function error"},
    {"hash": "7dbf030", "message": "feat: add ads count and modal list to UserManagement admin panel"},
    {"hash": "da44b42", "message": "fix: mapeamento correto da coluna phone e suporte a valores nulos no edge function"},
    {"hash": "2e2efe7", "message": "feat: customizacao no controle de usuarios, exclusao com modal supabase, bloqueio e disparo real de email"},
    {"hash": "662ddfc", "message": "feat: modal de exclusão estilo Supabase + alinhamento automático setor/cargo"},
    {"hash": "79a6fce", "message": "feat: bloqueio/exclusão de usuários + criação em modal no UserManagement"},
    {"hash": "f8c79f3", "message": "feat: logotipo SVG vetorial com engrenagem em formato de G"},
    {"hash": "fa03b68", "message": "feat: exportar relatórios para PDF + ledger cards clicáveis"},
    {"hash": "b66e061", "message": "feat: cadastro de terceiros e integração de contratos no ledger financeiro"},
    {"hash": "8ce00d2", "message": "feat: remove demo mode — SimulateSale do dashboard e fallback local do checkout"},
    {"hash": "106be6b", "message": "feat: ChatPopup oculto em rotas admin + abertura automática só p/ mensagens recebidas"},
    {"hash": "36d4b19", "message": "fix: variable shadowing do i18n t() no map de transactions"},
    {"hash": "ac020af", "message": "feat: régua de pagamentos e ledger financeiro no admin"},
    {"hash": "b5fa3ca", "message": "fix: aliases nas joins do Supabase em TransactionManagement — resolve 400 Bad Request nas transactions"},
    {"hash": "8cb577f", "message": "fix: tratamento O.map is not a function — extrai .rows/.data das respostas da API Logistix"},
    {"hash": "5808a1e", "message": "fix: validação Array.isArray() nas permissões de cargo — fallback [] evita .map() crash com objeto JSON"}
]
