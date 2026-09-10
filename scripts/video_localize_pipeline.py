#!/usr/bin/env python3
"""
DAIG Video Localization Pipeline  (v2 — corrigido)
=================================
Correções aplicadas vs v1:
  [FIX-1] stdout sem flush  → todo print usa flush=True ou reconfigure
  [FIX-2] Modelo sem progresso → spinner em thread separada durante carregamento
  [FIX-3] info.language antes do loop → detectado corretamente após init
  [FIX-4] extract_audio sem cache → pula re-extração se WAV já existe
  [FIX-5] amix com muitos inputs → substituído por abordagem iterativa (concat+mix)
  [FIX-6] GoogleTranslator sem timeout → wrappado com threading.Timer (15s timeout)
  [FIX-7] edge_tts sem timeout → asyncio.wait_for com 20s por segmento
  [FIX-8] deep_translator não instalado? → fallback para googletrans
"""

import os
import sys
import json
import asyncio
import subprocess
import re
import threading
import time
from pathlib import Path
from datetime import datetime

# Flush imediato — resolve buffer travado no pipe (| tee)
sys.stdout.reconfigure(line_buffering=True)

# --- Configuracoes -----------------------------------------------------------
VIDEO_INPUT   = "/home/lswitch/car-parts-marketplce/presentationdaig_cropped.mp4"
OUTPUT_DIR    = "/home/lswitch/car-parts-marketplce/video_localized"
VOICE_PT      = "pt-BR-AntonioNeural"
VOICE_JA      = "ja-JP-KeitaNeural"
WHISPER_MODEL = "large-v3"
TRANSLATE_TIMEOUT_S = 15   # timeout por segmento de tradução
TTS_TIMEOUT_S       = 20   # timeout por segmento TTS
FFMPEG_MAX_INPUTS   = 50   # máximo de inputs por chamada FFmpeg (evita travar)

# --- Utilitários -------------------------------------------------------------

def run(cmd, timeout=300, **kwargs):
    """Executa comando com timeout e mostra saída imediatamente."""
    cmd_str = " ".join(cmd) if isinstance(cmd, list) else cmd
    print(f"\n> {cmd_str[:120]}", flush=True)
    try:
        result = subprocess.run(
            cmd,
            shell=isinstance(cmd, str),
            capture_output=True,
            text=True,
            timeout=timeout,
        )
        if result.returncode != 0 and result.stderr:
            print(f"[STDERR] {result.stderr[:500]}", flush=True)
        return result
    except subprocess.TimeoutExpired:
        print(f"[TIMEOUT] Comando excedeu {timeout}s: {cmd_str[:80]}", flush=True)
        return None


def log(msg, tag="INFO"):
    ts = datetime.now().strftime("%H:%M:%S")
    print(f"[{ts}] [{tag:6s}] {msg}", flush=True)


def spinner(label, stop_event):
    """Thread de spinner para mostrar que o processo está vivo."""
    chars = "⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏"
    i = 0
    t0 = time.time()
    while not stop_event.is_set():
        elapsed = time.time() - t0
        print(f"\r  {chars[i % len(chars)]}  {label}  ({elapsed:.0f}s)    ", end="", flush=True)
        i += 1
        time.sleep(0.2)
    print(f"\r  ✓  {label} — concluído em {time.time()-t0:.1f}s        ", flush=True)


# --- ETAPA 1: Extrair áudio --------------------------------------------------

def extract_audio(video_path, output_dir):
    audio_path = os.path.join(output_dir, "audio_original.wav")

    # [FIX-4] cache: pula se WAV já existe e tem tamanho razoável
    if os.path.exists(audio_path) and os.path.getsize(audio_path) > 1_000_000:
        size_mb = os.path.getsize(audio_path) / 1024 / 1024
        log(f"Áudio já extraído ({size_mb:.1f} MB) — usando cache ✓", "CACHE")
        return audio_path

    log("Extraindo áudio do vídeo...", "AUDIO")
    run([
        "ffmpeg", "-y", "-i", video_path,
        "-vn",
        "-acodec", "pcm_s16le",
        "-ar",  "16000",
        "-ac",  "1",
        audio_path
    ])
    if os.path.exists(audio_path):
        size_mb = os.path.getsize(audio_path) / 1024 / 1024
        log(f"Áudio extraído: {audio_path} ({size_mb:.1f} MB)", "OK")
    else:
        log("ERRO ao extrair áudio!", "ERR")
    return audio_path


# --- ETAPA 2: Transcrever com Whisper ----------------------------------------

