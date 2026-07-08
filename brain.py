# 1. Instalar dependências necessárias
# !pip install fastapi uvicorn nest-asyncio pydantic
# !wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
# !dpkg -i cloudflared-linux-amd64.deb

import subprocess
import threading
import time
import nest_asyncio
import uvicorn
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class RequestData(BaseModel):
    prompt: str
    image: str # Imagem em base64

@app.post("/analyze")
async def analyze_part(data: RequestData):
    print("Chegou uma requisição!")
    
    # === FASE 1: VISÃO (OCR E CLASSIFICAÇÃO) ===
    # Utilizamos o Qwen3-VL (agora via OpenRouter) para ler a imagem.
    # NOVO PROMPT DE VISÃO:
    """
    Analise esta imagem de uma peça automotiva.
    Procure ativamente por números de série, OEM, códigos impressos ou em etiquetas na peça.
    Retorne um JSON estrito:
    {
      "is_car_part": boolean,
      "part_number": string | null, // NOVO: O código lido na peça
      "title": string,
      "brand": string,
      "category": string,
      "description": string,
      "estimated_price": number
    }
    """
    
    # === FASE 2: CATÁLOGO OFICIAL (WEB SCRAPER AI) ===
    # Se a Fase 1 retornar um 'part_number', nós disparamos uma segunda
    # chamada de IA (ex: Perplexity Sonar Online ou Gemini Flash) com acesso à internet.
    # NOVO PROMPT DE CATÁLOGO:
    """
    Você é um Web Scraper especializado em catálogos de autopeças (Bosch eCat, Denso, Honda, etc).
    Pesquise na sua base e na internet o Part Number (Número OEM): "{part_number}".
    Retorne APENAS um JSON:
    {
      "part_number": string,
      "brand": string,
      "model": string,
      "title": string,
      "category": string,
      "description": string,
      "estimated_price": number
    }
    """
    
    # Exemplo simulando a união das duas fases:
    import asyncio
    await asyncio.sleep(2) 
    
    resultado = '{"is_car_part": true, "part_number": "0280158117", "title": "Bico Injetor Bosch", "brand": "bosch", "category": "engine", "estimated_price": 450}'
    return {"content": resultado}

# 2. Iniciar o Cloudflare Tunnel em segundo plano
def start_tunnel():
    # Isso vai criar uma URL que aponta para a porta 8000
    process = subprocess.Popen(['cloudflared', 'tunnel', '--url', 'http://127.0.0.1:8000'], 
                               stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
    for line in iter(process.stdout.readline, b''):
        line_str = line.decode('utf-8')
        if "trycloudflare.com" in line_str:
            # Extrai e imprime apenas a URL pública
            url = [word for word in line_str.split() if "trycloudflare.com" in word][0]
            print("\n" + "="*60)
            print(f"✅ SUA URL DO COLAB: {url}/analyze")
            print("Copie essa URL e coloque na variável QWEN_API_URL do Supabase")
            print("="*60 + "\n")

threading.Thread(target=start_tunnel, daemon=True).start()

# 3. Subir a API FastAPI
nest_asyncio.apply()
if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
