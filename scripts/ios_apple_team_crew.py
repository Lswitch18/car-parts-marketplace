#!/usr/bin/env python3
"""CrewAI — iOS Apple Team: 4 agentes autônomos + manager em todas as etapas.

Uso:
  python3 scripts/ios_apple_team_crew.py --check-only   # CI / sem LLM (default seguro)
  python3 scripts/ios_apple_team_crew.py --with-llm      # tenta CrewAI real (GEMINI_API_KEY)

As 4 frentes (ios-dev, i18n-qa, security, banco) rodam SEMPRE juntas;
o ci-monitor junta os resultados e só declara VERDE se todas passarem.
Sem crewai instalado ou sem GEMINI_API_KEY, roda em modo check-only
(verificações determinísticas do repo) — nunca quebra o CI por falta de LLM.
"""
import argparse
import os
import re
import sys
import plistlib
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
FAILURES: list[str] = []
WARNINGS: list[str] = []


def ok(msg: str) -> None:
    print(f"  ✅ {msg}")


def fail(msg: str) -> None:
    print(f"  ❌ {msg}")
    FAILURES.append(msg)


def warn(msg: str) -> None:
    print(f"  ⚠️  {msg}")
    WARNINGS.append(msg)


def read(p: str) -> str:
    return (ROOT / p).read_text(encoding="utf-8", errors="replace")


def exists(p: str) -> bool:
    return (ROOT / p).exists()


# ---------------------------------------------------------------- ios-dev ---
def agent_ios_dev() -> bool:
    print("\n[ios-dev] Login Google: Chrome + iPhone (nativo + fallback deep-link)")
    start = len(FAILURES)
    cap = read("capacitor.config.ts") if exists("capacitor.config.ts") else ""
    for needle, label in [
        ("serverClientId", "GoogleAuth.serverClientId"),
        ("iosClientId", "GoogleAuth.iosClientId"),
        ("forceCodeForRefreshToken", "forceCodeForRefreshToken"),
    ]:
        if needle in cap:
            ok(f"capacitor.config.ts: {label}")
        else:
            fail(f"capacitor.config.ts sem {label}")

    supa = read("src/modules/shared/lib/supabase.ts") if exists("src/modules/shared/lib/supabase.ts") else ""
    if "com.daig.marketplace://login-callback" in supa:
        ok("supabase.ts fallback OAuth usa deep-link com.daig.marketplace://login-callback")
    else:
        fail("supabase.ts fallback ainda usa window.location.origin (quebra no iPhone)")

    if exists("src/modules/shared/lib/nativeAuth.ts"):
        nat = read("src/modules/shared/lib/nativeAuth.ts")
        if "appUrlOpen" in nat and "Browser" in nat:
            ok("nativeAuth.ts com appUrlOpen listener + Browser.close")
        else:
            fail("nativeAuth.ts sem appUrlOpen/Browser handling")
    else:
        fail("src/modules/shared/lib/nativeAuth.ts ausente")

    if exists("ios/App/App/Info.plist"):
        try:
            with open(ROOT / "ios/App/App/Info.plist", "rb") as f:
                info = plistlib.load(f)
            schemes = str(info.get("CFBundleURLTypes", ""))
            if "com.daig.marketplace" in schemes and "com.googleusercontent.apps" in schemes:
                ok("Info.plist CFBundleURLSchemes (app + Google REVERSED_CLIENT_ID)")
            else:
                fail("Info.plist CFBundleURLSchemes incompleto")
        except Exception as e:  # noqa: BLE001
            fail(f"Info.plist ilegível: {e}")
    else:
        fail("ios/App/App/Info.plist ausente")

    pod = read("ios/App/Podfile") if exists("ios/App/Podfile") else ""
    if "SouthdevsCapacitorGoogleAuth" in pod:
        ok("Podfile com SouthdevsCapacitorGoogleAuth")
    else:
        fail("Podfile sem SouthdevsCapacitorGoogleAuth")
    return len(FAILURES) == start


