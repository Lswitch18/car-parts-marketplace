import re
import os
import json

AUCTIONS_PATH = "/home/lswitch/car-parts-marketplce/src/modules/auctions/pages/Auctions.tsx"
I18N_PATH = "/home/lswitch/car-parts-marketplce/src/modules/shared/lib/i18n.tsx"

with open(AUCTIONS_PATH, 'r', encoding='utf-8') as f:
    auctions_content = f.read()

replacements = {
    # Real-time subscriptions & Feed
    "🔨 Novo lance: ¥": "🔨 ${t('Novo lance:')} ¥",
    "Erro ao carregar leilões": "t('Erro ao carregar leilões')",
    
    # Hero section
    "Transmissão Ao Vivo · ": "{t('Transmissão Ao Vivo')} · ",
    "{auctions.length} {t('Ativos')}": "{auctions.length} {t('Ativos')}",
    "Leilões{' '}": "{t('Leilões')}{' '}",
    ">Leilões{' '}": ">{t('Leilões')}{' '}",
    "Ao Vivo": "Ao Vivo", # need to replace carefully
    "Dispute em tempo real as peças automotivas mais raras do Japão.{' '}": "{t('Dispute em tempo real as peças automotivas mais raras do Japão.')}{' '}",
    "Lances atualizam instantaneamente": "{t('Lances atualizam instantaneamente')}",
    "para todos os participantes.": "{t('para todos os participantes.')}",
    
    # Loading / Errors
    "Sincronizando feed ao vivo...": "{t('Sincronizando feed ao vivo...')}",
    "Não foi possível carregar": "{t('Não foi possível carregar')}",
    "Tentar Novamente": "{t('Tentar Novamente')}",
    "Nenhum leilão ativo": "{t('Nenhum leilão ativo')}",
    "Seja o primeiro a anunciar sua peça no leilão ao vivo.": "{t('Seja o primeiro a anunciar sua peça no leilão ao vivo.')}",
    ">Anunciar Peça<": ">{t('Anunciar Peça')}<",
    
    # Card
    "lances<": " {t('lances')}<",
    "'Vendedor'": "t('Vendedor')",
    ">Lance Atual<": ">{t('Lance Atual')}<",
    "Dar Lance": "{t('Dar Lance')}",
    "Processando...": "t('Processando...')",
    "'Comprar Agora'": "t('Comprar Agora')",
    "'Encerrado'": "t('Encerrado')",
    "Encerra em<": "{t('Encerra em')}<",
    "Sem descrição disponível.": "{t('Sem descrição disponível.')}",
    
    # Right panel
    ">Total de Lances<": ">{t('Total de Lances')}<",
    "Feed de Lances Ao Vivo": "{t('Feed de Lances Ao Vivo')}",
    "Nenhum lance ainda. Seja o primeiro!": "{t('Nenhum lance ainda. Seja o primeiro!')}",
    "'Licitante'": "t('Licitante')",
    "Líder": "{t('Líder')}",
    
    # Payment
    "🎉 Você venceu!": "🎉 {t('Você venceu!')}",
    "Complete o pagamento de ": "{t('Complete o pagamento de')} ",
    " para garantir sua peça.": " {t('para garantir sua peça.')}",
    "Pagar Agora": "{t('Pagar Agora')}",
    "Este leilão foi encerrado.": "{t('Este leilão foi encerrado.')}",
    "Seu Lance — Mín: ": "{t('Seu Lance — Mín:')} ",
    
    # API calls / Alerts
    "'✅ Lance registrado com sucesso!'": "`✅ ${t('Lance registrado com sucesso!')}`",
    "Erro ao enviar lance.": "t('Erro ao enviar lance.')",
    "Lance mínimo: ": "${t('Lance mínimo:')} ",
    "Erro ao processar compra": "t('Erro ao processar compra')",
    "'Transação não encontrada'": "t('Transação não encontrada')",
    "'Erro ao redirecionar para pagamento'": "t('Erro ao redirecionar para pagamento')",
}

