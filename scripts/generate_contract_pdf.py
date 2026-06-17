#!/usr/bin/env python3
import sys
import os
import argparse
from pathlib import Path

# Auto-install dependencies if not present
try:
    from weasyprint import HTML, CSS
    import markdown2
except ImportError:
    print("Installing dependencies (weasyprint, markdown2)...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "markdown2", "weasyprint"])
    from weasyprint import HTML, CSS
    import markdown2

CONTRACT_TEMPLATE_PT = """
# CONTRATO DE PARCERIA E PRESTAÇÃO DE SERVIÇOS LOGÍSTICOS B2B

**CONTRATO Nº:** {contract_number}  
**DATA DE EMISSÃO:** {date}  

---

### PARTES
- **PLATAFORMA:** JDM Logistix WMS, representada pela matriz operacional em Tóquio, Japão.
- **PARCEIRO LOGÍSTICO:** **{partner_name}**, doravante denominada **CONTRATADA**, com endereço eletrônico corporativo **{partner_email}**.

---

### CLÁUSULA PRIMEIRA — DO OBJETO
O presente instrumento estabelece a cooperação comercial entre as partes para uso e integração do sistema **Logistix WMS** sob o protocolo de integração **B2B API**. O PARCEIRO LOGÍSTICO terá acesso ao ecossistema para gestão de coletas, triagens e acompanhamento de rotas no Japão.

### CLÁUSULA SEGUNDA — DA CONFIDENCIALIDADE E ISOLAMENTO DE DADOS
Em concordância com as diretrizes de segurança da PLATAFORMA:
1. O acesso a dados do banco de dados (pedidos, rastreamento, inventários) será restrito e isolado com base no escopo e permissão da API Key fornecida.
2. A CONTRATADA está expressamente proibida de acessar ou tentar coletar dados que extrapolem seu escopo logístico pré-configurado.

### CLÁUSULA TERCEIRA — DOS VALORES E PAGAMENTO
1. Pela contratação dos serviços e licença de uso do software, a CONTRATADA pagará o valor mensal de **¥ {contract_value}** ({periodicity}).
2. O envio de chaves de acesso ativas (B2B API Keys) será liberado de forma imediata e automatizada no painel administrativo **após a confirmação bancária/sistema de pagamento e assinatura eletrônica do presente termo**.

---

### CLÁUSULA QUARTA — DA RESCISÃO
O descumprimento de qualquer uma das cláusulas deste contrato, especialmente a violação de segurança de dados ou atraso no pagamento superior a 15 dias, autoriza a PLATAFORMA a suspender de imediato a API Key e rescindir a parceria sem aviso prévio.

---

<br/><br/>
<div class="signature-section">
    <div class="sig-box">
        <p>___________________________________________</p>
        <p><strong>JDM Logistix WMS</strong></p>
        <p>Diretoria de Operações</p>
    </div>
    <div class="sig-box">
        <p>___________________________________________</p>
        <p><strong>{partner_name}</strong></p>
        <p>Representante Autorizado</p>
    </div>
</div>
"""

CONTRACT_TEMPLATE_EN = """
# B2B PARTNERSHIP AND LOGISTICS SERVICES AGREEMENT

**CONTRACT NO:** {contract_number}  
**DATE OF ISSUE:** {date}  

---

### PARTIES
- **PLATFORM:** JDM Logistix WMS, represented by its operational headquarters in Tokyo, Japan.
- **LOGISTICS PARTNER:** **{partner_name}**, hereinafter referred to as the **CONTRACTED PARTY**, with the corporate email address **{partner_email}**.

---

### FIRST CLAUSE — OBJECT
This instrument establishes the commercial cooperation between the parties for the use and integration of the **Logistix WMS** system under the **B2B API** integration protocol. The LOGISTICS PARTNER will have access to the ecosystem for dispatch management, sorting, and tracking of routes in Japan.

### SECOND CLAUSE — CONFIDENTIALITY AND DATA ISOLATION
In compliance with the PLATFORM's security guidelines:
1. Access to database records (orders, tracking, inventory) will be restricted and isolated based on the scope and permissions of the provided API Key.
2. The CONTRACTED PARTY is strictly prohibited from accessing or attempting to collect data that exceeds its pre-configured logistics scope.

### THIRD CLAUSE — PRICING AND PAYMENT
1. For the services contracted and software license, the CONTRACTED PARTY will pay a monthly value of **¥ {contract_value}** ({periodicity}).
2. The active access keys (B2B API Keys) will be released automatically and immediately on the administrative panel **following bank confirmation/payment system approval and electronic signature of this agreement**.

---

### FOURTH CLAUSE — TERMINATION
Failure to comply with any clause of this contract, especially data security breaches or payment delays exceeding 15 days, authorizes the PLATFORM to immediately suspend the API Key and terminate the partnership without prior notice.

---

<br/><br/>
<div class="signature-section">
    <div class="sig-box">
        <p>___________________________________________</p>
        <p><strong>JDM Logistix WMS</strong></p>
        <p>Operations Directorate</p>
    </div>
    <div class="sig-box">
        <p>___________________________________________</p>
        <p><strong>{partner_name}</strong></p>
        <p>Authorized Representative</p>
    </div>
</div>
"""

CONTRACT_TEMPLATE_JA = """
# B2Bパートナーシップおよび物流サービス提供契約書

**契約番号:** {contract_number}  
**発行日:** {date}  

---

### 当事者
- **プラットフォーム:** JDM Logistix WMS（日本国東京都の本社運営部門を代表とする）
- **物流パートナー:** **{partner_name}**（以下「**乙**」という）、コーポレートメールアドレス: **{partner_email}**

---

### 第一条 — 目的
本契約は、**B2B API**統合プロトコルの下で**Logistix WMS**システムを使用および統合するための当事者間の商業的協力を確立します。物流パートナーは、日本国内での集荷、仕分け、およびルート追跡の管理のためにエコシステムにアクセスできます。

### 第二条 — 機密保持およびデータの隔離
プラットフォームのセキュリティガイドラインに従い：
1. データベースレコード（注文、追跡、在庫）へのアクセスは、提供されたAPIキーのスコープおよび権限に基づいて制限および隔離されます。
2. 乙は、事前に設定された物流スコープを超えるデータへのアクセスまたは収集の試みを厳重に禁止されます。

### 第三条 — 料金および支払い
1. 契約されたサービスおよびソフトウェアライセンスの使用料として、乙は月額**¥ {contract_value}**（{periodicity}）を支払うものとします。
2. 有効なアクセスキー（B2B APIキー）は、**銀行振込の確認/決済システムの承認および本契約への電子署名が完了した後**、管理パネル上で自動的かつ即座に有効化されます。

---

### 第四条 — 契約解除
本契約の条項のいずれかに違反した場合、特にデータセキュリティの侵害または15日を超える支払いの遅延があった場合、プラットフォームは即座にAPIキーを停止し、事前の通知なしにパートナーシップを解除する権利を有します。

---

<br/><br/>
<div class="signature-section">
    <div class="sig-box">
        <p>___________________________________________</p>
        <p><strong>JDM Logistix WMS</strong></p>
        <p>運営責任者</p>
    </div>
    <div class="sig-box">
        <p>___________________________________________</p>
        <p><strong>{partner_name}</strong></p>
        <p>権限ある代表者</p>
    </div>
</div>
"""

CONTRACT_CSS = """
@page {
    size: A4;
    margin: 2.5cm;
    font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
    @bottom-right {
        content: counter(page);
        font-size: 9pt;
        color: #7f8c8d;
    }
}

body {
    font-size: 11pt;
    line-height: 1.6;
    color: #2c3e50;
}

h1 {
    font-size: 20pt;
    font-weight: 700;
    color: #1a1a1a;
    border-bottom: 2px solid #e74c3c;
    padding-bottom: 12px;
    margin-bottom: 25px;
    text-align: center;
    text-transform: uppercase;
}

h3 {
    font-size: 12pt;
    font-weight: 700;
    color: #2c3e50;
    margin-top: 25px;
    margin-bottom: 10px;
    border-bottom: 1px solid #eee;
    padding-bottom: 5px;
}

p {
    margin-bottom: 12px;
    text-align: justify;
}

ul {
    margin-left: 20px;
    margin-bottom: 12px;
}

li {
    margin-bottom: 6px;
    text-align: justify;
}

.signature-section {
    margin-top: 50px;
    display: flex;
    justify-content: space-between;
}

.sig-box {
    width: 45%;
    text-align: center;
    font-size: 10pt;
}

.sig-box p {
    text-align: center;
    margin-bottom: 4px;
}
"""

def generate_contract(partner_name, partner_email, contract_value, contract_number, output_path, periodicity="mensal", language="pt"):
    from datetime import datetime
    
    # Choose template and date format based on language
    if language == "en":
        date_str = datetime.now().strftime("%B %d, %Y")
        template = CONTRACT_TEMPLATE_EN
        periodicity_map = {"mensal": "monthly", "anual": "yearly", "avulso": "one-off"}
        periodicity_val = periodicity_map.get(periodicity, periodicity)
    elif language == "ja":
        date_str = datetime.now().strftime("%Y年%m月%d日")
        template = CONTRACT_TEMPLATE_JA
        periodicity_map = {"mensal": "月額", "anual": "年額", "avulso": "都度"}
        periodicity_val = periodicity_map.get(periodicity, periodicity)
    else: # Default/PT
        date_str = datetime.now().strftime("%d/%m/%Y")
        template = CONTRACT_TEMPLATE_PT
        periodicity_val = periodicity
    
    # Format template
    md_content = template.format(
        partner_name=partner_name,
        partner_email=partner_email,
        contract_value=f"{float(contract_value):,.2f}".replace(",", "."),
        contract_number=contract_number,
        date=date_str,
        periodicity=periodicity_val
    )
    
    # Convert MD to HTML
    html_body = markdown2.markdown(md_content)
    
    title = "Contrato de Parceria B2B"
    if language == "en":
        title = "B2B Partnership Agreement"
    elif language == "ja":
        title = "B2Bパートナーシップ契約書"

    full_html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>{title}</title>
    </head>
    <body>
        {html_body}
    </body>
    </html>
    """
    
    # Create output dir if needed
    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
    
    # Write PDF
    HTML(string=full_html).write_pdf(output_path, stylesheets=[CSS(string=CONTRACT_CSS)])
    print(f"✅ Contrato PDF gerado com sucesso em: {output_path} (Language: {language})")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Gerador de Contrato PDF JDM Logistix")
    parser.add_argument("--partner-name", required=True, help="Nome do parceiro")
    parser.add_argument("--partner-email", required=True, help="E-mail do parceiro")
    parser.add_argument("--value", default="60000.00", help="Valor mensal do contrato")
    parser.add_argument("--contract-number", default="JDM-2026-001", help="Numero do contrato")
    parser.add_argument("--output", required=True, help="Caminho de saída para o PDF")
    parser.add_argument("--language", "-l", choices=["pt", "en", "ja"], default="pt", help="Idioma do contrato")
    
    args = parser.parse_args()
    generate_contract(
        partner_name=args.partner_name,
        partner_email=args.partner_email,
        contract_value=args.value,
        contract_number=args.contract_number,
        output_path=args.output,
        language=args.language
    )