# ---------------------------------------------------------------- i18n-qa ---
REQUIRED_KEYS = ["Entrar", "Continuar com Google", "Política de Privacidade", "Catálogo JDM"]


def agent_i18n_qa() -> bool:
    print("\n[i18n-qa] JA padrão + PT-BR opcional (web + bundle nativo)")
    start = len(FAILURES)
    i18n = read("src/modules/shared/lib/i18n.tsx") if exists("src/modules/shared/lib/i18n.tsx") else ""
    if "return 'ja'" in i18n:
        ok("i18n.tsx default 'ja'")
    else:
        fail("i18n.tsx sem default 'ja'")
    for k in REQUIRED_KEYS:
        # chave aparece como 'Chave': 'tradução' no dict ja
        if f"'{k}'" in i18n:
            ok(f"dict cobre '{k}'")
        else:
            fail(f"dict sem chave '{k}'")

    priv = read("src/modules/storefront/pages/PrivacyPolicy.tsx") if exists("src/modules/storefront/pages/PrivacyPolicy.tsx") else ""
    if "useI18n" in priv or "useTranslation" in priv:
        ok("PrivacyPolicy.tsx usa t() (sem hard-coded PT)")
    else:
        fail("PrivacyPolicy.tsx ainda hard-coded PT (sem t())")

    for lang in ("ja", "pt"):
        base = f"ios/App/App/{lang}.lproj"
        if exists(f"{base}/Localizable.strings") and exists(f"{base}/InfoPlist.strings"):
            ok(f"{base}/ Localizable.strings + InfoPlist.strings")
        else:
            fail(f"{base}/ sem Localizable.strings/InfoPlist.strings")

    # dist/ fresco? compara hash do bundle JS embarcado
    dist_js = sorted((ROOT / "dist" / "assets").glob("index-*.js")) if (ROOT / "dist" / "assets").exists() else []
    pub_js = sorted((ROOT / "ios/App/App/public/assets").glob("index-*.js")) if (ROOT / "ios/App/App/public/assets").exists() else []
    if not dist_js:
        warn("dist/assets sem bundle — rode `npm run build:store` antes do archive")
    elif not pub_js:
        fail("ios/App/App/public/assets sem bundle — rode `npx cap sync ios`")
    elif dist_js[-1].name != pub_js[-1].name:
        fail(f"bundle stale: dist={dist_js[-1].name} != public={pub_js[-1].name} (cap sync pendente)")
    else:
        ok(f"bundle fresco: {dist_js[-1].name}")
    return len(FAILURES) == start


# -------------------------------------------------------------- security ---
def agent_security() -> bool:
    print("\n[security] Secrets + OAuth + ATS (SAST gate)")
    start = len(FAILURES)
    # secrets nunca commitados (checa índice git, não o disco)
    import subprocess

    try:
        tracked = subprocess.run(
            ["git", "ls-files"], capture_output=True, text=True, cwd=ROOT, timeout=15
        ).stdout.splitlines()
    except Exception:  # noqa: BLE001
        tracked = []
    bad = [t for t in tracked if re.match(r"^\.env$", t) or t == "ios/App/App/GoogleService-Info.plist" or t == "ios/ExportOptions.generated.plist"]
    if bad:
        fail(f"secrets trackeados no git: {bad}")
    else:
        ok("nenhum secret trackeado (.env / GoogleService-Info.plist / ExportOptions.generated.plist)")
    if exists("ios/App/App/GoogleService-Info.plist.example"):
        ok("GoogleService-Info.plist.example versionado (template, sem secret)")
    else:
        warn("GoogleService-Info.plist.example ausente")

    if exists("ios/App/App/Info.plist"):
        try:
            with open(ROOT / "ios/App/App/Info.plist", "rb") as f:
                info = plistlib.load(f)
            ats = info.get("NSAppTransportSecurity", {})
            if ats.get("NSAllowsArbitraryLoads") is False:
                ok("ATS NSAllowsArbitraryLoads=false (https-only)")
            else:
                fail("ATS permite arbitrary loads (inseguro)")
        except Exception as e:  # noqa: BLE001
            fail(f"Info.plist ilegível: {e}")
    return len(FAILURES) == start


