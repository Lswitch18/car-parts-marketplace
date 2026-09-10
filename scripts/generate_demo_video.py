import os
import time
import json
from playwright.sync_api import sync_playwright

# Setup the output directory (public/videos for site usage)
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "public", "videos")
os.makedirs(OUTPUT_DIR, exist_ok=True)

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
        
        # Mock da API de Inteligência Artificial para gerar o Motor instantaneamente no vídeo!
        def handle_ai(route):
            print("🤖 Interceptando chamada de IA e injetando SR20DET Mock...")
            route.fulfill(
                status=200,
                content_type="application/json",
                body=json.dumps({
                    "title": "Nissan SR20DET Black Top Engine",
                    "description": "Motor original Nissan SR20DET Black Top retirado de um 180SX Type X. Turbina original em perfeito estado. Compressão testada e garantida.",
                    "category": "Motores",
                    "suggested_price": 450000,
                    "condition": "Usado - Excelente",
                    "compatibility_tags": ["Nissan", "Silvia", "180SX", "S13", "SR20DET", "Drift"]
                })
            )
        
        page.route("**/analyze-part*", handle_ai)
        page.route("**/analyze-part", handle_ai)
        
        try:
            # ========================================================
            # CENA 1: Landing Page e Auth Bypass
            # ========================================================
            print("🎥 CENA 1: Acesso Inicial e Bypass do Zustand Auth")
            page.goto("http://localhost:5173/")
            time.sleep(2)
            
            # Injeta o Bypass no Zustand para não sermos bloqueados em rotas protegidas
            print("🔓 Aplicando Auth Bypass via localStorage (Zustand)...")
            mock_user = """
            {
                "state": {
                    "user": {
                        "id": "mock-ai-user",
                        "email": "demo@daig.jp",
                        "role": "vendor",
                        "onboarding_completed": true,
                        "shop_name": "JDM Demo Garage"
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
            page.reload(wait_until="networkidle")
            
            # ========================================================
            # CENA 2: Catálogo Inteligente
            # ========================================================
            print("🎥 CENA 2: Catálogo de Peças (Navegando)")
            page.goto("http://localhost:5173/catalog")
            time.sleep(2)
            
            # Scroll no catálogo simulando interesse
            print("🖱️ Rolando pelo Catálogo...")
            for _ in range(4):
                page.mouse.wheel(0, 300)
                time.sleep(0.8)
            time.sleep(1)

            # Sobe um pouco para ver os botões no header
            page.mouse.wheel(0, -1000)
            time.sleep(1)

            # ========================================================
            # CENA 3: Criação de Anúncio IA (Clicando e Fazendo Upload)
            # ========================================================
            print("🎥 CENA 3: Criação de Anúncio IA (Upload Real do Motor SR20DET)")
            page.goto("http://localhost:5173/create-listing")
            time.sleep(4)
            print("URL Atual:", page.url)
            
            print("🖼️ Fazendo upload do motor...")
            engine_path = os.path.join(os.path.dirname(__file__), "..", "public", "demo-engine.jpg")
            try:
                # O Input de arquivo pode estar escondido, então forçamos o set_input_files
                page.set_input_files('input[type="file"]', engine_path, timeout=5000)
                print("✅ Upload concluído. Aguardando IA...")
            except Exception as e:
                print("❌ Falha ao achar input de arquivo:", e)
                page.screenshot(path="/home/lswitch/.gemini/antigravity-ide/brain/cfe3c060-601f-4fa7-8acb-6af4c1ab5f3f/scratch/debug_scene3.png")
                
            # Dá tempo para o visual da IA carregando acontecer na tela e os campos preencherem
            time.sleep(5)

            print("🖱️ Visualizando Anúncio Preenchido...")
            for _ in range(3):
                page.mouse.wheel(0, 300)
                time.sleep(1)
            time.sleep(1)

            # ========================================================
            # CENA 4: Chat e Negociação (Navegando e Digitando)
            # ========================================================
            print("🎥 CENA 4: Chat e Negociação")
            page.goto("http://localhost:5173/messages")
            time.sleep(4)
            print("URL Atual:", page.url)
            
            print("💬 Selecionando conversa...")
            try:
                # Clica na primeira conversa da lista para abrir o chat
                page.locator('.w-full.text-left.p-4, [role="button"], button').nth(1).click(timeout=3000)
                time.sleep(2)
            except Exception as e:
                print("⚠️ Falha ao clicar na conversa:", e)
            
            print("💬 Digitando mensagem no Chat de forma realista...")
            try:
                # Foca no input e digita devagar
                page.locator('input[type="text"][placeholder*="Digite"], input[placeholder*="message"], textarea').first.click(timeout=3000)
                time.sleep(0.5)
                page.keyboard.type("こんにちは！SR20DETエンジンに興味があります。少しお値下げ可能でしょうか？", delay=80)
                time.sleep(1)
                page.keyboard.press("Enter")
            except Exception as e:
                print("💬 Input não encontrado, simulando clique visual:", e)
                page.screenshot(path="/home/lswitch/.gemini/antigravity-ide/brain/cfe3c060-601f-4fa7-8acb-6af4c1ab5f3f/scratch/debug_scene4.png")
                
            time.sleep(3)

            # ========================================================
            # CENA 5: Fluxo de Pagamento
            # ========================================================
            print("🎥 CENA 5: Fluxo de Checkout (/checkout/demo)")
            page.goto("http://localhost:5173/checkout/demo")
            time.sleep(3)
            
            print("🖱️ Visualizando Checkout Seguro...")
            for _ in range(3):
                page.mouse.wheel(0, 250)
                time.sleep(0.8)
            time.sleep(2)

            print("✅ Coreografia concluída com sucesso!")

        except Exception as e:
            print(f"❌ Erro durante o fluxo de gravação: {e}")
        
        finally:
            print("💾 Finalizando gravação e fechando o navegador...")
            page.close()
            context.close()
            browser.close()
            print(f"🎉 Vídeo completo gerado no diretório: {OUTPUT_DIR}/")

if __name__ == "__main__":
    record_full_ecosystem_demo()
