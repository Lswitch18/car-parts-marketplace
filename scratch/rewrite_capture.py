import re

with open('agents/ai_directors/full_demo_capture.py', 'r') as f:
    content = f.read()

new_flows = """
def flow_landing_hero(page):
    \"\"\"Cena 0: Landing Page Hero 360\"\"\"
    page.goto(BASE_URL)
    _wait_loaded(page)
    page.wait_for_timeout(3000)
    page.mouse.wheel(0, 500)
    page.wait_for_timeout(4000)
    page.mouse.wheel(0, 600)
    page.wait_for_timeout(4000)
    page.mouse.wheel(0, 800)
    page.wait_for_timeout(4000)
    page.mouse.wheel(0, -1900)
    page.wait_for_timeout(4000)

def flow_register(page):
    \"\"\"Cena 1: Cadastro e Google Auth.\"\"\"
    page.goto(f"{BASE_URL}/register")
    _wait_loaded(page)
    page.wait_for_timeout(3000)
    
    # Preencher formulário lentamente
    page.fill("input[placeholder='Seu nome']", "Tanaka Hiroshi")
    page.wait_for_timeout(1000)
    page.fill("input[placeholder='seu@email.com']", "tanaka@daig.jp")
    page.wait_for_timeout(1000)
    page.fill("input[type='password']", "daig2026")
    page.wait_for_timeout(1500)
    
    page.mouse.wheel(0, 300)
    page.wait_for_timeout(2000)
    
    try:
        page.click("text=Comprador", timeout=2000)
        page.wait_for_timeout(2000)
    except: pass
    
    # Simula Google Auth
    page.mouse.wheel(0, -300)
    page.wait_for_timeout(2000)
    try:
        btn = page.query_selector("button:has-text('Google')")
        if btn:
            btn.hover()
            page.wait_for_timeout(2000)
            btn.click(timeout=2000)
            page.wait_for_timeout(3000)
    except: pass
    
    # Após login (simulado no script com inject_auth na proxima cena, ou forçando localstorage aqui)
    page.evaluate('''
      window.localStorage.setItem("mock_auth_for_video", "true");
      window.localStorage.setItem("auth-storage", JSON.stringify({
        state: { isAuthenticated: true, user: { id: "demo-user", role: "buyer" } },
        version: 0
      }));
    ''')
    page.goto(f"{BASE_URL}/home")
    _wait_loaded(page)
    page.wait_for_timeout(4000)


def flow_home(page):
    \"\"\"Cena 2: Tela inicial logada.\"\"\"
    page.goto(f"{BASE_URL}/home")
    _wait_loaded(page)
    page.wait_for_timeout(3000)
    page.mouse.wheel(0, 300)
    page.wait_for_timeout(4000)
    page.mouse.wheel(0, 400)
    page.wait_for_timeout(4000)
    page.mouse.wheel(0, -700)
    page.wait_for_timeout(4000)


def flow_catalog(page):
    \"\"\"Cena 3: Catálogo.\"\"\"
    page.goto(f"{BASE_URL}/catalog")
    _wait_loaded(page)
    page.wait_for_timeout(3000)
    page.mouse.wheel(0, 400)
    page.wait_for_timeout(3000)
    
    # Filtrar
    try:
        page.click("text=Honda", timeout=3000)
        page.wait_for_timeout(3000)
        page.click("text=Honda", timeout=3000) # untoggle
        page.wait_for_timeout(2000)
    except: pass
    
    page.mouse.wheel(0, 400)
    page.wait_for_timeout(3000)
    page.mouse.wheel(0, 500)
    page.wait_for_timeout(3000)
    page.mouse.wheel(0, -1000)
    page.wait_for_timeout(3000)


def flow_product_detail(page):
    \"\"\"Cena 4: Detalhe do Produto.\"\"\"
    PRODUCT_ID = '5d1df2a3-9d7a-478b-9b22-34183607f061'
    page.goto(f"{BASE_URL}/product/{PRODUCT_ID}")
    _wait_loaded(page)
    page.wait_for_timeout(4000)
    page.mouse.wheel(0, 400)
    page.wait_for_timeout(4000)
    page.mouse.wheel(0, 500)
    page.wait_for_timeout(4000)
    page.mouse.wheel(0, 500)
    page.wait_for_timeout(4000)
    page.mouse.wheel(0, -1400)
    page.wait_for_timeout(3000)


def flow_create_listing(page):
    \"\"\"Cena 5: Upload IA.\"\"\"
    page.goto(f"{BASE_URL}/create-listing")
    _wait_loaded(page)
    page.wait_for_timeout(3000)
    page.mouse.wheel(0, 300)
    page.wait_for_timeout(2000)
    try:
        page.set_input_files("input[type='file']", "public/mock_engine.jpg")
        page.wait_for_timeout(3000)
        
        try:
            btn = page.query_selector("button:has-text('IA'), button:has-text('AI')")
            if btn: btn.click()
        except: pass
        
        page.wait_for_timeout(6000)
    except: pass
    page.mouse.wheel(0, 300)
    page.wait_for_timeout(3000)
    page.mouse.wheel(0, 400)
    page.wait_for_timeout(3000)


def flow_messages(page):
    \"\"\"Cena 6: Chat de Negociação.\"\"\"
    def route_messages(route):
        if route.request.method == "GET":
            mock_msgs = [
                {"id": "1", "sender_id": "other-user", "content": "Olá, a peça está disponível?", "created_at": "2026-01-01T10:00:00Z"},
                {"id": "2", "sender_id": "demo-user-123", "content": "Sim, original e revisada. Aceito negociar.", "created_at": "2026-01-01T10:05:00Z"}
            ]
            import json
            route.fulfill(status=200, content_type="application/json", body=json.dumps(mock_msgs))
        else:
            route.continue_()
            
    def route_profiles(route):
        if route.request.method == "GET":
            import json
            mock_profile = {"id": "other-user", "full_name": "Kenji Sato", "avatar_url": None}
            route.fulfill(status=200, content_type="application/json", body=json.dumps(mock_profile))
        else:
            route.continue_()

    page.route("**/rest/v1/messages*", route_messages)
    page.route("**/rest/v1/profiles*", route_profiles)

    page.goto(f"{BASE_URL}/messages?user=other-user")
    _wait_loaded(page)
    page.wait_for_timeout(4000)
    
    try:
        chat_input = page.query_selector("input[type='text']")
        if chat_input:
            chat_input.click()
            page.wait_for_timeout(1000)
            chat_input.type("Se fechar pelo sistema agora, consigo fazer 47,000 JPY com frete.", delay=60)
            page.wait_for_timeout(2000)
            page.keyboard.press("Enter")
            page.wait_for_timeout(4000)
    except: pass
    
    page.mouse.wheel(0, 300)
    page.wait_for_timeout(4000)


def flow_checkout(page):
    \"\"\"Cena 7: Stripe Checkout (Destaque T+4).\"\"\"
    PRODUCT_ID = '5d1df2a3-9d7a-478b-9b22-34183607f061'
    page.goto(f"{BASE_URL}/checkout/{PRODUCT_ID}")
    _wait_loaded(page)
    page.wait_for_timeout(4000)
    
    page.mouse.wheel(0, 400)
    page.wait_for_timeout(3000)
    
    page.evaluate('''() => {
        const btn = document.querySelector("button[type='submit']");
        if (btn && btn.parentElement) {
            const badge = document.createElement("div");
            badge.innerHTML = "🔒 <b>Pagamento Seguro Escrow (Liquidação T+4)</b>";
            badge.style.cssText = "background: rgba(0, 229, 255, 0.15); color: #00E5FF; padding: 12px 16px; border-radius: 8px; border: 1px solid #00E5FF; margin-bottom: 16px; font-size: 14px; text-align: center; font-family: sans-serif;";
            btn.parentElement.insertBefore(badge, btn);
        }
    }''')
    
    page.wait_for_timeout(4000)
    
    try:
        stripe_btn = page.query_selector("button[type='submit']")
        if stripe_btn:
            stripe_btn.hover()
            page.wait_for_timeout(3000)
    except: pass
    
    page.mouse.wheel(0, 300)
    page.wait_for_timeout(4000)
"""

content = re.sub(r'def flow_landing_hero\(page\):.*?(?=def merge_videos)', new_flows + '\n\n', content, flags=re.DOTALL)

with open('agents/ai_directors/full_demo_capture.py', 'w') as f:
    f.write(content)
