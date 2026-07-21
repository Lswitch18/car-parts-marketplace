#!/usr/bin/env python3
"""
Google Drive Sync - GAID Platform
Módulo de integração para upload de planilhas Excel (.xlsx) e documentos Word (.docx) para o Google Drive.
"""

import os
import sys

def upload_to_google_drive(filepath: str, folder_id: str = None):
    """
    Realiza o upload de um arquivo local (.xlsx, .docx, etc.) para o Google Drive.
    """
    if not os.path.exists(filepath):
        print(f"❌ Arquivo não encontrado: {filepath}")
        return None

    filename = os.path.basename(filepath)
    print(f"🔄 Iniciando upload de '{filename}' para o Google Drive...")

    try:
        from googleapiclient.discovery import build
        from googleapiclient.http import MediaFileUpload
        from google.oauth2.service_account import Credentials

        # Procurar por credencial de serviço no ambiente
        creds_path = os.environ.get("GOOGLE_APPLICATION_CREDENTIALS", "google_credentials.json")
        
        if not os.path.exists(creds_path):
            print("\n⚠️ AVISO DE CONFIGURAÇÃO DE CREDENCIAIS GOOGLE DRIVE:")
            print("--------------------------------------------------------------------------------")
            print("1. Crie uma conta de serviço (Service Account) no Google Cloud Console.")
            print("2. Baixe o arquivo JSON de chave e salve como 'google_credentials.json' na raiz.")
            print("3. Compartilhe a pasta do Google Drive com o e-mail da Service Account.")
            print("--------------------------------------------------------------------------------\n")
            print(f"📄 O arquivo local '{filename}' foi salvo com sucesso na pasta /exports!")
            return filepath

        SCOPES = ['https://www.googleapis.com/auth/drive.file']
        creds = Credentials.from_service_account_file(creds_path, scopes=SCOPES)
        service = build('drive', 'v3', credentials=creds)

        file_metadata = {'name': filename}
        if folder_id:
            file_metadata['parents'] = [folder_id]

        media = MediaFileUpload(filepath, resumable=True)
        file = service.files().create(body=file_metadata, media_body=media, fields='id, webViewLink').execute()

        print(f"✅ Upload concluído com sucesso!")
        print(f"🔗 Link do arquivo no Google Drive: {file.get('webViewLink')}")
        return file.get('webViewLink')

    except Exception as e:
        print(f"❌ Erro no upload para o Google Drive: {e}")
        print(f"📄 Arquivo local preservado em: {filepath}")
        return filepath

if __name__ == "__main__":
    if len(sys.argv) > 1:
        target_file = sys.argv[1]
    else:
        target_file = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "exports", "relatorio_financeiro.xlsx"))
    
    upload_to_google_drive(target_file)