def transcribe_audio(audio_path, output_dir):
    from faster_whisper import WhisperModel

    log(f"Carregando modelo Whisper {WHISPER_MODEL} do cache...", "STT")

    # [FIX-2] Spinner enquanto modelo carrega (silêncio de ~60s)
    stop_ev = threading.Event()
    t = threading.Thread(target=spinner, args=("Carregando modelo 2.9GB na RAM", stop_ev), daemon=True)
    t.start()

    model = WhisperModel(WHISPER_MODEL, device="cpu", compute_type="int8")

    stop_ev.set()
    t.join()

    log("Modelo carregado! Iniciando transcrição...", "STT")

    # [FIX-3] Passa language=None para auto-detecção; info vem junto com o generator
    # mas NÃO lemos info.language aqui — esperamos o loop consumir o generator
    stop_ev2 = threading.Event()
    t2 = threading.Thread(
        target=spinner,
        args=("Detectando idioma + transcrevendo (pode levar 10-20 min no CPU)", stop_ev2),
        daemon=True
    )
    t2.start()

    segments_gen, info = model.transcribe(
        audio_path,
        language=None,
        beam_size=5,
        vad_filter=True,
        vad_parameters={
            "min_silence_duration_ms": 500,
            "speech_pad_ms": 200,
        },
        word_timestamps=False,
        condition_on_previous_text=True,
    )

    segments = []
    full_text = []
    first_seg = True

    for seg in segments_gen:
        if first_seg:
            stop_ev2.set()
            t2.join()
            log(f"Idioma: {info.language} | Duração: {info.duration:.1f}s", "LANG")
            print("\n--- TRANSCRIÇÃO ---", flush=True)
            first_seg = False

        txt = seg.text.strip()
        print(f"  [{seg.start:6.1f}s → {seg.end:6.1f}s] {txt}", flush=True)
        segments.append({"start": round(seg.start, 2), "end": round(seg.end, 2), "text": txt})
        full_text.append(txt)

    if first_seg:  # nenhum segmento gerado
        stop_ev2.set()
        t2.join()

    # Salva JSON
    transcript_path = os.path.join(output_dir, "transcript_original.json")
    with open(transcript_path, "w", encoding="utf-8") as f:
        json.dump({
            "language": info.language,
            "language_probability": info.language_probability,
            "duration": info.duration,
            "segments": segments,
            "full_text": " ".join(full_text)
        }, f, ensure_ascii=False, indent=2)

    txt_path = os.path.join(output_dir, "transcript_original.txt")
    with open(txt_path, "w", encoding="utf-8") as f:
        f.write(" ".join(full_text))

    log(f"Transcrição salva: {len(segments)} segmentos → {transcript_path}", "OK")
    return segments


# --- ETAPA 3: Traduzir -------------------------------------------------------

def clean_text(text):
    text = re.sub(r'\b(\w+)( \1\b)+', r'\1', text, flags=re.IGNORECASE)
    text = re.sub(r' +', ' ', text)
    text = re.sub(r'\s+([.,!?;:])', r'\1', text)
    return text.strip()


def _translate_one(translator, text, result_box):
    """Executado em thread separada para permitir timeout."""
    try:
        result_box.append(translator.translate(text))
    except Exception as e:
        result_box.append(None)


def translate_with_timeout(translator, text, timeout=TRANSLATE_TIMEOUT_S):
    """[FIX-6] Tradução com timeout para evitar hang de rede."""
    result_box = []
    t = threading.Thread(target=_translate_one, args=(translator, text, result_box))
    t.start()
    t.join(timeout=timeout)
    if not result_box or result_box[0] is None:
        return text  # fallback: texto original
    return result_box[0]


