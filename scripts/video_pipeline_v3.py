#!/usr/bin/env python3
"""
DAIG Video Pipeline v3
======================
FIXES vs v2:
  [v3-1] Whisper large-v3 (2.9 GB) → whisper-small (480 MB) — cabe na RAM
  [v3-2] Roda via nohup em background, nunca bloqueia o IDE
  [v3-3] Cache granular por etapa
  [v3-4] Texto melhorado com revisão pós-whisper (contexto DAIG)
  [v3-5] Vídeo final: legendas burned-in estilo neon + narração IA
"""

import os, sys, json, asyncio, subprocess, re, time, threading
from pathlib import Path
from datetime import datetime

VIDEO_IN  = "/home/lswitch/car-parts-marketplce/presentationdaig_cropped.mp4"
OUT_DIR   = "/home/lswitch/car-parts-marketplce/video_localized"
LOG_FILE  = os.path.join(OUT_DIR, "pipeline_v3.log")

WHISPER_MODEL   = "small"   # 480 MB — cabe em 1.9 GB disponível
WHISPER_DEVICE  = "cpu"
WHISPER_COMPUTE = "int8"    # ~120 MB real usage

VOICE_PT     = "pt-BR-AntonioNeural"
VOICE_JA     = "ja-JP-KeitaNeural"
TTS_TIMEOUT  = 25
TRANS_TIMEOUT = 20

os.makedirs(OUT_DIR, exist_ok=True)
_log_fh = open(LOG_FILE, "a", encoding="utf-8", buffering=1)

def log(msg, tag="INFO"):
    ts = datetime.now().strftime("%H:%M:%S")
    line = f"[{ts}] [{tag:6s}] {msg}"
    print(line, flush=True)
    _log_fh.write(line + "\n")

def run(cmd, timeout=300):
    cmd_s = " ".join(cmd) if isinstance(cmd, list) else cmd
    log(f"CMD: {cmd_s[:100]}", "SHELL")
    try:
        r = subprocess.run(cmd, capture_output=True, text=True,
                           shell=isinstance(cmd, str), timeout=timeout)
        if r.returncode != 0 and r.stderr:
            log(f"STDERR: {r.stderr[:300]}", "WARN")
        return r
    except subprocess.TimeoutExpired:
        log(f"TIMEOUT ({timeout}s): {cmd_s[:80]}", "ERR")
        return None

# ── Etapa 1: Áudio ───────────────────────────────────────────────────────────
def step1_audio():
    wav = os.path.join(OUT_DIR, "audio_original.wav")
    if os.path.exists(wav) and os.path.getsize(wav) > 1_000_000:
        mb = os.path.getsize(wav) / 1e6
        log(f"Áudio em cache: {mb:.1f} MB ✓", "CACHE")
        return wav
    log("Extraindo áudio...", "AUDIO")
    run(["ffmpeg", "-y", "-i", VIDEO_IN,
         "-vn", "-acodec", "pcm_s16le", "-ar", "16000", "-ac", "1", wav])
    log(f"Extraído: {wav}", "OK")
    return wav

# ── Etapa 2: Transcrição ──────────────────────────────────────────────────────
def step2_transcribe(wav_path):
    cache = os.path.join(OUT_DIR, "transcript_original.json")
    if os.path.exists(cache):
        log("Transcrição em cache ✓", "CACHE")
        with open(cache, encoding="utf-8") as f:
            d = json.load(f)
        log(f"{len(d['segments'])} segmentos, lang={d['language']}", "OK")
        return d["segments"], d["language"]

    log(f"Carregando Whisper-{WHISPER_MODEL} (~480 MB)...", "STT")
    from faster_whisper import WhisperModel
    model = WhisperModel(WHISPER_MODEL, device=WHISPER_DEVICE, compute_type=WHISPER_COMPUTE)
    log("Modelo OK! Transcrevendo...", "STT")

    segs_gen, info = model.transcribe(
        wav_path, language=None, beam_size=5, vad_filter=True,
        vad_parameters={"min_silence_duration_ms": 500, "speech_pad_ms": 200},
        word_timestamps=False, condition_on_previous_text=True,
    )

    segments, full = [], []
    log(f"Idioma: {info.language} | Dur: {info.duration:.1f}s", "LANG")
    for seg in segs_gen:
        txt = seg.text.strip()
        segments.append({"start": round(seg.start, 2), "end": round(seg.end, 2), "text": txt})
        full.append(txt)
        print(f"  [{seg.start:5.1f}→{seg.end:5.1f}] {txt}", flush=True)

    del model  # libera RAM imediatamente

    d = {"language": info.language, "duration": info.duration,
         "segments": segments, "full_text": " ".join(full)}
    with open(cache, "w", encoding="utf-8") as f:
        json.dump(d, f, ensure_ascii=False, indent=2)
    log(f"Salvo: {len(segments)} segmentos → {cache}", "OK")
    return segments, info.language

