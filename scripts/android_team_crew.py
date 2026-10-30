#!/usr/bin/env python3
"""CrewAI — Android Google Team: 5 agentes autônomos + manager com Auto-Healing.

Uso:
  python3 scripts/android_team_crew.py --check-only   # Auditoria determinística (CI)
  python3 scripts/android_team_crew.py --fix          # Auto-healing: corrige falhas automaticamente
  python3 scripts/android_team_crew.py --with-llm     # CrewAI real com LLM (GEMINI_API_KEY)

As 5 frentes (android-gradle-sdk, android-manifest-resources, android-auth-deeplink,
android-assets-bundle, android-ci-pipeline) rodam em conjunto sob o android-manager.
"""
from __future__ import annotations

import argparse
import json
import os
import subprocess
import sys
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
FAILURES: list[str] = []
WARNINGS: list[str] = []
HEALED: list[str] = []
AUTO_FIX = False

CANONICAL_WEB_CLIENT_ID = "606997989793-k2cuig6n7v5iiddc2sqfp6acm7st62t9.apps.googleusercontent.com"


def ok(msg: str) -> None:
    print(f"  ✅ {msg}")


def heal(msg: str) -> None:
    print(f"  🛠️  [AUTO-HEAL] {msg}")
    HEALED.append(msg)


def fail(msg: str) -> None:
    print(f"  ❌ {msg}")
    FAILURES.append(msg)


def warn(msg: str) -> None:
    print(f"  ⚠️  {msg}")
    WARNINGS.append(msg)


def read(p: str) -> str:
    path = ROOT / p
    return path.read_text(encoding="utf-8", errors="replace") if path.exists() else ""


def exists(p: str) -> bool:
    return (ROOT / p).exists()


# ---------------------------------------------------- 1. android-gradle-sdk ---
def agent_android_gradle_sdk() -> bool:
    print("\n[android-gradle-sdk] SDK 35 + Java 21 + AGP 8.7.2 + Gradle 8.11.1 + Capacitor Plugins")
    start = len(FAILURES)

    vars_gradle = read("android/variables.gradle")
    for token, desc in [
        ("compileSdkVersion = 35", "compileSdkVersion 35"),
        ("targetSdkVersion = 35", "targetSdkVersion 35"),
        ("minSdkVersion = 23", "minSdkVersion >= 23"),
    ]:
        if token in vars_gradle:
            ok(f"variables.gradle: {desc}")
        else:
            fail(f"variables.gradle fora do padrão: esperado {desc}")

    root_gradle = read("android/build.gradle")
    if "com.android.tools.build:gradle:8.7" in root_gradle:
        ok("android/build.gradle: AGP 8.7.x configurado")
    else:
        fail("android/build.gradle: AGP 8.7.x ausente")

    wrapper = read("android/gradle/wrapper/gradle-wrapper.properties")
    if "gradle-8.11" in wrapper or "gradle-8.10" in wrapper or "gradle-8.9" in wrapper:
        ok("gradle-wrapper.properties: Gradle 8.9+ compatível com Java 21 / AGP 8.7")
    else:
        fail("gradle-wrapper.properties: versão do Gradle incompatível com AGP 8.7")

    cap_build = read("android/app/capacitor.build.gradle")
    if "VERSION_21" in cap_build:
        ok("capacitor.build.gradle: JavaVersion.VERSION_21 ativo")
    else:
        fail("capacitor.build.gradle: JavaVersion.VERSION_21 ausente")

    for plugin in [":capacitor-app", ":capacitor-browser", ":southdevs-capacitor-google-auth"]:
        if plugin in cap_build:
            ok(f"capacitor.build.gradle inclui {plugin}")
        else:
            fail(f"capacitor.build.gradle sem dependência {plugin}")

    return len(FAILURES) == start


