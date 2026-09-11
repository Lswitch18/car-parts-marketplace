import os
import sys

# Ensure current path is in sys.path
sys.path.append(os.path.dirname(__file__))

from scene_capturer import run_captures
from video_editor import edit_videos

def run_pipeline():
    print("🚀 Iniciando Video-Ops Pipeline do DAIG Marketing Agent...")
    print("---------------------------------------------------------")
    
    # Passo 1: Captura bruta em 1080p via Playwright
    try:
        run_captures()
    except Exception as e:
        print(f"❌ Erro na captura de cenas: {e}")
        return
        
    print("---------------------------------------------------------")
    
    # Passo 2: Edição profissional via FFmpeg
    try:
        edit_videos()
    except Exception as e:
        print(f"❌ Erro na edição do vídeo: {e}")
        return
        
    print("---------------------------------------------------------")
    print("🎉 Pipeline concluído! Vídeo profissional disponível em public/videos/daig-pitch-professional.mp4")

if __name__ == "__main__":
    run_pipeline()
