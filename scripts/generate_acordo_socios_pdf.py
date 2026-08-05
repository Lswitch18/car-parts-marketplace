#!/usr/bin/env python3
import os
import sys

try:
    import markdown2
    from weasyprint import HTML, CSS
except ImportError:
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "markdown2", "weasyprint"])
    import markdown2
    from weasyprint import HTML, CSS

ACORDO_SOCIOS_MARKDOWN = """
# INSTRUMENTO PARTICULAR DE ACORDO DE SÓCIOS E GOVERNANÇA CORPORATIVA

**EMPRESA / PLATAFORMA:** DAIG AUTO PARTS  
**CIDADE DE REGISTRO E FORO:** TÓQUIO (JAPÃO) / SÃO PAULO (BRASIL)  
**DATA:** 05 DE AGOSTO DE 2026  

---

### DAS PARTES CONTRATANTES

1. **SÓCIO MAJORITÁRIO (90%):**  
   **PATRICK SUZUKI**, empresário e fundador, residente e domiciliado no Japão, portador de documento de identificação oficial no Japão, detentor de **90% (noventa por cento)** das cotas representativas do capital social e votante.

2. **SÓCIO DESENVOLVEDOR (10%):**  
   **WELLYNTON SANTOS JERONIMO**, engenheiro de software e desenvolvedor líder, residente e domiciliado no Brasil, portador de documento de identificação oficial no Brasil, detentor de **10% (dez por cento)** das cotas representativas do capital social.

---

### CLÁUSULA PRIMEIRA — DO OBJETO E ESTRUTURA SOCIETÁRIA
1.1. O presente instrumento disciplina os direitos, deveres, governança corporativa, distribuição de resultados e proteção da Propriedade Intelectual da sociedade **DAIG AUTO PARTS**.  
1.2. O capital social da empresa permanece estritamente dividido na proporção de **90% (noventa por cento)** para **PATRICK SUZUKI** e **10% (dez por cento)** para **WELLYNTON SANTOS JERONIMO**.

---

### CLÁUSULA SEGUNDA — CESSÃO IRREVOGÁVEL DE PROPRIEDADE INTELECTUAL (IP ASSIGNMENT)
2.1. O SÓCIO DESENVOLVEDOR cede e transfere à empresa **DAIG AUTO PARTS**, de forma integral, irrevogável, irretratável e sem limitação territorial ou temporal, a totalidade dos direitos patrimoniais de Propriedade Intelectual referentes ao software, código-fonte, arquitetura multi-tenant, algoritmos de inteligência artificial, visão computacional, bancos de dados, design de interfaces e marcas.  
2.2. É vedada a utilização, cópia, cessão ou licenciamento de qualquer módulo da plataforma para terceiros sem autorização prévia por escrito do SÓCIO MAJORITÁRIO.

---

### CLÁUSULA TERCEIRA — DA GOVERNANÇA CORPORATIVA E PODER DE VOTO
3.1. A administração geral, representação comercial, tomada de decisões estratégicas, aprovação de orçamentos, investimentos e venda da empresa cabem privativamente ao SÓCIO MAJORITÁRIO (**PATRICK SUZUKI**), detentor de 90% do poder de voto deliberativo.  
3.2. O SÓCIO DESENVOLVEDOR (**WELLYNTON SANTOS JERONIMO**) exercerá as funções de liderança técnica, garantindo a evolução do software, segurança da informação e estabilidade da plataforma.

---

### CLÁUSULA QUARTA — DA DISTRIBUIÇÃO DE LUCROS
4.1. Os lucros líquidos apurados ao final de cada exercício fiscal e declarados para distribuição serão pagos aos sócios na exata proporção de suas cotas societárias: **90% para Patrick Suzuki** e **10% para Wellynton Santos Jeronimo**.

---

### CLÁUSULA QUINTA — CONFIDENCIALIDADE (NDA) E NÃO-COMPETIÇÃO (NON-COMPETE)
5.1. **CONFIDENCIALIDADE:** Ambas as partes obrigam-se a manter sigilo rigoroso sobre dados financeiros, credenciais de servidores (Supabase, Vercel, Stripe), segredos industriais e base de clientes B2B.  
5.2. **NÃO-COMPETIÇÃO:** O SÓCIO DESENVOLVEDOR obriga-se a não atuar em empreendimento concorrente direto no segmento de ERP de desmanche e marketplace de autopeças JDM pelo período de 24 (vinte e quatro) meses após eventual desligamento da sociedade.

---

### CLÁUSULA SEXTA — DIREITOS DE VENDA DE CONTROLE (DRAG-ALONG E TAG-ALONG)
6.1. **DRAG-ALONG:** Na hipótese de recebimento de proposta de compra de 100% da empresa aceita pelo SÓCIO MAJORITÁRIO, o SÓCIO DESENVOLVEDOR obriga-se a alienar suas cotas (10%) nas mesmas condições negociadas.  
6.2. **TAG-ALONG:** Fica assegurado ao SÓCIO DESENVOLVEDOR o direito de inclusão de suas cotas na alienação do controle acionário da empresa.

---

### CLÁUSULA SÉTIMA — DA EXECUÇÃO FORMAL E RECONHECIMENTO DE FIRMAS
7.1. O presente contrato é emitido em via formal para cumprimento de exigências legais e cartorárias no Brasil e no Japão.  
7.2. O SÓCIO DESENVOLVEDOR (**WELLYNTON SANTOS JERONIMO**) assinará o presente instrumento no **Brasil**, procedendo ao **Reconhecimento de Firma por Autenticidade em Cartório de Notas**.  
7.3. O SÓCIO MAJORITÁRIO (**PATRICK SUZUKI**) assinará o presente instrumento no **Japão**, procedendo à **Autenticação Notarial (公証人役場) e Apostilamento da Convenção da Haia (Apostille)** conforme as leis locais do Japão.

---

<br/><br/>

<div class="signature-container">
    <div class="signature-block">
        <div class="line"></div>
        <p><strong>PATRICK SUZUKI</strong></p>
        <p>Sócio Majoritário (90%) — CEO</p>
        <p class="small-text">Assinado e Notarizado no Japão 🇯🇵<br/>(Notário / 公証人役場 + Apostille)</p>
    </div>
    
    <div class="signature-block">
        <div class="line"></div>
        <p><strong>WELLYNTON SANTOS JERONIMO</strong></p>
        <p>Sócio Desenvolvedor (10%) — Lead Eng.</p>
        <p class="small-text">Assinado com Firma Reconhecida no Brasil 🇧🇷<br/>(Cartório de Notas — Autenticidade)</p>
    </div>
</div>

<br/><br/>

### TESTEMUNHAS:

<div class="signature-container">
    <div class="signature-block">
        <div class="line"></div>
        <p>Nome: __________________________________</p>
        <p>CPF / ID: _______________________________</p>
    </div>
    
    <div class="signature-block">
        <div class="line"></div>
        <p>Nome: __________________________________</p>
        <p>CPF / ID: _______________________________</p>
    </div>
</div>
"""