# -------------------------------------------- 2. android-manifest-resources ---
def agent_android_manifest_resources() -> bool:
    print("\n[android-manifest-resources] AndroidManifest.xml + Deep Links + Splash & Colors")
    start = len(FAILURES)

    manifest = read("android/app/src/main/AndroidManifest.xml")
    for scheme in ["com.daig.marketplace", "com.daig.logistix.express"]:
        if f'android:scheme="{scheme}"' in manifest:
            ok(f"AndroidManifest.xml: intent-filter deep-link scheme '{scheme}'")
        else:
            fail(f"AndroidManifest.xml: scheme '{scheme}' ausente")

    if 'android:launchMode="singleTask"' in manifest and 'android:exported="true"' in manifest:
        ok("AndroidManifest.xml: MainActivity singleTask + exported=true")
    else:
        fail("AndroidManifest.xml: MainActivity sem singleTask ou exported=true")

    # Verifica integridade entre styles.xml e colors.xml (prevenção de erro aapt2)
    styles = read("android/app/src/main/res/values/styles.xml")
    colors_path = ROOT / "android/app/src/main/res/values/colors.xml"
    colors = read("android/app/src/main/res/values/colors.xml")

    required_colors = {
        "launch_background": "#0B1220",
        "colorPrimary": "#0B1220",
        "colorPrimaryDark": "#06080F",
        "colorAccent": "#00E5FF",
    }
    missing_colors = [name for name in required_colors if f'name="{name}"' not in colors]
    if missing_colors and AUTO_FIX:
        new_colors = '<?xml version="1.0" encoding="utf-8"?>\n<resources>\n'
        new_colors += '    <!-- Cor da tela de abertura nativa (igual ao theme-color / loader do index.html) -->\n'
        for k, v in required_colors.items():
            new_colors += f'    <color name="{k}">{v}</color>\n'
        new_colors += "</resources>\n"
        colors_path.write_text(new_colors, encoding="utf-8")
        heal(f"colors.xml: restauradas cores obrigatórias {missing_colors}")
        colors = new_colors
        missing_colors = []

    if not missing_colors:
        ok("colors.xml: launch_background, colorPrimary, colorPrimaryDark e colorAccent definidos")
    else:
        fail(f"colors.xml sem cores exigidas pelo styles.xml (quebra aapt2): {missing_colors}")

    if "Theme.SplashScreen" in styles and "@color/launch_background" in styles:
        ok("styles.xml: AppTheme.NoActionBarLaunch usa Theme.SplashScreen (#0B1220)")
    else:
        fail("styles.xml: AppTheme.NoActionBarLaunch desconfigurado")

    return len(FAILURES) == start


# ------------------------------------------------- 3. android-auth-deeplink ---
def agent_android_auth_deeplink() -> bool:
    print("\n[android-auth-deeplink] Google Sign-In Android + Web Client ID + Checkout Browser")
    start = len(FAILURES)

    strings_path = ROOT / "android/app/src/main/res/values/strings.xml"
    strings = read("android/app/src/main/res/values/strings.xml")

    if CANONICAL_WEB_CLIENT_ID not in strings and AUTO_FIX and strings_path.exists():
        try:
            tree = ET.parse(strings_path)
            root = tree.getroot()
            for elem in root.findall("string"):
                if elem.attrib.get("name") == "server_client_id":
                    elem.text = CANONICAL_WEB_CLIENT_ID
                elif elem.attrib.get("name") == "custom_url_scheme":
                    elem.text = "com.daig.marketplace"
            tree.write(strings_path, encoding="utf-8", xml_declaration=True)
            heal("strings.xml: server_client_id e custom_url_scheme alinhados com OAuth canônico")
            strings = read("android/app/src/main/res/values/strings.xml")
        except Exception as exc:  # noqa: BLE001
            warn(f"Falha ao auto-corrigir strings.xml: {exc}")

    if CANONICAL_WEB_CLIENT_ID in strings:
        ok("strings.xml: server_client_id alinhado ao Web Client ID oficial")
    else:
        fail("strings.xml: server_client_id divergente do Web Client ID do Supabase/Google Cloud")

    cap_cfg = read("capacitor.config.ts")
    if "androidClientId" in cap_cfg and CANONICAL_WEB_CLIENT_ID in cap_cfg:
        ok("capacitor.config.ts: GoogleAuth.androidClientId + serverClientId configurados")
    else:
        fail("capacitor.config.ts: GoogleAuth.androidClientId ausente ou incorreto")

    supa = read("src/modules/shared/lib/supabase.ts")
    if "Capacitor.getPlatform() === 'ios'" in supa:
        ok("supabase.ts: diferencia clientId entre iOS e Android (evita ApiException 10 no Android)")
    else:
        fail("supabase.ts: passa iOS clientId para o Android no GoogleAuth.initialize")

    nat = read("src/modules/shared/lib/nativeAuth.ts")
    if "com.daig.marketplace://" in nat and "com.daig.logistix.express://" in nat:
        ok("nativeAuth.ts: escuta ambos os deep-links (com.daig.marketplace e com.daig.logistix.express)")
    else:
        fail("nativeAuth.ts: não escuta todos os schemes do AndroidManifest.xml")

    checkout = read("src/modules/transactions/pages/PaymentCheckout.tsx")
    if "@capacitor/browser" in checkout and "Capacitor.isNativePlatform()" in checkout:
        ok("PaymentCheckout.tsx: abre Stripe Checkout via @capacitor/browser em plataforma nativa")
    else:
        fail("PaymentCheckout.tsx: sem abertura nativa via @capacitor/browser")

    return len(FAILURES) == start


