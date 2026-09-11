import json
import os

# Caminho onde os props dinâmicos serão salvos para o Remotion ler
OUTPUT_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "remotion_studio", "public", "props.json"))

class ScriptAgent:
    def __init__(self):
        self.scenes = [
            {
                "id": "scene1_hero",
                "voiceover": "Bem-vindo ao DAIG, o marketplace definitivo de autopeças JDM.",
                "overlay_text": "THE JDM MARKETPLACE",
                "strategic_pause": 2.0, # Pausa ao final da fala para o usuário ler o texto
                "duration_frames": 0, # Calculado dinamicamente pelo Audio Agent
            },
            {
                "id": "scene2_dash",
                "voiceover": "Acompanhe suas vendas e liquidação de forma instantânea e totalmente integrada ao Stripe.",
                "overlay_text": "SELLER ANALYTICS",
                "strategic_pause": 1.5,
                "duration_frames": 0,
            },
            {
                "id": "scene3_catalog",
                "voiceover": "Busque milhares de motores originais testados e com garantia diretamente do Japão.",
                "overlay_text": "",
                "strategic_pause": 0.5,
                "duration_frames": 0,
            },
            {
                "id": "scene4_ai",
                "voiceover": "Crie anúncios irresistíveis em segundos usando a inteligência artificial do DAIG, que analisa a foto da peça e extrai todos os dados.",
                "overlay_text": "AI LISTING CREATOR",
                "strategic_pause": 3.0, # Muito importante dar pausa no final pra mostrar a mágica da IA
                "duration_frames": 0,
            },
            {
                "id": "scene5_checkout",
                "voiceover": "Tudo isso com um fechamento de negócio ultrasseguro em ienes via Escrow. DAIG, the final gear.",
                "overlay_text": "SECURE CHECKOUT",
                "strategic_pause": 2.0,
                "duration_frames": 0,
            }
        ]

    def run(self):
        print("✍️ [Script Agent] Analisando fluxos e gerando roteiro base com pausas estratégicas...")
        # Apenas salva o arquivo inicial, que depois será enriquecido pelos outros agentes.
        os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
        with open(OUTPUT_PATH, "w") as f:
            json.dump({"scenes": self.scenes}, f, indent=4)
        print(f"✅ [Script Agent] Roteiro salvo em {OUTPUT_PATH}")

if __name__ == "__main__":
    ScriptAgent().run()
