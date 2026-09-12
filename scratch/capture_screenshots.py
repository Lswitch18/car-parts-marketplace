from playwright.sync_api import sync_playwright
import os

BASE_URL = "http://localhost:5173"
OUT = "public/screenshots"
os.makedirs(OUT, exist_ok=True)

MOCK_SCRIPT = """
window.localStorage.setItem('mock_auth_for_video', 'true');
window.localStorage.setItem('auth-storage', JSON.stringify({
  state: {
    isAuthenticated: true,
    user: {
      id: '123', name: 'Tanaka Hiroshi', role: 'buyer',
      isVerified: true, email: 'tanaka@daig.jp',
      currency: 'JPY', onboarding_completed: true
    }
  }, version: 0
}));
"""

scenes = [
    ("home",     "/",        None,  "header h1"),
    ("catalog",  "/catalog", None,  "h1"),
    ("product",  "/product", None,  None),
    ("messages", "/messages",None,  None),
    ("checkout", "/checkout/00000000-0000-0000-0000-000000000001", None, None),
]

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    context = browser.new_context(viewport={"width": 1440, "height": 900})
    
    # inject mock auth
    page = context.new_page()
    page.goto(BASE_URL)
    page.evaluate(MOCK_SCRIPT)
    page.wait_for_timeout(500)
    
    for name, path, wait_sel, fallback_sel in scenes:
        try:
            page.goto(f"{BASE_URL}{path}")
            # wait for spinner to disappear
            try:
                page.wait_for_selector(".animate-spin", state="hidden", timeout=12000)
            except:
                pass
            page.wait_for_timeout(2000)
            page.screenshot(path=f"{OUT}/{name}.jpg")
            print(f"✅ {name}: {OUT}/{name}.jpg")
        except Exception as e:
            print(f"❌ {name}: {e}")
    
    # Also capture catalog product grid after scroll
    try:
        page.goto(f"{BASE_URL}/catalog")
        try:
            page.wait_for_selector(".animate-spin", state="hidden", timeout=12000)
        except:
            pass
        page.wait_for_timeout(2000)
        page.screenshot(path=f"{OUT}/catalog_grid.jpg")
        print(f"✅ catalog_grid")
    except Exception as e:
        print(f"❌ catalog_grid: {e}")
    
    browser.close()

print("All done.")
