import json
import os

# Caminho onde os props dinâmicos serão salvos para o Remotion ler
OUTPUT_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "remotion_studio", "public", "props.json"))

class ScriptAgent:
    def __init__(self):
        self.scenes = [
            {
                "id": "scene1_register",
                "voiceover": "Apresentamos o DAIG. A plataforma corporativa desenhada para revolucionar o mercado de autopeças automotivas.",
                "overlay_text": "ENTERPRISE REGISTRATION",
                "strategic_pause": 2.5,
                "duration_frames": 0,
            },
            {
                "id": "scene2_catalog",
                "voiceover": "Navegue por um catálogo global de alta performance. Encontre motores e peças verificadas com rastreabilidade total.",
                "overlay_text": "GLOBAL CATALOG",
                "strategic_pause": 2.0,
                "duration_frames": 0,
            },
            {
                "id": "scene3_ai_upload",
                "voiceover": "Reduza custos operacionais com a nossa IA. Basta fazer o upload de uma foto da peça, e o DAIG extrai todos os dados técnicos instantaneamente.",
                "overlay_text": "AI LISTING CREATOR",
                "strategic_pause": 3.5,
                "duration_frames": 0,
            },
            {
                "id": "scene4_chat",
                "voiceover": "Negocie diretamente através de um chat integrado e seguro, mantendo a comunicação centralizada e auditável.",
                "overlay_text": "SECURE MESSAGING",
                "strategic_pause": 2.0, 
                "duration_frames": 0,
            },
            {
                "id": "scene5_checkout",
                "voiceover": "Finalize a transação com liquidação automatizada via Stripe e proteção Escrow. DAIG, a infraestrutura definitiva.",
                "overlay_text": "INSTANT SETTLEMENT",
                "strategic_pause": 3.0,
                "duration_frames": 0,
            }
        ]

    def generate_script(self):
        print("✍️ [Script Agent] Analisando fluxos e gerando roteiro base com pausas estratégicas...")
        # Apenas salva o arquivo inicial, que depois será enriquecido pelos outros agentes.
        os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
        with open(OUTPUT_PATH, "w") as f:
            json.dump({"scenes": self.scenes}, f, indent=4)

    def run(self):
        self.generate_script()
        print(f"✅ [Script Agent] Roteiro salvo em {OUTPUT_PATH}")

if __name__ == "__main__":
    ScriptAgent().run()
