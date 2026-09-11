import re
import json
import os

class PronunciationAgent:
    def __init__(self):
        self.phonetic_dict = {
            r'\bStripe\b': 'Straipe',
            r'\bDAIG\b': 'Daigui',
            r'\bEscrow\b': 'Éscrou',
            r'\bJDM\b': 'Jota Dê Emi',
            r'\bAI\b': 'IA',
            r'\bcheckout\b': 'chécaute',
            r'\bmarketplace\b': 'márquet pleici',
            r'\bdashboard\b': 'déshi borde'
        }

    def process_script(self):
        props_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "remotion_studio", "public", "props.json"))
        if not os.path.exists(props_path):
            print("❌ props.json não encontrado.")
            return

        with open(props_path, 'r', encoding='utf-8') as f:
            data = json.load(f)

        print("🗣️ [Pronunciation Agent] Processando dicionário fonético...")
        for scene in data['scenes']:
            text = scene['voiceover']
            for pattern, replacement in self.phonetic_dict.items():
                text = re.sub(pattern, replacement, text, flags=re.IGNORECASE)
            
            scene['phonetic_voiceover'] = text
            if scene['voiceover'] != text:
                print(f"   => Corrigido: '{scene['voiceover']}' \n      -> '{text}'")

        with open(props_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=4)
        print("✅ [Pronunciation Agent] Dicionário aplicado e salvo em props.json")

if __name__ == "__main__":
    agent = PronunciationAgent()
    agent.process_script()
