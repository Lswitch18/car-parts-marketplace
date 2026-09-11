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
t_start_1 = d0
t_start_2 = t_start_1 + d1
t_start_3 = t_start_2 + d2
t_start_4 = t_start_3 + d3
t_start_5 = t_start_4 + d4
t_start_6 = t_start_5 + d5
t_start_7 = t_start_6 + d6
total = t_start_7 + d7

def format_time(seconds):
    h = int(seconds // 3600)
    m = int((seconds % 3600) // 60)
    s = int(seconds % 60)
    ms = int((seconds - int(seconds)) * 1000)
    return f"{h:02d}:{m:02d}:{s:02d}.{ms:03d}"

cues_pt = [
    f"1\n{format_time(t_start_0)} --> {format_time(t_start_1 - 0.5)}\nBem-vindo à DAIG, sua garagem digital. Para começar, clique no botão de cadastro no topo para criar sua conta gratuitamente.",
    f"2\n{format_time(t_start_1)} --> {format_time(t_start_2 - 0.5)}\nNa tela de registro rápido, você tem a opção de preencher o formulário tradicional ou cadastrar instantaneamente usando sua conta Google.",
    f"3\n{format_time(t_start_2)} --> {format_time(t_start_3 - 0.5)}\nApós entrar, você tem acesso imediato à plataforma unificada, que conecta você aos melhores desmanches homologados no Japão.",
    f"4\n{format_time(t_start_3)} --> {format_time(t_start_4 - 0.5)}\nNo catálogo inteligente, encontre milhares de peças genuínas. Use filtros precisos para buscar pelo chassi, marca ou modelo exato.",
    f"5\n{format_time(t_start_4)} --> {format_time(t_start_5 - 0.5)}\nA página de produto exibe todas as especificações técnicas, incluindo o histórico da peça, condição real e detalhes JDM originais.",
    f"6\n{format_time(t_start_5)} --> {format_time(t_start_6 - 0.5)}\nPara os vendedores, basta fazer o upload de uma foto da peça. Nossa Inteligência Artificial analisa a imagem e preenche o anúncio em segundos.",
    f"7\n{format_time(t_start_6)} --> {format_time(t_start_7 - 0.5)}\nA comunicação não tem barreiras. O chat embutido com tradução simultânea permite negociações diretas entre comprador e desmanche.",
    f"8\n{format_time(t_start_7)} --> {format_time(total - 0.5)}\nO checkout é protegido pelo Stripe. O dinheiro fica seguro em Escrow e o vendedor recebe na liquidação T+4 apenas após a entrega garantida."
]

cues_ja = [
    f"1\n{format_time(t_start_0)} --> {format_time(t_start_1 - 0.5)}\nDAIGへようこそ。あなたのデジタルガレージです。始めるには、上部の登録ボタンをクリックして無料アカウントを作成してください。",
    f"2\n{format_time(t_start_1)} --> {format_time(t_start_2 - 0.5)}\n迅速な登録画面では、標準フォームに入力するか、Googleアカウントで即座に登録するかを選択できます。",
    f"3\n{format_time(t_start_2)} --> {format_time(t_start_3 - 0.5)}\nログイン後、日本の認定解体業者とあなたをつなぐ、統合プラットフォームにすぐにアクセスできます。",
    f"4\n{format_time(t_start_3)} --> {format_time(t_start_4 - 0.5)}\nスマートカタログでは、何千もの純正部品を見つけることができます。シャーシ、メーカー、モデルなどの正確なフィルターを使用してください。",
    f"5\n{format_time(t_start_4)} --> {format_time(t_start_5 - 0.5)}\n製品ページには、部品の履歴、実際の状態、オリジナルのJDMの詳細など、すべての技術仕様が表示されます。",
    f"6\n{format_time(t_start_5)} --> {format_time(t_start_6 - 0.5)}\n出品者向けには、部品の写真をアップロードするだけです。私たちの人工知能が画像を分析し、数秒で広告を自動入力します。",
    f"7\n{format_time(t_start_6)} --> {format_time(t_start_7 - 0.5)}\nコミュニケーションに壁はありません。同時翻訳を備えた統合チャットにより、買い手と解体業者が直接交渉できます。",
    f"8\n{format_time(t_start_7)} --> {format_time(total - 0.5)}\nチェックアウトはStripeによって保護されます。資金はエスクローで安全に保管され、配達が保証された後のT+4決済で出品者に支払われます。"
]

with open("public/videos/demo-pt.vtt", "w") as f:
    f.write("WEBVTT\n\n" + "\n\n".join(cues_pt) + "\n")

with open("public/videos/demo-ja.vtt", "w") as f:
    f.write("WEBVTT\n\n" + "\n\n".join(cues_ja) + "\n")

print(f"Total video length: {total}s")
print("VTT files successfully synchronized to the video!")

print("Percentages for PresentationPage.tsx:")
print(f"{{ label: 'Revolução 360°', pct: 0 }},")
print(f"{{ label: 'Cadastro & Google', pct: {round((t_start_1/total)*100, 1)} }},")
print(f"{{ label: 'Plataforma Unificada', pct: {round((t_start_2/total)*100, 1)} }},")
print(f"{{ label: 'Catálogo JDM', pct: {round((t_start_3/total)*100, 1)} }},")
print(f"{{ label: 'Especificações 3D', pct: {round((t_start_4/total)*100, 1)} }},")
print(f"{{ label: 'IA para Vendedores', pct: {round((t_start_5/total)*100, 1)} }},")
print(f"{{ label: 'Chat com Tradução', pct: {round((t_start_6/total)*100, 1)} }},")
print(f"{{ label: 'Pagamento Escrow', pct: {round((t_start_7/total)*100, 1)} }},")