CSS_STYLE = """
@page {
    size: A4;
    margin: 2cm;
    @bottom-right {
        content: "Página " counter(page) " de " counter(pages);
        font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
        font-size: 8pt;
        color: #666;
    }
}

body {
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    color: #111;
    line-height: 1.6;
    font-size: 10.5pt;
}

h1 {
    font-size: 16pt;
    text-align: center;
    color: #0A192F;
    border-bottom: 2px solid #00E5FF;
    padding-bottom: 10px;
    margin-bottom: 20px;
    text-transform: uppercase;
}

h3 {
    font-size: 11pt;
    color: #0A192F;
    border-bottom: 1px solid #ddd;
    padding-bottom: 4px;
    margin-top: 18px;
    margin-bottom: 10px;
}

p, li {
    text-align: justify;
}

hr {
    border: none;
    border-top: 1px dashed #ccc;
    margin: 15px 0;
}

.signature-container {
    display: flex;
    justify-content: space-between;
    margin-top: 30px;
    page-break-inside: avoid;
}

.signature-block {
    width: 45%;
    text-align: center;
}

.line {
    border-bottom: 1.5px solid #000;
    margin-bottom: 8px;
    height: 40px;
}

.small-text {
    font-size: 8pt;
    color: #555;
    margin-top: 4px;
}
"""

def main():
    output_dir = os.path.join(os.getcwd(), 'documentos_juridicos')
    os.makedirs(output_dir, exist_ok=True)
    pdf_path = os.path.join(output_dir, 'Acordo_de_Socios_DAIG_Auto_Parts_90_10.pdf')

    html_content = markdown2.markdown(ACORDO_SOCIOS_MARKDOWN)
    full_html = f"<!DOCTYPE html><html><head><meta charset='utf-8'/></head><body>{html_content}</body></html>"

    HTML(string=full_html).write_pdf(pdf_path, stylesheets=[CSS(string=CSS_STYLE)])

    print(f"✅ PDF do Acordo de Sócios gerado com sucesso em:\n   {pdf_path}")

if __name__ == '__main__':
    main()