# ----------------------------------------------------------------- banco ---
def agent_banco() -> bool:
    print("\n[banco] Supabase redirects + Stripe JPY (banco em conjunto com ios-dev)")
    start = len(FAILURES)
    supa = read("src/modules/shared/lib/supabase.ts") if exists("src/modules/shared/lib/supabase.ts") else ""
    if "com.daig.marketplace://login-callback" in supa:
        ok("redirect deep-link presente (Apple + Google fallback unificados)")
    else:
        fail("redirect deep-link ausente — cadastrar em Supabase URL Configuration")
    if exists("supabase/functions/stripe-checkout"):
        ok("supabase/functions/stripe-checkout existe")
    else:
        warn("supabase/functions/stripe-checkout ausente (checkout JPY fora do escopo iOS mínimo)")
    return len(FAILURES) == start


# -------------------------------------------------------------- web-auth ---
def agent_web_auth() -> bool:
    print("\n[web-auth] Chrome: One Tap + callback canônico (nunca endereço-base)")
    start = len(FAILURES)
    supa = read("src/modules/shared/lib/supabase.ts") if exists("src/modules/shared/lib/supabase.ts") else ""
    if "redirectTo: window.location.origin" in supa or "redirectTo:window.location.origin" in supa:
        fail("supabase.ts ainda usa endereço-base cru (window.location.origin) no redirectTo")
    else:
        ok("supabase.ts sem endereço-base cru no redirectTo")
    if "gsi-hidden-button-container" in supa or "btn.click()" in supa:
        fail("supabase.ts ainda tem botão oculto + clique sintético (popup bloqueado no Chrome)")
    else:
        ok("supabase.ts sem botão oculto/clique sintético")
    if exists("src/modules/shared/lib/webAuth.ts"):
        web = read("src/modules/shared/lib/webAuth.ts")
        if "VITE_SITE_URL" in web and "getWebAuthCallbackUrl" in web:
            ok("webAuth.ts com callback canônico VITE_SITE_URL")
        else:
            fail("webAuth.ts sem callback canônico")
    else:
        fail("src/modules/shared/lib/webAuth.ts ausente")
    if exists("src/modules/identity/pages/AuthCallback.tsx"):
        ok("AuthCallback.tsx existe")
    else:
        fail("AuthCallback.tsx ausente")
    for app, path in [("App", "src/App.tsx"), ("StoreApp", "src/StoreApp.tsx"), ("DriverApp", "src/DriverApp.tsx")]:
        content = read(path) if exists(path) else ""
        if "auth/callback" in content and "AuthCallback" in content:
            ok(f"{app}: rota auth/callback registrada")
        else:
            fail(f"{app}: rota auth/callback ausente")
    drv = read("src/DriverApp.tsx") if exists("src/DriverApp.tsx") else ""
    if "/auth/callback" in drv and "location.pathname !== '/auth/callback'" in drv:
        ok("DriverApp: callback isento do redirect forçado p/ /login")
    else:
        fail("DriverApp: callback pode ser empurrado p/ /login (loop senha)")
    return len(FAILURES) == start


