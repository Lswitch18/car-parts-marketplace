---
name: design-authority
description: Skill guardiã de identidade DAIG — toda decisão autônoma de design deve mapear para designTokens.ts
---

# Design Authority — DAIG Cyber Neon

Toda IA que toma decisão de design para `/presentation` DEVE passar por este guard.

## Tokens Canônicos (fonte: `src/modules/shared/lib/designTokens.ts`)

- Fundos: `void #020617`, `deep #050505`, `card #0A0A0F` (ver `src/index.css:12`)
- Neon: `blue #0D75FF`, `cyan #00E5FF`, `purple #7000FF` (accent luminoso)
- Glass: `ultra rgba(11,14,23,0.78) blur 24px saturate 180% border rgba(13,117,255,0.14)` (`src/index.css:733`)
- Tipografia: `Sora` display / `Raleway` body
- Motion: Lenis `duration 1.2 easing 1.001-2^-10t` (`PresentationPage.tsx:637`), só `transform/opacity`

## Regras de Rejeição Automática

1. Cor fora de `designTokens.lock.json` → rejeita PR
2. `glass-ultra` ausente em card novo → rejeita
3. GSAP anima `width/height` → rejeita, só `transform/opacity`
4. `gsap.context()` sem `.revert()` → rejeita
5. Sem `prefers-reduced-motion` guard → rejeita
6. Valor Zengin (`T+4`, `10%`, `¥6/¥100`) fora de `InvestorMoatSection.tsx:7` → rejeita via `business-model-sync`

## Checklist de Aprovação

- [ ] `isAllowedColor()` passa
- [ ] `glass-ultra` ou `gradient-border` presente
- [ ] `Lenis` + `ScrollTrigger.refresh()` após stats
- [ ] `KineticCaption` com `backdrop-blur 14px`
- [ ] Mobile `<768px` desativa tilt
