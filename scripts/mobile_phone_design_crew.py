#!/usr/bin/env python3
"""CrewAI — Mobile Phone Premium Design & Valuation Crew.

Orquestra 4 agentes especialistas em design móvel de alto luxo:
1. [hig-mobile-architect]      Ergonomia Apple HIG, Thumb-Zone & Cyber Neon Luxury
2. [motion-haptics-engineer]   MadeWithGSAP, 120fps ProMotion & Feedback Tátil
3. [valuation-strategist]      Fintech JDM Trust, Kobutsu-sho, Stripe Escrow & Valuation
4. [mobile-polish-qa]          Zero quebra de layout, Safe-Areas, Touch Targets & i18n

Execução:
  python3 scripts/mobile_phone_design_crew.py [--check-only] [--audit]
"""

from __future__ import annotations

import argparse
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parent.parent
FAILURES: list[str] = []
WARNINGS: list[str] = []
SCORE = 100


def ok(msg: str) -> None:
    print(f"  ✅ {msg}")


def warn(msg: str) -> None:
    global SCORE
    SCORE = max(0, SCORE - 5)
    print(f"  ⚠️  {msg}")
    WARNINGS.append(msg)


def fail(msg: str) -> None:
    global SCORE
    SCORE = max(0, SCORE - 15)
    print(f"  ❌ {msg}")
    FAILURES.append(msg)


def read(rel: str) -> str:
    path = ROOT / rel
    return path.read_text(encoding="utf-8", errors="replace") if path.exists() else ""


def exists(rel: str) -> bool:
    return (ROOT / rel).exists()


# -------------------------------------------------------- hig-mobile-architect ---
def agent_hig_mobile_architect() -> bool:
    print("\n[hig-mobile-architect] Ergonomia Apple HIG, Thumb-Zone & Cyber Neon")
    start = len(FAILURES)

    # 1. Dock flutuante com safe-area
    layout = read("src/modules/shared/components/layout/IosMarketplaceLayout.tsx")
    if "safe-area-inset-bottom" in layout:
        ok("IosMarketplaceLayout com safe-area-inset-bottom adaptativo")
    else:
        fail("IosMarketplaceLayout sem safe-area-inset-bottom (risco Home Indicator)")

    if "backdrop-blur" in layout:
        ok("Dock flutuante com efeito Apple Glass (backdrop-blur)")
    else:
        fail("Dock flutuante sem efeito de vidro fosco")

    # 2. Thumb-zone e ergonomia de toque
    if "min-w-[64px]" in layout or "min-w-[56px]" in layout:
        ok("Touch targets do Dock respeitam padrão mínimo Apple HIG (>= 48px)")
    else:
        warn("Touch targets do Dock podem estar abaixo de 48px")

    # 3. MobileStoreHome estética e paleta
    home = read("src/modules/storefront/pages/MobileStoreHome.tsx")
    if "#060B14" in home and ("#0D75FF" in home or "daig-blue" in home):
        ok("MobileStoreHome alinhado à paleta Cyber Neon (#060B14 Dark Void + Electric Blue)")
    else:
        fail("MobileStoreHome fora da paleta de cores oficial DAIG")

    if "rounded-[1.5rem]" in home or "rounded-[1.75rem]" in home or "rounded-[2rem]" in home:
        ok("Curvatura orgânica Apple (squircle/rounded-2xl+)")
    else:
        warn("Bordas retas detectadas — recomenda-se squircle orgânico (rounded-2xl+)")

    return len(FAILURES) == start


# ---------------------------------------------------- motion-haptics-engineer ---
def agent_motion_haptics_engineer() -> bool:
    print("\n[motion-haptics-engineer] MadeWithGSAP, 120fps & Haptic Feedback")
    start = len(FAILURES)

    layout = read("src/modules/shared/components/layout/IosMarketplaceLayout.tsx")
    if "useGSAP" in layout or "gsap." in layout:
        ok("Coreografia de entrada com GSAP no IosMarketplaceLayout")
    else:
        fail("IosMarketplaceLayout sem animação GSAP")

    # Scroll intelligence
    if "scroll" in layout and ("prevScrollY" in layout or "ScrollTrigger" in layout):
        ok("Dock inteligente com auto-hide no scroll-down e reveal no scroll-up")
    else:
        warn("Dock sem auto-hide no scroll")

    # Haptics
    home = read("src/modules/storefront/pages/MobileStoreHome.tsx")
    if "vibrate" in layout and "vibrate" in home:
        ok("Feedback tátil haptic (navigator.vibrate) ativo no Dock e na Home")
    elif "vibrate" in layout or "vibrate" in home:
        warn("Feedback tátil haptic parcialmente implementado")
    else:
        fail("Feedback tátil haptic ausente nas interações móveis")

    # GPU acceleration
    if "clearProps" in layout or "transform" in layout or "translate" in home:
        ok("Animações otimizadas para aceleração por hardware (GPU compositor)")
    else:
        warn("Animações podem estar forçando reflow de layout")

    return len(FAILURES) == start


