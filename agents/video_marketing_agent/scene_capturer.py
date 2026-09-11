import os
import time
import json
import shutil
from playwright.sync_api import sync_playwright

BASE_URL = "http://localhost:4173"
RAW_DIR = os.path.join(os.path.dirname(__file__), "raw_clips")
os.makedirs(RAW_DIR, exist_ok=True)

def setup_mocks(page):
    page.evaluate("window.localStorage.setItem('daig-language', 'ja');")
    mock_user = """{ "state": { "user": { "id": "buyer-456", "email": "demo@daig.jp", "role": "buyer", "onboarding_completed": true, "shop_name": "" }, "isAdmin": false, "initialized": true, "loading": false }, "version": 0 }"""
    page.evaluate(f"window.localStorage.setItem('auth-storage', JSON.stringify({mock_user}));")
    page.evaluate("window.localStorage.setItem('mock_auth_for_video', 'true');")

def handle_ai(route):
    headers = {"Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "*", "Access-Control-Allow-Headers": "*"}
    if route.request.method == "OPTIONS":
        route.fulfill(status=204, headers=headers)
        return
    route.fulfill(status=200, headers=headers, content_type="application/json", body=json.dumps({
        "success": True, "data": {
            "title": "Nissan SR20DET Black Top Engine",
            "description": "Motor original Nissan SR20DET Black Top retirado de um 180SX Type X. Turbina original em perfeito estado. Compressão testada e garantida.",
            "category": "Motores", "suggested_price": 450000, "condition": "Usado - Excelente",
            "compatibility_tags": ["Nissan", "Silvia", "180SX", "S13", "SR20DET", "Drift"]
        }
    }))

def handle_dashboard(route):
    route.fulfill(status=200, headers={"Access-Control-Allow-Origin": "*"}, content_type="application/json", body=json.dumps({"success": True, "data": {"total_sales": 15420000, "active_listings": 42, "messages_unread": 5}}))

def capture_scene(browser, scene_name, action_fn):
    print(f"🎥 Gravando cena bruta: {scene_name}...")
    context = browser.new_context(
        viewport={"width": 1920, "height": 1080},
        record_video_dir=RAW_DIR,
        record_video_size={"width": 1920, "height": 1080},
        device_scale_factor=1.0
    )
    page = context.new_page()
    page.add_init_script("""
        document.addEventListener('DOMContentLoaded', () => {
            const style = document.createElement('style');
            style.innerHTML = `
                .animate-spin { display: none !important; opacity: 0 !important; }
                .daig-cursor { position: fixed; top: -100px; left: -100px; width: 30px; height: 42px; z-index: 2147483647; pointer-events: none; transition: transform 0.1s; filter: drop-shadow(0px 0px 8px rgba(0,229,255,0.8)); }
                .daig-ripple { position: absolute; border-radius: 50%; border: 3px solid #00E5FF; background: rgba(0,229,255,0.4); animation: ripple 0.7s cubic-bezier(0, 0, 0.2, 1) forwards; pointer-events: none; z-index: 2147483646; }
                @keyframes ripple { 0% { width: 0; height: 0; opacity: 1; margin-top: 0; margin-left: 0; } 100% { width: 80px; height: 80px; opacity: 0; margin-top: -40px; margin-left: -40px; } }
            `;
            document.head.appendChild(style);
            
            const cursor = document.createElement('div');
            cursor.className = 'daig-cursor';
            cursor.innerHTML = '<svg width="30" height="42" viewBox="0 0 24 36" fill="none"><path d="M5.4 33.6L0 0L24 16.8L13.8 19.8L18.6 30L13.2 32.4L8.4 22.2L5.4 33.6Z" fill="#00E5FF" stroke="#020617" stroke-width="2"/></svg>';
            document.body.appendChild(cursor);
            
            document.addEventListener('mousemove', e => {
                cursor.style.left = e.clientX + 'px';
                cursor.style.top = e.clientY + 'px';
            });
            document.addEventListener('mousedown', e => { 
                cursor.style.transform = 'scale(0.7)';
                const ripple = document.createElement('div'); ripple.className = 'daig-ripple';
                ripple.style.left = e.clientX + 'px'; ripple.style.top = e.clientY + 'px';
                document.body.appendChild(ripple);
                setTimeout(() => ripple.remove(), 700);
            });
            document.addEventListener('mouseup', () => cursor.style.transform = 'scale(1)');
        });
    """)
    page.route("**/analyze-part*", handle_ai)
    page.route("**/analytics/all*", handle_dashboard)
    
    # Initialize page to setup localstorage
    page.goto(BASE_URL, wait_until="domcontentloaded")
    setup_mocks(page)
    
    action_fn(page)
    
    # Close context to save video
    page.wait_for_timeout(1000)
    video_path = page.video.path()
    context.close()
    
    final_path = os.path.join(RAW_DIR, f"{scene_name}.webm")
    if os.path.exists(final_path):
        os.remove(final_path)
    shutil.move(video_path, final_path)
    print(f"✅ Cena salva: {final_path}")

def smooth_click(page, locator):
    box = locator.bounding_box()
    if box:
        x = box["x"] + box["width"] / 2
        y = box["y"] + box["height"] / 2
        page.mouse.move(x, y, steps=25)
        time.sleep(0.3)
        page.mouse.click(x, y)
    else:
        locator.click(timeout=3000, force=True)

def run_captures():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        
        # 1. Hero
        def scene_hero(page):
            page.goto(f"{BASE_URL}/", wait_until="networkidle")
            time.sleep(1)
            for _ in range(2):
                page.mouse.wheel(0, 300)
                time.sleep(1)
        capture_scene(browser, "scene1_hero", scene_hero)
        
        # 2. Dashboard
        def scene_dash(page):
            page.goto(f"{BASE_URL}/admin", wait_until="networkidle")
            page.mouse.move(960, 540, steps=20)
            time.sleep(3)
        capture_scene(browser, "scene2_dash", scene_dash)
        
        # 3. Catalog
        def scene_cat(page):
            page.goto(f"{BASE_URL}/catalog", wait_until="networkidle")
            time.sleep(1)
            inp = page.locator('input[type="text"]').first
            smooth_click(page, inp)
            page.keyboard.type("SR20DET", delay=150)
            page.keyboard.press("Enter")
            time.sleep(2)
        capture_scene(browser, "scene3_catalog", scene_cat)
        
        # 4. AI Upload
        def scene_ai(page):
            page.goto(f"{BASE_URL}/create-listing", wait_until="networkidle")
            time.sleep(1)
            file_input = page.locator('input[type="file"]').first
            file_input.set_input_files(os.path.join(os.path.dirname(__file__), "..", "..", "public", "images", "jdm_engine.jpg"))
            time.sleep(1)
            btn = page.locator('button.group').first
            if btn.is_visible(): smooth_click(page, btn)
            else: page.evaluate("document.querySelector('button.group').click()")
            page.mouse.wheel(0, 400)
            time.sleep(3)
        capture_scene(browser, "scene4_ai", scene_ai)

        # 5. Checkout
        def scene_checkout(page):
            page.goto(f"{BASE_URL}/checkout/part-001?price=420000", wait_until="networkidle")
            time.sleep(1.5)
            page.mouse.wheel(0, 300)
            time.sleep(1)
            try:
                page.evaluate("""
                    const btn = Array.from(document.querySelectorAll('button')).find(b => b.className.includes('bg-gradient-to-r'));
                    if(btn){
                        btn.disabled = false;
                        const rect = btn.getBoundingClientRect();
                        document.querySelector('.daig-cursor').style.left = (rect.left+rect.width/2) + 'px';
                        document.querySelector('.daig-cursor').style.top = (rect.top+rect.height/2) + 'px';
                        setTimeout(() => btn.click(), 500);
                    }
                """)
                time.sleep(2)
            except: pass
        capture_scene(browser, "scene5_checkout", scene_checkout)
        
        browser.close()

if __name__ == "__main__":
    run_captures()
