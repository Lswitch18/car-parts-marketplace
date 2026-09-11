"""
DAIG Full Demo Video Capture Agent (v2 - Extended with Register & Voiceover Cues)
=================================================================================
Grava o vídeo completo de demonstração da plataforma DAIG.
"""

import os
import time
import subprocess
from playwright.sync_api import sync_playwright

BASE_URL = "http://localhost:5173"
OUT_DIR = "public/videos"
os.makedirs(OUT_DIR, exist_ok=True)

AUTH_INIT = """
(() => {
  const mockUser = {
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
  };
  window.localStorage.setItem("mock_auth_for_video", "true");
  window.localStorage.setItem("auth-storage", JSON.stringify({
    state: { isAuthenticated: true, user: mockUser },
    version: 0
  }));
  window.__SUPPRESS_LOGS = true;
})();
"""

def capture_demo(name: str, flow_fn, viewport_w=1440, viewport_h=900, inject_auth=True):
    print(f"\n🎬 Capturando: {name}")
    
    with sync_playwright() as p:
        browser = p.chromium.launch(
            headless=True,
            args=[
                "--disable-gpu",
                "--no-sandbox",
                "--disable-dev-shm-usage",
                "--disable-web-security",
            ]
        )
        ctx = browser.new_context(
            record_video_dir=OUT_DIR,
            viewport={"width": viewport_w, "height": viewport_h},
            device_scale_factor=1,
        )
        
        if inject_auth:
            ctx.add_init_script(AUTH_INIT)
            
        page = ctx.new_page()
        page.on("console", lambda _: None)
        page.on("pageerror", lambda _: None)
        
        try:
            flow_fn(page)
            page.wait_for_timeout(1500)
        except Exception as e:
            print(f"  ⚠️  Erro no fluxo: {e}")
        finally:
            video_tmp = page.video.path() if page.video else None
            ctx.close()
            browser.close()
        
        if video_tmp and os.path.exists(video_tmp):
            final = os.path.join(OUT_DIR, f"{name}.webm")
            if os.path.exists(final):
                os.remove(final)
            os.rename(video_tmp, final)
            size = os.path.getsize(final) / 1024
            print(f"  ✅ Salvo: {final} ({size:.0f}KB)")
            return final
        else:
            print(f"  ❌ Arquivo de vídeo não encontrado")
            return None


def _wait_loaded(page, timeout=20000):
    try:
        page.wait_for_selector(".animate-spin", state="hidden", timeout=timeout)
    except:
        pass
    page.wait_for_timeout(500)

# ─── FLUXOS DE DEMO ──────────────────────────────────────────────────────────

def flow_landing_hero(page):
    """Cena 0: Landing Page Hero 360"""
    page.goto(BASE_URL)
    _wait_loaded(page)
    
    page.wait_for_timeout(2000)

def flow_register(page):
    """Cena 0: Cadastro do Usuário."""
    page.goto(f"{BASE_URL}/register")
    _wait_loaded(page)
    page.wait_for_timeout(1500)
    
    # Preencher formulário
    page.fill("input[placeholder='Seu nome']", "Tanaka Hiroshi")
    page.wait_for_timeout(500)
    page.fill("input[placeholder='seu@email.com']", "tanaka@daig.jp")
    page.wait_for_timeout(500)
    page.fill("input[type='password']", "daig2026")
    page.wait_for_timeout(500)
    
    page.mouse.wheel(0, 300)
    page.wait_for_timeout(1500)
    
    try:
        # Tenta selecionar "Comprador"
        page.click("text=Comprador")
        page.wait_for_timeout(1000)
    except: pass
    
    # Hover e click no botão de cadastro
    try:
        btn = page.query_selector("button:has-text('Criar Conta')")
        if btn:
            btn.hover()
            page.wait_for_timeout(1000)
            btn.click()
    except: pass
    
    page.wait_for_timeout(2000)


def flow_home(page):
    """Cena 1: Tela inicial."""
    page.goto(BASE_URL)
    _wait_loaded(page)
    page.wait_for_timeout(2000)
    page.mouse.wheel(0, 200)
    page.wait_for_timeout(2500)
    page.mouse.wheel(0, -200)
    page.wait_for_timeout(1500)


def flow_catalog(page):
    """Cena 2: Catálogo."""
    page.goto(f"{BASE_URL}/catalog")
    _wait_loaded(page)
    page.wait_for_timeout(2000)
    page.mouse.wheel(0, 400)
    page.wait_for_timeout(1500)
    try:
        page.click("text=Honda", timeout=3000)
        page.wait_for_timeout(1500)
        page.click("text=Honda", timeout=3000)
        page.wait_for_timeout(1000)
    except: pass
    page.mouse.wheel(0, 300)
    page.wait_for_timeout(2000)
    page.mouse.wheel(0, -300)
    page.wait_for_timeout(1000)


