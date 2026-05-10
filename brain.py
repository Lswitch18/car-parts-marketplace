"""
Brain - Central de Conhecimento do Projeto
Mantém um registro das estruturas e dados do projeto
Atualizado automaticamente pelo monitor.py
"""

import os
from datetime import datetime

PROJECT_INFO = {
    "name": "car-parts-marketplce",
    "type": "Marketplace de peças automotivas",
    "tech_stack": ["Python", "HTML", "SQL", "Supabase", "Google OAuth"],
}

FILES = {
    "AWS-COST-STUDY.md": {
        "size": 8615,
        "modified": 1778355239.7881644,
        "hash": "81b2ffae26f2eeb21eca7c42c9e3f90f"
    },
    "Dockerfile.jenkins": {
        "size": 324,
        "modified": 1778343579.364174,
        "hash": "cc1d0e586a677b4d3ba4b90b6a578178"
    },
    "package-lock.json": {
        "size": 122215,
        "modified": 1778353972.9281747,
        "hash": "981b3ceadb01846aa78b452406793168"
    },
    "tsconfig.json": {
        "size": 657,
        "modified": 1778299587.802882,
        "hash": "cee37d11245240fc77acac0975e29a5a"
    },
    "backup-full.sql": {
        "size": 6099,
        "modified": 1778291597.8668823,
        "hash": "c41117ce9a6e0788fb0fe1cf18656bfb"
    },
    "SPEC.md": {
        "size": 15548,
        "modified": 1778257140.6325505,
        "hash": "01dacd4c46dcc25723112511392ed938"
    },
    "create-10-ads.sql": {
        "size": 5439,
        "modified": 1778298212.6508818,
        "hash": "e51bb3d52ada002c343d2705697d97ef"
    },
    "INFRASTRUCTURE.md": {
        "size": 23781,
        "modified": 1778328067.8224897,
        "hash": "0bbcf8d21421ab2ef095bf6e4db839ac"
    },
    "NEXT-STEPS.pdf": {
        "size": 31047,
        "modified": 1778331509.4144938,
        "hash": "d6a0d063e7ae3590b90864074ef961c5"
    },
    "docker-compose.jenkins.yml": {
        "size": 388,
        "modified": 1778344398.1961665,
        "hash": "d912f7ed728aeed7a71ad1bbb21448ab"
    },
    "JENKINS_SETUP.md": {
        "size": 1815,
        "modified": 1778343606.9361737,
        "hash": "e6679996d1bf9863bbb813ebad6f2f5f"
    },
    "vite.config.ts": {
        "size": 179,
        "modified": 1778243528.2685492,
        "hash": "9781fc548154773b168ea218d9bff4ee"
    },
    "brain.py": {
        "size": 17442,
        "modified": 1778403104.7684436,
        "hash": "19dbda11779404615a3d9a3dcc351454"
    },
    "vite.config.js": {
        "size": 196,
        "modified": 1778244229.3365455,
        "hash": "8504b6d963f8dddfea545af4a9dbfa51"
    },
    "GOOGLE-OAUTH-SETUP.md": {
        "size": 2014,
        "modified": 1778212271.7812095,
        "hash": "b956184c08e404001ac36aaa8d0a61f0"
    },
    "tsconfig.node.json": {
        "size": 212,
        "modified": 1778243533.6725483,
        "hash": "1c139bab5d1a90787cbb951073a5abde"
    },
    "clean_pdf.py": {
        "size": 5099,
        "modified": 1778328853.2944913,
        "hash": "b7c6fb47f0b6a617956505fa59667254"
    },
    "package.json": {
        "size": 767,
        "modified": 1778353972.3801749,
        "hash": "5bf5121f366db4bfe1b1732071fc219c"
    },
    "postcss.config.js": {
        "size": 79,
        "modified": 1778244136.1845484,
        "hash": "470cfd3ee10fbff840b377e769485f3e"
    },
    "tsconfig.tsbuildinfo": {
        "size": 1417,
        "modified": 1778396031.6204455,
        "hash": "a0e9bf1e4033ea33783e3b9c594c9b63"
    },
    "PROJECT-STATUS.md": {
        "size": 10335,
        "modified": 1778331362.2944922,
        "hash": "543973cec8db8b4d1a42c55cb62a0c09"
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
        "size": 870,
        "modified": 1778257148.2285507,
        "hash": "9fc5498ccb09349bea004b19681c4b3a"
    },
    "README.md": {
        "size": 3018,
        "modified": 1778257130.1565504,
        "hash": "c2c077def6b978259e0fe577e1d971ad"
    },
    "tailwind.config.js": {
        "size": 679,
        "modified": 1778247873.4485478,
        "hash": "ea6a647c90d74bc0a82dba6fd9e4ec9d"
    },
    "vite.config.d.ts": {
        "size": 76,
        "modified": 1778244229.5445457,
        "hash": "9fcf75521f4c43fd8b75300e0f63b867"
    },
    "BUILD-REPORT-2026-05-10.md": {
        "size": 2567,
        "modified": 1778403104.3324437,
        "hash": "3e698c0ecf55a7dcecf01f600c860767"
    },
    "ENVIRONMENT_SETUP.md": {
        "size": 2265,
        "modified": 1778256253.4725423,
        "hash": "33516d340df1a3617f00751af2121be0"
    },
    "NEXT-STEPS.md": {
        "size": 2331,
        "modified": 1778331468.5544941,
        "hash": "e2747a6a8810f911644506ef1c87b5b2"
    },
    "PRODUCT-LAUNCH-PLAN.pdf": {
        "size": 81439,
        "modified": 1778330247.6624923,
        "hash": "981b2d7436256c10323b39d982a6da54"
    },
    "update-ads-images.sql": {
        "size": 1690,
        "modified": 1778300106.6948752,
        "hash": "a4c4acc46f6e759715fe4486ac9deabe"
    },
    "GITHUB-ACTIONS-SETUP.md": {
        "size": 3774,
        "modified": 1778388754.5604434,
        "hash": "930ab348dc80a099306a3194a127a77f"
    },
    "PRODUCT-LAUNCH-PLAN.md": {
        "size": 22595,
        "modified": 1778330212.158492,
        "hash": "ff97082e4a773a75ffb5a371f0b60f21"
    },
    "Jenkinsfile": {
        "size": 2854,
        "modified": 1778343597.6681738,
        "hash": "d0e2bc054469ce96c79d5ab8aeb67ce3"
    },
    "rls-policies.sql": {
        "size": 6974,
        "modified": 1778331385.0744886,
        "hash": "c3e838c346be584bca2311f0c7c700c6"
    },
    "monitor.py": {
        "size": 3153,
        "modified": 1778388595.3764443,
        "hash": "73892d940ad938c6e02f5d5cd8e7e579"
    },
    "download-schema.sh": {
        "size": 1609,
        "modified": 1778291578.4548821,
        "hash": "3ee0a35697494f2b702005ca8b6329ea"
    },
    "deploy-functions.sh": {
        "size": 2984,
        "modified": 1778337407.9224913,
        "hash": "0e4388cbe054a43af9818c3f5122f88b"
    },
    "md2pdf_convert.py": {
        "size": 7620,
        "modified": 1778210307.0892053,
        "hash": "296883d7caf9d86b1f798e82538ea03e"
    },
    "project-reports/BUILD-REPORT-2026-05-10.pdf": {
        "size": 33576,
        "modified": 1778399583.8124416,
        "hash": "02bdce0f748c29cdd7799ba5d596bf2a"
    },
    "project-reports/BUILD-REPORT-2026-05-10.md": {
        "size": 3167,
        "modified": 1778403095.2604437,
        "hash": "85d54363f2568b9f601fbec78924dafd"
    },
    "src/index.css": {
        "size": 2377,
        "modified": 1778247869.164548,
        "hash": "e12aa434629cbb2a05bfa1d84916e7d9"
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
        "size": 2444,
        "modified": 1778401966.4884453,
        "hash": "e95f39abae38fcd82c0e2413a5811804"
    },
    "src/stores/favoriteStore.ts": {
        "size": 1205,
        "modified": 1778243577.9725485,
        "hash": "a3de439381b1694ffecd1cc7821c4ab9"
    },
    "src/stores/authStore.ts": {
        "size": 3207,
        "modified": 1778401396.0564423,
        "hash": "534c5cbfc4d8d1a38a4637a7efe98f17"
    },
    "src/pages/Home.tsx": {
        "size": 13030,
        "modified": 1778299966.9628832,
        "hash": "b41a1a473e1eb475ea7658185b39d352"
    },
    "src/pages/Register.tsx": {
        "size": 8226,
        "modified": 1778403050.2004466,
        "hash": "de2f6407b4682931dcaf1a1020aa59c1"
    },
    "src/pages/Dashboard.tsx": {
        "size": 17163,
        "modified": 1778340560.3401697,
        "hash": "2e0d59df889e75fd757af40580982840"
    },
    "src/pages/Login.tsx": {
        "size": 7321,
        "modified": 1778397057.9684439,
        "hash": "856cd066346faa9c522171d88b4d1169"
    },
    "src/pages/Favorites.tsx": {
        "size": 4230,
        "modified": 1778299966.8948832,
        "hash": "60ed38e24963c9379470ec64e97cc4c3"
    },
    "src/pages/ProductDetail.tsx": {
        "size": 7388,
        "modified": 1778340474.1481752,
        "hash": "6754e18598384a836761cd14a172bda4"
    },
    "src/pages/Catalog.tsx": {
        "size": 13732,
        "modified": 1778299959.3508835,
        "hash": "eea332b48d74bf0538803e5ebce33c53"
    },
    "src/pages/CreateListing.tsx": {
        "size": 14596,
        "modified": 1778391073.2364438,
        "hash": "101b4982d5d01a8560c1c3d6f4446cc8"
    },
    "src/pages/Messages.tsx": {
        "size": 17857,
        "modified": 1778341423.29617,
        "hash": "22074761455e45a6b31d992c28c79626"
    },
    "src/pages/Profile.tsx": {
        "size": 6232,
        "modified": 1778244922.756551,
        "hash": "7f246d6a15b0627e0fea704977152eb3"
    },
    "src/pages/PaymentCheckout.tsx": {
        "size": 18186,
        "modified": 1778341442.000172,
        "hash": "bb39aa47b1c50c381bb37cc5fa656e73"
    },
    "src/pages/admin/Dashboard.tsx": {
        "size": 10683,
        "modified": 1778395752.6524448,
        "hash": "527d4957aab55f80895bdc83b2829216"
    },
    "src/pages/admin/TransactionManagement.tsx": {
        "size": 13027,
        "modified": 1778299748.8508852,
        "hash": "654945951b110ea91e6cd1036176e65b"
    },
    "src/pages/admin/UserManagement.tsx": {
        "size": 9610,
        "modified": 1778299748.8548853,
        "hash": "d477960b8c3203626c38166e3b4a1190"
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
        "size": 10137,
        "modified": 1778333027.422486,
        "hash": "87c60468311364603499b16714559933"
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
        "size": 2130,
        "modified": 1778299622.2028801,
        "hash": "61ba9ad2ac786c9a9f946a614fdf5216"
    },
    "src/components/GaidLogo.tsx": {
        "size": 2826,
        "modified": 1778394825.5444164,
        "hash": "c844fa790acb6b1dd973f071cf8b6ce0"
    },
    "src/components/SimulateSale.tsx": {
        "size": 6485,
        "modified": 1778341482.1561694,
        "hash": "2f178d0a09d6ab897b90b867521d2a32"
    },
    "src/components/layout/Header.tsx": {
        "size": 12119,
        "modified": 1778399001.1844437,
        "hash": "d41bc5575bfa63fa70c537a35faf58d9"
    },
    "src/components/layout/Footer.tsx": {
        "size": 4671,
        "modified": 1778257116.8365502,
        "hash": "ff35db7c0b6dddaa125d841691571fe7"
    },
    "src/components/layout/Layout.tsx": {
        "size": 505,
        "modified": 1778243602.7925215,
        "hash": "30c575371dfb07e4c6c4139ec09a7b67"
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
        "size": 2360,
        "modified": 1778243569.2885485,
        "hash": "22b70101ed939ed330e38ca0f308c958"
    },
    "src/lib/supabaseErrorHandler.ts": {
        "size": 3089,
        "modified": 1778249513.9325483,
        "hash": "fee891a53a2c2eba069b98b7d2863fee"
    },
    "src/lib/supabase.ts": {
        "size": 4914,
        "modified": 1778402828.404441,
        "hash": "09a8b928e35961e3d7f723524c560458"
    },
    "src/lib/api.ts": {
        "size": 7773,
        "modified": 1778390840.0604486,
        "hash": "91da8ac6116cb569be106cc9c2efe849"
    },
    "src/lib/i18n.tsx": {
        "size": 19409,
        "modified": 1778395810.5884433,
        "hash": "9edf9b941b5a9ddc603e1e084046febd"
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
    "supabase/functions/auctions/index.ts": {
        "size": 10214,
        "modified": 1778327850.9744914,
        "hash": "c60d1c801526d1e246b908956aed53d7"
    },
    "supabase/migrations/analytics_functions.sql": {
        "size": 7939,
        "modified": 1778395710.324444,
        "hash": "90c9efcdbf7653df907258c27cd764f5"
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

last_updated = "2026-05-10"
