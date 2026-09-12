import re

def shift_vtt(input_file, output_file, shift_seconds, first_cue_text):
    with open(input_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    blocks = re.split(r'\n\n+', content)
    header = blocks[0]
    
    new_blocks = [header]
    
    # Create new first cue
    new_blocks.append("1\n00:00:00.000 --> 00:00:07.500\n" + first_cue_text)
    
    # Process old cues (they start from block[1])
    for i, block in enumerate(blocks[1:]):
        if not block.strip(): continue
        
        lines = block.strip().split('\n')
        if len(lines) >= 2 and '-->' in lines[1]:
            time_line = lines[1]
            text_lines = lines[2:]
        elif len(lines) >= 2 and '-->' in lines[0]:
            time_line = lines[0]
            text_lines = lines[1:]
        else:
            continue
            
        def shift_time(t_str):
            h, m, s = t_str.split(':')
            s, ms = s.split('.')
            total_sec = int(h)*3600 + int(m)*60 + int(s) + shift_seconds
            new_h = total_sec // 3600
            new_m = (total_sec % 3600) // 60
            new_s = total_sec % 60
            return f"{new_h:02d}:{new_m:02d}:{new_s:02d}.{ms}"
            
        t1, t2 = time_line.split(' --> ')
        new_t1 = shift_time(t1.strip())
        new_t2 = shift_time(t2.strip())
        
        new_cue = f"{i+2}\n{new_t1} --> {new_t2}\n" + '\n'.join(text_lines)
        new_blocks.append(new_cue)
        
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write('\n\n'.join(new_blocks))

pt_text = "Esta é a DAIG. Uma plataforma ultra-moderna onde você pode interagir com peças em 3D antes de comprar."
ja_text = "これがDAIGです。購入前に3Dでパーツを確認できる超モダンなプラットフォームです。"

shift_vtt('public/videos/demo-pt.vtt', 'public/videos/demo-pt.vtt', 8, pt_text)
shift_vtt('public/videos/demo-ja.vtt', 'public/videos/demo-ja.vtt', 8, ja_text)
print("VTTs shifted successfully!")
