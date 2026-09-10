import os
import time
import json
from playwright.sync_api import sync_playwright

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "public", "videos")
os.makedirs(OUTPUT_DIR, exist_ok=True)

def smooth_click(page, locator):
    """Move o mouse suavemente até o elemento e clica"""
    box = locator.bounding_box()
    if box:
        x = box["x"] + box["width"] / 2
        y = box["y"] + box["height"] / 2
        page.mouse.move(x, y, steps=25)
        time.sleep(0.3)
        page.mouse.click(x, y)
    else:
        locator.click(timeout=3000, force=True)

def record_cinematic_tour():
    print(f"🎬 Iniciando gravação do Tour Cinematográfico (Pitch Premium)...")
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        
        # Cria contexto de gravação Full HD (1080p)
        context = browser.new_context(
            viewport={"width": 1920, "height": 1080},
            record_video_dir=OUTPUT_DIR,
            record_video_size={"width": 1920, "height": 1080},
            device_scale_factor=1.0
        )
        
        page = context.new_page()
        page.on('console', lambda msg: print('Browser:', msg.text))
        
        # Injeção da Câmera Virtual, Barras Cinematográficas e Cursor
        page.add_init_script("""
            document.addEventListener('DOMContentLoaded', () => {
                const style = document.createElement('style');
                style.innerHTML = `
                    .animate-spin { display: none !important; opacity: 0 !important; }
                    /* Cursor Setup */
                    .daig-cursor { position: fixed; top: -100px; left: -100px; width: 30px; height: 42px; z-index: 2147483647; pointer-events: none; transition: transform 0.1s; filter: drop-shadow(0px 0px 8px rgba(0,229,255,0.8)); }
                    .daig-ripple { position: absolute; border-radius: 50%; border: 3px solid #00E5FF; background: rgba(0,229,255,0.4); animation: ripple 0.7s cubic-bezier(0, 0, 0.2, 1) forwards; pointer-events: none; z-index: 2147483646; }
                    @keyframes ripple { 0% { width: 0; height: 0; opacity: 1; margin-top: 0; margin-left: 0; } 100% { width: 80px; height: 80px; opacity: 0; margin-top: -40px; margin-left: -40px; } }
                    
                    /* Cinematic Camera */
                    body {
                        transition: transform 2.5s cubic-bezier(0.25, 1, 0.5, 1), transform-origin 0s;
                        transform-origin: center center;
                    }
                    /* Overlay de Transição (Fades) */
                    #cinematic-overlay {
                        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
                        background: #000; z-index: 2147483645;
                        transition: opacity 1.2s ease-in-out; pointer-events: none; opacity: 1;
                    }
                    /* Barras Cinematográficas */
                    .cinematic-bars {
                        position: fixed; left: 0; width: 100vw; height: 85px;
                        background: #020617; z-index: 2147483644; pointer-events: none;
                        border-top: 1px solid rgba(0,229,255,0.1); border-bottom: 1px solid rgba(0,229,255,0.1);
                        box-shadow: 0 0 20px rgba(0,0,0,0.8);
                    }
                    #bar-top { top: 0; border-bottom: 2px solid #00E5FF33; }
                    #bar-bottom { bottom: 0; border-top: 2px solid #00E5FF33; }
                `;
                document.head.appendChild(style);

                const overlay = document.createElement('div');
                overlay.id = 'cinematic-overlay';
                document.body.appendChild(overlay);

                const barTop = document.createElement('div');
                barTop.className = 'cinematic-bars';
                barTop.id = 'bar-top';
                document.body.appendChild(barTop);

                const barBottom = document.createElement('div');
                barBottom.className = 'cinematic-bars';
                barBottom.id = 'bar-bottom';
                document.body.appendChild(barBottom);

                // API do Diretor de Câmera
                window.director = {
                    fadeIn: () => document.getElementById('cinematic-overlay').style.opacity = '0',
                    fadeOut: () => document.getElementById('cinematic-overlay').style.opacity = '1',
                    zoomIn: (scale = 1.3, origin = 'center center', duration = '2.5s') => {
                        document.body.style.transitionDuration = duration;
                        document.body.style.transformOrigin = origin;
                        document.body.style.transform = `scale(${scale})`;
                    },
                    zoomOut: (duration = '2.5s') => {
                        document.body.style.transitionDuration = duration;
                        document.body.style.transform = 'scale(1)';
                    }
                };

                const cursor = document.createElement('div');
                cursor.className = 'daig-cursor';
                cursor.innerHTML = '<svg width="30" height="42" viewBox="0 0 24 36" fill="none"><path d="M5.4 33.6L0 0L24 16.8L13.8 19.8L18.6 30L13.2 32.4L8.4 22.2L5.4 33.6Z" fill="#00E5FF" stroke="#020617" stroke-width="2"/></svg>';
                document.body.appendChild(cursor);

                document.addEventListener('mousemove', e => {
                    cursor.style.left = e.clientX + 'px';
                    cursor.style.top = e.clientY + 'px';
                });
                document.addEventListener('mousedown', (e) => { 
                    cursor.style.transform = 'scale(0.7)';
                    const ripple = document.createElement('div');
                    ripple.className = 'daig-ripple';
                    ripple.style.left = e.clientX + 'px';
                    ripple.style.top = e.clientY + 'px';
                    document.body.appendChild(ripple);
                    setTimeout(() => ripple.remove(), 700);
                });
                document.addEventListener('mouseup', () => { cursor.style.transform = 'scale(1)'; });
            });
        """)

        # Mocks (Auth, Supabase, AI)
        def handle_ai(route):
            headers = {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                "Access-Control-Allow-Headers": "*"
            }
            if route.request.method == "OPTIONS":
                route.fulfill(status=204, headers=headers)
                return
            route.fulfill(status=200, headers=headers, content_type="application/json", body=json.dumps({
                "success": True,
                "data": {
                    "title": "Nissan SR20DET Black Top Engine",
                    "description": "Motor original Nissan SR20DET Black Top retirado de um 180SX Type X. Turbina original em perfeito estado. Compressão testada e garantida.",
                    "category": "Motores",
                    "suggested_price": 450000,
                    "condition": "Usado - Excelente",
                    "compatibility_tags": ["Nissan", "Silvia", "180SX", "S13", "SR20DET", "Drift"]
                }
            }))
        page.route("**/analyze-part*", handle_ai)
        page.route("**/analyze-part", handle_ai)

        def handle_supabase_rest(route):
            url = route.request.url
            if "/rest/v1/messages" in url and "select=" in url:
                mock_msg = [{
                    "id": "msg-999", "sender_id": "seller-123", "receiver_id": "buyer-456", "part_id": "part-001",
                    "content": "はい、420,000円で承知いたしました。明日発送可能です！ (Sim, aceito ¥420.000. Posso enviar amanhã!)",
                    "created_at": "2026-09-10T12:00:00Z", "read_at": None, "type": "price_update",
                    "metadata": {"price": 420000},
                    "parts": {"id": "part-001", "title": "Nissan SR20DET", "price": 450000, "images": ["/images/jdm_engine.jpg"]}
                }]
                route.fulfill(status=200, content_type="application/json", body=json.dumps(mock_msg))
            elif "/rest/v1/profiles" in url:
                mock_profile = {"id": "seller-123", "full_name": "TDK JDM Parts", "avatar_url": None}
                route.fulfill(status=200, content_type="application/json", body=json.dumps(mock_profile if "vnd.pgrst.object" in route.request.headers.get("accept", "") else [mock_profile]))
            elif "/rest/v1/parts" in url:
                mock_part = {"id": "part-001", "title": "Nissan SR20DET", "description": "Motor SR20DET impecável", "price": 420000, "condition": "Usado", "seller_id": "seller-123", "images": ["/images/jdm_engine.jpg"], "brand": "Nissan", "model_compatibility": ["Silvia", "180SX"]}
                route.fulfill(status=200, content_type="application/json", body=json.dumps(mock_part if "vnd.pgrst.object" in route.request.headers.get("accept", "") else [mock_part]))
            else:
                route.continue_()
        page.route("**/rest/v1/*", handle_supabase_rest)

        def handle_dashboard_analytics(route):
             route.fulfill(status=200, headers={"Access-Control-Allow-Origin": "*"}, content_type="application/json", body=json.dumps({"success": True, "data": {"total_sales": 15420000, "active_listings": 42, "messages_unread": 5}}))
        page.route("**/analytics/all*", handle_dashboard_analytics)

        try:
            BASE_URL = "http://localhost:4173"
            
            # Setup User State
            print("🔧 Preparando Estado do Usuário...")
            page.goto(BASE_URL, wait_until="domcontentloaded")
            mock_user = """{ "state": { "user": { "id": "buyer-456", "email": "demo@daig.jp", "role": "buyer", "onboarding_completed": true, "shop_name": "" }, "isAdmin": false, "initialized": true, "loading": false }, "version": 0 }"""
            page.evaluate(f"window.localStorage.setItem('auth-storage', JSON.stringify({mock_user}));")
            page.evaluate("window.localStorage.setItem('mock_auth_for_video', 'true');")
            page.evaluate("window.localStorage.setItem('daig-language', 'ja');")
            
            # ========================================================
            # CENA 1: Hero (Cinematic Pan & Zoom)
            # ========================================================
            print("🎥 CENA 1: Abertura Hero...")
            page.goto(f"{BASE_URL}/", wait_until="networkidle")
            page.evaluate("window.director.zoomIn(1.4, '50% 30%', '0s')") # Começa focado
            time.sleep(1)
            page.evaluate("window.director.fadeIn()")
            time.sleep(1)
            page.evaluate("window.director.zoomOut('4s')") # Zoom out lento cinematográfico
            time.sleep(4.5)
            
            print("🖱️ Scroll suave e fade out...")
            for _ in range(3):
                page.mouse.wheel(0, 300)
                time.sleep(0.8)
            page.evaluate("window.director.fadeOut()")
            time.sleep(1.5)

            # ========================================================
            # CENA 2: Dashboard Vendedor (Métricas)
            # ========================================================
            print("🎥 CENA 2: Dashboard de Analytics...")
            page.goto(f"{BASE_URL}/admin", wait_until="domcontentloaded")
            page.wait_for_timeout(1000)
            page.evaluate("window.director.zoomIn(1.3, 'center 20%', '0s')")
            page.evaluate("window.director.fadeIn()")
            time.sleep(1)
            
            page.evaluate("window.director.zoomOut('3s')")
            page.mouse.move(960, 540, steps=20)
            time.sleep(3)
            
            page.evaluate("window.director.fadeOut()")
            time.sleep(1.5)

            # ========================================================
            # CENA 3: Catálogo (Busca Inteligente)
            # ========================================================
            print("🎥 CENA 3: Catálogo de Peças...")
            page.goto(f"{BASE_URL}/catalog", wait_until="domcontentloaded")
            page.evaluate("window.director.zoomIn(1.2, 'top center', '0s')")
            page.evaluate("window.director.fadeIn()")
            time.sleep(1)
            
            print("⌨️ Pesquisando Motor...")
            search_input = page.locator('input[type="text"]').first
            smooth_click(page, search_input)
            page.keyboard.type("SR20DET", delay=150)
            time.sleep(0.5)
            page.keyboard.press("Enter")
            
            page.evaluate("window.director.zoomOut('2s')")
            time.sleep(2.5)
            page.evaluate("window.director.fadeOut()")
            time.sleep(1.5)

            # ========================================================
            # CENA 4: Upload IA (Criação de Anúncio)
            # ========================================================
            print("🎥 CENA 4: IA Engine (Upload)...")
            page.goto(f"{BASE_URL}/create-listing", wait_until="domcontentloaded")
            page.evaluate("window.director.zoomIn(1.1, 'center center', '0s')")
            page.evaluate("window.director.fadeIn()")
            time.sleep(1)
            
            file_input = page.locator('input[type="file"]').first
            image_path = os.path.join(os.path.dirname(__file__), "..", "public", "images", "jdm_engine.jpg")
            file_input.set_input_files(image_path)
            time.sleep(1)
            
            ai_btn = page.locator('button.group').first
            if ai_btn.is_visible():
                smooth_click(page, ai_btn)
            else:
                page.evaluate("document.querySelector('button.group').click()")

            # Zoom nos campos sendo preenchidos
            page.evaluate("window.director.zoomIn(1.4, 'center bottom', '4s')")
            page.mouse.wheel(0, 400)
            time.sleep(4)
            
            page.evaluate("window.director.fadeOut()")
            time.sleep(1.5)

            # ========================================================
            # CENA 5: Mensagens e Checkout
            # ========================================================
            print("🎥 CENA 5: Fechamento de Negócio...")
            page.goto(f"{BASE_URL}/messages", wait_until="domcontentloaded")
            page.evaluate("window.director.zoomIn(1.1, 'center center', '0s')")
            page.evaluate("window.director.fadeIn()")
            time.sleep(1)
            
            chat_btn = page.locator('.w-full.text-left.p-4, [role="button"]').nth(1)
            if chat_btn.is_visible():
                smooth_click(page, chat_btn)
            time.sleep(1)
            
            page.evaluate("window.director.fadeOut()")
            time.sleep(1.5)
            
            pay_btn = page.locator('a[href*="/checkout/"], button.bg-primary').last
            if pay_btn.is_visible():
                page.evaluate("window.director.zoomIn(1.3, 'right bottom', '1.5s')")
                time.sleep(1.5)
                smooth_click(page, pay_btn)
            else:
                page.evaluate("window.location.href = '/checkout/part-001?price=420000'")
            
            page.wait_for_url("**/checkout/**")
            page.wait_for_load_state("domcontentloaded")

            # ========================================================
            # CENA 6: Pagamento Stripe
            # ========================================================
            print("🎥 CENA 6: Checkout Stripe...")
            page.evaluate("window.director.zoomIn(1.1, 'center center', '0s')")
            page.evaluate("window.director.fadeIn()")
            time.sleep(1.5)
            page.mouse.wheel(0, 300)
            
            try:
                page.evaluate("window.director.zoomIn(1.4, 'center bottom', '2s')")
                time.sleep(2)
                page.evaluate("""
                    const btn = Array.from(document.querySelectorAll('button')).find(b => b.className.includes('bg-gradient-to-r'));
                    if (btn) { 
                        btn.disabled = false;
                        const rect = btn.getBoundingClientRect();
                        const x = rect.left + rect.width / 2;
                        const y = rect.top + rect.height / 2;
                        document.querySelector('.daig-cursor').style.left = x + 'px';
                        document.querySelector('.daig-cursor').style.top = y + 'px';
                        setTimeout(() => btn.click(), 500);
                    }
                """)
                time.sleep(1.5) # Aguarda animação de clique e load
            except Exception as e:
                pass
            
            page.evaluate("window.director.fadeOut()")
            time.sleep(2) # Fade to black final

        except Exception as e:
            print(f"❌ Erro na automação: {e}")
        finally:
            print("✅ Tour Cinematográfico concluído!")
            browser.close()

if __name__ == "__main__":
    record_cinematic_tour()
