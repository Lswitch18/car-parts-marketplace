import os
import subprocess
import json

RAW_DIR = os.path.join(os.path.dirname(__file__), "raw_clips")
OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "public", "videos")
FINAL_OUTPUT = os.path.join(OUT_DIR, "daig-pitch-professional.mp4")

def get_duration(file_path):
    cmd = ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", file_path]
    return float(subprocess.check_output(cmd).decode().strip())

def edit_videos():
    print("🎬 Iniciando edição de vídeo profissional com FFmpeg...")
    scenes = [
        {"name": "scene1_hero", "zoom": True, "text": "THE JDM MARKETPLACE"},
        {"name": "scene2_dash", "zoom": False, "text": "SELLER ANALYTICS"},
        {"name": "scene3_catalog", "zoom": False, "text": ""},
        {"name": "scene4_ai", "zoom": True, "text": "AI LISTING CREATOR"},
        {"name": "scene5_checkout", "zoom": True, "text": "SECURE CHECKOUT"}
    ]
    
    edited_clips = []
    
    for idx, scene in enumerate(scenes):
        input_file = os.path.join(RAW_DIR, f"{scene['name']}.webm")
        if not os.path.exists(input_file):
            print(f"⚠️ Arquivo {input_file} não encontrado, pulando...")
            continue
            
        dur = get_duration(input_file)
        out_file = os.path.join(RAW_DIR, f"edited_{idx}.mp4")
        
        # Filtros base: Fades e Barras Cinematográficas
        filters = [
            f"fade=t=in:st=0:d=0.5",
            f"fade=t=out:st={dur-0.5}:d=0.5",
            "drawbox=y=0:color=black:width=iw:height=120:t=fill",
            "drawbox=y=ih-120:color=black:width=iw:height=120:t=fill"
        ]
        
        # Usando um Zoom Cinematográfico Estático (Close-up) para performance
        if scene["zoom"]:
            filters.insert(0, f"scale=w=iw*1.2:h=-1,crop=1920:1080,fps=25")
        else:
            filters.insert(0, "fps=25")
            
        # Adiciona texto no rodapé (na barra preta)
        if scene["text"]:
            filters.append(f"drawtext=fontfile='/usr/share/fonts/truetype/ubuntu/Ubuntu-B.ttf':text='{scene['text']}':fontcolor=white:fontsize=48:x=(w-text_w)/2:y=h-80:shadowcolor=black:shadowx=2:shadowy=2")
            
        filter_str = ",".join(filters)
        
        cmd = [
            "ffmpeg", "-y", "-i", input_file,
            "-vf", filter_str,
            "-c:v", "libx264", "-pix_fmt", "yuv420p", "-b:v", "4M",
            out_file
        ]
        
        print(f"⚙️ Processando {scene['name']}...")
        subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        edited_clips.append(out_file)
        
    if not edited_clips:
        print("❌ Nenhum clipe processado.")
        return
        
    print("🔄 Concatenando clipes...")
    concat_file = os.path.join(RAW_DIR, "concat.txt")
    with open(concat_file, "w") as f:
        for clip in edited_clips:
            f.write(f"file '{os.path.basename(clip)}'\n")
            
    concat_cmd = [
        "ffmpeg", "-y", "-f", "concat", "-safe", "0",
        "-i", concat_file,
        "-c", "copy",
        FINAL_OUTPUT
    ]
    subprocess.run(concat_cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    
    print(f"✅ Vídeo final renderizado: {FINAL_OUTPUT}")

if __name__ == "__main__":
    edit_videos()