# ------------------------------------------------------------ ci-monitor ---
def agent_ci_monitor() -> bool:
    print("\n[ci-monitor] Esteira verde (dono dos artefatos)")
    start = len(FAILURES)
    wf = read(".github/workflows/ios-build.yml") if exists(".github/workflows/ios-build.yml") else ""
    for needle, label in [
        ("APPLE_TEAM_ID", "Apple Team wiring (signed release via secrets)"),
        ("upload-artifact@v4", "upload-artifact v4"),
        ("DAIG-Marketplace-iOS-IPA", "artefato .ipa"),
        ("DAIG-Marketplace-Simulator", "artefato Simulator/Appetize"),
    ]:
        if needle in wf:
            ok(f"ios-build.yml: {label}")
        else:
            fail(f"ios-build.yml sem {label}")
    if exists(".github/workflows/ios-crew.yml"):
        ok("ios-crew.yml (4 frentes em paralelo + join do manager)")
    else:
        fail(".github/workflows/ios-crew.yml ausente")
    if exists("ios/ExportOptions.plist.template") and exists("scripts/ios-apple-team.sh"):
        ok("Apple Team template + script presentes")
    else:
        fail("Apple Team template/script ausentes")
    return len(FAILURES) == start


def run_check_only() -> int:
    print("🚀 CrewAI iOS Apple Team — 4 frentes ativas em conjunto (modo check-only, sem LLM)")
    results = {
        "ios-dev": agent_ios_dev(),
        "web-auth": agent_web_auth(),
        "i18n-qa": agent_i18n_qa(),
        "security": agent_security(),
        "banco": agent_banco(),
        "ci-monitor": agent_ci_monitor(),
    }
    print("\n" + "=" * 52)
    print("RESULTADO DA CREW (manager ci-monitor):")
    for k, v in results.items():
        print(f"  {'✅' if v else '❌'} {k}")
    if WARNINGS:
        print(f"\n⚠️  {len(WARNINGS)} aviso(s) — ver acima (não bloqueiam, mas merecem follow-up).")
    if FAILURES:
        print(f"\n❌ {len(FAILURES)} falha(s) bloqueando o verde:")
        for f in FAILURES:
            print(f"   - {f}")
        return 1
    print("\n✅ Toda a crew VERDE — pronta pra archive + artefatos.")
    return 0


def run_with_llm() -> int:
    try:
        from crewai import Agent, Task, Crew, Process  # type: ignore
    except ImportError:
        print("⚠️  crewai não instalado — caindo para check-only determinístico.")
        return run_check_only()
    if not os.environ.get("GEMINI_API_KEY"):
        print("⚠️  GEMINI_API_KEY ausente — caindo para check-only determinístico.")
        return run_check_only()
    print("🚀 CrewAI real com LLM (hierarchical, manager ci-monitor)…")
    monitor = Agent(role="CI Monitor (manager)", goal="Esteira iOS verde com 3 artefatos.", backstory="Dono do verde.", verbose=True, allow_delegation=True)
    workers = [
        Agent(role="iOS Dev", goal="Login Chrome+iPhone.", backstory="Capacitor+Xcode.", verbose=True),
        Agent(role="i18n QA", goal="JA default + PT opcional.", backstory="i18n + bundle nativo.", verbose=True),
        Agent(role="Security", goal="Secrets/OAuth/ATS.", backstory="SecOps.", verbose=True),
        Agent(role="Banco", goal="Redirects + Stripe JPY.", backstory="DBA Supabase.", verbose=True),
    ]
    tasks = [Task(description=f"Execute e valide a frente {a.role} no repo e reporte achados.", expected_output="Checklist verde/vermelho com paths:line.", agent=a) for a in workers]
    tasks.append(Task(description="Junte os 4 relatórios e declare VERDE só se todos passarem.", expected_output="Veredito final + lista de artefatos.", agent=monitor))
    result = Crew(agents=workers + [monitor], tasks=tasks, process=Process.hierarchical, manager_agent=monitor, verbose=True).kickoff()
    print(result)
    return run_check_only()


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--check-only", action="store_true")
    ap.add_argument("--with-llm", action="store_true")
    args = ap.parse_args()
    if args.with_llm:
        return run_with_llm()
    return run_check_only()


if __name__ == "__main__":
    sys.exit(main())
