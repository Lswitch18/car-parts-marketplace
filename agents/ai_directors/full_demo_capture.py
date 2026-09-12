"""
DAIG Fast-Paced Demo Video Capture Agent
=================================================================================
Grava o vídeo completo de demonstração focado em alta velocidade.
"""

import os
import time
import subprocess
import argparse
from playwright.sync_api import sync_playwright

BASE_URL = "http://localhost:5173"
OUT_DIR = "public/videos"
os.makedirs(OUT_DIR, exist_ok=True)

def get_init_script(lang='pt-BR', inject_auth=True):
    # i18n.tsx expects 'pt' or 'ja'
    ui_lang = "ja" if "ja" in lang else "pt"

    auth_part = f"""
      const mockUser = {{
        id: "demo-user-123",
        name: "Tanaka Hiroshi",
        full_name: "Tanaka Hiroshi",
        role: "buyer",
        email: "tanaka@daig.jp",
        avatar_url: null,
        currency: "JPY",
        onboarding_completed: true,
        is_verified: true,
        rating: 5.0,
        total_sales: 48
      }};
      window.localStorage.setItem("mock_auth_for_video", "true");
      window.localStorage.setItem("auth-storage", JSON.stringify({{
        state: {{ isAuthenticated: true, user: mockUser }},
        version: 0
      }}));
    """ if inject_auth else ""

    return f"""
    (() => {{
      {auth_part}
      window.localStorage.setItem("daig-language", "{ui_lang}");
      window.__SUPPRESS_LOGS = true;
    }})();
    """

def capture_demo(name: str, flow_fn, viewport_w=1440, viewport_h=900, inject_auth=True, lang='pt-BR'):
    print(f"\n🎬 Capturando: {name} (Idioma: {lang})")
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, args=["--disable-gpu", "--no-sandbox", "--disable-dev-shm-usage", "--disable-web-security"])
        ctx = browser.new_context(record_video_dir=OUT_DIR, viewport={"width": viewport_w, "height": viewport_h})
        ctx.add_init_script(get_init_script(lang, inject_auth))
            
        page = ctx.new_page()
        page.on("console", lambda _: None)
        
        try:
            is_ja = "ja" in lang
            # Only pass is_ja to functions that accept it.
            import inspect
            sig = inspect.signature(flow_fn)
            if "is_ja" in sig.parameters:
                flow_fn(page, is_ja=is_ja)
            else:
                flow_fn(page)
            page.wait_for_timeout(1000)
        except Exception as e:
            print(f"  ⚠️  Erro no fluxo: {e}")
        finally:
            video_tmp = page.video.path() if page.video else None
            ctx.close()
            browser.close()
        
        if video_tmp and os.path.exists(video_tmp):
            final = os.path.join(OUT_DIR, f"{name}.webm")
            if os.path.exists(final): os.remove(final)
            os.rename(video_tmp, final)
            return final
        return None

def _wait_loaded(page):
    try: page.wait_for_selector(".animate-spin", state="hidden", timeout=2000)
    except: pass
    page.wait_for_timeout(300)

def flow_landing_hero(page):
    page.goto(BASE_URL)
    _wait_loaded(page)
    page.wait_for_timeout(1000)
    page.mouse.wheel(0, 700)
    page.wait_for_timeout(1000)
    page.mouse.wheel(0, 1000)
    page.wait_for_timeout(1000)

def flow_register(page, is_ja):
    page.goto(f"{BASE_URL}/register")
    _wait_loaded(page)
    page.wait_for_timeout(800)
    
    name_ph = "お名前" if is_ja else "Seu nome"
    email_ph = "seu@email.com" # usually not translated or it's type='email'
    
    try:
        page.fill(f"input[placeholder='{name_ph}']", "Tanaka Hiroshi", timeout=2000)
    except:
        # Fallback to the first text input
        page.fill("input[type='text']", "Tanaka Hiroshi")

    page.wait_for_timeout(400)
    
    try:
        page.fill("input[type='email']", "tanaka@daig.jp", timeout=2000)
    except:
        page.fill("input[placeholder='seu@email.com']", "tanaka@daig.jp")

    page.wait_for_timeout(400)
    page.fill("input[type='password']", "daig2026")
    page.wait_for_timeout(600)
    page.mouse.wheel(0, 300)
    page.wait_for_timeout(500)
    try:
        buyer_txt = "購入者" if is_ja else "Comprador"
        page.click(f"text={buyer_txt}", timeout=1000)
        page.wait_for_timeout(500)
        btn = page.query_selector("button:has-text('Google')")
        if btn:
            btn.hover()
            page.wait_for_timeout(500)
            btn.click(timeout=1000)
    except: pass
    page.wait_for_timeout(1000)

