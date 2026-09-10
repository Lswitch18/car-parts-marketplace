import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager

def run_site_test():
    print("🚀 Iniciando teste de site com Selenium...")

    # Configurações do Chrome (Headless para rodar em background/servidores)
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--window-size=1920,1080")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--no-sandbox")

    # Inicializa o driver do Chrome via webdriver_manager (baixa o driver compatível automaticamente)
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=chrome_options)

    try:
        # 1. Acessa a página da apresentação local
        test_url = "http://localhost:5173/presentation"
        print(f"🌐 Navegando para: {test_url}")
        driver.get(test_url)

        # 2. Aguarda até o título da página carregar corretamente
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.TAG_NAME, "h1"))
        )

        # 3. Teste básico: Verifica o título da página
        page_title = driver.title
        print(f"📄 Título da Página lido: '{page_title}'")
        
        # O título padrão costuma ser definido no index.html (ex: Vite App ou DAIG...)
        assert "DAIG" in page_title or "Vite" in page_title, "O título esperado não foi encontrado!"

        # 4. Procura pelo componente principal da página de apresentação (Hero Section)
        print("🔍 Verificando se a Hero Section e o botão de CTA carregaram...")
        # Use CSS selector for more robust matching of the button class
        cta_button = WebDriverWait(driver, 15).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, ".hero-cta"))
        )
        
        print("✅ Elementos críticos carregados com sucesso!")

        # Simula um clique de teste via JavaScript (ignora overlays transparentes ou animações do GSAP)
        print("🖱️ Simulando clique no botão...")
        driver.execute_script("arguments[0].click();", cta_button)
        
        # Aguarda a animação de scroll
        time.sleep(2)
        
        # Tira uma screenshot para evidência do teste
        screenshot_path = "evidencia_teste_selenium.png"
        driver.save_screenshot(screenshot_path)
        print(f"📸 Screenshot salva em: {screenshot_path}")

        print("🎉 Teste End-to-End (E2E) com Selenium finalizado com sucesso!")

    except Exception as e:
        print(f"❌ Erro durante o teste: {e}")
    finally:
        # Sempre fechar o navegador ao final do teste
        print("🛑 Fechando o navegador...")
        driver.quit()

if __name__ == "__main__":
    run_site_test()