def flow_product_detail(page):
    """Cena 3: Detalhe."""
    # Usando o ID real gravado no cache
    PRODUCT_ID = '5d1df2a3-9d7a-478b-9b22-34183607f061'
    page.goto(f"{BASE_URL}/product/{PRODUCT_ID}")
    _wait_loaded(page)
    page.wait_for_timeout(2500)
    page.mouse.wheel(0, 500)
    page.wait_for_timeout(2000)
    page.mouse.wheel(0, 600)
    page.wait_for_timeout(2000)
    page.mouse.wheel(0, -400)
    page.wait_for_timeout(1500)


def flow_create_listing(page):
    """Cena 4: Upload IA."""
    page.goto(f"{BASE_URL}/create-listing")
    _wait_loaded(page)
    page.wait_for_timeout(2500)
    page.mouse.wheel(0, 300)
    page.wait_for_timeout(1500)
    try:
        upload_area = page.query_selector("input[type='file']")
        if upload_area:
            bbox = upload_area.bounding_box()
            if bbox:
                cx = bbox["x"] + bbox["width"] / 2
                cy = bbox["y"] + bbox["height"] / 2
                page.mouse.move(cx, cy)
                page.wait_for_timeout(1500)
    except: pass
    page.mouse.wheel(0, 400)
    page.wait_for_timeout(1500)
    try:
        title_input = page.query_selector("input[name='title'], input[placeholder*='título'], input[placeholder*='title']")
        if title_input:
            title_input.click()
            title_input.type("GReddy T88-34D Turbocharger SR20DET", delay=50)
            page.wait_for_timeout(1500)
    except: pass
    page.mouse.wheel(0, 500)
    page.wait_for_timeout(2000)
    page.mouse.wheel(0, -800)
    page.wait_for_timeout(1000)


def flow_messages(page):
    """Cena 6: Chat (Digitação interativa com histórico)."""
    
    # Mocking network requests for messages and profiles
    import json
    
    def route_messages(route):
        if route.request.method == "GET":
            mock_data = [
                {
                    "id": "m1", "sender_id": "other-user", "receiver_id": "demo-user-123",
                    "content": "Ainda tem a turbina disponível?", "message_type": "text", "created_at": "2026-09-10T10:00:00.000Z",
                    "part_id": "5d1df2a3-9d7a-478b-9b22-34183607f061",
                    "parts": { "id": "5d1df2a3-9d7a-478b-9b22-34183607f061", "title": "GReddy T88-34D Turbocharger SR20DET", "price": 48000, "images": ["https://example.com/mock.jpg"] }
                },
                {
                    "id": "m2", "sender_id": "demo-user-123", "receiver_id": "other-user",
                    "content": "Sim, pronta entrega. Envio amanhã pela Yamato.", "message_type": "text", "created_at": "2026-09-10T10:05:00.000Z",
                    "part_id": "5d1df2a3-9d7a-478b-9b22-34183607f061",
                    "parts": { "id": "5d1df2a3-9d7a-478b-9b22-34183607f061", "title": "GReddy T88-34D Turbocharger SR20DET", "price": 48000, "images": ["https://example.com/mock.jpg"] }
                },
                {
                    "id": "m3", "sender_id": "other-user", "receiver_id": "demo-user-123",
                    "content": "Aceita 45,000 JPY nela?", "message_type": "text", "created_at": "2026-09-10T10:10:00.000Z",
                    "part_id": "5d1df2a3-9d7a-478b-9b22-34183607f061",
                    "parts": { "id": "5d1df2a3-9d7a-478b-9b22-34183607f061", "title": "GReddy T88-34D Turbocharger SR20DET", "price": 48000, "images": ["https://example.com/mock.jpg"] }
                }
            ]
            route.fulfill(status=200, content_type="application/json", body=json.dumps(mock_data))
        else:
            route.continue_()
            
    def route_profiles(route):
        if route.request.method == "GET":
            mock_profile = {"id": "other-user", "full_name": "Kenji Sato", "avatar_url": None}
            route.fulfill(status=200, content_type="application/json", body=json.dumps(mock_profile))
        else:
            route.continue_()

    page.route("**/rest/v1/messages*", route_messages)
    page.route("**/rest/v1/profiles*", route_profiles)

    page.goto(f"{BASE_URL}/messages")
    _wait_loaded(page)
    page.wait_for_timeout(2500)
    
    # Interage e escreve uma mensagem de negociação no chat
    try:
        # Clica num contato no sidebar (fallback pra área seletora)
        page.mouse.click(150, 250)
        page.wait_for_timeout(1500)
        
        # Foca no input do chat
        chat_input = page.query_selector("input[placeholder*='mensagem'], input[placeholder*='message'], textarea")
        if chat_input:
            chat_input.click()
            page.wait_for_timeout(500)
            # Digita como se fosse uma negociação japonesa
            chat_input.type("Se fechar pelo sistema agora, consigo fazer 47,000 JPY com frete incluso.", delay=40)
            page.wait_for_timeout(1000)
            
            # Envia
            page.keyboard.press("Enter")
            page.wait_for_timeout(2000)
    except Exception as e:
        print(f"Chat interaction skip: {e}")
        pass
    
    page.mouse.wheel(0, 300)
    page.wait_for_timeout(2000)