def flow_catalog(page, is_ja):
    page.goto(f"{BASE_URL}/catalog")
    _wait_loaded(page)
    page.wait_for_timeout(800)
    page.mouse.wheel(0, 400)
    page.wait_for_timeout(800)
    try:
        honda_txt = "ホンダ" if is_ja else "Honda"
        page.click(f"text={honda_txt}", timeout=1000)
        page.wait_for_timeout(800)
    except: pass
    page.mouse.wheel(0, 600)
    page.wait_for_timeout(1000)
    PRODUCT_ID = '5d1df2a3-9d7a-478b-9b22-34183607f061'
    page.goto(f"{BASE_URL}/product/{PRODUCT_ID}")
    _wait_loaded(page)
    page.wait_for_timeout(1000)
    page.mouse.wheel(0, 500)
    page.wait_for_timeout(1500)

def flow_messages(page):
    def route_messages(route):
        if route.request.method == "GET":
            import json
            route.fulfill(status=200, content_type="application/json", body=json.dumps([
                {"id": "1", "sender_id": "other-user", "content": "Olá, a peça está disponível?", "created_at": "2026-01-01T10:00:00Z"}
            ]))
        else: route.continue_()
            
    def route_profiles(route):
        if route.request.method == "GET":
            import json
            route.fulfill(status=200, content_type="application/json", body=json.dumps({"id": "other-user", "full_name": "Kenji Sato", "avatar_url": None}))
        else: route.continue_()

    page.route("**/rest/v1/messages*", route_messages)
    page.route("**/rest/v1/profiles*", route_profiles)
    page.goto(f"{BASE_URL}/messages?user=other-user")
    _wait_loaded(page)
    page.wait_for_timeout(1000)
    try:
        chat_input = page.query_selector("input[type='text']")
        if chat_input:
            chat_input.click()
            chat_input.type("Faço 47,000 JPY agora via Stripe Escrow.", delay=30)
            page.wait_for_timeout(500)
            page.keyboard.press("Enter")
            page.wait_for_timeout(1500)
    except: pass

def flow_checkout(page):
    PRODUCT_ID = '5d1df2a3-9d7a-478b-9b22-34183607f061'
    page.goto(f"{BASE_URL}/checkout/{PRODUCT_ID}")
    _wait_loaded(page)
    page.wait_for_timeout(1000)
    page.mouse.wheel(0, 400)
    page.wait_for_timeout(1000)
    page.evaluate('''() => {
        const btn = document.querySelector("button[type='submit']");
        if (btn && btn.parentElement) {
            const badge = document.createElement("div");
            badge.innerHTML = "🔒 <b>Pagamento Seguro Escrow (Liquidação T+4)</b>";
            badge.style.cssText = "background: rgba(0, 229, 255, 0.15); color: #00E5FF; padding: 12px; border-radius: 8px; border: 1px solid #00E5FF; margin-bottom: 16px; font-size: 14px; text-align: center;";
            btn.parentElement.insertBefore(badge, btn);
        }
    }''')
    page.wait_for_timeout(1500)
    try:
        stripe_btn = page.query_selector("button[type='submit']")
        if stripe_btn:
            stripe_btn.hover()
            page.wait_for_timeout(1000)
            stripe_btn.click()
            page.wait_for_timeout(1500)
    except: pass

def merge_videos(inputs: list, output: str):
    print(f"\n🎞️  Mesclando {len(inputs)} cenas em {output}...")
    
    list_file = "/tmp/daig_concat.txt"
    with open(list_file, "w") as f:
        for i, inp in enumerate(inputs):
            if inp and os.path.exists(inp):
                f.write(f"file '{os.path.abspath(inp)}'\n")
                if i == 0:
                    # Trim 2.5s from the first scene accurately during concat
                    f.write("inpoint 00:00:02.500\n")
                    
    subprocess.run(["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", list_file, "-c:v", "libvpx-vp9", "-crf", "32", "-b:v", "0", "-c:a", "copy", output], capture_output=True)
    return output

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--lang", type=str, default="pt-BR")
    args = parser.parse_args()
    
    scenes = [
        ("demo_fast_0_landing",  flow_landing_hero, False),
        ("demo_fast_1_register", flow_register, False),
        ("demo_fast_2_catalog",  flow_catalog, True),
        ("demo_fast_3_messages", flow_messages, True),
        ("demo_fast_4_checkout", flow_checkout, True),
    ]
    
    captured = []
    for name, fn, inject_auth in scenes:
        path = capture_demo(name, fn, inject_auth=inject_auth, lang=args.lang)
        if path: captured.append(path)
    
    if captured:
        lang_suffix = "pt" if args.lang == "pt-BR" else "ja"
        final_output = os.path.join(OUT_DIR, f"daig-full-demo-v2-{lang_suffix}.webm")
        merge_videos(captured, final_output)
        
        mp4_output = os.path.join(OUT_DIR, f"daig-full-demo-v2-{lang_suffix}.mp4")
        subprocess.run(["ffmpeg", "-y", "-i", final_output, "-c:v", "libx264", "-preset", "fast", "-crf", "22", "-movflags", "+faststart", "-c:a", "copy", mp4_output], capture_output=True)
        print(f"  ✅ Concluído: {mp4_output}")
