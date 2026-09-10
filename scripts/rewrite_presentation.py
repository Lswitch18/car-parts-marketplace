import os
import json
import requests
from dotenv import load_dotenv

load_dotenv()

OPENROUTER_KEY = os.getenv("VITE_OPENROUTER_API_KEY")
if not OPENROUTER_KEY:
    print("ERRO: VITE_OPENROUTER_API_KEY não encontrada.")
    exit(1)

# Ler a transcrição original
try:
    with open("/home/lswitch/car-parts-marketplce/video_localized/transcript_original.json", "r") as f:
        data = json.load(f)
        original_text = " ".join([seg["text"] for seg in data["segments"]])
except Exception as e:
    print(f"Erro ao ler JSON: {e}")
    exit(1)

prompt_pt = f"""
Reescreva a seguinte apresentação de vídeo para que fique extremamente profissional, engajadora e focada em negócios. 
É o pitch de 1 minuto da DAIG, o marketplace JDM (autopeças do Japão). O tom deve ser moderno, confiante e premium.
A duração falada deve ser em torno de 1 a 2 minutos no máximo. Não inclua marcações de áudio, nem instruções de câmera, apenas o texto que será lido pelo locutor (voz). 
Por favor, gere apenas o texto final e nada mais. Não inclua introduções como "Aqui está o texto:".

Texto original:
{original_text}
"""

print("Enviando para OpenRouter (GPT-4o) - PT-BR...")
response_pt = requests.post(
    url="https://openrouter.ai/api/v1/chat/completions",
    headers={"Authorization": f"Bearer {OPENROUTER_KEY}"},
    json={
        "model": "openai/gpt-4o-2024-08-06",
        "messages": [{"role": "user", "content": prompt_pt}]
    }
)
pt_text = response_pt.json()["choices"][0]["message"]["content"].strip()

with open("/home/lswitch/car-parts-marketplce/video_localized/transcript_professional_pt.txt", "w") as f:
    f.write(pt_text)
print("PT-BR salvo.")

prompt_ja = f"""
Traduza o seguinte roteiro de apresentação profissional para um japonês de negócios fluido, natural e extremamente premium (Keigo apropriado para B2B/B2C).
Não inclua marcações de áudio, apenas o texto falado. Gere apenas o texto final e nada mais.

Roteiro:
{pt_text}
"""

print("Enviando para OpenRouter (GPT-4o) - JA...")
response_ja = requests.post(
    url="https://openrouter.ai/api/v1/chat/completions",
    headers={"Authorization": f"Bearer {OPENROUTER_KEY}"},
    json={
        "model": "openai/gpt-4o-2024-08-06",
        "messages": [{"role": "user", "content": prompt_ja}]
    }
)
ja_text = response_ja.json()["choices"][0]["message"]["content"].strip()

with open("/home/lswitch/car-parts-marketplce/video_localized/transcript_professional_ja.txt", "w") as f:
    f.write(ja_text)
print("JA salvo.")

print("Concluído!")
