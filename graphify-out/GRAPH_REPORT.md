# Graph Report - car-parts-marketplce  (2026-08-14)

## Corpus Check
- 392 files · ~1,115,969 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1695 nodes · 2771 edges · 203 communities (131 shown, 72 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 8 edges (avg confidence: 0.73)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `30d87dc9`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- LogistixDashboard-ZhczRoYg.js
- LogistixDashboard-ZhczRoYg.js
- vendor-react-DqCMjyrC.js
- vendor-three-BAVKA0D-.js
- vendor-react-DqCMjyrC.js
- vendor-three-BAVKA0D-.js
- .setAttribute
- n
- i
- vendor-supabase-CW1GYbG4.js
- t
- axios
- .copy
- r
- t
- .get
- r
- .get
- .push
- .getX
- index-B_no5lKC.js
- Ne
- Ne
- constructor
- PartCard.tsx
- corsHeaders
- Wt
- .getSize
- zt
- Prompt para Apresentação de 1 Minuto (Google Vids / Google AI Flow)
- @supabase/supabase-js
- logisticsApi.ts
- Prompt Ultra-Realista de 1 Minuto (100% em Português - PT-BR)
- ColetasPage.tsx
- GaidLogo.tsx
- WMSPage.tsx
- adminApi.test.ts
- Catalog-Dz-L_iSM.js
- .clone
- l
- l
- .setAttribute
- .toString
- Ye
- index-BjaIWHBv.js
- ln
- .applyMatrix4
- B
- xn
- Catalog-Dz-L_iSM.js
- ColetasPage.tsx
- MarketplaceAiAssistantModal.tsx
- .charAt
- @types/three
- B2BPage.tsx
- @base-ui/react
- LegalNotice.tsx
- PrivacyPolicy.tsx
- App.tsx
- TransactionManagement.tsx
- PedidosPage.tsx
- GlobalSearch.tsx
- LogistixDashboard.tsx
- 📱 Mobile-First Hi-Tech Design & AI Skill
- PedidoDetail.tsx
- PartCard.tsx
- PartCard.tsx
- PedidosPage.tsx
- B2BPage.tsx
- index.ts
- clsx
- main.tsx
- jsbarcode
- GlobalSearch.tsx
- axios
- leaflet
- lucide-react
- TrackingPublico.tsx
- typescript
- typescript-eslint
- api-crud.spec.ts
- integration.spec.ts
- CarList.tsx
- vite-env.d.ts
- dispose
- useAuthStore
- vite
- upload_to_google_drive
- @vitejs/plugin-react
- PedidosPage.tsx
- ChatPopup.tsx
- index.ts
- vite.config.ts
- @capacitor/android
- capacitor.config.ts
- @capacitor/core
- @capacitor/ios
- clsx
- @codetrix-studio/capacitor-google-auth
- dependencies
- download-schema.sh
- @fontsource-variable/geist
- framer-motion
- html5-qrcode
- jsbarcode
- WorkerApp-BWctDf0A.js
- lucide-react
- cn
- index.ts
- @capacitor/ios
- react-leaflet
- react-router-dom
- @react-three/drei
- @base-ui/react
- recharts
- shadcn
- @supabase/supabase-js
- tailwind-merge
- tailwindcss
- @tanstack/react-query
- three
- tw-animate-css
- ws
- zustand
- sw.js
- brain.py
- disaster-recovery-backup.sh
- owasp-pipeline.sh
- update-launcher-icons.sh
- setup-google-oauth.sh
- main.tsx
- GlobalSearch.tsx
- useAnalytics.ts
- PedidosPage.tsx
- EtiquetasPage.tsx
- NotificationCenter.tsx
- @base-ui/react
- GlobalSearch.tsx
- class-variance-authority
- gsap
- @gsap/react
- lenis
- typescript-eslint
- @capacitor/cli
- @testing-library/user-event
- MobileIaVision.tsx
- @types/three
- react
- ProtectedRoute.tsx
- graphify.md
- graphify.md
- main.tsx
- react-router
- @southdevs/capacitor-google-auth
- @testing-library/jest-dom
- @testing-library/react
- vite
- typescript
- NotificationCenter.tsx
- adminApi.test.ts
- autoprefixer
- @types/three
- autoprefixer
- @react-three/fiber
- typescript-eslint

## God Nodes (most connected - your core abstractions)
1. `useI18n()` - 100 edges
2. `useAuthStore` - 82 edges
3. `corsHeaders()` - 48 edges
4. `supabase` - 46 edges
5. `successResponse()` - 46 edges
6. `errorResponse()` - 44 edges
7. `cn()` - 34 edges
8. `requireAuth()` - 23 edges
9. `adminApi` - 21 edges
10. `compilerOptions` - 20 edges

## Surprising Connections (you probably didn't know these)
- `LogistixDashboard()` --indirect_call--> `handler()`  [INFERRED]
  src/modules/logistics/pages/LogistixDashboard.tsx → supabase/functions/stripe-webhook/index.ts
- `SaasHeroSection()` --calls--> `useI18n()`  [EXTRACTED]
  .agents/skills/gsap-scroll-premium-animations/examples/saas-hero-section.tsx → src/modules/shared/lib/i18n.tsx
- `useCreateListing()` --references--> `dompurify`  [EXTRACTED]
  src/modules/parts-catalog/hooks/useCreateListing.ts → package.json
- `LabelCard()` --references--> `qrcode`  [EXTRACTED]
  src/modules/logistics/pages/admin/EtiquetasPage.tsx → package.json
- `QRInstallPage()` --references--> `qrcode`  [EXTRACTED]
  src/modules/transportation/pages/QRInstallPage.tsx → package.json

## Import Cycles
- None detected.

## Communities (203 total, 72 thin omitted)

### Community 0 - "LogistixDashboard-ZhczRoYg.js"
Cohesion: 0.05
Nodes (42): QRStickerPrint(), QRStickerPrintProps, INITIAL_MEMBERS, TeamMember, TenantTeamManager(), Dashboard(), TabType, AuthState (+34 more)

### Community 1 - "LogistixDashboard-ZhczRoYg.js"
Cohesion: 0.13
Nodes (4): TransactionManagement(), loadGsiScript(), signInWithGoogle(), updateTransactionStatus()

### Community 2 - "vendor-react-DqCMjyrC.js"
Cohesion: 0.07
Nodes (69): getAllAnalytics(), getDailyStats(), getFinancialStats(), getPartsByCategory(), getPopularBrands(), getRecentTransactions(), getSalesByDate(), getTopSellers() (+61 more)

### Community 3 - "vendor-three-BAVKA0D-.js"
Cohesion: 0.07
Nodes (21): getCityCoords(), getCurrentPositionSafe(), haversineKm(), JP_CITY_COORDS, sortByDistance(), getCurrentPosition(), mobileApi, BiometricScannerProps (+13 more)

### Community 4 - "vendor-react-DqCMjyrC.js"
Cohesion: 0.14
Nodes (14): scripts, build, build:driver, build:store, cap:init, cap:open, cap:sync, cap:sync:driver (+6 more)

### Community 5 - "vendor-three-BAVKA0D-.js"
Cohesion: 0.04
Nodes (45): AccountsPayable, AdminDashboard, AdminLayout, AgenciaPage, AiOpsPage, Auctions, CarList, Catalog (+37 more)

### Community 6 - ".setAttribute"
Cohesion: 0.10
Nodes (23): AdminLayout(), DeliveriesManagement(), DeliveryTransaction, JapanBankAccount(), PREDEFINED_PERMISSIONS, UserManagement(), ContactsManagement(), SaasGatewayPage() (+15 more)

### Community 7 - "n"
Cohesion: 0.07
Nodes (29): SaasHeroSection(), AiPartQuickUploadModal(), AiPartQuickUploadModalProps, LegalFinanceCenter(), InterchangeMapping, PartInterchangeManager(), PartInterchangeManagerProps, VehicleStrippingYieldModal() (+21 more)

### Community 8 - "i"
Cohesion: 0.10
Nodes (31): Badge(), badgeVariants, Button(), buttonVariants, Card(), CardAction(), CardContent(), CardDescription() (+23 more)

### Community 9 - "vendor-supabase-CW1GYbG4.js"
Cohesion: 0.13
Nodes (35): atribuirMotorista(), auditLog(), calcularPrazo(), criarRota(), criarShipment(), dashboard(), gerarCodigoRastreamento(), gerarEtiquetas() (+27 more)

### Community 10 - "t"
Cohesion: 0.07
Nodes (26): AiOpsPage(), AnalysisLogEntry, HealthStatus, loadLog(), saveLog(), fetchParts(), PartsFilters, PartsParams (+18 more)

### Community 11 - "axios"
Cohesion: 0.06
Nodes (30): DOM, DOM.Iterable, ES2020, node_modules, src, src/**/__tests__/*, vitest/globals, compilerOptions (+22 more)

### Community 12 - ".copy"
Cohesion: 0.13
Nodes (10): JAPAN_BANKS, JapanBankForm(), Subscription(), iconMap, Props, PARTNER_PLANS, PartnerPlan, api (+2 more)

### Community 13 - "r"
Cohesion: 0.11
Nodes (5): DEFAULT_ICON, adminApi, DashboardKPIs, importModule(), mockFetch

### Community 14 - "t"
Cohesion: 0.14
Nodes (27): callLogistixSync(), confirmPayment(), constantTimeCompare(), corsHeaders, errorResponse(), getWebhookSecret(), handleAsyncPaymentFailed(), handleChargeRefunded() (+19 more)

### Community 15 - ".get"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 16 - "r"
Cohesion: 0.25
Nodes (7): AuctionItem, Auctions(), CONDITION_COLORS, RecentBid, COLORS, Particle, ParticleField()

### Community 17 - ".get"
Cohesion: 0.32
Nodes (10): decryptSensitiveData(), deriveEncryptionKey(), encryptSensitiveData(), hashSHA256(), isTrustedOrigin(), maskCreditCard(), maskEmail(), maskPhone() (+2 more)

### Community 18 - ".push"
Cohesion: 0.19
Nodes (14): useTranslation(), CategoryChart(), CategoryChartProps, COLORS, RevenueChart(), RevenueChartProps, TopSellersChart(), TopSellersChartProps (+6 more)

### Community 19 - ".getX"
Cohesion: 0.13
Nodes (13): Any, Bool, Capacitor, AppDelegate, NSUserActivity, UIApplication, UIApplicationDelegate, UIKit (+5 more)

### Community 20 - "index-B_no5lKC.js"
Cohesion: 0.13
Nodes (20): dotenv, dotenv, supabase, download_image(), get_car_placeholder_url(), get_parts_without_images(), main(), Script para buscar imagens da internet e associar aos anúncios sem fotos (+12 more)

### Community 21 - "Ne"
Cohesion: 0.12
Nodes (8): ArmazemData, getOccupancyColor(), getZoneBaseColor(), RackGrid(), rackH, tempC, Zone, ZONE_COLORS

### Community 22 - "Ne"
Cohesion: 0.20
Nodes (11): AdminDashboard(), AlertItem, AlertOrchestrationParams, calculateFinanceStats(), calculateGrowth(), FinanceStats, orchestrateAlerts(), TransactionSummary (+3 more)

### Community 23 - "constructor"
Cohesion: 0.12
Nodes (17): auto-parts-db, eslint, jsdom, devDependencies, auto-parts-db, eslint, jsdom, @testing-library/dom (+9 more)

### Community 24 - "PartCard.tsx"
Cohesion: 0.25
Nodes (7): ALLOWED_KEY_PATTERNS, corsHeaders(), isAllowedKey(), json(), redisCmd(), redisGet(), supabase

### Community 25 - "corsHeaders"
Cohesion: 0.12
Nodes (8): GESTURES, Zone, ZONE_TYPE_CONFIG, Armazem3DPage(), getOccColor(), WarehouseScene, Zone, ZONE_TYPE_LABEL

### Community 26 - "Wt"
Cohesion: 0.10
Nodes (18): queryClient, root, lazyWithRetry(), Auctions, CarList, Catalog, CreateListing, Dashboard (+10 more)

### Community 27 - ".getSize"
Cohesion: 0.15
Nodes (9): logisticsApi, DropoffPage(), MapaPage(), TransportesPage(), ETAPAS, TIPO_LABEL, TrackingPublico(), mockFetch (+1 more)

### Community 28 - "zt"
Cohesion: 0.30
Nodes (13): auditLog(), calcularCustos(), corsHeaders(), createResource(), deleteResource(), getAuthUser(), getResource(), handleDashboard() (+5 more)

### Community 29 - "Prompt para Apresentação de 1 Minuto (Google Vids / Google AI Flow)"
Cohesion: 0.14
Nodes (13): background_color, categories, description, display, icons, name, orientation, scope (+5 more)

### Community 30 - "@supabase/supabase-js"
Cohesion: 0.18
Nodes (9): AuditLogEvent, DEMO_AUDIT_LOGS, SecurityAuditCenter(), TabType, WorkOrder, RealNfeInvoice, RealTransactionSale, RealWorkOrder (+1 more)

### Community 31 - "logisticsApi.ts"
Cohesion: 0.23
Nodes (10): MarketplaceAiAssistantModal(), MarketplaceAiAssistantModalProps, CompatibilityTagInput(), CompatibilityTagInputProps, CompatibilityTagItem, CompatibilityTagType, parseCompatibilityTextToTags(), IdentifiedPartInfo (+2 more)

### Community 32 - "Prompt Ultra-Realista de 1 Minuto (100% em Português - PT-BR)"
Cohesion: 0.19
Nodes (12): calculateFees(), corsHeaders, createAccountLink(), createCheckoutSchema, createCheckoutSession(), createConnectedAccount(), createContractSubscription(), createPortalSession() (+4 more)

### Community 33 - "ColetasPage.tsx"
Cohesion: 0.18
Nodes (16): BytesIO, Path, build_manifest(), create_folder(), get_client_config(), get_credentials(), load_dotenv(), main() (+8 more)

### Community 34 - "GaidLogo.tsx"
Cohesion: 0.18
Nodes (10): 💡 1. Conceito Fundamental: Transferência vs Repasse Bancário, 🔹 1. Primeiro Repasse Bancário (First Payout Holding Period), 🔹 2. Janela Padrão de Liquidação no Japão (Rolling Payout Schedule), ⏱️ 2. Janelas de Retenção & Payout Schedule no Japão (Stripe JPY), ⚡ 3. Posso Disparar o Repasse Imediatamente ao Vendedor?, 🛠️ 4. Implementação Técnica Recomendada (Stripe Edge Function), 📊 5. Checklist de Verificação de Saldos e Solução de Dúvidas, 🔹 Para a Conta Bancária Física do Vendedor (TED/Zengin Bank): (+2 more)

### Community 36 - "WMSPage.tsx"
Cohesion: 0.18
Nodes (11): axios, @base-ui/react, dependencies, axios, @base-ui/react, react, recharts, tailwind-merge (+3 more)

### Community 37 - "adminApi.test.ts"
Cohesion: 0.20
Nodes (9): calculateCpuPercent(), corsHeaders, getCpuInfo(), http, https, lastCpuInfo, os, server (+1 more)

### Community 38 - "Catalog-Dz-L_iSM.js"
Cohesion: 0.07
Nodes (27): 📦 1. Stack de Animação (Dependências), 2.1 — Hook `useGsap` com cleanup correto, 2.2 — Provider de Smooth Scroll (Lenis), 🏗️ 2. Arquitetura de Animação no React, 3.1 — Stagger Reveal de Cards (Scroll-triggered), 3.2 — Counter Animado (Número que sobe), 3.3 — Parallax Hero com Pin Section, 3.4 — Text Reveal por Linha (Split Text Effect) (+19 more)

### Community 39 - ".clone"
Cohesion: 0.24
Nodes (9): BAYS, getWarehouseLocation(), LEVEL_COLORS, LEVELS, POSITIONS, RACKS, WarehouseGrid(), WarehouseGridProps (+1 more)

### Community 40 - "l"
Cohesion: 0.33
Nodes (8): B2BApiKey, corsHeaders(), error(), hashString(), json(), logRequest(), supabaseFetch(), validateApiKey()

### Community 41 - "l"
Cohesion: 0.22
Nodes (8): vite.config.ts, compilerOptions, allowSyntheticDefaultImports, composite, module, moduleResolution, skipLibCheck, include

### Community 42 - ".setAttribute"
Cohesion: 0.09
Nodes (22): ChatPopup(), ChatPopupProps, Conversation, Message, Conversation, Message, Messages(), SafeImage() (+14 more)

### Community 43 - ".toString"
Cohesion: 0.07
Nodes (35): AiVisionBanner(), AiVisionBannerProps, CarPartScannerAnimation(), Props, ListingFormFields(), Props, ListingImageUpload(), Props (+27 more)

### Community 44 - "Ye"
Cohesion: 0.27
Nodes (9): Login(), Register(), getRetryDelay(), handleSupabaseError(), isRateLimitError(), RATE_LIMIT_ERRORS, sanitizeMessage(), SupabaseError (+1 more)

### Community 45 - "index-BjaIWHBv.js"
Cohesion: 0.25
Nodes (3): isServiceRoleJwt, MockWebSocket, supabaseAdmin

### Community 46 - "ln"
Cohesion: 0.07
Nodes (31): Profile(), localStorageMock, store, clearDeviceTrust(), isDeviceTrusted(), setDeviceTrusted(), Terceiro, TerceirosPage() (+23 more)

### Community 47 - ".applyMatrix4"
Cohesion: 0.43
Nodes (4): AccountsPayable(), calculateCloudAndFinancialGrowth(), GrowthInputs, GrowthProjection

### Community 48 - "B"
Cohesion: 0.29
Nodes (3): CarSceneProps, COLOR_MAP, ScanShader

### Community 49 - "xn"
Cohesion: 0.18
Nodes (10): 🏛️ 1. Arquitetura Stripe Connect (Modelos de Cobrança), 💴 2. Regras de Repasse Bancário no Japão (Stripe JPY & Zengin System), ⚡ 3. Código de Referência para Disparo de Transferência (Edge Function Deno / Node), 🔔 4. Tratamento de Webhooks Obrigatórios do Stripe Connect, 🛡️ 5. Resolução de Erros Comuns e Tratamento de Exceções, 📋 6. Regras de Interface e UX (Frontend Shift-Left Validation), 🔹 Janelas de Liquidação (Payout Holding Periods), 🔹 Modos de Movimentação Financeira (+2 more)

### Community 50 - "Catalog-Dz-L_iSM.js"
Cohesion: 0.33
Nodes (4): checkCollectionAuth(), DriverProfileInput, VerificationState, verifyBiometricMatch()

### Community 51 - "ColetasPage.tsx"
Cohesion: 0.29
Nodes (4): corsHeaders, generatePedidoCode(), supabase, syncTransaction()

### Community 53 - ".charAt"
Cohesion: 0.60
Nodes (5): fail(), fnc(), ok(), test-api.sh script, sql()

### Community 54 - "@types/three"
Cohesion: 0.33
Nodes (3): corsHeaders(), json(), supabase

### Community 55 - "B2BPage.tsx"
Cohesion: 0.18
Nodes (5): PLAN_DETAILS, SaasCompanySubscription, SaasControlCenter(), STORE_TYPE_CONFIG, STORE_TYPES

### Community 56 - "@base-ui/react"
Cohesion: 0.40
Nodes (3): TIPOS, LabelPrint(), Props

### Community 57 - "LegalNotice.tsx"
Cohesion: 0.60
Nodes (3): ExampleInstrumentedTest, Test, RunWith

### Community 58 - "PrivacyPolicy.tsx"
Cohesion: 0.50
Nodes (3): BaseModel, analyze_part(), RequestData

### Community 59 - "App.tsx"
Cohesion: 0.40
Nodes (3): __dirname, __filename, supabase

### Community 60 - "TransactionManagement.tsx"
Cohesion: 0.40
Nodes (3): __dirname, __filename, supabase

### Community 61 - "PedidosPage.tsx"
Cohesion: 0.80
Nodes (4): get_file_hash(), main(), scan_directory(), update_brain_file()

### Community 62 - "GlobalSearch.tsx"
Cohesion: 0.40
Nodes (4): create_excel_spreadsheet(), create_word_document(), Cria um documento Word (.docx) profissional formatado., Cria uma planilha Excel (.xlsx) profissional e formatada.

### Community 65 - "📱 Mobile-First Hi-Tech Design & AI Skill"
Cohesion: 0.40
Nodes (3): manufacturerApi, ManufacturerPartData, mockDatabase

### Community 66 - "PedidoDetail.tsx"
Cohesion: 0.20
Nodes (9): engines, node, npm, name, overrides, @babel/core, private, type (+1 more)

### Community 67 - "PartCard.tsx"
Cohesion: 0.18
Nodes (10): 🚫 1. Anti-Patterns (O que NUNCA fazer com ícones), 2.1 — O Conceito de "Icon Wrapper" (Conteinerização Luminosa), 2.2 — Composição Multi-Camada (Layered Icons), 💎 2. Princípios dos Ícones Não-Genéricos (High-Impact System), 🎨 3. Paleta Temática de Cores por Domínio, 🛠️ 4. Ícones Customizados SVG Nativos (Auto Parts & JDM), ⚡ 5. Micro-Interações & Animações nos Ícones, 📋 6. Componentes Utilitários de Ícone Prontos (+2 more)

### Community 68 - "PartCard.tsx"
Cohesion: 0.19
Nodes (9): AgenciaPage, DriverApp(), Login, MobileApp, QRInstallPage, WorkerApp, GlobalLoader(), PWARegister() (+1 more)

### Community 69 - "PedidosPage.tsx"
Cohesion: 0.36
Nodes (6): ExplodedCarScene(), ExplodedCarSceneProps, MODEL_CATALOG, THEME_COLORS, COMPONENT_DETAILS, HomeLanding()

### Community 73 - "main.tsx"
Cohesion: 0.83
Nodes (3): gradlew script, die(), warn()

### Community 74 - "jsbarcode"
Cohesion: 0.50
Nodes (3): ANDROID_HOME, PATH, build-apk.sh script

### Community 75 - "GlobalSearch.tsx"
Cohesion: 0.50
Nodes (3): ANDROID_HOME, PATH, build-store-apk.sh script

### Community 76 - "axios"
Cohesion: 0.83
Nodes (3): check_login(), deploy_function(), deploy-functions.sh script

### Community 77 - "leaflet"
Cohesion: 0.50
Nodes (3): qrcode, qrcode, QRInstallPage()

### Community 78 - "lucide-react"
Cohesion: 0.83
Nodes (3): convert_md_to_pdf(), convert_png_to_pdf(), main()

### Community 79 - "TrackingPublico.tsx"
Cohesion: 0.67
Nodes (3): createUser(), main(), supabase

### Community 80 - "typescript"
Cohesion: 0.18
Nodes (10): 🔒 1. Proteção de Banco de Dados Supabase (RLS & SQLi Prevention), ⚡ 2. Proteção Vercel & Supabase Edge Functions, 🧪 3. Pipeline SAST & Sanitização Anti-XSS (Shift-Left), 🔹 Cabeçalhos de Segurança HTTP (Content Security Policy), 🔹 Prevenção contra SQL Injection (SQLi), 🔹 Rate Limiting & Throttling em TODAS as Rotas Públicas, 🔹 Rotação de Chaves de Segurança (Secret Rotation Pipeline), 🔹 Row Level Security (RLS) Estrito (+2 more)

### Community 82 - "typescript-eslint"
Cohesion: 0.20
Nodes (9): 🎨 1. Frontend & UX/UI Hi-Tech Cyber Neon (Visual & Performance), ⚡ 2. Arquitetura Backend Scalable & Performance Extrema, 💎 3. Pilares de Inovação para Elevação do Valuation, 🔍 4. Protocolo de Code Review & Auditoria Contínua, 🔹 APIs B2B & Segurança Shift-Left, 🔹 Clean Architecture & DDD (Domínio SaaS Multi-Tenant), 🚀 Fullstack Innovation & Product Valuation Skill (DAIG Auto Parts), 🔹 Micro-Interações & Animações 60 FPS (+1 more)

### Community 83 - "api-crud.spec.ts"
Cohesion: 0.83
Nodes (3): adminFetch(), headers(), logisticsFetch()

### Community 84 - "integration.spec.ts"
Cohesion: 0.50
Nodes (3): DB_TABLE_USAGE, FUNCTION_CONSUMERS, SEEDED_DATA

### Community 86 - "vite-env.d.ts"
Cohesion: 0.50
Nodes (3): ImportMeta, ImportMetaEnv, Window

### Community 87 - "dispose"
Cohesion: 0.50
Nodes (3): imports, @supabase/functions-js, @supabase/server

### Community 89 - "vite"
Cohesion: 0.22
Nodes (8): 🔹 1. Co-Titularidade de Propriedade Intelectual (50% Wellynton / 50% DAIG), 🏛️ 1. Quadro de Titularidade & Estrutura Societária, 📜 2. Cláusulas Pétreas do Acordo de Sócios (Shareholders' Agreement), 🔹 2. Tomada de Decisão & Governança (Voting Rights & Veto), 🔹 3. Distribuição de Lucros & Pro-Labore, 🔹 4. Confidencialidade (NDA) & Não-Competição (Non-Compete), 🔹 5. Direitos de Venda & Proteção de Liquidez (Drag-Along & Tag-Along), ⚖️ Corporate Legal Counsel Skill — Governança & Acordo de Sócios (DAIG)

### Community 92 - "@vitejs/plugin-react"
Cohesion: 0.22
Nodes (8): 🏛️ 1. Licenciamento Regulatório do Desmanche no Japão, 💴 2. Sistema Tributário do Japão (JCT & Invoice System), 3. Sistema de Fatura Qualificada (インボイス制度 - Qualified Invoice System), 🏦 4. Pagamentos Bancários no Japão & Repasses Stripe Connect, 🔹 Imposto sobre Consumo do Japão (消費税 - Japanese Consumption Tax 10%), 🇯🇵 Japan Legal & Tax Compliance Skill (DAIG Auto Parts), 🔹 Lei de Reciclagem Automotiva (自動車リサイクル法 - Automobile Recycling Law), 🔹 Licença de Antiguidades & Segunda Mão (古物商許可證 - Kobutsu-sho)

### Community 94 - "PedidosPage.tsx"
Cohesion: 0.25
Nodes (7): 🎯 1. Validação dos 5 Pilares de Produção, 🔑 2. Protocolo de Chaves de API & Produção (Stripe Live), 🔒 3. Auditoria de Segurança & RLS Supabase (Shift-Left), ⏱️ 4. Matriz de Prazos & SLAs de Operação no Japão, 🏁 5. Procedimento de Virada de Chave (Go-Live Execution Steps), 📋 Checklist de Validação por Pilar, 🚀 Go-Live Readiness & Release Agent (Marketplace DAIG Japão)

### Community 98 - "vite.config.ts"
Cohesion: 0.50
Nodes (3): buildConfig, __dirname, __filename

### Community 99 - "@capacitor/android"
Cohesion: 0.15
Nodes (10): authFetch(), ColetasPage(), STATUS_COLOR, STATUS_ENTREGA, DONUT_COLORS, getNavGroups(), LogistixDashboard(), NavGroup (+2 more)

### Community 102 - "@capacitor/ios"
Cohesion: 0.33
Nodes (4): ApiKey, LegalContract, RequestLog, WebhookItem

### Community 103 - "clsx"
Cohesion: 0.25
Nodes (7): 💼 1. Modelo de Monetização & Unit Economics (DAIG Marketplace), ⏱️ 2. Análise dos Prazos Bancários no Japão (Zengin Network & Payout Timelines), 🇯🇵 3. Conformidade Tributária & Regulatória no Japão, 🚀 4. Impacto no Valuation & Conclusão de Fechamento de Fluxo, 📊 Fórmula de Distribuição de Receita em JPY (¥), 🔹 Linha do Tempo Real Comprovada (Ciclo de 5 Dias Úteis / T+4), 📈 Marketplace Business Model & Financial Flow Analyzer (DAIG JDM Parts)

### Community 109 - "html5-qrcode"
Cohesion: 0.40
Nodes (3): STATUS_COLOR, TIPO_COLOR, TIPO_ICON

### Community 120 - "recharts"
Cohesion: 0.33
Nodes (4): emptyForm, PedidoForm, STATUS_COLOR, STATUS_OPTIONS

### Community 123 - "tailwind-merge"
Cohesion: 0.50
Nodes (4): EtiquetasPage(), getWarehouseLocation(), LabelCard(), LEVEL_COLORS

### Community 142 - "main.tsx"
Cohesion: 0.22
Nodes (8): 🎯 1. Princípios Fundamentais do Mobile-First, 🎨 2. Design System: Estética Cyber Neon Hi-Tech, 🤖 3. Padrões de Integração com Recursos de IA & Câmera, 🛠️ 4. Regras Obrigatórias de Código e Internacionalização, 💡 5. Exemplo de Componente Mobile-First Hi-Tech (React + Tailwind), 📱 Mobile-First Hi-Tech Design & AI Skill, Paleta de Cores e Gradientes, Tipografia e Ícones

### Community 174 - "GlobalSearch.tsx"
Cohesion: 0.40
Nodes (3): EVENT_ICONS, STATUS_COLOR, STATUS_LABEL

### Community 182 - "MobileIaVision.tsx"
Cohesion: 0.40
Nodes (4): 1. Isolamento Estrito de Dados Multi-Tenant (Supabase RLS), 2. Eliminação de Dados Simulados (Real-Data First), 3. Padrão Estético 21st.dev Cyber Neon Professional, 🏢 SaaS Multi-Tenant ERP & WMS Architecture Guide

### Community 185 - "ProtectedRoute.tsx"
Cohesion: 0.40
Nodes (5): App(), Props, ProtectedRoute(), Onboarding(), isSaaSUser()

## Knowledge Gaps
- **573 isolated node(s):** `CustomIconProps`, `build-apk.sh script`, `ANDROID_HOME`, `PATH`, `build-store-apk.sh script` (+568 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **72 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `WMSPage.tsx` to `ws`, `zustand`, `GlobalSearch.tsx`, `index-B_no5lKC.js`, `NotificationCenter.tsx`, `class-variance-authority`, `gsap`, `@gsap/react`, `lenis`, `typescript-eslint`, `@testing-library/user-event`, `react`, `main.tsx`, `react-router`, `@southdevs/capacitor-google-auth`, `PedidoDetail.tsx`, `@react-three/fiber`, `leaflet`, `@capacitor/core`, `@codetrix-studio/capacitor-google-auth`, `@fontsource-variable/geist`, `framer-motion`, `jsbarcode`, `WorkerApp-BWctDf0A.js`, `lucide-react`, `@capacitor/ios`, `react-leaflet`, `@react-three/drei`, `@base-ui/react`, `shadcn`, `@supabase/supabase-js`, `tailwindcss`, `@tanstack/react-query`, `three`, `tw-animate-css`?**
  _High betweenness centrality (0.111) - this node is a cross-community bridge._
- **Why does `useI18n()` connect `n` to `LogistixDashboard-ZhczRoYg.js`, `LogistixDashboard-ZhczRoYg.js`, `.setAttribute`, `t`, `.copy`, `r`, `.push`, `Ne`, `.getSize`, `@supabase/supabase-js`, `logisticsApi.ts`, `.clone`, `.setAttribute`, `.toString`, `Ye`, `ln`, `B2BPage.tsx`, `ProtectedRoute.tsx`, `@capacitor/android`, `tailwind-merge`?**
  _High betweenness centrality (0.090) - this node is a cross-community bridge._
- **Why does `useCreateListing()` connect `.toString` to `typescript-eslint`, `.setAttribute`, `n`?**
  _High betweenness centrality (0.068) - this node is a cross-community bridge._
- **What connects `CustomIconProps`, `build-apk.sh script`, `ANDROID_HOME` to the rest of the system?**
  _573 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `LogistixDashboard-ZhczRoYg.js` be split into smaller, more focused modules?**
  _Cohesion score 0.05254237288135593 - nodes in this community are weakly interconnected._
- **Should `LogistixDashboard-ZhczRoYg.js` be split into smaller, more focused modules?**
  _Cohesion score 0.13333333333333333 - nodes in this community are weakly interconnected._
- **Should `vendor-react-DqCMjyrC.js` be split into smaller, more focused modules?**
  _Cohesion score 0.06763717805151176 - nodes in this community are weakly interconnected._