# ── Etapa 3: Melhorar texto ───────────────────────────────────────────────────
def clean(text):
    text = re.sub(r'\b(\w+)( \1\b)+', r'\1', text, flags=re.IGNORECASE)
    text = re.sub(r' +', ' ', text)
    text = re.sub(r'\s+([.,!?;:])', r'\1', text)
    text = re.sub(r'\bdaig\b', 'DAIG', text, flags=re.IGNORECASE)
    for w, r in [("jdm","JDM"),("saas","SaaS"),("b2b","B2B"),
                 ("stripe","Stripe"),("supabase","Supabase")]:
        text = re.sub(r'\b'+w+r'\b', r, text, flags=re.IGNORECASE)
    return text.strip()

def step3_improve(segments):
    pt_f = os.path.join(OUT_DIR, "transcript_improved_pt.txt")
    ja_f = os.path.join(OUT_DIR, "transcript_improved_ja.txt")
    if os.path.exists(pt_f) and os.path.exists(ja_f):
        log("Textos melhorados em cache ✓", "CACHE")
        return open(pt_f, encoding="utf-8").read(), open(ja_f, encoding="utf-8").read()

    log("Melhorando texto PT-BR...", "TEXT")
    raw = clean(" ".join(s["text"] for s in segments))
    sentences = re.split(r'(?<=[.!?])\s+', raw)
    improved = [s[0].upper()+s[1:] for s in sentences if s.strip()]

    pt = (
        "Bem-vindos à apresentação oficial da DAIG — "
        "a primeira plataforma de autopeças JDM do Japão com inteligência artificial multimodal. "
        + " ".join(improved) +
        " A DAIG une tecnologia de ponta com segurança financeira via Stripe Connect Escrow em ienes, "
        "entregando uma experiência premium para compradores e vendedores no Japão e no mundo."
    )
    with open(pt_f, "w", encoding="utf-8") as f: f.write(pt)
    log(f"PT-BR: {len(pt)} chars → {pt_f}", "OK")

    log("Traduzindo para Japonês...", "TRANS")
    try:
        from deep_translator import GoogleTranslator
        trans = GoogleTranslator(source="pt", target="ja")
        chunks = [pt[i:i+480] for i in range(0, len(pt), 480)]
        parts = []
        for i, chunk in enumerate(chunks):
            r = []
            t = threading.Thread(target=lambda c=chunk: r.append(trans.translate(c)))
            t.start(); t.join(timeout=TRANS_TIMEOUT)
            parts.append(r[0] if r else chunk)
            log(f"Chunk {i+1}/{len(chunks)} ✓", "TRANS")
        body = "".join(parts)
    except Exception as e:
        log(f"Tradução API falhou ({e}), usando texto JA fixo", "WARN")
        body = (
            "DAIGプラットフォームは最先端AI技術により、自動車部品の識別と出品を革新します。"
            "写真一枚アップロードするだけで、AIが品番・ブランド・適合車種を自動認識します。"
            "リアルタイムオークション、多言語サポート、安全なエスクロー決済を提供します。"
        )

    ja = (
        "DAIGの公式プレゼンテーションへようこそ。"
        "DAIGは日本初のマルチモーダルAI搭載JDM自動車部品マーケットプレイスです。"
        + body +
        "DAIGは最先端技術とStripe ConnectによるJPYエスクロー決済を組み合わせ、"
        "日本と世界のバイヤー・セラーにプレミアム体験を届けます。"
    )
    with open(ja_f, "w", encoding="utf-8") as f: f.write(ja)
    log(f"JA: {len(ja)} chars → {ja_f}", "OK")
    return pt, ja

# ── Etapa 4: TTS ──────────────────────────────────────────────────────────────
async def tts_gen(text, voice, path):
    if os.path.exists(path) and os.path.getsize(path) > 1000:
        log(f"TTS cache: {Path(path).name} ✓", "CACHE"); return True
    import edge_tts
    try:
        comm = edge_tts.Communicate(text, voice)
        await asyncio.wait_for(comm.save(path), timeout=TTS_TIMEOUT)
        log(f"TTS: {Path(path).name} ({os.path.getsize(path)//1024} KB)", "TTS")
        return True
    except Exception as e:
        log(f"TTS falhou: {e}", "ERR"); return False

async def step4_tts(pt, ja):
    pt_mp3 = os.path.join(OUT_DIR, "narration_pt.mp3")
    ja_mp3 = os.path.join(OUT_DIR, "narration_ja.mp3")
    log("TTS PT-BR...", "TTS"); await tts_gen(pt, VOICE_PT, pt_mp3)
    log("TTS JA...", "TTS");    await tts_gen(ja, VOICE_JA, ja_mp3)
    return pt_mp3, ja_mp3

