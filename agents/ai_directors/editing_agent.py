import os
import subprocess
import shutil

# Paths
BASE_DIR = os.path.dirname(__file__)
REMOTION_DIR = os.path.abspath(os.path.join(BASE_DIR, "..", "remotion_studio"))
RAW_CLIPS_DIR = os.path.abspath(os.path.join(BASE_DIR, "..", "video_marketing_agent", "raw_clips"))
PUBLIC_VIDEOS_DIR = os.path.join(REMOTION_DIR, "public", "videos")

def copy_raw_videos():
    print("✂️ [Editing Agent] Preparando assets crus para a Engine do Remotion...")
    os.makedirs(PUBLIC_VIDEOS_DIR, exist_ok=True)
    
    # Copia as webm originais do video_marketing_agent
    for file in os.listdir(RAW_CLIPS_DIR):
        if file.endswith(".webm"):
            src = os.path.join(RAW_CLIPS_DIR, file)
            dst = os.path.join(PUBLIC_VIDEOS_DIR, file)
            shutil.copy2(src, dst)

def run():
    print("🎬 [Editing Agent] Iniciando a Orquestração do Estúdio DAIG Remotion...")
    print("----------------------------------------------------------------------")
    
    # 1. Copia arquivos de video
    copy_raw_videos()
    
    # 2. Executa os Agentes de IA
    subprocess.run(["python3", os.path.join(BASE_DIR, "script_agent.py")], check=True)
    subprocess.run(["python3", os.path.join(BASE_DIR, "audio_agent.py")], check=True)
    subprocess.run(["python3", os.path.join(BASE_DIR, "effect_agent.py")], check=True)
    
    print("----------------------------------------------------------------------")
    print("💻 [Editing Agent] Todos os metadados gerados. Disparando Remotion Renderer...")
    
    # O Remotion irá ler public/props.json nativamente no componente.
    # Disparar renderização. O composition ID padrão é "MyComp" se for template blank.
    # Mas precisamos criar a Composition React primeiro!
    print("⚠️  [Editing Agent] Certifique-se de que o código React do Remotion foi implementado em agents/remotion_studio/src!")
    
    # Comando de render: npx remotion render src/index.ts Main public/out.mp4
    subprocess.run(["npx", "remotion", "render", "Main", "public/out.mp4"], cwd=REMOTION_DIR, check=True)

if __name__ == "__main__":
    run()
