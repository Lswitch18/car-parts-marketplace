import os
import subprocess

def generate_tts(text_file, voice, out_mp3, out_vtt):
    print(f"Generating TTS for {text_file}...")
    cmd = [
        "edge-tts",
        "--file", text_file,
        "--voice", voice,
        "--rate", "+0%",
        "--write-media", out_mp3,
        "--write-subtitles", out_vtt
    ]
    subprocess.run(cmd, check=True)
    print(f"✅ Generated {out_mp3} and {out_vtt}")

if __name__ == "__main__":
    generate_tts("scratch/pitch.txt", "pt-BR-AntonioNeural", "public/videos/demo-pt.mp3", "public/videos/demo-pt.vtt")
    generate_tts("scratch/pitch_ja.txt", "ja-JP-KeitaNeural", "public/videos/demo-ja.mp3", "public/videos/demo-ja.vtt")
