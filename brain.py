# ==============================================================================
# BLUEPRINT DO PIPELINE DE ANÁLISE DE IA DO GAID
# Este arquivo serve como referência de arquitetura, prompts e fluxos do backend.
# ==============================================================================

import subprocess
import threading
import time
import nest_asyncio
import uvicorn
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class RequestData(BaseModel):
    image: str       # Imagem em base64
    language: str    # Idioma de retorno (pt, en, ja)
    vin: str = None  # Número de chassi/VIN opcional para validação cruzada

@app.post("/analyze")
async def analyze_part(data: RequestData):
    print(f"Nova requisição recebida! Chassi informado: {data.vin}")
    
    # --------------------------------------------------------------------------
    # FASE 1: VISÃO COMPUTACIONAL REDUNDANTE (Qwen3-VL + Gemini 3.5 Flash)
    # --------------------------------------------------------------------------
    # O Qwen3-VL faz a primeira análise. Se a confiança for menor que 95%,
    # o Gemini 3.5 Flash é acionado para dupla validação e concordância.
    
    # PROMPT DE VISÃO (Qwen3-VL & Gemini 3.5 Flash):
    prompt_vision = """
    Verifique se a imagem contém uma peça automotiva. Retorne APENAS um JSON estrito com os seguintes campos:
    {
      "is_car_part": boolean (true se a imagem contiver uma peça de carro, etiqueta/sticker de peça, motor, radiador ou componente automotivo, false caso contrário),
      "part_number": string | null (o código OEM, part number ou número de série impresso ou na etiqueta),
      "brand": string (a marca/fabricante do VEÍCULO compatível em lowercase, ex: toyota, honda, nissan. Se for de autopeças como Bosch/Denso, retorne a marca do carro em que ela é aplicada),
      "model": string (o modelo do CARRO/VEÍCULO compatível, ex: prius, aqua, fit, note. NÃO retorne o modelo da própria peça, retorne o nome do carro),
      "category": string,
      "title": string,
      "description": string (descrição técnica altamente detalhada. Você DEVE extrair e incluir especificações cruciais como amperagem/Ah, voltagem/V, CCA, dimensões e polaridade no caso de baterias. Além disso, DEVE listar as principais marcas e modelos de carros compatíveis conhecidos para esta peça, ex: compatível com Honda Fit, Toyota Prius, etc.),
      "estimated_price": number,
      "confidence_score": number
    }
    IMPORTANTE: Retorne os textos descritivos (title e description) no idioma com código especificado.
    """

    # --------------------------------------------------------------------------
    # FASE 2: DETALHAMENTO DE CATÁLOGO (Gemini 3.5 Flash)
    # --------------------------------------------------------------------------
    # Se um 'part_number' for detectado na Fase 1, o Gemini 3.5 Flash é consultado
    # para trazer especificações detalhadas do catálogo de autopeças.
    
    # PROMPT DO DETALHADOR DE CATÁLOGO (Gemini 3.5 Flash):
    prompt_scraper = """
    Você é um especialista em catálogos oficiais de autopeças.
    Sua missão é detalhar e validar em seu conhecimento o Part Number (Número OEM): "{part_number}" do fabricante "{brand}".

    Retorne APENAS um JSON válido e estrito contendo:
    {
      "found": boolean,
      "part_number": string (o código oficial),
      "brand": string (marca/fabricante do VEÍCULO compatível em lowercase, ex: toyota, honda, nissan),
      "model": string (modelo de CARRO/VEÍCULO compatível, ex: fit, aqua, prius. NÃO retorne o nome do modelo da própria peça),
      "category": string,
      "title": string,
      "description": string (descrição técnica extremamente detalhada e completa. Busque e inclua obrigatoriamente especificações cruciais como amperagem/Ah, voltagem/V, CCA, dimensões, polaridade e se suporta stop-start no caso de baterias. Além disso, DEVE listar de forma legível e clara os principais modelos de carros e marcas compatíveis conhecidos para esta peça, ex: compatível com Honda Fit, Toyota Prius, etc.),
      "estimated_price": number,
      "source_url": string | null
    }
    """

    # --------------------------------------------------------------------------
    # FASE 3: DECIFRADOR E CRUZAMENTO DE CHASSI (VIN DECODER)
    # --------------------------------------------------------------------------
    # Se o usuário fornecer o Chassi/VIN, o backend decodifica localmente a marca e ano.
    # Se a marca do chassi (ex: Honda) for compatível com a peça (mencionada na descrição ou marca),
    # o backend ajusta automaticamente a sugestão principal do formulário (ex: para Honda Fit/N-VAN) 
    # e evita o conflito de marca, marcando 95%+ de confiança!
    
    # Simulação da resposta da API
    import asyncio
    await asyncio.sleep(1)
    
    resultado_mock = {
        "is_car_part": True,
        "part_number": "023000-0670",
        "brand": "honda",
        "model": "N-VAN",
        "category": "cooling-system",
        "title": "Radiador Honda N-VAN (JJ1/JJ2)",
        "description": "Radiador de água original do motor fabricado pela DENSO compatível com Honda N-VAN (chassis JJ1/JJ2) de 660cc. Código OEM equivalente Honda: 19010-6F6-003.",
        "compatibility_tags": ["Honda N-VAN (2018-2024)", "Honda N-BOX (2017-2023)", "Honda N-WGN (2019-2023)"],
        "estimated_price": 12000,
        "confidence_score": 0.99,
        "source": "web_lookup"
    }
    return resultado_mock

