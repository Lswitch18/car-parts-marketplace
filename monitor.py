#!/usr/bin/env python3
"""
Monitor de alterações do projeto
Executa: python monitor.py
"""

import os
import sys
import json
import hashlib
import time
from pathlib import Path
from datetime import datetime

PROJECT_ROOT = Path(__file__).parent
BRAIN_FILE = PROJECT_ROOT / "brain.py"
IGNORE_EXTENSIONS = {'.pyc', '.pyo', '__pycache__', '.git'}

def get_file_hash(filepath):
    try:
        with open(filepath, 'rb') as f:
            return hashlib.md5(f.read()).hexdigest()
    except:
        return None

def scan_directory(root_path):
    files_info = {}
    
    for root, dirs, files in os.walk(root_path):
        dirs[:] = [d for d in dirs if d not in IGNORE_EXTENSIONS and not d.startswith('.')]
        
        rel_root = os.path.relpath(root, root_path)
        
        for file in files:
            if file.startswith('.'):
                continue
            
            filepath = os.path.join(root, file)
            try:
                stat = os.stat(filepath)
                files_info[os.path.relpath(filepath, root_path)] = {
                    "size": stat.st_size,
                    "modified": stat.st_mtime,
                    "hash": get_file_hash(filepath)
                }
            except:
                pass
    
    return files_info

from datetime import datetime

def update_brain_file(files_info):
    now = datetime.now().strftime("%Y-%m-%d")
    brain_content = f'''"""
Brain - Central de Conhecimento do Projeto
Mantém um registro das estruturas e dados do projeto
Atualizado automaticamente pelo monitor.py
"""

import os
from datetime import datetime

PROJECT_INFO = {{
    "name": "car-parts-marketplce",
    "type": "Marketplace de peças automotivas",
    "tech_stack": ["Python", "HTML", "SQL", "Supabase", "Google OAuth"],
}}

FILES = {json.dumps(files_info, indent=4)}

last_updated = "{now}"
'''
    
    with open(BRAIN_FILE, 'w') as f:
        f.write(brain_content)
    
    print(f"Brain atualizado com {len(files_info)} arquivos")

def main():
    print("Monitor de alterações iniciado...")
    print("Pressione Ctrl+C para parar")
    
    last_state = scan_directory(PROJECT_ROOT)
    update_brain_file(last_state)
    
    while True:
        time.sleep(5)
        current_state = scan_directory(PROJECT_ROOT)
        
        changes = []
        for path, info in current_state.items():
            if path not in last_state:
                changes.append(f"NOVO: {path}")
            elif last_state[path]['hash'] != info['hash']:
                changes.append(f"ALTERADO: {path}")
        
        for path in last_state:
            if path not in current_state:
                changes.append(f"REMOVIDO: {path}")
        
        if changes:
            print(f"\n[{datetime.now().strftime('%H:%M:%S')}] Alterações detectadas:")
            for change in changes:
                print(f"  - {change}")
            
            update_brain_file(current_state)
            last_state = current_state

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\nMonitor parado")
        sys.exit(0)