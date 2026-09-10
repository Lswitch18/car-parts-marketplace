import os
import time
import json
from playwright.sync_api import sync_playwright

# Setup the output directory (public/videos for site usage)
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "public", "videos")
os.makedirs(OUTPUT_DIR, exist_ok=True)

def smooth_click(page, locator):
    """Move o mouse suavemente até o elemento e clica"""
    box = locator.bounding_box()
    if box:
        x = box["x"] + box["width"] / 2
        y = box["y"] + box["height"] / 2
        page.mouse.move(x, y, steps=20)
        time.sleep(0.3)
        page.mouse.click(x, y)
    else:
        # Se não achar a bounding box, tenta o clique padrão
        locator.click(timeout=3000, force=True)

def record_full_ecosystem_demo():
    print(f"🎬 Iniciando gravação do fluxo completo de 5 Cenas (Ecossistema DAIG)...")
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        
        # Cria contexto de gravação Full HD
        context = browser.new_context(
            viewport={"width": 1920, "height": 1080},
            record_video_dir=OUTPUT_DIR,
            record_video_size={"width": 1920, "height": 1080},
            device_scale_factor=1.0
        )
        
        page = context.new_page()
        page.on('console', lambda msg: print('Browser:', msg.text))
        
        # Injeta CSS para ocultar spinners e cria um cursor com marcação (ripple) e suporte a zoom
        page.add_init_script("""
            document.addEventListener('DOMContentLoaded', () => {
                const style = document.createElement('style');
                style.innerHTML = `
                    .animate-spin { display: none !important; opacity: 0 !important; }
                    .daig-cursor { position: fixed; top: 0; left: 0; width: 24px; height: 36px; z-index: 2147483647; pointer-events: none; transition: transform 0.1s; }
                    .daig-ripple { position: absolute; border-radius: 50%; border: 2px solid #00E5FF; background: rgba(0,229,255,0.3); animation: ripple 0.6s linear forwards; pointer-events: none; z-index: 2147483646; }
                    @keyframes ripple { 0% { width: 0; height: 0; opacity: 1; margin-top: 0; margin-left: 0; } 100% { width: 60px; height: 60px; opacity: 0; margin-top: -30px; margin-left: -30px; } }
                    body { transition: transform 1s cubic-bezier(0.25, 0.1, 0.25, 1); transform-origin: center center; }
                    .zoom-in { transform: scale(1.1); }
                `;
                document.head.appendChild(style);

                const cursor = document.createElement('div');
                cursor.className = 'daig-cursor';
                cursor.innerHTML = '<svg width="24" height="36" viewBox="0 0 24 36" fill="none"><path d="M5.4 33.6L0 0L24 16.8L13.8 19.8L18.6 30L13.2 32.4L8.4 22.2L5.4 33.6Z" fill="#00E5FF" stroke="#FFFFFF" stroke-width="2"/></svg>';
                document.body.appendChild(cursor);

                document.addEventListener('mousemove', e => {
                    cursor.style.left = e.clientX + 'px';
                    cursor.style.top = e.clientY + 'px';
                });
                document.addEventListener('mousedown', (e) => { 
                    cursor.style.transform = 'scale(0.8)';
                    const ripple = document.createElement('div');
                    ripple.className = 'daig-ripple';
                    ripple.style.left = e.clientX + 'px';
                    ripple.style.top = e.clientY + 'px';
                    document.body.appendChild(ripple);
                    setTimeout(() => ripple.remove(), 600);
                });
                document.addEventListener('mouseup', () => { cursor.style.transform = 'scale(1)'; });
            });
        """)
        
        # Mock da API de Inteligência Artificial
        def handle_ai(route):
            print("🤖 Interceptando chamada de IA e injetando SR20DET Mock...")
            headers = {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                "Access-Control-Allow-Headers": "*"
            }
            if route.request.method == "OPTIONS":
                route.fulfill(status=204, headers=headers)
                return
            route.fulfill(
                status=200,
                headers=headers,
                content_type="application/json",
                body=json.dumps({
                    "success": True,
                    "data": {
                        "title": "Nissan SR20DET Black Top Engine",
                        "description": "Motor original Nissan SR20DET Black Top retirado de um 180SX Type X. Turbina original em perfeito estado. Compressão testada e garantida.",
                        "category": "Motores",
                        "suggested_price": 450000,
                        "condition": "Usado - Excelente",
                        "compatibility_tags": ["Nissan", "Silvia", "180SX", "S13", "SR20DET", "Drift"]
                    }
                })
            )
        
        page.route("**/analyze-part*", handle_ai)
        page.route("**/analyze-part", handle_ai)

        # Mock da API do Supabase para injetar a conversa no Chat
        def handle_supabase_rest(route):
            url = route.request.url
            if "/rest/v1/messages" in url and "select=" in url:
                mock_msg = [{
                    "id": "msg-999",
                    "sender_id": "seller-123",
                    "receiver_id": "buyer-456",
                    "part_id": "part-001",
                    "content": "はい、420,000円で承知いたしました。明日発送可能です！ (Sim, aceito ¥420.000. Posso enviar amanhã!)",
                    "created_at": "2026-09-10T12:00:00Z",
                    "read_at": None,
                    "type": "price_update",
                    "metadata": {"price": 420000},
                    "parts": {
                        "id": "part-001",
                        "title": "Nissan SR20DET Black Top Engine",
                        "price": 450000,
                        "images": ["/images/jdm_engine.jpg"]
                    }
                }]
                route.fulfill(status=200, content_type="application/json", body=json.dumps(mock_msg))
            elif "/rest/v1/profiles" in url:
                mock_profile = {
                    "id": "seller-123",
                    "full_name": "TDK JDM Parts",
                    "avatar_url": None
                }
                if "application/vnd.pgrst.object+json" in route.request.headers.get("accept", ""):
                    route.fulfill(status=200, content_type="application/json", body=json.dumps(mock_profile))
                else:
                    route.fulfill(status=200, content_type="application/json", body=json.dumps([mock_profile]))
            elif "/rest/v1/parts" in url:
                mock_part = {
                    "id": "part-001",
                    "title": "Nissan SR20DET Black Top Engine",
                    "description": "Motor SR20DET impecável",
                    "price": 420000,
                    "condition": "Usado",
                    "seller_id": "seller-123",
                    "images": ["/images/jdm_engine.jpg"],
                    "brand": "Nissan",
                    "model_compatibility": ["Silvia", "180SX"]
                }
                if "application/vnd.pgrst.object+json" in route.request.headers.get("accept", ""):
                    route.fulfill(status=200, content_type="application/json", body=json.dumps(mock_part))
                else:
                    route.fulfill(status=200, content_type="application/json", body=json.dumps([mock_part]))
            else:
                route.continue_()

        page.route("**/rest/v1/*", handle_supabase_rest)
        
        try:
            # ========================================================
            # CENA 1: Landing Page e Auth Bypass
            # ========================================================
            print("🎥 CENA 1: Acesso Inicial, Scroll e Tela de Cadastro")
            page.goto("http://localhost:4173/", wait_until="domcontentloaded")
            # Esperar um pouco o carregamento visual antes de agir
            page.wait_for_timeout(1500)
            
            print("🖱️ Rolando lentamente a Home...")
            for _ in range(3):
                page.mouse.wheel(0, 400)
                time.sleep(1)
            
            # Zoom In e clique com smooth_click
            page.evaluate("document.body.classList.add('zoom-in')")
            time.sleep(1)
            
            print("📝 Acessando a tela de Cadastro...")
            btn_cadastrar = page.locator('a[href="/register"]').first
            if btn_cadastrar.is_visible():
                smooth_click(page, btn_cadastrar)
            else:
                page.goto("http://localhost:4173/register", wait_until="domcontentloaded")
            
            time.sleep(1)
            page.evaluate("document.body.classList.remove('zoom-in')")
            
            print("🔓 Fazendo Skip na autenticação via localStorage...")
            mock_user = """
            {
                "state": {
                    "user": {
                        "id": "buyer-456",
                        "email": "demo@daig.jp",
                        "role": "buyer",
                        "onboarding_completed": true,
                        "shop_name": ""
                    },
                    "isAdmin": false,
                    "initialized": true,
                    "loading": false
                },
                "version": 0
            }
            """
            page.evaluate(f"window.localStorage.setItem('auth-storage', JSON.stringify({mock_user}));")
            page.evaluate("window.localStorage.setItem('mock_auth_for_video', 'true');")
            page.evaluate("window.localStorage.setItem('daig-language', 'ja');")
            page.reload(wait_until="domcontentloaded")
            
            # ========================================================
            # CENA 2: Catálogo Inteligente
            # ========================================================
            print("🎥 CENA 2: Catálogo de Peças (Busca e Análise)")
            page.goto("http://localhost:4173/catalog", wait_until="domcontentloaded")
            time.sleep(1)
            
            print("⌨️ Digitando busca de peça...")
            search_input = page.locator('input[type="text"]').first
            smooth_click(page, search_input)
            time.sleep(0.5)
            page.keyboard.type("SR20DET", delay=150)
            time.sleep(1)
            page.keyboard.press("Enter")
            time.sleep(2)
            
            print("🖱️ Analisando a peça no Catálogo...")
            # Aplica zoom-in no grid
            page.evaluate("document.body.classList.add('zoom-in')")
            page.mouse.wheel(0, 300)
            time.sleep(2)
            page.evaluate("document.body.classList.remove('zoom-in')")

            # ========================================================
            # CENA 3: Criação de Anúncio IA (Navegação para Upload)
            # ========================================================
            print("🎥 CENA 3: Criação de Anúncio IA (Upload Real do Motor SR20DET)")
            page.goto("http://localhost:4173/create-listing", wait_until="domcontentloaded")
            time.sleep(1)
            
            print("🖼️ Fazendo upload do motor...")
            # Pega o input file real e sobe a imagem (usando caminhos absolutos do diretório)
            file_input = page.locator('input[type="file"]').first
            image_path = os.path.join(os.path.dirname(__file__), "..", "public", "images", "jdm_engine.jpg")
            file_input.set_input_files(image_path)
            time.sleep(1)
            
            # Encontra o botão Analisar com a IA
            ai_btn = page.locator('button.group').first
            if ai_btn.is_visible():
                smooth_click(page, ai_btn)
            else:
                page.evaluate("document.querySelector('button.group').click()")

            time.sleep(1.5)
            print("✅ Upload concluído. Aguardando IA...")

            print("🖱️ Visualizando Anúncio Preenchido...")
            page.mouse.wheel(0, 400)
            time.sleep(0.5)

            # ========================================================
            # CENA 4: Chat e Negociação (Fechando Proposta)
            # ========================================================
            print("🎥 CENA 4: Chat e Negociação (Fechando Proposta)")
            page.goto("http://localhost:4173/messages", wait_until="domcontentloaded")
            time.sleep(1)
            
            print("💬 Selecionando conversa...")
            chat_btn = page.locator('.w-full.text-left.p-4, [role="button"]').nth(1)
            if chat_btn.is_visible():
                smooth_click(page, chat_btn)
            time.sleep(0.5)
            
            print("🛍️ Clicando em Ir para Pagamento...")
            pay_btn = page.locator('a[href*="/checkout/"], button.bg-primary').last
            if pay_btn.is_visible():
                page.evaluate("document.body.classList.add('zoom-in')")
                time.sleep(1)
                smooth_click(page, pay_btn)
            else:
                print("⚠️ Botão de pagamento não encontrado, redirecionando via JS...")
                page.evaluate("window.location.href = '/checkout/part-001?price=420000'")
                
            time.sleep(1)
            page.evaluate("document.body.classList.remove('zoom-in')")

            # ========================================================
            # CENA 5: Fluxo de Pagamento e Direcionamento Stripe
            # ========================================================
            print("🎥 CENA 5: Fluxo de Checkout e Stripe")
            time.sleep(1)
            
            print("🖱️ Visualizando Checkout Seguro...")
            page.mouse.wheel(0, 300)
            time.sleep(1)
                
            print("💳 Clicando no botão de Pagar via Stripe...")
            try:
                # Usa JavaScript para encontrar o botão de gradiente
                page.evaluate("""
                    const btn = Array.from(document.querySelectorAll('button')).find(b => b.className.includes('bg-gradient-to-r'));
                    if (btn) { 
                        btn.disabled = false;
                        const rect = btn.getBoundingClientRect();
                        const x = rect.left + rect.width / 2;
                        const y = rect.top + rect.height / 2;
                        document.querySelector('.daig-cursor').style.left = x + 'px';
                        document.querySelector('.daig-cursor').style.top = y + 'px';
                    }
                """)
                time.sleep(0.5)
                # Zoom final antes do click
                page.evaluate("document.body.classList.add('zoom-in')")
                time.sleep(0.5)
                
                page.evaluate("""
                    const btn = Array.from(document.querySelectorAll('button')).find(b => b.className.includes('bg-gradient-to-r'));
                    if (btn) { btn.click(); }
                """)
                
                print("✅ Botão Pagar clicado via JavaScript!")
                time.sleep(4) # Espera mostrar o redirecionamento
            except Exception as e:
                print("⚠️ Erro ao clicar no botão pagar:", e)
                
        except Exception as e:
            print(f"❌ Erro na automação: {e}")
        finally:
            print("✅ Coreografia concluída com sucesso!")
            print("💾 Finalizando gravação e fechando o navegador...")
            browser.close()

if __name__ == "__main__":
    record_full_ecosystem_demo()