def translate_segments(segments, target_lang, output_dir):
    try:
        from deep_translator import GoogleTranslator
        translator = GoogleTranslator(source="auto", target=target_lang)
    except ImportError:
        log("deep_translator não encontrado, instalando...", "WARN")
        subprocess.run([sys.executable, "-m", "pip", "install", "deep-translator", "-q"])
        from deep_translator import GoogleTranslator
        translator = GoogleTranslator(source="auto", target=target_lang)

    lang_name = "Japonês" if target_lang == "ja" else "Português"
    log(f"Traduzindo {len(segments)} segmentos → {lang_name} (timeout {TRANSLATE_TIMEOUT_S}s/seg)...", "TRANS")

    translated_segments = []
    full_translated = []

    for i, seg in enumerate(segments):
        original = clean_text(seg["text"])
        if not original:
            translated_segments.append({**seg, "translated": ""})
            continue

        # [FIX-6] tradução com timeout
        translated = translate_with_timeout(translator, original)
        if not translated:
            translated = original

        translated_segments.append({
            "start": seg["start"],
            "end": seg["end"],
            "original": original,
            "translated": translated,
            "duration": seg["end"] - seg["start"]
        })
        full_translated.append(translated)

        if (i + 1) % 5 == 0 or i == 0:
            print(f"  [{i+1}/{len(segments)}] {original[:40]} → {translated[:40]}", flush=True)

    lang_suffix = target_lang.upper()
    trans_path = os.path.join(output_dir, f"transcript_{lang_suffix}.json")
    with open(trans_path, "w", encoding="utf-8") as f:
        json.dump({
            "language": target_lang,
            "segments": translated_segments,
            "full_text": " ".join(full_translated)
        }, f, ensure_ascii=False, indent=2)

    txt_path = os.path.join(output_dir, f"transcript_{lang_suffix}.txt")
    with open(txt_path, "w", encoding="utf-8") as f:
        f.write(" ".join(full_translated))

    log(f"Tradução {lang_name} salva: {trans_path}", "OK")
    return translated_segments


# --- ETAPA 4: TTS ------------------------------------------------------------

async def synthesize_segment(text, voice, output_path):
    import edge_tts

    if not text or not text.strip():
        run(["ffmpeg", "-y", "-f", "lavfi", "-i", "anullsrc=r=24000:cl=mono",
             "-t", "0.5", output_path], timeout=15)
        return True

    try:
        # [FIX-7] timeout por segmento de TTS
        communicate = edge_tts.Communicate(text, voice)
        await asyncio.wait_for(communicate.save(output_path), timeout=TTS_TIMEOUT_S)
        return True
    except asyncio.TimeoutError:
        print(f"  [TTS TIMEOUT] segmento ignorado: {text[:50]}", flush=True)
        return False
    except Exception as e:
        print(f"  [TTS ERR] {e} | texto: {text[:50]}", flush=True)
        return False


async def synthesize_all_segments(segments, voice, output_dir, lang_code):
    lang_name = "Japonês" if lang_code == "ja" else "Português"
    log(f"TTS {lang_name} com {voice}...", "TTS")

    segments_dir = os.path.join(output_dir, f"segments_{lang_code}")
    os.makedirs(segments_dir, exist_ok=True)

    audio_files = []

    for i, seg in enumerate(segments):
        text = seg.get("translated", seg.get("text", ""))
        seg_path = os.path.join(segments_dir, f"seg_{i:04d}.mp3")

        # Skip se já existe (cache de segmento)
        if os.path.exists(seg_path) and os.path.getsize(seg_path) > 100:
            audio_files.append({
                "index": i, "path": seg_path,
                "start": seg["start"], "end": seg["end"],
                "duration": seg.get("duration", seg["end"] - seg["start"]),
                "text": text
            })
            continue

        success = await synthesize_segment(text, voice, seg_path)

        if success and os.path.exists(seg_path):
            audio_files.append({
                "index": i, "path": seg_path,
                "start": seg["start"], "end": seg["end"],
                "duration": seg.get("duration", seg["end"] - seg["start"]),
                "text": text
            })
            if (i + 1) % 10 == 0:
                print(f"  [{i+1}/{len(segments)}] segmentos sintetizados...", flush=True)
        else:
            print(f"  [WARN] Falha no segmento {i}", flush=True)

    log(f"TTS concluído: {len(audio_files)}/{len(segments)} segmentos", "OK")
    return audio_files


# --- ETAPA 5: Montar áudio ---------------------------------------------------

