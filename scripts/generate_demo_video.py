import os
import time
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
        
        try:
            # ========================================================
            # CENA 1: Landing Page e Auth Bypass
            # ========================================================
            print("🎥 CENA 1: Acesso Inicial e Bypass do Zustand Auth")
            page.goto("http://localhost:5173/", wait_until="networkidle")
            time.sleep(2)
            
            # Navega um pouco pela home para mostrar a apresentação
            for _ in range(3):
                page.mouse.wheel(0, 300)
                time.sleep(0.5)
            
            # Injeta o Bypass no Zustand
            print("🔓 Aplicando Auth Bypass via localStorage (Zustand)...")
            mock_user = """
            {
                "state": {
                    "user": {
                        "id": "mock-ai-user",
                        "email": "demo@daig.jp",
                        "role": "vendor",
                        "onboarding_completed": true
                    },
                    "isAdmin": false,
                    "initialized": true,
                    "loading": false
                },
                "version": 0
            }
            """
            # Store it in localStorage under the assumed Zustand persist key
            # Assuming the store might use 'auth-storage' or similar. We will just use page.goto to trigger reload
            page.evaluate(f"window.localStorage.setItem('auth-storage', JSON.stringify({mock_user}));")
            
            # ========================================================
            # CENA 2: Catálogo Inteligente
            # ========================================================
            print("🎥 CENA 2: Catálogo de Peças")
            page.goto("http://localhost:5173/catalog", wait_until="networkidle")
            time.sleep(3)
            
            # Scroll no catálogo simulando interesse em uma peça
            print("🖱️ Rolando pelo Catálogo...")
            for _ in range(6):
                page.mouse.wheel(0, 250)
                time.sleep(0.4)
            time.sleep(1)

            # ========================================================
            # CENA 3: Criação de Anúncio IA
            # ========================================================
            print("🎥 CENA 3: Criação de Anúncio IA (/create-listing)")
            page.goto("http://localhost:5173/create-listing", wait_until="networkidle")
            time.sleep(3)
            
            # Interação com a interface
            try:
                page.locator("text=Leilão Ao Vivo").click(timeout=3000)
                time.sleep(1.5)
                page.locator("text=Preço Fixo").click(timeout=3000)
                time.sleep(1.5)
            except Exception as e:
                print("Elemento de IA não encontrado, prosseguindo fluxo visual...")

            print("🖱️ Rolando pela tela de Anúncio e visualizando IA...")
            for _ in range(4):
                page.mouse.wheel(0, 300)
                time.sleep(0.5)
            time.sleep(2)

            # ========================================================
            # CENA 4: Chat e Negociação
            # ========================================================
            print("🎥 CENA 4: Chat e Negociação (/messages)")
            page.goto("http://localhost:5173/messages", wait_until="networkidle")
            time.sleep(3)
            
            # Movendo mouse pela interface de chat
            page.mouse.move(1920 // 4, 1080 // 3, steps=30)
            time.sleep(2)
            page.mouse.move(1920 // 2, 1080 // 2, steps=30)
            time.sleep(2)

            # ========================================================
            # CENA 5: Fluxo de Pagamento
            # ========================================================
            print("🎥 CENA 5: Fluxo de Checkout (/checkout/demo)")
            # Vamos para uma URL simulada de checkout
            page.goto("http://localhost:5173/checkout/demo", wait_until="networkidle")
            time.sleep(3)
            
            print("🖱️ Visualizando Checkout de Custódia...")
            for _ in range(2):
                page.mouse.wheel(0, 200)
                time.sleep(0.5)
            time.sleep(2)

            print("✅ Coreografia concluída com sucesso!")

        except Exception as e:
            print(f"❌ Erro durante o fluxo de gravação: {e}")
        
        finally:
            print("💾 Finalizando gravação e fechando o navegador...")
            # Fechar a page e o context vai gerar o .webm
            page.close()
            context.close()
            browser.close()
            print(f"🎉 Vídeo completo gerado no diretório: {OUTPUT_DIR}/")

if __name__ == "__main__":
    record_full_ecosystem_demo()
