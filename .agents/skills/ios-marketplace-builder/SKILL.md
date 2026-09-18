---
name: ios-marketplace-builder
description: "Agente especialista no desenvolvimento do App iOS Marketplace PURO (sem Logistix) com MadeWithGSAP premium, Google Fonts (Sora+Instrument+Mono) e build efêmero AWS EC2 macOS M2 — 7 telas marketplace-only + i18n pt/ja estrito + Stripe JPY."
---

# 🍎 iOS Marketplace Builder — Puro & Efêmero

> **Escopo travado:** somente Marketplace. NADA de Logistix/WMS/SaaS/Driver. 7 telas: `Login`/`Register` (Google OAuth) + `Catálogo` + `ProductDetail` + `Messages/Propostas` + `ProfileMarketplace` + `Checkout→Stripe` + `Terms/Privacy`. i18n `pt ↔ ja` sem mistura. Paleta `designTokens.ts` intacta + `iosMarketplaceTokens.ts`. Infra **efêmera**: liga só pro build.

Este agente orquestra **React + Vite (store mode) + Capacitor 7.6.8 + MadeWithGSAP + Tailwind glass-ultra** e **AWS EC2 macOS M2 efêmero**.

**Capacitor:** `capacitor.config.ts` `appId com.daig.marketplace` / `appName DAIG Marketplace` (`ios/App/App/capacitor.config.json` deve espelhar).

---

## 🚀 1. Infraestrutura Mac na AWS (Pronta para Executar)

A infraestrutura foi totalmente codificada em Terraform e testada com sucesso na região **Sydney (`ap-southeast-2`)**, permitida pela Organização AWS.

### Infra Efêmera — credenciais NUNCA no repo (gitignored)
- **Chave SSH:** `Ios-key.pem` `chmod 400` (`/.gitignore`).
- **Secrets:** `AWS_ACCESS_KEY_ID/SECRET`, `MAC_PASSWORD`, `STRIPE_*`, `SUPABASE_*` vão em `terraform/mac-ios/terraform.tfvars` (gitignored) + `GitHub Secrets` / `Vercel Env` / `Supabase Vault` — NUNCA em `.env` commitado (veja `.env.example`). O `.env` atual com `AKIA...` foi rotacionado.
- **Módulo Terraform:** `terraform/mac-ios/`
  - `main.tf`: host `mac2-m2.metal` efêmero, SG só `22` restrito a `allowed_ssh_cidr` (`variables.tf:44`), sem VNC.
  - `terraform.tfvars.example` — copie para `terraform.tfvars` antes do build.
  - `ExportOptions.plist.template` — `teamID` via `APPLE_TEAM_ID` env.

### Comando Efêmero (liga só pro build → destroy):
```bash
ALLOWED_SSH_CIDR=$(curl -s ifconfig.me)/32 APPLE_TEAM_ID=XXXX ./scripts/ios-ephemeral-build.sh
# artefato em ./build/DAIG.ipa (ou .xcarchive se sem teamID)
# --no-destroy para debug (host fica ligado e cobra 24h)
```

### Comandos manuais (debug):
- `terraform -chdir=terraform/mac-ios apply -var="allowed_ssh_cidr=SEU.IP/32" -auto-approve`
- `ssh -i Ios-key.pem ec2-user@<IP>`  (IP em `terraform output mac_public_ip`)
- `vnc://<IP>:5900` desativado no efêmero (SG sem 5900) — reative em `main.tf` só se precisar debug visual.

---

## 🎨 2. Escopo Travado — 7 Telas Marketplace Puro (MadeWithGSAP + Google Fonts Premium)

> Sem Logistix/WMS. `StoreApp.tsx` marketplace-only (`IosMarketplaceLayout` + 7 telas). Paleta `designTokens.ts` + `iosMarketplaceTokens.ts` (Sora + Instrument Sans + JetBrains Mono + Noto JP fallback). Lenis `1.2` `touchMultiplier 2`, GSAP só `transform/opacity`.

O app roda `VITE_APP_MODE=store` (`StoreApp.tsx:14`) com 60/120fps ProMotion, Thumb-Zone `128px` e Safe Areas (`viewport-fit=cover`, Dynamic Island) via `IOS_TOKENS.ios`:

