"""
DAIG Full Demo Video Capture Agent
===================================
Grava o vídeo completo de demonstração da plataforma DAIG.
Usa add_init_script() para injetar auth ANTES do React inicializar,
eliminando o problema do loading spinner de forma definitiva.

Cenas:
  1. Home / Dashboard seleção de ambiente
  2. Catálogo JDM com produtos reais
  3. Detalhe de produto
  4. Create Listing + Upload de Imagem (IA)
  5. Messages / Chat comprador-vendedor
  6. Checkout → redirecionamento Stripe

Uso: python3 agents/ai_directors/full_demo_capture.py
"""

import os
import time
import subprocess
from playwright.sync_api import sync_playwright

BASE_URL = "http://localhost:5173"
OUT_DIR = "public/videos"
os.makedirs(OUT_DIR, exist_ok=True)

# Auth mock injetado ANTES do React rodar (add_init_script)
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
  // Suppress console noise
  window.__SUPPRESS_LOGS = true;
})();
"""


def capture_demo(name: str, flow_fn, viewport_w=1440, viewport_h=900):
    """Captura um fluxo como webm e retorna o caminho do arquivo."""
    print(f"\n🎬 Capturando: {name}")
    
    with sync_playwright() as p:
        browser = p.chromium.launch(
            headless=True,
            args=[
                "--disable-gpu",
                "--no-sandbox",
                "--disable-dev-shm-usage",
                "--disable-web-security",  # permite cross-origin para assets locais
            ]
        )
        ctx = browser.new_context(
            record_video_dir=OUT_DIR,
            viewport={"width": viewport_w, "height": viewport_h},
            device_scale_factor=1,
        )
        # CHAVE: injeta auth ANTES do React inicializar
        ctx.add_init_script(AUTH_INIT)
        
        page = ctx.new_page()
        
        # Silencia logs do browser para output limpo
        page.on("console", lambda _: None)
        page.on("pageerror", lambda _: None)
        
        try:
            flow_fn(page)
            page.wait_for_timeout(1500)  # freeze final frame
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


# ─── FLUXOS DE DEMO ──────────────────────────────────────────────────────────

def flow_home(page):
    """Cena 1: Tela inicial / seleção de ambiente do parceiro."""
    page.goto(BASE_URL)
    _wait_loaded(page)
    page.wait_for_timeout(2000)
    # Scroll suave para mostrar os dois cards de ambiente
    page.mouse.wheel(0, 200)
    page.wait_for_timeout(2500)
    page.mouse.wheel(0, -200)
    page.wait_for_timeout(1500)


def flow_catalog(page):
    """Cena 2: Catálogo JDM com produtos e filtros."""
    page.goto(f"{BASE_URL}/catalog")
    _wait_loaded(page)
    page.wait_for_timeout(2000)
    # Mostra produtos carregados
    page.mouse.wheel(0, 400)
    page.wait_for_timeout(1500)
    # Click em marca Honda no sidebar para filtrar
    try:
        page.click("text=Honda", timeout=3000)
        page.wait_for_timeout(1500)
        page.click("text=Honda", timeout=3000)  # deselecionar
        page.wait_for_timeout(1000)
    except:
        pass
    page.mouse.wheel(0, 300)
    page.wait_for_timeout(2000)
    page.mouse.wheel(0, -300)
    page.wait_for_timeout(1000)


def flow_product_detail(page):
    """Cena 3: Detalhe de produto - ver specs e preço."""
    page.goto(f"{BASE_URL}/catalog")
    _wait_loaded(page)
    page.wait_for_timeout(1500)
    # Clica no primeiro produto
    try:
        first_product = page.query_selector("a[href*='/product/']")
        if first_product:
            product_url = first_product.get_attribute("href")
            page.goto(f"{BASE_URL}{product_url}")
            _wait_loaded(page)
            page.wait_for_timeout(2000)
            page.mouse.wheel(0, 400)
            page.wait_for_timeout(2000)
            page.mouse.wheel(0, 600)
            page.wait_for_timeout(2000)
    except:
        page.goto(f"{BASE_URL}/catalog")
        _wait_loaded(page)
        page.wait_for_timeout(3000)


def flow_create_listing(page):
    """Cena 4: Create Listing + Upload de Imagem com IA."""
    page.goto(f"{BASE_URL}/create-listing")
    _wait_loaded(page)
    page.wait_for_timeout(2500)
    # Scroll para mostrar área de upload
    page.mouse.wheel(0, 300)
    page.wait_for_timeout(1500)
    # Hover sobre a área de upload para mostrar feedback visual
    try:
        upload_area = page.query_selector("input[type='file']")
        if upload_area:
            bbox = upload_area.bounding_box()
            if bbox:
                cx = bbox["x"] + bbox["width"] / 2
                cy = bbox["y"] + bbox["height"] / 2
                page.mouse.move(cx, cy)
                page.wait_for_timeout(1500)
    except:
        pass
    page.mouse.wheel(0, 400)
    page.wait_for_timeout(1500)
    # Mostra campos de preenchimento
    try:
        title_input = page.query_selector("input[name='title'], input[placeholder*='título'], input[placeholder*='title']")
        if title_input:
            title_input.click()
            title_input.type("GReddy T88-34D Turbocharger SR20DET", delay=50)
            page.wait_for_timeout(1500)
    except:
        pass
    page.mouse.wheel(0, 500)
    page.wait_for_timeout(2000)
    page.mouse.wheel(0, -800)
    page.wait_for_timeout(1000)


def flow_messages(page):
    """Cena 5: Mensagens / Chat vendedor-comprador."""
    page.goto(f"{BASE_URL}/messages")
    _wait_loaded(page)
    page.wait_for_timeout(2500)
    # Hover na área de mensagens
    page.mouse.move(700, 400)
    page.wait_for_timeout(1500)
    page.mouse.wheel(0, 300)
    page.wait_for_timeout(2000)
    page.mouse.wheel(0, -300)
    page.wait_for_timeout(1000)


def flow_checkout(page):
    """Cena 6: Checkout com Stripe Connect."""
    # Tenta navegar para checkout de um produto real
    page.goto(f"{BASE_URL}/catalog")
    _wait_loaded(page)
    page.wait_for_timeout(1500)
    
    product_id = None
    try:
        links = page.query_selector_all("a[href*='/product/']")
        if links:
            href = links[0].get_attribute("href")
            product_id = href.split("/product/")[-1] if href else None
    except:
        pass
    
    if product_id:
        page.goto(f"{BASE_URL}/checkout/{product_id}")
        _wait_loaded(page)
        page.wait_for_timeout(2500)
        # Mostra o formulário de checkout completo
        page.mouse.wheel(0, 400)
        page.wait_for_timeout(2000)
        # Hover no botão de pagamento Stripe
        try:
            stripe_btn = page.query_selector("button[type='submit'], button:has-text('Pagar'), button:has-text('Pay')")
            if stripe_btn:
                stripe_btn.hover()
                page.wait_for_timeout(2000)
        except:
            pass
        page.mouse.wheel(0, 300)
        page.wait_for_timeout(2000)
    else:
        # Fallback: mostra catalog
        page.wait_for_timeout(4000)


# ─── UTILS ──────────────────────────────────────────────────────────────────

def _wait_loaded(page, timeout=20000):
    """Aguarda spinner sumir e conteúdo real aparecer."""
    try:
        page.wait_for_selector(".animate-spin", state="hidden", timeout=timeout)
    except:
        pass
    # Extra wait para animações CSS
    page.wait_for_timeout(500)


def merge_videos(inputs: list, output: str):
    """Concatena webm files via ffmpeg."""
    print(f"\n🎞️  Mesclando {len(inputs)} cenas em {output}...")
    
    # Cria arquivo de lista para concat
    list_file = "/tmp/daig_concat.txt"
    with open(list_file, "w") as f:
        for inp in inputs:
            if inp and os.path.exists(inp):
                f.write(f"file '{os.path.abspath(inp)}'\n")
    
    cmd = [
        "ffmpeg", "-y",
        "-f", "concat", "-safe", "0", "-i", list_file,
        "-c:v", "vp8", "-b:v", "1500k",
        "-c:a", "copy",
        output
    ]
    
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode == 0:
        size = os.path.getsize(output) / (1024 * 1024)
        print(f"  ✅ Vídeo final: {output} ({size:.1f}MB)")
    else:
        print(f"  ❌ Erro ffmpeg: {result.stderr[-500:]}")
    
    return output


# ─── MAIN ────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    print("=" * 60)
    print("DAIG Full Demo Video Capture Agent")
    print("=" * 60)
    
    scenes = [
        ("demo_1_home",     flow_home),
        ("demo_2_catalog",  flow_catalog),
        ("demo_3_product",  flow_product_detail),
        ("demo_4_upload",   flow_create_listing),
        ("demo_5_messages", flow_messages),
        ("demo_6_checkout", flow_checkout),
    ]
    
    captured = []
    for name, fn in scenes:
        path = capture_demo(name, fn)
        if path:
            captured.append(path)
    
    if captured:
        final_output = os.path.join(OUT_DIR, "daig-full-demo.webm")
        merge_videos(captured, final_output)
        # Also copy as mp4 for max compatibility
        mp4_output = os.path.join(OUT_DIR, "daig-full-demo.mp4")
        subprocess.run([
            "ffmpeg", "-y", "-i", final_output,
            "-c:v", "libx264", "-preset", "fast", "-crf", "22",
            "-c:a", "copy",
            mp4_output
        ], capture_output=True)
        if os.path.exists(mp4_output):
            size = os.path.getsize(mp4_output) / (1024 * 1024)
            print(f"  ✅ MP4: {mp4_output} ({size:.1f}MB)")
        
        print("\n✅ Captura concluída!")
        print(f"   WebM: {final_output}")
        print(f"   MP4:  {mp4_output}")
    else:
        print("\n❌ Nenhuma cena capturada com sucesso.")
