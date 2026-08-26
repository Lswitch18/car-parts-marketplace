import asyncio
import os
import edge_tts

SLIDES_JA = [
    {
        "id": 1,
        "text": "ダイグ公式プレゼンテーションへようこそ。ダイグは、日本初となるマルチモーダルAIを搭載した次世代JDM自動車パーツプラットフォームです。出品画面では、高度なコンピュータビジョンアシスタントにより、技術仕様や型番の手動入力を完全にゼロにします。"
    },
    {
        "id": 2,
        "text": "パーツの写真をアップロードするだけで、スバルSTI純正ブレンボブレーキなどの複雑なパーツも、ニューラルネットワークがわずか3秒で解析します。メーカー名、適合車種、年式、パーツ状態を自動判別し、高精度な技術説明文を瞬時に生成します。"
    },
    {
        "id": 3,
        "text": "公開パーツカタログでは、サイバーネオンを基調とした洗练されたデザインで、5,000点以上の在庫を美しく表示します。グリッドとリスト表示の即時切り替え、新着・人気順の並び替え、日産、トヨタ、ホンダ、スバル、HKS、GReddyなど伝説的JDMブランドでの絞り込みが可能です。"
    },
    {
        "id": 4,
        "text": "ダイグの最大の強みの一つは、リアルタイム多言語ローカライズです。言語セレクターをワンクリックするだけで、日本のカタカナや漢字のパーツ情報が自然なポルトガル語へと瞬時に翻訳されます。世界中のバイヤーやチューニングショップが、言葉の壁なく希少なパーツを見つけることができます。"
    },
    {
        "id": 5,
        "text": "マーケットプレイスの管理画面では、日本円でのリアルタイムな資金フローを確認できます。ダイグはStripe Connectによる安全なエスクロー信託を採用しており、プラットフォームが10%の手数料を保持し、残り90%をセラーへ自動送金することで、不正を防ぎ安全な取引を実現します。"
    },
    {
        "id": 6,
        "text": "法人エコシステムを強化するため、ダイグは自動車解体業者やパートナー店舗向けに包括的なB2B SaaSハブを提供しています。月次経常収益MRR、Starter・Pro・Enterpriseプランの契約状況、回収率100%のStripe Billing連携を一元管理。日本市場をリードする高バリュエーション設計です。"
    }
]

OUTPUT_DIR = "/home/lswitch/car-parts-marketplce/public/presentation_audio"
VOICE_MALE = "ja-JP-KeitaNeural"
VOICE_FEMALE = "ja-JP-NanamiNeural"

async def generate_audio():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    for slide in SLIDES_JA:
        idx = slide["id"]
        text = slide["text"]
        
        # Male Voice (Keita)
        male_file = os.path.join(OUTPUT_DIR, f"slide_ja_{idx}.mp3")
        print(f"🎙️ Gerando Áudio Japonês Masculino (Keita Neural) - Slide {idx}...")
        communicate_male = edge_tts.Communicate(text, VOICE_MALE, rate="+0%", pitch="+0Hz")
        await communicate_male.save(male_file)
        print(f"✅ Salvo: {male_file} ({os.path.getsize(male_file)} bytes)")
        
        # Female Voice (Nanami)
        female_file = os.path.join(OUTPUT_DIR, f"slide_ja_f_{idx}.mp3")
        print(f"🎙️ Gerando Áudio Japonês Feminino (Nanami Neural) - Slide {idx}...")
        communicate_female = edge_tts.Communicate(text, VOICE_FEMALE, rate="+0%", pitch="+0Hz")
        await communicate_female.save(female_file)
        print(f"✅ Salvo: {female_file} ({os.path.getsize(female_file)} bytes)")

if __name__ == "__main__":
    asyncio.run(generate_audio())