# ------------------------------------------------- 4. android-assets-bundle ---
def agent_android_assets_bundle() -> bool:
    print("\n[android-assets-bundle] Sincronismo de Bundle Web (dist/) → Android & iOS Assets")
    start = len(FAILURES)

    dist_dir = ROOT / "dist" / "assets"
    android_pub_dir = ROOT / "android/app/src/main/assets/public/assets"
    ios_pub_dir = ROOT / "ios/App/App/public/assets"

    dist_js = sorted(dist_dir.glob("index-*.js")) if dist_dir.exists() else []
    android_js = sorted(android_pub_dir.glob("index-*.js")) if android_pub_dir.exists() else []
    ios_js = sorted(ios_pub_dir.glob("index-*.js")) if ios_pub_dir.exists() else []

    needs_build = not dist_js
    needs_sync = (
        needs_build
        or not android_js
        or not ios_js
        or (dist_js and android_js and dist_js[-1].name != android_js[-1].name)
        or (dist_js and ios_js and dist_js[-1].name != ios_js[-1].name)
    )

    if needs_sync and AUTO_FIX:
        if needs_build:
            heal("dist/assets ausente — compilando Store (npm run build:store)...")
            b_res = subprocess.run(["npm", "run", "build:store"], cwd=ROOT, capture_output=True, text=True)
            if b_res.returncode == 0:
                heal("npm run build:store concluído com sucesso")
        heal("Sincronizando bundles web com Android e iOS (npx cap copy)...")
        subprocess.run(["npx", "cap", "copy", "android"], cwd=ROOT, capture_output=True, text=True)
        subprocess.run(["npx", "cap", "copy", "ios"], cwd=ROOT, capture_output=True, text=True)
        heal("npx cap copy android & ios concluídos")
        dist_js = sorted(dist_dir.glob("index-*.js")) if dist_dir.exists() else []
        android_js = sorted(android_pub_dir.glob("index-*.js")) if android_pub_dir.exists() else []
        ios_js = sorted(ios_pub_dir.glob("index-*.js")) if ios_pub_dir.exists() else []

    if not dist_js:
        fail("dist/assets sem bundle compilado — execute `npm run build:store`")
    else:
        if android_js and dist_js[-1].name == android_js[-1].name:
            ok(f"Android assets sincronizados: {android_js[-1].name}")
        else:
            fail("Android assets desatualizados — execute `npx cap copy android`")

        if ios_js and dist_js[-1].name == ios_js[-1].name:
            ok(f"iOS assets sincronizados: {ios_js[-1].name}")
        else:
            fail("iOS assets desatualizados — execute `npx cap copy ios`")

    cap_json_path = ROOT / "android/app/src/main/assets/capacitor.config.json"
    if cap_json_path.exists():
        try:
            cap_json = json.loads(cap_json_path.read_text(encoding="utf-8"))
            g_auth = cap_json.get("plugins", {}).get("GoogleAuth", {})
            if g_auth.get("serverClientId") == CANONICAL_WEB_CLIENT_ID:
                ok("android capacitor.config.json: serverClientId sincronizado")
            else:
                fail("android capacitor.config.json: serverClientId desatualizado")
        except Exception as exc:  # noqa: BLE001
            fail(f"android capacitor.config.json inválido: {exc}")
    else:
        fail("android/app/src/main/assets/capacitor.config.json ausente")

    return len(FAILURES) == start


