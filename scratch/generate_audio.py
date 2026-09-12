import re
import os
import subprocess
import asyncio
import edge_tts

def parse_vtt(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Simple parser: look for blocks with times
    blocks = re.split(r'\n\n+', content)
    cues = []
    for block in blocks:
        lines = block.strip().split('\n')
        if len(lines) >= 2 and '-->' in lines[0] or (len(lines) >= 3 and '-->' in lines[1]):
            time_line = lines[1] if '-->' in lines[1] else lines[0]
            text_lines = lines[2:] if '-->' in lines[1] else lines[1:]
            
            # parse time
            start_str = time_line.split('-->')[0].strip()
            # convert hh:mm:ss.mmm to ms
            h, m, s = start_str.split(':')
            s, ms = s.split('.')
            start_ms = int(h)*3600000 + int(m)*60000 + int(s)*1000 + int(ms)
            
            text = ' '.join(text_lines)
            cues.append({'start_ms': start_ms, 'text': text})
    return cues

async def generate_cues(cues, voice, out_prefix):
    for i, cue in enumerate(cues):
        out_file = f"{out_prefix}_{i}.mp3"
        print(f"Generating {out_file}...")
        communicate = edge_tts.Communicate(cue['text'], voice, rate="+5%")
        await communicate.save(out_file)
        cue['file'] = out_file

def merge_audio(cues, total_duration_ms, out_file):
    # We will build an ffmpeg complex filter to pad and mix
    # ffmpeg -i 1.mp3 -i 2.mp3 -filter_complex "[0]adelay=1000|1000[a0];[1]adelay=5000|5000[a1];[a0][a1]amix=inputs=2[out]" -map "[out]" out.mp3
    
    inputs = []
    filter_parts = []
    mix_inputs = []
    
    for i, cue in enumerate(cues):
        inputs.extend(["-i", cue['file']])
        delay_ms = cue['start_ms']
        filter_parts.append(f"[{i}]adelay={delay_ms}|{delay_ms}[a{i}]")
        mix_inputs.append(f"[a{i}]")
        
    mix_str = "".join(mix_inputs)
    complex_filter = ";".join(filter_parts) + f";{mix_str}amix=inputs={len(cues)}:normalize=0[out]"
    
    cmd = ["ffmpeg", "-y"] + inputs + ["-filter_complex", complex_filter, "-map", "[out]", out_file]
    print(f"Running ffmpeg for {out_file}...")
    subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    
    # cleanup temp files
    for cue in cues:
        os.remove(cue['file'])

async def main():
    print("Parsing PT...")
    pt_cues = parse_vtt('public/videos/demo-pt.vtt')
    await generate_cues(pt_cues, 'pt-BR-AntonioNeural', 'tmp_pt')
    merge_audio(pt_cues, 120000, 'public/videos/demo-pt.mp3')
    
    print("Parsing JA...")
    ja_cues = parse_vtt('public/videos/demo-ja.vtt')
    await generate_cues(ja_cues, 'ja-JP-KeitaNeural', 'tmp_ja')
    merge_audio(ja_cues, 120000, 'public/videos/demo-ja.mp3')
    
    print("Done!")

asyncio.run(main())