# Iniciar o Cloudflare Tunnel em segundo plano para o Colab
def start_tunnel():
    process = subprocess.Popen(['cloudflared', 'tunnel', '--url', 'http://127.0.0.1:8000'], 
                               stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
    for line in iter(process.stdout.readline, b''):
        line_str = line.decode('utf-8')
        if "trycloudflare.com" in line_str:
            url = [word for word in line_str.split() if "trycloudflare.com" in word][0]
            print("\n" + "="*60)
            print(f"✅ SUA URL DO COLAB: {url}/analyze")
            print("Copie essa URL e coloque na variável QWEN_API_URL do Supabase")
            print("="*60 + "\n")

threading.Thread(target=start_tunnel, daemon=True).start()

# Subir a API FastAPI
nest_asyncio.apply()
if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)


# ==============================================================================
# REGISTRO DE ARQUITETURA E PROGRESSO DO PROJETO (Histórico de Alterações)
# ==============================================================================
# DATA: 13 de Julho de 2026
#
# 1. HOMOLOGAÇÃO DE CHECKOUT & ESCROW REAL (Stripe Connect):
#    - Checkout Dinâmico: Removido o parâmetro fixo 'payment_method_types[]': 'card' 
#      no endpoint /stripe-checkout para permitir formas locais JDM (Konbini/Furikomi).
#    - Escrow Nativo (Separate Charges & Transfers): Confirmado que o dinheiro das compras 
#      entra direto no saldo da plataforma (Stripe principal) com status 'escrow'. 
#      A liberação dos fundos líquidos (seller_net) para a conta do vendedor via /v1/transfers 
#      só ocorre quando o comprador confirma o recebimento (status 'completed' no PUT).
#
# 2. ALINHAMENTO DE BANCO DE DADOS:
#    - Adicionada a coluna faltante 'stripe_payment_id' na tabela 'transactions' via script 
#      de migração 'stripe-checkout-fix.sql' para garantir integridade dos IDs de Checkout.
#
# 3. VERIFICAÇÃO DE FLUXOS:
#    - Simulação completa do fluxo de compra (7 fases) realizada com sucesso via 
#      script automatizado 'scripts/test_purchase_flow.mjs' (DB, Webhooks, Chats e Escrow).
#
# 4. CORREÇÃO DE MÉTRICAS NO ADMIN:
#    - O painel de controle (AdminDashboard.tsx) foi corrigido para usar a correta 
#      mapeação do banco (amount, payment_status, fulfillment_status) ao consolidar o 
#      GMV, Custódia Escrow e Pedidos Ativos, eliminando a exibição de dados zerados.
#
# 5. DOCUMENTAÇÃO:
#    - Relatório consolidado em Markdown e PDF gerado e salvo em:
#      docs/RELATORIO_DE_FLUXOS_E_VERIFICACAO_SEGURANCA-SAST.md
#      docs/RELATORIO_DE_FLUXOS_E_VERIFICACAO_SEGURANCA-SAST.pdf
#
# 6. SUPORTE A MÉTODOS DO JAPÃO (KONBINI/APPLE PAY/GOOGLE PAY) & RESEND:
#    - Adicionada a coluna 'currency' na tabela 'transactions' (20260721_add_currency_to_transactions.sql) para suporte pleno a JPY.
#    - Stripe Checkout integrado com Payment Method Configuration ID ('pmc_1O8JCnHLdM') para forçar métodos locais do Japão.
#    - Suporte ao ciclo de vida assíncrono do Konbini no 'stripe-webhook' (checkout.session.async_payment_succeeded e async_payment_failed).
#    - Disparo automático de e-mails transacionais via API do Resend (/notifications) para pagamentos pendentes, confirmações de venda e cancelamentos por expiração.
#    - Refatoração dos utilitários do Painel Administrativo ('dashboardUtils.ts') e homologação de suíte de testes unitários com 100% de aprovação (154/154 testes passando).
# ==============================================================================