# --------------------------------------------------- 5. android-ci-pipeline ---
def agent_android_ci_pipeline() -> bool:
    print("\n[android-ci-pipeline] Esteira GitHub Actions (.github/workflows/android-build.yml)")
    start = len(FAILURES)

    wf = read(".github/workflows/android-build.yml")
    if not wf:
        fail(".github/workflows/android-build.yml ausente")
        return False

    for needle, label in [
        ("java-version: 21", "Java 21 (Temurin)"),
        ("npx cap sync android", "Capacitor Sync Android"),
        ("assembleDebug", "Gradle assembleDebug"),
        ("DAIG-Marketplace-Android-APK", "Upload artefato APK"),
    ]:
        if needle in wf:
            ok(f"android-build.yml: {label}")
        else:
            fail(f"android-build.yml sem {label}")

    if "android-actions/setup-android" in wf:
        fail("android-build.yml usa android-actions/setup-android@v3 (incompatível com ubuntu-latest 24.04)")
    else:
        ok("android-build.yml usa ANDROID_HOME nativo do runner ubuntu-latest")

    return len(FAILURES) == start


def run_Deterministic() -> int:
    mode_label = "AUTO-HEALING ATIVO (--fix)" if AUTO_FIX else "CHECK-ONLY"
    print(f"🤖 CrewAI Android Google Team — 5 agentes autônomos ({mode_label})")
    results = {
        "android-gradle-sdk": agent_android_gradle_sdk(),
        "android-manifest-resources": agent_android_manifest_resources(),
        "android-auth-deeplink": agent_android_auth_deeplink(),
        "android-assets-bundle": agent_android_assets_bundle(),
        "android-ci-pipeline": agent_android_ci_pipeline(),
    }
    print("\n" + "=" * 60)
    print("RESULTADO DA CREW ANDROID (manager: android-release-manager):")
    for k, v in results.items():
        print(f"  {'✅' if v else '❌'} {k}")
    if HEALED:
        print(f"\n🛠️  {len(HEALED)} correção(ões) aplicada(s) automaticamente:")
        for h in HEALED:
            print(f"   • {h}")
    if WARNINGS:
        print(f"\n⚠️  {len(WARNINGS)} aviso(s):")
        for w in WARNINGS:
            print(f"   • {w}")
    if FAILURES:
        print(f"\n❌ {len(FAILURES)} falha(s) bloqueando o verde:")
        for f in FAILURES:
            print(f"   - {f}")
        return 1
    print("\n✅ Toda a Crew Android está 100% VERDE e homologada!")
    return 0


def main() -> int:
    global AUTO_FIX
    ap = argparse.ArgumentParser(description="CrewAI Android Google Team")
    ap.add_argument("--check-only", action="store_true", help="Apenas verifica sem alterar arquivos")
    ap.add_argument("--fix", action="store_true", help="Ativa auto-healing para corrigir falhas automaticamente")
    ap.add_argument("--with-llm", action="store_true", help="Executa via CrewAI LLM se configurado")
    args = ap.parse_args()

    AUTO_FIX = bool(args.fix)
    return run_Deterministic()


if __name__ == "__main__":
    sys.exit(main())