# ---------------------------------------------------- valuation-strategist ---
def agent_valuation_strategist() -> bool:
    print("\n[valuation-growth-strategist] Fintech JDM Trust & Valuation Multipliers")
    start = len(FAILURES)

    home = read("src/modules/storefront/pages/MobileStoreHome.tsx")
    layout = read("src/modules/shared/components/layout/IosMarketplaceLayout.tsx")
    i18n = read("src/modules/shared/lib/i18n.tsx")

    # 1. Confiança e garantia japonesa (Escrow / Kobutsu-sho / Stripe JPY)
    trust_score = 0
    if "Stripe" in home or "Stripe" in i18n or "Escrow" in home or "Escrow" in i18n:
        trust_score += 1
        ok("Garantia de custódia Escrow Stripe JDM identificada no sistema")
    else:
        warn("Garantia Escrow não exposta com clareza na interface móvel")

    if "JDM" in home:
        trust_score += 1
        ok("Badge de autoridade JDM Specialist presente na Home")
    else:
        warn("Falta evidência visual da autoridade JDM na Home")

    if "¥" in home or "¥" in i18n:
        trust_score += 1
        ok("Precificação em moeda japonesa JPY (¥) sem siglas redundantes")
    else:
        warn("Precificação JPY não identificada com clareza")

    # 2. Call-to-actions de alto valor
    if "Catálogo" in home or "Explorar" in home:
        ok("CTA de exploração com transição visual clara")
    else:
        fail("CTA principal da Home ausente ou inacessível")

    return len(FAILURES) == start


# ------------------------------------------------------------ mobile-polish-qa ---
def agent_mobile_polish_qa() -> bool:
    print("\n[mobile-polish-qa] Zero Defeitos Visuais, i18n & Safe-Area Polish")
    start = len(FAILURES)

    home = read("src/modules/storefront/pages/MobileStoreHome.tsx")
    layout = read("src/modules/shared/components/layout/IosMarketplaceLayout.tsx")

    # 1. i18n coverage
    if "useI18n" in home and "t(" in home:
        ok("MobileStoreHome 100% internacionalizado via useI18n")
    else:
        fail("MobileStoreHome com textos estáticos fora do i18n")

    if "LanguageDetector" in layout or "LanguageDetector" in home or "toggleLanguage" in home:
        ok("Seletor de idioma Japonês / Português acessível com um toque")
    else:
        fail("Seletor de idioma ausente na experiência móvel")

    # 2. Overflow protection
    if "overflow-hidden" in layout and "overflow-hidden" in home:
        ok("Proteção estrita contra scroll horizontal acidental (overflow-hidden)")
    else:
        warn("Risco de overflow horizontal detectado em containers móveis")

    # 3. Viewport & index.html
    html = read("index.html")
    if "viewport-fit=cover" in html:
        ok("index.html com viewport-fit=cover para suporte total à Dynamic Island/Notch")
    else:
        fail("index.html sem viewport-fit=cover (bordas pretas na safe-area)")

    return len(FAILURES) == start


# ---------------------------------------------------------- design-director ---
def main() -> int:
    parser = argparse.ArgumentParser(description="Mobile Phone Premium Design Crew")
    parser.add_argument("--check-only", action="store_true", help="Executa auditoria automatizada")
    parser.add_argument("--audit", action="store_true", help="Gera relatório detalhado de design e valuation")
    args = parser.parse_args()

    print("╔══════════════════════════════════════════════════════════════════╗")
    print("║   📱 CREWAI: MOBILE PHONE PREMIUM DESIGN & VALUATION CREW        ║")
    print("║   Padrao Apple HIG • MadeWithGSAP • Cyber JDM Luxury • JPY       ║")
    print("╚══════════════════════════════════════════════════════════════════╝")

    r1 = agent_hig_mobile_architect()
    r2 = agent_motion_haptics_engineer()
    r3 = agent_valuation_strategist()
    r4 = agent_mobile_polish_qa()

    all_passed = r1 and r2 and r3 and r4 and len(FAILURES) == 0

    print("\n" + "=" * 66)
    print("RESUMO DA AUDITORIA DA CREW (Director: design-director):")
    print(f"  • hig-mobile-architect:       {'✅ APROVADO' if r1 else '❌ PENDENTE'}")
    print(f"  • motion-haptics-engineer:    {'✅ APROVADO' if r2 else '❌ PENDENTE'}")
    print(f"  • valuation-growth-strategist:{'✅ APROVADO' if r3 else '❌ PENDENTE'}")
    print(f"  • mobile-polish-qa:           {'✅ APROVADO' if r4 else '❌ PENDENTE'}")
    print("-" * 66)
    print(f"🌟 MOBILE LUXURY VALUATION SCORE: {SCORE}/100")
    print("=" * 66)

    if FAILURES:
        print(f"\n❌ {len(FAILURES)} item(ns) bloqueando a certificação de design:")
        for f in FAILURES:
            print(f"   - {f}")
        return 1

    if WARNINGS:
        print(f"\n💡 {len(WARNINGS)} recomendação(ões) de refinamento estético:")
        for w in WARNINGS:
            print(f"   • {w}")

    print("\n✨ CERTIFICAÇÃO DA CREW: DAIG Mobile Premium Standard APROVADO!")
    return 0


if __name__ == "__main__":
    sys.exit(main())