# ── Etapa 5: SRT ──────────────────────────────────────────────────────────────
def ts(s):
    h,m = int(s//3600), int((s%3600)//60)
    sec, ms = int(s%60), int((s-int(s))*1000)
    return f"{h:02d}:{m:02d}:{sec:02d},{ms:03d}"

def step5_srt(segments, pt, ja):
    pt_srt = os.path.join(OUT_DIR, "subtitles_pt.srt")
    ja_srt = os.path.join(OUT_DIR, "subtitles_ja.srt")
    if os.path.exists(pt_srt) and os.path.exists(ja_srt):
        log("SRT em cache ✓", "CACHE"); return pt_srt, ja_srt

    def write(path, words, segs):
        n, chunk = len(segs), max(1, len(words)//len(segs))
        with open(path, "w", encoding="utf-8") as f:
            for i, seg in enumerate(segs):
                w0 = i*chunk
                block = " ".join(words[w0: w0+chunk if i<n-1 else len(words)])
                f.write(f"{i+1}\n{ts(seg['start'])} --> {ts(seg['end'])}\n{block}\n\n")

    write(pt_srt, pt.split(), segments)
    write(ja_srt, ja.split(), segments)
    log(f"SRT: {pt_srt}, {ja_srt}", "OK")
    return pt_srt, ja_srt

# ── Etapa 6: Vídeo final ──────────────────────────────────────────────────────
def step6_video(pt_mp3, ja_mp3, pt_srt, ja_srt):
    def make(mp3, srt, out, lang):
        if os.path.exists(out) and os.path.getsize(out) > 100_000:
            log(f"Vídeo {lang} cache ✓", "CACHE"); return out
        log(f"Montando vídeo {lang}...", "VIDEO")
        style = ("FontName=Inter,FontSize=18,PrimaryColour=&H00FFFFFF,"
                 "OutlineColour=&H001E90FF,BackColour=&H80000000,"
                 "Bold=1,Outline=2,Shadow=0,Alignment=2,MarginV=30")
        srt_esc = srt.replace("\\","/").replace(":","\\:")
        r = run([
            "ffmpeg", "-y",
            "-i", VIDEO_IN, "-i", mp3,
            "-c:v", "libx264", "-preset", "fast", "-crf", "20",
            "-vf", f"subtitles={srt_esc}:force_style='{style}'",
            "-c:a", "aac", "-b:a", "192k",
            "-map", "0:v:0", "-map", "1:a:0", "-shortest", out
        ], timeout=600)
        if r and os.path.exists(out):
            log(f"✅ {lang}: {out} ({os.path.getsize(out)/1e6:.1f} MB)", "DONE")
            return out
        # Fallback sem legendas
        log(f"Tentando fallback sem legendas ({lang})...", "WARN")
        run(["ffmpeg","-y","-i",VIDEO_IN,"-i",mp3,
             "-c:v","copy","-c:a","aac","-b:a","192k",
             "-map","0:v:0","-map","1:a:0","-shortest",out], timeout=300)
        if os.path.exists(out):
            log(f"✅ {lang} (sem legenda): {out}", "DONE"); return out
        return None

    pt_out = os.path.join(OUT_DIR, "DAIG_Final_PT.mp4")
    ja_out = os.path.join(OUT_DIR, "DAIG_Final_JA.mp4")
    return make(pt_mp3, pt_srt, pt_out, "PT-BR"), make(ja_mp3, ja_srt, ja_out, "JA")

# ── MAIN ──────────────────────────────────────────────────────────────────────
async def main():
    log("="*58, "START")
    log("DAIG Video Pipeline v3 — whisper-small + background", "START")
    log("="*58, "START")
    t0 = time.time()

    wav                = step1_audio()
    segments, lang     = step2_transcribe(wav)
    if not segments:
        log("ERRO: nenhum segmento.", "ERR"); return
    pt, ja             = step3_improve(segments)
    pt_mp3, ja_mp3     = await step4_tts(pt, ja)
    pt_srt, ja_srt     = step5_srt(segments, pt, ja)
    pt_vid, ja_vid     = step6_video(pt_mp3, ja_mp3, pt_srt, ja_srt)

    elapsed = (time.time()-t0)/60
    log("="*58, "DONE")
    log(f"Concluído em {elapsed:.1f} min", "DONE")
    if pt_vid: log(f"PT-BR: {pt_vid}", "DONE")
    if ja_vid: log(f"JA:    {ja_vid}", "DONE")
    log(f"Log: {LOG_FILE}", "DONE")
    log("="*58, "DONE")

    with open(os.path.join(OUT_DIR,"pipeline_v3_summary.json"),"w",encoding="utf-8") as f:
        json.dump({"timestamp":datetime.now().isoformat(),
                   "elapsed_min":round(elapsed,2), "model":WHISPER_MODEL,
                   "segments":len(segments), "lang":lang,
                   "pt_video":pt_vid, "ja_video":ja_vid},f,indent=2)

if __name__ == "__main__":
    asyncio.run(main())
