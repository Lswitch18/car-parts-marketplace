import os
import time
from playwright.sync_api import sync_playwright

# Setup the output directory
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "videos_gerados")
os.makedirs(OUTPUT_DIR, exist_ok=True)

def record_presentation():
    print(f"🎬 Iniciando automação de gravação de vídeo (Playwright)...")
    
    with sync_playwright() as p:
        # Lança o Chromium. Em CI/CD ou WSL, rodar headless=True.
        # Estamos definindo o tamanho da janela para Full HD 1080p
        browser = p.chromium.launch(headless=True)
        
        # Cria um contexto que grava tudo que acontece na tela com alta qualidade
        context = browser.new_context(
            viewport={"width": 1920, "height": 1080},
            record_video_dir=OUTPUT_DIR,
            record_video_size={"width": 1920, "height": 1080},
            device_scale_factor=1.0
        )
        
        page = context.new_page()
        
        print("🌐 Acessando a página de apresentação: http://localhost:5173/presentation")
        page.goto("http://localhost:5173/presentation", wait_until="networkidle")
        
        # Espera um pouco para garantir que todos os elementos, fontes (SplitText) 
        # e o vídeo de background tenham carregado
        time.sleep(3)
        print("✅ Página carregada. Iniciando fluxo cinemático de navegação...")

        # Movemos o cursor de forma suave no início (opcional)
        page.mouse.move(1920 // 2, 1080 // 2, steps=25)
        
        # Passo 1: Esperar na Hero Section para visualização (3 segundos)
        time.sleep(3)
        
        # Passo 2: Scroll suave em direção ao Módulo 1 (AI Features)
        # O Lenis no Frontend cuida da interpolação do mouse.wheel,
        # mas simularemos vários scrolls para não ser brusco.
        print("🖱️ Rolando para o Módulo 1...")
        for _ in range(12):
            page.mouse.wheel(0, 120)
            time.sleep(0.3)
            
        # Esperamos as animações (SplitText e Scale) do Módulo 1 rodarem
        time.sleep(4)
        
        # Passo 3: Movimentar o mouse como se estivesse focado na tela (Spotlight / Hover simulation)
        box = page.locator("text=Módulo 1").bounding_box()
        if box:
            print("👁️ Movendo cursor com foco sobre o módulo 1...")
            page.mouse.move(box["x"] + 20, box["y"] + 20, steps=40)
            time.sleep(1)

        # Passo 4: Scroll em direção ao Módulo 2 (SaaS Multi-tenant)
        print("🖱️ Rolando para o Módulo 2...")
        for _ in range(15):
            page.mouse.wheel(0, 150)
            time.sleep(0.3)
            
        time.sleep(4)
        
        # Passo 5: Movemos o cursor para o Módulo 2
        box_mod2 = page.locator("text=Módulo 2").bounding_box()
        if box_mod2:
            page.mouse.move(box_mod2["x"] + 20, box_mod2["y"] + 20, steps=40)
            time.sleep(2)
        
        # Conclusão e Salvamento
        print("💾 Navegação concluída. Salvando o arquivo de vídeo...")
        
        # Para que o vídeo seja consolidado e salvo, o context precisa ser fechado
        context.close()
        browser.close()
        
        print(f"🎉 Vídeo gravado com sucesso no diretório: {OUTPUT_DIR}/")

if __name__ == "__main__":
    record_presentation()
