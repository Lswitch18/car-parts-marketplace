import os
import time
from playwright.sync_api import sync_playwright

class CaptureAgent:
    def __init__(self):
        self.base_url = "http://localhost:5173"
        # The Remotion CLI needs to read videos from the public directory
        self.output_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "remotion_studio", "public", "videos"))
        if not os.path.exists(self.output_dir):
            os.makedirs(self.output_dir)

    def _record_flow(self, name, flow_function):
        print(f"🎥 Iniciando captura da cena: {name}")
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            # 1920x1080 resolution for Enterprise Pitch
            context = browser.new_context(
                record_video_dir=self.output_dir,
                viewport={"width": 1920, "height": 1080}
            )
            page = context.new_page()
            
            # Auth bypass from authStore.ts (mock_auth_for_video)
            page.goto(self.base_url)
            page.evaluate("window.localStorage.setItem('mock_auth_for_video', 'true')")
            page.evaluate("window.localStorage.setItem('auth-storage', JSON.stringify({state: {isAuthenticated: true, user: {id: '123', name: 'Demo User', role: 'buyer', isVerified: true, email: 'demo@daig.jp', currency: 'JPY'}}, version: 0}))")
            page.reload()
            
            try:
                flow_function(page)
                # Extra 1 second to let final frames stabilize
                page.wait_for_timeout(1000)
            except Exception as e:
                print(f"❌ Erro ao capturar {name}: {e}")
            finally:
                video_path = page.video.path()
                context.close()
                browser.close()
                
                # Rename the randomly generated webm file
                if os.path.exists(video_path):
                    final_path = os.path.join(self.output_dir, f"{name}.webm")
                    if os.path.exists(final_path):
                        os.remove(final_path)
                    os.rename(video_path, final_path)
                    print(f"✅ Vídeo salvo em: {final_path}")

    def capture_all_scenes(self):
        self._record_flow("scene1_register", self._flow_register)
        self._record_flow("scene2_catalog", self._flow_catalog)
        self._record_flow("scene3_ai_upload", self._flow_ai_upload)
        self._record_flow("scene4_chat", self._flow_chat)
        self._record_flow("scene5_checkout", self._flow_checkout)

    # ==========================
    # FLUXOS DE INTERAÇÃO REAIS NO SITE
    # ==========================
    def _flow_register(self, page):
        # Go to home and simulate reading/registering, then jump to dashboard
        page.goto(f"{self.base_url}/")
        page.wait_for_timeout(1000)
        page.mouse.wheel(0, 700)
        page.wait_for_timeout(2000)
        page.goto(f"{self.base_url}/dashboard")
        page.wait_for_timeout(3000)
        
    def _flow_catalog(self, page):
        page.goto(f"{self.base_url}/catalog")
        page.wait_for_timeout(1500)
        # Scroll to show parts
        page.mouse.wheel(0, 500)
        page.wait_for_timeout(1500)
        page.mouse.wheel(0, -200)
        page.wait_for_timeout(2000)

    def _flow_ai_upload(self, page):
        # Simulate AI Scan page
        page.goto(f"{self.base_url}/sell")
        page.wait_for_timeout(1500)
        # We just hover or show the scanner area
        page.mouse.move(500, 500)
        page.wait_for_timeout(3000)

    def _flow_chat(self, page):
        # Open inbox
        page.goto(f"{self.base_url}/inbox")
        page.wait_for_timeout(2000)
        # Click on a message if it exists, or just show inbox layout
        page.mouse.wheel(0, 300)
        page.wait_for_timeout(2000)

    def _flow_checkout(self, page):
        # Go to auctions or checkout
        page.goto(f"{self.base_url}/auctions")
        page.wait_for_timeout(1500)
        page.mouse.wheel(0, 800)
        page.wait_for_timeout(3000)

if __name__ == "__main__":
    agent = CaptureAgent()
    agent.capture_all_scenes()
