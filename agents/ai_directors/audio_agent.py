import json
import os
import asyncio
import edge_tts
from pydub import AudioSegment

PROPS_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "remotion_studio", "public", "props.json"))
AUDIO_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "remotion_studio", "public", "audio"))
FPS = 60

async def generate_audio(text, output_file):
    # Usando uma voz brasileira premium
    communicate = edge_tts.Communicate(text, "pt-BR-AntonioNeural")
    await communicate.save(output_file)

def run():
    print("🎵 [Audio Agent] Iniciando geração sintética de locução...")
    os.makedirs(AUDIO_DIR, exist_ok=True)
    
    with open(PROPS_PATH, "r") as f:
        data = json.load(f)
        
    for scene in data["scenes"]:
        print(f"🎤 Gravando locução para cena {scene['id']}...")
        audio_path = os.path.join(AUDIO_DIR, f"{scene['id']}.mp3")
        
        # Gerar TTS
        asyncio.run(generate_audio(scene['voiceover'], audio_path))
        
        # Medir duração com pydub
        audio = AudioSegment.from_mp3(audio_path)
        audio_duration_sec = len(audio) / 1000.0
        
        total_sec = audio_duration_sec + scene["strategic_pause"]
        scene["duration_frames"] = int(total_sec * FPS)
        
        # Guardar referência do arquivo pro Remotion
        scene["audio_src"] = f"/audio/{scene['id']}.mp3"
        
        print(f"   => Duração do áudio: {audio_duration_sec:.2f}s | Pausa: {scene['strategic_pause']}s | Frames totais: {scene['duration_frames']}")

    # Atualiza o props.json
    with open(PROPS_PATH, "w") as f:
        json.dump(data, f, indent=4)
        
    print(f"✅ [Audio Agent] Áudios gerados e timeline matemática sincronizada em {PROPS_PATH}")

if __name__ == "__main__":
    run()