def flow_checkout(page):
    """Cena 6: Stripe Checkout (Destaque T+4)."""
    PRODUCT_ID = '5d1df2a3-9d7a-478b-9b22-34183607f061'
    page.goto(f"{BASE_URL}/checkout/{PRODUCT_ID}")
    _wait_loaded(page)
    page.wait_for_timeout(2500)
    
    page.mouse.wheel(0, 400)
    page.wait_for_timeout(2000)
    
    # Injeta um badge de "Escrow T+4" dinamicamente sobre o botão Pagar
    page.evaluate('''() => {
        const btn = document.querySelector("button[type='submit']");
        if (btn && btn.parentElement) {
            const badge = document.createElement("div");
            badge.innerHTML = "🔒 <b>Transação Segura Escrow:</b> Repasse JCT após entrega (Liquidação T+4)";
            badge.style.cssText = "background: rgba(0, 229, 255, 0.15); color: #00E5FF; padding: 12px 16px; border-radius: 8px; border: 1px solid #00E5FF; margin-bottom: 16px; font-size: 14px; text-align: center; animation: pulse 2s infinite;";
            
            const keyframes = document.createElement('style');
            keyframes.innerHTML = "@keyframes pulse { 0% { opacity: 0.8; } 50% { opacity: 1; box-shadow: 0 0 15px rgba(0,229,255,0.4); } 100% { opacity: 0.8; } }";
            document.head.appendChild(keyframes);
            
            btn.parentElement.insertBefore(badge, btn);
        }
    }''')
    
    page.wait_for_timeout(2000)
    
    try:
        stripe_btn = page.query_selector("button[type='submit']")
        if stripe_btn:
            stripe_btn.hover()
            page.wait_for_timeout(2000)
    except: pass
    
    page.mouse.wheel(0, 300)
    page.wait_for_timeout(2000)


def merge_videos(inputs: list, output: str):
    print(f"\n🎞️  Mesclando {len(inputs)} cenas em {output}...")
    list_file = "/tmp/daig_concat.txt"
    with open(list_file, "w") as f:
        for inp in inputs:
            if inp and os.path.exists(inp):
                f.write(f"file '{os.path.abspath(inp)}'\n")
    
    cmd = ["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", list_file, "-c:v", "vp8", "-b:v", "1500k", "-c:a", "copy", output]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode == 0:
        print(f"  ✅ Vídeo final: {output} ({os.path.getsize(output)/(1024*1024):.1f}MB)")
    else:
        print(f"  ❌ Erro ffmpeg: {result.stderr[-500:]}")
    return output


if __name__ == "__main__":
    print("=" * 60)
    print("DAIG Full Demo Video Capture Agent V2 (Registration, Chat, Stripe T+4)")
    print("=" * 60)
    
    scenes = [
        ("demo_0_landing",  flow_landing_hero, False),
        ("demo_1_register", flow_register, False),
        ("demo_2_home",     flow_home, True),
        ("demo_3_catalog",  flow_catalog, True),
        ("demo_4_product",  flow_product_detail, True),
        ("demo_5_upload",   flow_create_listing, True),
        ("demo_6_messages", flow_messages, True),
        ("demo_7_checkout", flow_checkout, True),
    ]
    
    captured = []
    for name, fn, inject_auth in scenes:
        path = capture_demo(name, fn, inject_auth=inject_auth)
        if path:
            captured.append(path)
    
    if captured:
        final_output = os.path.join(OUT_DIR, "daig-full-demo.webm")
        merge_videos(captured, final_output)
        
        mp4_output = os.path.join(OUT_DIR, "daig-full-demo.mp4")
        subprocess.run(["ffmpeg", "-y", "-i", final_output, "-c:v", "libx264", "-preset", "fast", "-crf", "22", "-c:a", "copy", mp4_output], capture_output=True)
        if os.path.exists(mp4_output):
            print(f"  ✅ MP4: {mp4_output} ({os.path.getsize(mp4_output)/(1024*1024):.1f}MB)")