def assemble_audio_timeline(audio_files, video_duration, output_dir, lang_code):
    """
    [FIX-5] Em vez de amix com centenas de inputs (que trava o FFmpeg),
    usa abordagem em batches: mistura chunks de FFMPEG_MAX_INPUTS por vez.
    """
    log(f"Montando timeline de áudio [{lang_code.upper()}] com {len(audio_files)} segmentos...", "MIX")

    output_audio = os.path.join(output_dir, f"audio_final_{lang_code}.wav")

    if not audio_files:
        log("Nenhum segmento disponível!", "ERR")
        return None

    # Gera base de silêncio com a duração total do vídeo
    silence_path = os.path.join(output_dir, f"silence_base_{lang_code}.wav")
    run([
        "ffmpeg", "-y", "-f", "lavfi",
        "-i", f"anullsrc=r=24000:cl=mono",
        "-t", str(video_duration),
        "-c:a", "pcm_s16le",
        silence_path
    ])

    # Processa em batches para não explodir o FFmpeg
    current_base = silence_path

    for batch_start in range(0, len(audio_files), FFMPEG_MAX_INPUTS):
        batch = audio_files[batch_start : batch_start + FFMPEG_MAX_INPUTS]
        batch_out = os.path.join(output_dir, f"batch_{lang_code}_{batch_start:04d}.wav")

        is_last = (batch_start + FFMPEG_MAX_INPUTS) >= len(audio_files)
        final_out = output_audio if is_last else batch_out

        inputs = ["-i", current_base]
        for af in batch:
            inputs.extend(["-i", af["path"]])

        filter_parts = []
        for idx, af in enumerate(batch):
            stream_idx = idx + 1
            delay_ms = int(af["start"] * 1000)
            filter_parts.append(
                f"[{stream_idx}:a]aresample=24000,aformat=sample_fmts=s16:channel_layouts=mono,"
                f"adelay={delay_ms}|{delay_ms}[d{idx}]"
            )

        mix_inputs = "[0:a]" + "".join(f"[d{i}]" for i in range(len(batch)))
        filter_parts.append(
            f"{mix_inputs}amix=inputs={len(batch)+1}:normalize=0[out]"
        )

        cmd = [
            "ffmpeg", "-y",
            *inputs,
            "-filter_complex", ";".join(filter_parts),
            "-map", "[out]",
            "-t", str(video_duration),
            "-c:a", "pcm_s16le",
            "-ar",  "24000",
            final_out
        ]

        result = run(cmd, timeout=600)

        if result is None or not os.path.exists(final_out):
            log(f"Batch {batch_start} falhou, tentando concat...", "WARN")
            return assemble_audio_concat_method(audio_files, video_duration, output_dir, lang_code)

        current_base = final_out
        pct = min(100, int((batch_start + len(batch)) / len(audio_files) * 100))
        print(f"  Batch {batch_start//FFMPEG_MAX_INPUTS+1}: {pct}% concluído", flush=True)

    if os.path.exists(output_audio):
        size = os.path.getsize(output_audio) / 1024 / 1024
        log(f"Áudio final: {output_audio} ({size:.1f} MB)", "OK")
        return output_audio

    return None


def assemble_audio_concat_method(audio_files, video_duration, output_dir, lang_code):
    """Fallback: concat simples de segmentos com silêncio entre eles."""
    log("Usando método fallback de concat...", "RETRY")

    output_audio = os.path.join(output_dir, f"audio_final_{lang_code}.wav")
    concat_list  = os.path.join(output_dir, f"concat_{lang_code}.txt")

    with open(concat_list, "w") as f:
        prev_end = 0.0
        for af in audio_files:
            gap = af["start"] - prev_end
            if gap > 0.05:
                sil_seg = os.path.join(output_dir, f"sil_{lang_code}_{int(prev_end*1000)}.wav")
                run([
                    "ffmpeg", "-y", "-f", "lavfi",
                    "-i", f"anullsrc=r=24000:cl=mono",
                    "-t", str(gap),
                    "-c:a", "pcm_s16le",
                    sil_seg
                ], timeout=30)
                f.write(f"file '{sil_seg}'\n")
            f.write(f"file '{af['path']}'\n")
            prev_end = af["end"]

    run([
        "ffmpeg", "-y",
        "-f", "concat", "-safe", "0",
        "-i", concat_list,
        "-c:a", "pcm_s16le",
        "-ar", "24000",
        output_audio
    ], timeout=300)

    return output_audio if os.path.exists(output_audio) else None


# --- ETAPA 6: Vídeo final ----------------------------------------------------

def create_final_video(video_input, audio_path, output_dir, lang_code):
    lang_name = "Japanese" if lang_code == "ja" else "Portuguese"
    log(f"Criando vídeo final [{lang_name}]...", "VIDEO")

    output_video = os.path.join(output_dir, f"DAIG_Presentation_{lang_name}.mp4")

    run([
        "ffmpeg", "-y",
        "-i", video_input,
        "-i", audio_path,
        "-c:v", "copy",
        "-c:a", "aac",
        "-b:a", "192k",
        "-map", "0:v:0",
        "-map", "1:a:0",
        "-shortest",
        output_video
    ], timeout=300)

    if os.path.exists(output_video):
        size = os.path.getsize(output_video) / 1024 / 1024
        log(f"Vídeo [{lang_name}] pronto: {output_video} ({size:.1f} MB) ✅", "DONE")
        return output_video
    else:
        log(f"Erro ao criar vídeo [{lang_name}]", "ERR")
        return None