### 1. Login & Cadastro (`/login`, `/register`) — GSAP Flip + glass-ultra
- `Login.tsx`/`Register.tsx` com `useGSAP` `y 24→0 opacity 0→1` + `stagger 0.06` nos fields, `glass-ultra` `src/index.css:733`, sem layout jump no teclado iOS (`visualViewport`).
- `Google OAuth` nativo via `authStore.ts:294` `signInGoogle()` + `capacitor.config.ts` `GoogleAuth` + `Info.plist` `CFBundleURLSchemes` + `GoogleService-Info.plist` (gitignored). Botão Google branco com haptics.

### 2. Home + Catálogo (`/`, `/catalog`, `/product/:id`) — ScrollTrigger.batch
- `MobileStoreHome.tsx` premium com `IOS_TOKENS` glows + `glass-ultra`, sem Logistix.
- `Catalog.tsx` grid `ScrollTrigger.batch` `y 24 stagger 0.08`, filtros `marca/modelo/JPY` com Bottom Sheet tátil, `ProductDetail` carrossel `Observer` inércia + snap.

### 3. Mensagens & Propostas (`/messages`) — iMessage + ¥
- Bolhas `stagger 0.06` `Messages.tsx:46`, `proposed_price` + `price_confirmed` `Messages.tsx:236`, CTA `Ir para Pagamento` → `checkout/:id?price=&msg=` validado no backend (`PaymentCheckout.tsx:133` `SHA-256` idempotency). Sem `→ /admin/logistix`.

### 4. Perfil (`/profile`) — `ProfileMarketplace.tsx` (sem WMS/bank/MFA)
- Campos: `nome, email (read-only), telefone, Zipcloud JP (CEP 7 dígitos)`, idioma `pt↔ja` toggle, logout. `fetchPostal` JP + GSAP `stagger 0.08`. Sem `JapanBankForm`/`MFA` (isolados no SaaS).

### 5. Checkout (`/checkout/:id`) — Stripe Hosted → redirect
- `PaymentCheckout.tsx:40` coleta `shipping` + `api.transactions.create` (`idempotency_key` `PaymentCheckout.tsx:133`) → `api.stripe.createCheckout` → `window.location.href = result.url` `PaymentCheckout.tsx:218` (Stripe Hosted escolhe Konbini/Cartão/Apple Pay em `JPY`). `success_url` `capacitor://checkout/success` + `cancel_url`. Acordeão GPU `scaleY`, botão `magnetic` + `canvas-confetti`.

### 6. Políticas (`/terms`, `/privacy`, `/legal`) — i18n pt/ja estrito
- `TermsOfService.tsx`/`PrivacyPolicy.tsx`/`LegalNotice.tsx` sem Logistix, 100% `t()` (nenhum hard-coded), `isAllowedColor()` ok.

---

## 📱 3. Navegação iOS Dock Premium (`IosMarketplaceLayout.tsx`)

Dock flutuante `glass-ultra` `IOS_TOKENS.dock` `bottom 16 + safe-area`, `backdrop-blur 24px`, hide on scroll-down, haptics `light`:
1. 🏠 **Home** (`/`)
2. 🔍 **Catálogo** (`/catalog` + `/product/:id`)
3. 💬 **Mensagens** (`/messages` iMessage + ¥ badge)
4. 👤 **Perfil** (`/profile` + idioma + logout)
— central `Anunciar` removido no marketplace iOS (sem criação de anúncio; apenas compra). `MobileLayout.tsx` legado removido do StoreApp.

---

## 🛠️ 4. Fluxo Efêmero (local → mac → .ipa → destroy)

1. **Dev local (marketplace-only):**
   ```bash
   VITE_APP_MODE=store npm run dev   # iPhone 15/16 Pro viewport-fit=cover, ProMotion
   ```
2. **Build efêmero (liga só pro build):**
   ```bash
   ALLOWED_SSH_CIDR=$(curl -s ifconfig.me)/32 APPLE_TEAM_ID=TEAMID ./scripts/ios-ephemeral-build.sh
   # ou: VITE_APP_MODE=store npm run build && npx cap sync ios && ./scripts/ios-ephemeral-build.sh --no-destroy
   ```
3. **No mac (se debug manual):**
   ```bash
   cd ~/daig/ios/App && pod install && xcodebuild -workspace App.xcworkspace -scheme App -configuration Release -archivePath ~/DAIG.xcarchive archive
   xcodebuild -exportArchive -archivePath ~/DAIG.xcarchive -exportPath ~/daig/build -exportOptionsPlist ~/daig/ExportOptions.plist
   ```
