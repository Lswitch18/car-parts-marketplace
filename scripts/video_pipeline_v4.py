import os
import time
import requests
from faster_whisper import WhisperModel
import subprocess

ELEVENLABS_KEY = "sk_76f2e08705bfe6ce0498becb2567263c3f9f268c792cbb51"
VOICE_ID = "EXAVITQu4vr4xnSDxMaL" # Sarah - Mature, Reassuring, Confident
MODEL_ID = "eleven_multilingual_v2"

BASE_DIR = "/home/lswitch/car-parts-marketplce/video_localized"
VIDEO_INPUT = "/home/lswitch/car-parts-marketplce/presentationdaig_cropped.mp4"

def generate_tts(text_file, output_audio):
    if os.path.exists(output_audio):
        print(f"[{output_audio}] Já existe, pulando TTS.")
        return
        
    with open(text_file, "r") as f:
        text = f.read().strip()
        
    print(f"Gerando TTS para {text_file} via ElevenLabs...")
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE_ID}"
    headers = {
        "Accept": "audio/mpeg",
        "Content-Type": "application/json",
        "xi-api-key": ELEVENLABS_KEY
    }
    data = {
        "text": text,
        "model_id": MODEL_ID,
        "voice_settings": {
            "stability": 0.5,
            "similarity_boost": 0.75
        }
    }
    
    response = requests.post(url, json=data, headers=headers)
    if response.status_code != 200:
        print(f"ERRO ElevenLabs: {response.text}")
        exit(1)
        
    with open(output_audio, "wb") as f:
        f.write(response.content)
    print(f"TTS salvo em {output_audio}")

def generate_word_srt(audio_file, srt_file, lang):
    if os.path.exists(srt_file):
        print(f"[{srt_file}] Já existe, pulando Whisper.")
        return
        
    print(f"Gerando legendas palavra-por-palavra para {audio_file}...")
    model = WhisperModel("small", device="cpu", compute_type="int8")
    segments, info = model.transcribe(audio_file, word_timestamps=True, language=lang)
    
    srt_content = ""
    counter = 1
    
    for segment in segments:
        for word in segment.words:
            start = word.start
            end = word.end
            text = word.word.strip()
            if not text:
                continue
                
            def format_time(seconds):
                ms = int((seconds % 1) * 1000)
                s = int(seconds)
                m = s // 60
                h = m // 60
                return f"{h:02d}:{m%60:02d}:{s%60:02d},{ms:03d}"
            
            srt_content += f"{counter}\n"
            srt_content += f"{format_time(start)} --> {format_time(end)}\n"
            srt_content += f"{text}\n\n"
            counter += 1
            
    with open(srt_file, "w") as f:
        f.write(srt_content)
    print(f"Legendas salvas em {srt_file}")

def burn_subtitles(audio_file, srt_file, output_video):
    print(f"Montando vídeo final: {output_video}")
    # Estilo: Branco, fonte sans-serif, borda preta simples, sem fundo animado
    style = "FontName=Arial,FontSize=28,PrimaryColour=&H00FFFFFF,OutlineColour=&H00000000,BorderStyle=1,Outline=1,Shadow=0,Alignment=2"
    
    cmd = [
        "ffmpeg", "-y",
        "-i", VIDEO_INPUT,
        "-i", audio_file,
        "-c:v", "libx264",
        "-preset", "fast",
        "-crf", "24",
        "-c:a", "aac",
        "-b:a", "192k",
        "-map", "0:v:0",
        "-map", "1:a:0",
        "-shortest", # Corta o vídeo para terminar junto com o áudio
        "-vf", f"crop=1230:754:0:40,subtitles={srt_file}:force_style='{style}'",
        output_video
    ]
    
    print("Executando FFmpeg...")
    subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    print(f"✅ Vídeo finalizado: {output_video}")

if __name__ == "__main__":
    pt_txt = f"{BASE_DIR}/transcript_professional_pt.txt"
    ja_txt = f"{BASE_DIR}/transcript_professional_ja.txt"
    
    pt_audio = f"{BASE_DIR}/eleven_pt.mp3"
    ja_audio = f"{BASE_DIR}/eleven_ja.mp3"
    
    pt_srt = f"{BASE_DIR}/eleven_pt.srt"
    ja_srt = f"{BASE_DIR}/eleven_ja.srt"
    
    pt_video = f"{BASE_DIR}/DAIG_Premium_PT.mp4"
    ja_video = f"{BASE_DIR}/DAIG_Premium_JA.mp4"
    
    # 1. TTS
    generate_tts(pt_txt, pt_audio)
    generate_tts(ja_txt, ja_audio)
    
    # 2. SRT Palavra por palavra
    generate_word_srt(pt_audio, pt_srt, "pt")
    generate_word_srt(ja_audio, ja_srt, "ja")
    
    # 3. FFmpeg
    burn_subtitles(pt_audio, pt_srt, pt_video)
    burn_subtitles(ja_audio, ja_srt, ja_video)
    
    print("🚀 PIPELINE V4 (ELEVENLABS) CONCLUÍDO!")