# Special regex replacements to avoid breaking HTML
auctions_content = re.sub(r'>\s*Ao Vivo\s*<', r'>{t(\'Ao Vivo\')}<', auctions_content)
auctions_content = auctions_content.replace(">Leilões{' '}", ">{t('Leilões')}{' '}")
auctions_content = auctions_content.replace("Dar Lance", "{t('Dar Lance')}")
auctions_content = auctions_content.replace("Pagar Agora\n", "{t('Pagar Agora')}\n")

for k, v in replacements.items():
    if k not in ["Ao Vivo", "Dar Lance", "Pagar Agora\n"]:
        auctions_content = auctions_content.replace(k, v)

# Fix double t() if it happened
auctions_content = auctions_content.replace("t(t(", "t(")

with open(AUCTIONS_PATH, 'w', encoding='utf-8') as f:
    f.write(auctions_content)


translations = {
    'Leilões': 'オークション',
    'Ao Vivo': 'ライブ',
    'Transmissão Ao Vivo': '生放送',
    'Ativos': 'アクティブ',
    'Dispute em tempo real as peças automotivas mais raras do Japão.': '日本の最も希少な自動車部品をリアルタイムで競り合います。',
    'Lances atualizam instantaneamente': '入札は即座に更新されます',
    'para todos os participantes.': 'すべての参加者のために。',
    'Sincronizando feed ao vivo...': 'ライブフィードを同期中...',
    'Não foi possível carregar': '読み込めませんでした',
    'Tentar Novamente': '再試行',
    'Nenhum leilão ativo': 'アクティブなオークションはありません',
    'Seja o primeiro a anunciar sua peça no leilão ao vivo.': 'ライブオークションで最初の出品者になりましょう。',
    'Anunciar Peça': '部品を出品',
    'Encerra em': '終了まで',
    'Lance Atual': '現在の入札',
    'Total de Lances': '入札総数',
    'Dar Lance': '入札する',
    'Comprar Agora': '今すぐ購入',
    'Processando...': '処理中...',
    'Vendedor': '出品者',
    'lances': '入札',
    'Encerrado': '終了',
    'Feed de Lances Ao Vivo': 'ライブ入札フィード',
    'Nenhum lance ainda. Seja o primeiro!': 'まだ入札はありません。最初に入札しましょう！',
    'Licitante': '入札者',
    'Líder': 'リーダー',
    'Você venceu!': '落札しました！',
    'Complete o pagamento de': '支払いを完了して',
    'para garantir sua peça.': '部品を確保してください。',
    'Pagar Agora': '今すぐ支払う',
    'Este leilão foi encerrado.': 'このオークションは終了しました。',
    'Seu Lance — Mín:': 'あなたの入札 — 最小：',
    'Novo lance:': '新しい入札:',
    'Erro ao carregar leilões': 'オークションの読み込みエラー',
    'Lance registrado com sucesso!': '入札が正常に登録されました！',
    'Erro ao enviar lance.': '入札の送信エラー。',
    'Lance mínimo:': '最小入札額:',
    'Erro ao processar compra': '購入処理エラー',
    'Transação não encontrada': '取引が見つかりません',
    'Erro ao redirecionar para pagamento': '支払いへのリダイレクトエラー',
    'Sem descrição disponível.': '説明はありません。',
}

with open(I18N_PATH, 'r', encoding='utf-8') as f:
    i18n_content = f.read()

# Insert into the 'ja' object. We'll find `ja: {` and insert after it.
insertion = ""
for k, v in translations.items():
    insertion += f"    '{k}': '{v}',\n"

if "ja: {" in i18n_content:
    i18n_content = i18n_content.replace("ja: {", "ja: {\n" + insertion, 1)

with open(I18N_PATH, 'w', encoding='utf-8') as f:
    f.write(i18n_content)

print("Done translations")
