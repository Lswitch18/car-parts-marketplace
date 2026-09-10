import os
import time
import json
from playwright.sync_api import sync_playwright

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "public", "videos")
os.makedirs(OUTPUT_DIR, exist_ok=True)

def record_chat_buy_demo():
    print(f"🎬 Iniciando gravação do fluxo de Negociação e Compra (Chat -> Checkout)...")
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        
        context = browser.new_context(
            viewport={"width": 1920, "height": 1080},
            record_video_dir=OUTPUT_DIR,
            record_video_size={"width": 1920, "height": 1080},
            device_scale_factor=1.0
        )
        
        page = context.new_page()
        page.on('console', lambda msg: print('Browser:', msg.text))
        
        # Interceptar chamadas REST do Supabase para injetar a conversa
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
                        "images": ["/demo-engine.jpg"]
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
            else:
                route.continue_()

        page.route("**/rest/v1/*", handle_supabase_rest)

        try:
            print("🎥 Acesso Inicial e Auth Bypass")
            page.goto("http://localhost:5173/", wait_until="domcontentloaded")
            time.sleep(1)
            
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
            
            # Vai direto para o chat
            page.goto("http://localhost:5173/messages", wait_until="domcontentloaded")
            time.sleep(3)
            
            print("💬 Injetando conversa simulada...")
            # Clicar na conversa injetada
            try:
                page.locator('.w-full.text-left.p-4, [role="button"], button').nth(1).click(timeout=3000)
                time.sleep(2)
            except Exception as e:
                print("⚠️ Falha ao clicar na conversa mockada:", e)

            # Scroll no chat para ver a mensagem aceita e o botão
            page.mouse.wheel(0, 300)
            time.sleep(2)

            print("🛍️ Clicando em Ir para Pagamento...")
            try:
                page.locator("text=Ir para Pagamento").click(timeout=3000)
            except Exception:
                page.goto("http://localhost:5173/checkout/part-001?price=420000", wait_until="domcontentloaded")

            time.sleep(3)
            
            print("🖱️ Visualizando Checkout...")
            for _ in range(4):
                page.mouse.wheel(0, 300)
                time.sleep(1)
                
            print("✅ Concluído!")

        except Exception as e:
            print(f"❌ Erro durante gravação: {e}")
        finally:
            page.close()
            context.close()
            browser.close()
            print("💾 Finalizado.")

if __name__ == "__main__":
    record_chat_buy_demo()