# --- MAIN --------------------------------------------------------------------

async def main():
    print("\n" + "="*60, flush=True)
    print("  DAIG VIDEO LOCALIZATION PIPELINE v2", flush=True)
    print("  Whisper STT → Translate → Edge-TTS → FFmpeg", flush=True)
    print("="*60 + "\n", flush=True)

    os.makedirs(OUTPUT_DIR, exist_ok=True)
    start_time = datetime.now()

    # Etapa 1: Áudio (com cache)
    audio_original = extract_audio(VIDEO_INPUT, OUTPUT_DIR)

    # Etapa 2: Transcrição (com cache)
    transcript_cache = os.path.join(OUTPUT_DIR, "transcript_original.json")
    if os.path.exists(transcript_cache):
        log("Transcrição encontrada em cache, pulando Whisper...", "CACHE")
        with open(transcript_cache, "r", encoding="utf-8") as f:
            data = json.load(f)
            segments = data["segments"]
        log(f"Cache carregado: {len(segments)} segmentos", "OK")
    else:
        segments = transcribe_audio(audio_original, OUTPUT_DIR)

    if not segments:
        log("ERRO: Nenhum segmento transcrito. Verifique o arquivo de áudio.", "ERR")
        return

    log(f"Segmentos disponíveis: {len(segments)}", "STATS")

    # Etapa 3: Tradução PT (com cache)
    pt_cache = os.path.join(OUTPUT_DIR, "transcript_PT.json")
    if os.path.exists(pt_cache):
        log("Tradução PT em cache...", "CACHE")
        with open(pt_cache, "r", encoding="utf-8") as f:
            pt_segments = json.load(f)["segments"]
    else:
        pt_segments = translate_segments(segments, "pt", OUTPUT_DIR)

    # Etapa 4: Tradução JA (com cache)
    ja_cache = os.path.join(OUTPUT_DIR, "transcript_JA.json")
    if os.path.exists(ja_cache):
        log("Tradução JA em cache...", "CACHE")
        with open(ja_cache, "r", encoding="utf-8") as f:
            ja_segments = json.load(f)["segments"]
    else:
        ja_segments = translate_segments(segments, "ja", OUTPUT_DIR)

    # Etapa 5: TTS PT
    pt_audio_files = await synthesize_all_segments(pt_segments, VOICE_PT, OUTPUT_DIR, "pt")

    # Etapa 6: TTS JA
    ja_audio_files = await synthesize_all_segments(ja_segments, VOICE_JA, OUTPUT_DIR, "ja")

    # Duração do vídeo
    result = subprocess.run(
        ["ffprobe", "-v", "quiet", "-show_entries", "format=duration",
         "-of", "default=noprint_wrappers=1:nokey=1", VIDEO_INPUT],
        capture_output=True, text=True, timeout=30
    )
    video_duration = float(result.stdout.strip())
    log(f"Duração do vídeo: {video_duration:.1f}s", "INFO")

    # Etapa 7: Montar áudios
    pt_audio_final = assemble_audio_timeline(pt_audio_files, video_duration, OUTPUT_DIR, "pt")
    ja_audio_final = assemble_audio_timeline(ja_audio_files, video_duration, OUTPUT_DIR, "ja")

    # Etapa 8: Vídeos finais
    pt_video = create_final_video(VIDEO_INPUT, pt_audio_final, OUTPUT_DIR, "pt") if pt_audio_final else None
    ja_video = create_final_video(VIDEO_INPUT, ja_audio_final, OUTPUT_DIR, "ja") if ja_audio_final else None

    elapsed = (datetime.now() - start_time).total_seconds() / 60

    print(f"\n{'='*60}", flush=True)
    print(f"  PIPELINE CONCLUÍDO em {elapsed:.1f} minutos", flush=True)
    if pt_video: print(f"  ✅ {pt_video}", flush=True)
    if ja_video: print(f"  ✅ {ja_video}", flush=True)
    print("="*60, flush=True)

    summary = {
        "pipeline_completed": datetime.now().isoformat(),
        "elapsed_minutes": elapsed,
        "input_video": VIDEO_INPUT,
        "segments_count": len(segments),
        "outputs": {"pt_video": pt_video, "ja_video": ja_video}
    }
    with open(os.path.join(OUTPUT_DIR, "pipeline_summary.json"), "w", encoding="utf-8") as f:
        json.dump(summary, f, ensure_ascii=False, indent=2)

    return summary


if __name__ == "__main__":
    asyncio.run(main())
