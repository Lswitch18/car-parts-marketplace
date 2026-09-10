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
            
            # ========================================================
            # CENA 2: Catálogo Inteligente
            # ========================================================
            print("🎥 CENA 2: Catálogo de Peças (Navegando)")
            page.goto("http://localhost:5173/catalog", wait_until="networkidle")
            time.sleep(2)
            
            # Scroll no catálogo simulando interesse
            print("🖱️ Rolando pelo Catálogo...")
            for _ in range(4):
                page.mouse.wheel(0, 300)
                time.sleep(0.5)
            time.sleep(1)

            # Sobe um pouco para ver os botões no header ou painel
            page.mouse.wheel(0, -600)
            time.sleep(1)

            # ========================================================
            # CENA 3: Criação de Anúncio IA (Clicando)
            # ========================================================
            print("🎥 CENA 3: Criação de Anúncio IA (Clicando no botão Anunciar Peça)")
            try:
                # O usuário pediu para o robô clicar para criar o anúncio!
                # Move o mouse para simular a intenção
                page.mouse.move(1920 // 2, 1080 // 4, steps=15)
                # Clica no botão "Anunciar Peça" (seja no Header ou no Catálogo)
                page.locator("text=Anunciar Peça").first.click()
            except:
                page.goto("http://localhost:5173/create-listing")
                
            time.sleep(3)
            time.sleep(2)
            
            # Simula tentar usar os botões de Preço Fixo vs Leilão
            try:
                page.locator("text=Leilão Ao Vivo").click(timeout=3000)
                time.sleep(1.5)
                page.locator("text=Preço Fixo").click(timeout=3000)
                time.sleep(1.5)
            except Exception as e:
                pass

            print("🖱️ Rolando pela tela de Anúncio...")
            for _ in range(3):
                page.mouse.wheel(0, 300)
                time.sleep(0.5)
            time.sleep(1)

            # ========================================================
            # CENA 4: Chat e Negociação (Clicando e Digitando)
            # ========================================================
            print("🎥 CENA 4: Chat e Negociação (Navegando para as mensagens)")
            try:
                # Vamos forçar a navegação pro link do chat no Header
                page.locator('a[href="/messages"]').first.click()
            except:
                page.goto("http://localhost:5173/messages")
            
            time.sleep(3)
            time.sleep(2)
            
            # Movendo mouse pela interface de chat e digitando!
            print("💬 Digitando mensagem no Chat...")
            page.mouse.move(1920 // 2, 1080 // 2, steps=15)
            
            # Clica no meio da tela para focar e digita como se fosse no input do chat
            page.mouse.click(1920 // 2, 1080 // 2)
            time.sleep(1)
            # Usa o teclado para simular que encontrou o input (ou se não tiver focado, é apenas demonstrativo)
            try:
                # Tenta focar no input real se achar um placeholder comum
                page.locator('textarea, input[type="text"]').first.click(timeout=2000)
            except:
                pass
                
            page.keyboard.type("Olá, estou muito interessado nesse motor SR20DET. Aceita oferta?", delay=50)
            time.sleep(1)
            # Tenta clicar no botão de enviar (se for de icone, bater ENTER resolve a simulação visual)
            page.keyboard.press("Enter")
            time.sleep(2)

            # ========================================================
            # CENA 5: Fluxo de Pagamento
            # ========================================================
            print("🎥 CENA 5: Fluxo de Checkout (/checkout/demo)")
            page.goto("http://localhost:5173/checkout/demo", wait_until="networkidle")
            time.sleep(3)
            
            print("🖱️ Visualizando Checkout...")
            for _ in range(2):
                page.mouse.wheel(0, 200)
                time.sleep(0.5)
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
