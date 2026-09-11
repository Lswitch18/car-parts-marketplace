import os
import subprocess

def get_duration(filename):
    cmd = ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", filename]
    result = subprocess.run(cmd, capture_output=True, text=True)
    return float(result.stdout.strip())

# Obter durações reais
d0 = get_duration("public/videos/demo_0_landing.webm")
d1 = get_duration("public/videos/demo_1_register.webm")
d2 = get_duration("public/videos/demo_2_home.webm")
d3 = get_duration("public/videos/demo_3_catalog.webm")
d4 = get_duration("public/videos/demo_4_product.webm")
d5 = get_duration("public/videos/demo_5_upload.webm")
d6 = get_duration("public/videos/demo_6_messages.webm")
d7 = get_duration("public/videos/demo_7_checkout.webm")

# Calcular os pontos de início
t_start_0 = 0.0
t_start_1 = d0 + d1
t_start_2 = t_start_1 + d2
t_start_3 = t_start_2 + d3
t_start_4 = t_start_3 + d4
t_start_5 = t_start_4 + d5
t_start_6 = t_start_5 + d6
total = t_start_6 + d7

def format_time(seconds):
    h = int(seconds // 3600)
    m = int((seconds % 3600) // 60)
    s = int(seconds % 60)
    ms = int((seconds - int(seconds)) * 1000)
    return f"{h:02d}:{m:02d}:{s:02d}.{ms:03d}"

cues_pt = [
    f"1\n{format_time(t_start_0)} --> {format_time(t_start_1 - 0.5)}\nBem-vindo à DAIG. Tudo começa com o cadastro, que leva menos de um minuto para compradores e vendedores.",
    f"2\n{format_time(t_start_1)} --> {format_time(t_start_2 - 0.5)}\nApós entrar, você tem acesso aos módulos: Gestão Inteligente para desmanches e o Marketplace Central.",
    f"3\n{format_time(t_start_2)} --> {format_time(t_start_3 - 0.5)}\nNo catálogo, encontre milhares de peças genuínas de desmanches homologados no Japão, com filtros precisos.",
    f"4\n{format_time(t_start_3)} --> {format_time(t_start_4 - 0.5)}\nA página de produto detalha as condições da peça, histórico e especificações originais JDM.",
    f"5\n{format_time(t_start_4)} --> {format_time(t_start_5 - 0.5)}\nPara os vendedores, a inteligência artificial gera o anúncio completo a partir de uma única foto.",
    f"6\n{format_time(t_start_5)} --> {format_time(t_start_6 - 0.5)}\nA comunicação flui sem barreiras. O chat integrado permite negociações diretas em tempo real.",
    f"7\n{format_time(t_start_6)} --> {format_time(total - 0.5)}\nO pagamento é seguro. Via Stripe, o valor fica em Escrow e o vendedor recebe na liquidação T+4 após a entrega."
]

cues_ja = [
    f"1\n{format_time(t_start_0)} --> {format_time(t_start_1 - 0.5)}\nDAIGへようこそ。すべてはプラットフォームでの登録から始まります。バイヤーとセラーの登録は1分未満で完了します。",
    f"2\n{format_time(t_start_1)} --> {format_time(t_start_2 - 0.5)}\nログイン後、解体業者向けのスマート管理モジュールとマーケットプレイス・セントラルにアクセスできます。",
    f"3\n{format_time(t_start_2)} --> {format_time(t_start_3 - 0.5)}\nカタログでは、日本の認定解体業者からの何千もの純正部品を見つけることができます。",
    f"4\n{format_time(t_start_3)} --> {format_time(t_start_4 - 0.5)}\n製品ページには、部品の状態、履歴、オリジナルのJDM仕様が詳細に記載されています。",
    f"5\n{format_time(t_start_4)} --> {format_time(t_start_5 - 0.5)}\n出品者にとって、AIは写真1枚からポルトガル語と日本語で完全な広告を自動生成します。",
    f"6\n{format_time(t_start_5)} --> {format_time(t_start_6 - 0.5)}\n統合されたチャットにより、買い手と解体業者がリアルタイムで直接交渉できます。",
    f"7\n{format_time(t_start_6)} --> {format_time(total - 0.5)}\nStripeを通じて、資金はエスクローに保管され、配達後のT+4決済で出品者に自動的に支払われます。"
]

with open("public/videos/demo-pt.vtt", "w") as f:
    f.write("WEBVTT\n\n" + "\n\n".join(cues_pt) + "\n")

with open("public/videos/demo-ja.vtt", "w") as f:
    f.write("WEBVTT\n\n" + "\n\n".join(cues_ja) + "\n")

print(f"Total video length: {total}s")
print("VTT files successfully synchronized to the video!")
