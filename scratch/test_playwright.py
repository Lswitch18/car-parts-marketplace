from playwright.sync_api import sync_playwright

def test():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto("http://localhost:5173")
        page.evaluate("window.localStorage.setItem('mock_auth_for_video', 'true')")
        page.evaluate("window.localStorage.setItem('auth-storage', JSON.stringify({state: {isAuthenticated: true, user: {id: '123', name: 'Demo User', role: 'buyer', isVerified: true, email: 'demo@daig.jp', currency: 'JPY'}}, version: 0}))")
        page.reload()
        page.wait_for_timeout(3000)
        page.screenshot(path="scratch/playwright_screenshot.jpg")
        browser.close()

if __name__ == "__main__":
    test()
