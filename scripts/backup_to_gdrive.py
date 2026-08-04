#!/usr/bin/env python3
"""
CLI de backup para Google Drive - Digital AI Garage (DAIG).

Faz upload de um snapshot/backup local (diretorio ou arquivo) para uma pasta
do Google Drive, criando uma subpasta com timestamp. Pensado para automatizacao
via cron/CI: quando o token e valido roda sem interacao.

Uso:
  # Autenticar uma unica vez (abre URL no navegador, cola o codigo)
  .venv/bin/python scripts/backup_to_gdrive.py --auth-only

  # Backup de um diretorio (gera tar.gz + sha256 + manifest e envia)
  .venv/bin/python scripts/backup_to_gdrive.py --source supabase/backups/xyz --archive

  # Backup de um arquivo solto
  .venv/bin/python scripts/backup_to_gdrive.py --source meubackup.sql

  # Dry-run (sem interacao com o Drive)
  .venv/bin/python scripts/backup_to_gdrive.py --source supabase/backups/xyz --archive --dry-run

Variaveis (via .env ou ambiente):
  GOOGLE_CLIENT_ID     (obrigatorio)
  GOOGLE_CLIENT_SECRET (obrigatorio)
  GDRIVE_FOLDER_ID     (opcional; padrao: 1S6uMQx0LOc62_EdMN7YwoOTnteHi2Df2)
  GDRIVE_TOKEN_FILE    (opcional; padrao: token_gdrive.json na raiz do repo)
"""

import argparse
import hashlib
import io
import json
import os
import sys
import tarfile
from datetime import datetime
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
SCOPES = [
    "https://www.googleapis.com/auth/drive.file",
    "https://www.googleapis.com/auth/drive",
]
DEFAULT_FOLDER_ID = "1S6uMQx0LOc62_EdMN7YwoOTnteHi2Df2"


def load_dotenv():
    env_path = REPO_ROOT / ".env"
    if not env_path.exists():
        return
    for line in env_path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, value = line.partition("=")
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        if key and not os.environ.get(key):
            os.environ[key] = value


def get_client_config():
    client_id = os.environ.get("GOOGLE_CLIENT_ID", "")
    client_secret = os.environ.get("GOOGLE_CLIENT_SECRET", "")
    if not client_id or not client_secret:
        sys.exit("ERRO: GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET nao encontrados (defina no .env ou ambiente).")
    return {
        "installed": {
            "client_id": client_id,
            "client_secret": client_secret,
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
            "redirect_uris": ["http://localhost:8085/", "http://localhost"],
        }
    }


def token_file():
    return Path(os.environ.get("GDRIVE_TOKEN_FILE", REPO_ROOT / "token_gdrive.json"))


def get_credentials(flow, auth_only=False):
    token_path = token_file()
    if token_path.exists():
        from google.oauth2.credentials import Credentials
        creds = Credentials.from_authorized_user_file(str(token_path), SCOPES)
        if creds.valid:
            print(f"[ok] Token valido ({token_path})")
            return creds
        if creds.refresh_token:
            try:
                from google.auth.transport.requests import Request
                creds.refresh(Request())
                token_path.write_text(creds.to_json(), encoding="utf-8")
                print("[ok] Token renovado automaticamente")
                return creds
            except Exception as exc:
                print(f"[warn] Falha ao renovar token: {exc}")
    if auth_only:
        return None
    print("=" * 72)
    print("AUTORIZACAO GOOGLE DRIVE REQUERIDA")
    print("Abra o link abaixo no navegador, autorize e cole o codigo:")
    print("=" * 72)
    url, _ = flow.authorization_url(prompt="consent", access_type="offline")
    print(f"\nLINK: {url}\n")
    code = input("Cole aqui o codigo (parametro 'code' da URL de redirecionamento): ").strip()
    flow.fetch_token(code=code)
    token_path.write_text(flow.credentials.to_json(), encoding="utf-8")
    print(f"[ok] Token salvo em {token_path}")
    return flow.credentials


