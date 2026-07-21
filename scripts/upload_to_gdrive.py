#!/usr/bin/env python3
"""
Upload de Documentação DAIG para o Google Drive
Utiliza as credenciais Google OAuth configuradas no .env para autorizar e realizar o upload.
"""

import os
import sys
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload

FOLDER_ID = "1S6uMQx0LOc62_EdMN7YwoOTnteHi2Df2"
SCOPES = ['https://www.googleapis.com/auth/drive.file', 'https://www.googleapis.com/auth/drive']

CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID", "")
CLIENT_SECRET = os.environ.get("GOOGLE_CLIENT_SECRET", "")

CLIENT_CONFIG = {
    "installed": {
        "client_id": CLIENT_ID,
        "project_id": "digital-aigarage",
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
        "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
        "client_secret": CLIENT_SECRET,
        "redirect_uris": ["urn:ietf:wg:oauth:2.0:oob", "http://localhost"]
    }
}

FILES_TO_UPLOAD = [
    ("docs/diag/daig_architecture_diagram.png", "image/png"),
    ("docs/diag/daig_software_flow.png", "image/png"),
    ("docs/diag/env_configuracoes.xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"),
    ("docs/diag/MODELO_DE_NEGOCIO_JAPAO.md", "text/markdown"),
    ("docs/diag/ESTUDO_DE_MERCADO_JAPAO.md", "text/markdown"),
    ("docs/diag/ARQUITETURA_E_FLUXO_SOFTWARE.md", "text/markdown"),
    ("docs/diag/INDEX.md", "text/markdown"),
    ("exports/relatorio_financeiro.xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"),
    ("exports/contrato_parceria_b2b.docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"),
    ("daig_documentacao.zip", "application/zip")
]

def main():
    print("🚀 Iniciando serviço de upload do Digital AIGarage para o Google Drive...")
    print(f"📁 Pasta Destino ID: {FOLDER_ID}")

    token_file = "token_gdrive.json"
    creds = None

    if os.path.exists(token_file):
        from google.oauth2.credentials import Credentials
        creds = Credentials.from_authorized_user_file(token_file, SCOPES)

    if not creds or not creds.valid:
        flow = InstalledAppFlow.from_client_config(CLIENT_CONFIG, SCOPES)
        flow.redirect_uri = "http://localhost:8085/"
        
        auth_url, _ = flow.authorization_url(prompt='consent', access_type='offline')
        
        print("\n--------------------------------------------------------------------------------")
        print("🔑 AUTENTICAÇÃO DO GOOGLE DRIVE REQUERIDA:")
        print("Por favor, abra o link abaixo no seu navegador para autorizar o upload:")
        print(f"\n👉 {auth_url}\n")
        print("--------------------------------------------------------------------------------\n")
        
        try:
            creds = flow.run_local_server(port=8085, open_browser=False)
        except Exception as e:
            print(f"Erro no servidor local: {e}")
            code = input("Cole o código de autorização do Google aqui: ").strip()
            flow.fetch_token(code=code)
            creds = flow.credentials

        with open(token_file, "w") as token:
            token.write(creds.to_json())

    service = build('drive', 'v3', credentials=creds)
    print("\n✅ Autenticação realizada com sucesso!")

    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

    for rel_path, mime_type in FILES_TO_UPLOAD:
        full_path = os.path.join(base_dir, rel_path)
        if not os.path.exists(full_path):
            print(f"⚠️ Arquivo não encontrado: {rel_path}, pulando...")
            continue

        filename = os.path.basename(full_path)
        print(f"⬆️ Enviando '{filename}' ({mime_type})...")

        file_metadata = {
            'name': filename,
            'parents': [FOLDER_ID]
        }

        media = MediaFileUpload(full_path, mimetype=mime_type, resumable=True)
        uploaded = service.files().create(body=file_metadata, media_body=media, fields='id, name, webViewLink').execute()
        print(f"   ✅ '{uploaded.get('name')}' enviado! Link: {uploaded.get('webViewLink')}")

    print("\n🎉 Todos os arquivos e diagramas da DAIG foram enviados com sucesso para a pasta do Google Drive!")

if __name__ == "__main__":
    main()