def sha256_of(file_path):
    h = hashlib.sha256()
    with open(file_path, "rb") as fh:
        for chunk in iter(lambda: fh.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def make_archive(source: Path, out_dir: Path) -> Path:
    out_dir.mkdir(parents=True, exist_ok=True)
    name = source.name if source.is_dir() else source.stem
    archive = out_dir / f"{name}_{datetime.now():%Y%m%d_%H%M%S}.tar.gz"
    with tarfile.open(archive, "w:gz") as tar:
        if source.is_dir():
            for entry in sorted(source.rglob("*")):
                if entry.is_file():
                    tar.add(entry, arcname=Path("backup") / entry.relative_to(source))
        else:
            tar.add(source, arcname=source.name)
    print(f"[ok] Arquivo gerado: {archive}")
    return archive


def upload_file(service, local_path: Path, drive_parent: str, name: str = None):
    from googleapiclient.http import MediaFileUpload
    file_name = name or local_path.name
    media = MediaFileUpload(str(local_path), resumable=True)
    body = {"name": file_name, "parents": [drive_parent]}
    result = (
        service.files()
        .create(body=body, media_body=media, fields="id, name, webViewLink")
        .execute()
    )
    print(f"  -> {result.get('name')} | {result.get('webViewLink')}")
    return result.get("id")


def create_folder(service, name: str, parent: str) -> str:
    body = {
        "name": name,
        "parents": [parent],
        "mimeType": "application/vnd.google-apps.folder",
    }
    result = service.files().create(body=body, fields="id, name").execute()
    print(f"[ok] Pasta criada: {result.get('name')} ({result.get('id')})")
    return result.get("id")


def build_manifest(source: Path, archive: Path, remote_folder: str) -> io.BytesIO:
    lines = [
        f"daig-backup {datetime.now():%Y-%m-%d %H:%M:%S}",
        f"source: {source}",
        f"remote_folder_id: {remote_folder}",
        "",
        "sha256:",
    ]
    files = [archive]
    if source.is_dir():
        files.extend(sorted(source.rglob("*")) if False else [])
        files = sorted({f for f in source.rglob("*") if f.is_file()})
        files.insert(0, archive)
    for f in sorted(set(files), key=lambda p: str(p)):
        lines.append(f"{sha256_of(f)}  {f.name}")
    return io.BytesIO("\n".join(lines).encode("utf-8"))


def main():
    load_dotenv()
    parser = argparse.ArgumentParser(description="Backup CLI para Google Drive (DAIG)")
    parser.add_argument("--source", help="Diretorio ou arquivo a enviar")
    parser.add_argument("--drive-folder-id", default=os.environ.get("GDRIVE_FOLDER_ID", DEFAULT_FOLDER_ID))
    parser.add_argument("--subfolder", help="Nome da subpasta no Drive (padrao: timestamp)")
    parser.add_argument("--archive", action="store_true", help="Gerar tar.gz antes de enviar")
    parser.add_argument("--dry-run", action="store_true", help="So mostra o que faria")
    parser.add_argument("--auth-only", action="store_true", help="Somente autenticar e salvar o token")
    parser.add_argument("--redirect-uri", default=os.environ.get("GDRIVE_REDIRECT_URI", "http://localhost:8085"))
    args = parser.parse_args()

    from google_auth_oauthlib.flow import InstalledAppFlow

    flow = InstalledAppFlow.from_client_config(get_client_config(), SCOPES)
    flow.redirect_uri = args.redirect_uri

    if not args.dry_run:
        creds = get_credentials(flow, auth_only=args.auth_only)
        if args.auth_only:
            print("[ok] Autenticacao concluida. Pode rodar o backup agora.")
            return
        from googleapiclient.discovery import build
        service = build("drive", "v3", credentials=creds)

    if args.source:
        source = Path(args.source)
        if not source.is_absolute():
            source = REPO_ROOT / source
    else:
        candidates = sorted((REPO_ROOT / "supabase/backups").glob("*"))
        sources = [c for c in candidates if c.is_dir()]
        if not sources:
            sys.exit("ERRO: --source obrigatorio (nenhum snapshot encontrado em supabase/backups/).")
        source = sources[-1]

    if not source.exists():
        sys.exit(f"ERRO: caminho nao encontrado: {source}")

    archive = None
    if args.archive:
        archive = make_archive(source, REPO_ROOT / "supabase/backups" / "gdrive")

    subfolder = args.subfolder or f"backup_{datetime.now():%Y%m%d_%H%M%S}"
    print(f"[info] Destino: pasta '{subfolder}' (Drive folder {args.drive_folder_id})")
    print(f"[info] Origem : {source}")

    files_to_upload = []
    if archive:
        files_to_upload.append(archive)
    elif source.is_dir():
        files_to_upload.extend(sorted(f for f in source.rglob("*") if f.is_file()))
    else:
        files_to_upload.append(source)

    for f in files_to_upload:
        print(f"  [file] {f.name} ({f.stat().st_size / 1024:.1f} KB)")

    if args.dry_run:
        print("[dry-run] concluido.")
        return

    remote_folder = create_folder(service, subfolder, args.drive_folder_id)
    for f in files_to_upload:
        upload_file(service, f, remote_folder)

    manifest = build_manifest(source, archive or source, remote_folder)
    media = __import__("googleapiclient.http", fromlist=["MediaIoBaseUpload"]).MediaIoBaseUpload(
        manifest, mimetype="text/plain", resumable=True
    )
    service.files().create(
        body={"name": "manifest-sha256.txt", "parents": [remote_folder]},
        media_body=media,
        fields="id, name",
    ).execute()
    print("[ok] Manifest de checksums enviado.")
    print(f"\nBackup concluido. Pasta no Drive: {subfolder}")


if __name__ == "__main__":
    main()
