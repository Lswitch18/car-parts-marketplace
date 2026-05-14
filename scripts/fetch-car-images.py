"""
Script para buscar imagens da internet e associar aos anúncios sem fotos
"""

import os
import re
import json
import time
import requests
from supabase import create_client, Client
from urllib.parse import quote
from dotenv import load_dotenv

load_dotenv()

# Configuração Supabase
SUPABASE_URL = os.getenv('SUPABASE_URL', 'https://clqubcryhbrjlupkgeva.supabase.co')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_KEY', os.getenv('SUPABASE_ANON_KEY', ''))

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Headers para requests
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

def search_unsplash_images(query, count=3):
    """Busca imagens no Unsplash"""
    api_key = os.getenv('UNSPLASH_ACCESS_KEY', '')
    
    if not api_key:
        # Busca imagens gratuitas via Bing/Google Images API alternativa
        return search_free_images(query, count)
    
    try:
        url = f"https://api.unsplash.com/search/photos?query={quote(query)}&per_page={count}"
        response = requests.get(url, headers={
            'Authorization': f'Client-ID {api_key}'
        })
        if response.status_code == 200:
            data = response.json()
            return [photo['urls']['regular'] for photo in data.get('results', [])]
    except Exception as e:
        print(f"Erro Unsplash: {e}")
    
    return []

def search_free_images(query, count=3):
    """Busca imagens gratuitas usando fontes abertas"""
    images = []
    
    # Busca no Wikimedia Commons
    try:
        url = f"https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch={quote(query)}&format=json&origin=*"
        resp = requests.get(url, headers=HEADERS, timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            # Usa imagens placeholder baseadas na busca
            for i in range(count):
                # Gera URLs de imagens do Wikimedia commons
                img_url = f"https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/600px-No_image_available.svg.png"
                if i == 0 and ('nissan' in query.lower() or 'toyota' in query.lower() or 'honda' in query.lower()):
                    img_url = get_car_placeholder_url(query)
                images.append(img_url)
    except Exception as e:
        print(f"Erro Wikimedia: {e}")
    
    return images

def get_car_placeholder_url(query):
    """Gera URL de placeholder baseado na marca/modelo"""
    query_lower = query.lower()
    
    # Mapeamento de placeholders do Unsplash
    car_images = {
        'nissan': [
            'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=600',
            'https://images.unsplash.com/photo-1612825173281-9a193378527e?w=600',
            'https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=600'
        ],
        'gt-r': 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=600',
        'supra': 'https://images.unsplash.com/photo-1612825173281-9a193378527e?w=600',
        'skyline': 'https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=600',
        'toyota': [
            'https://images.unsplash.com/photo-1612825173281-9a193378527e?w=600',
            'https://images.unsplash.com/photo-1626668893632-6f3a4466d22f?w=600'
        ],
        'honda': [
            'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=600',
            'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=600'
        ],
        'nsx': 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=600',
        's2000': 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=600',
        'mazda': [
            'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=600',
            'https://images.unsplash.com/photo-1609752747034-5962bfb4fb4b?w=600'
        ],
        'rx-7': 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=600',
        'rx-8': 'https://images.unsplash.com/photo-1609752747034-5962bfb4fb4b?w=600',
        'mx-5': 'https://images.unsplash.com/photo-1609752747034-5962bfb4fb4b?w=600',
        'miata': 'https://images.unsplash.com/photo-1609752747034-5962bfb4fb4b?w=600',
        'subaru': [
            'https://images.unsplash.com/photo-1626668893632-6f3a4466d22f?w=600',
            'https://images.unsplash.com/photo-1611843467160-25afb8df1074?w=600'
        ],
        'wrx': 'https://images.unsplash.com/photo-1626668893632-6f3a4466d22f?w=600',
        'brz': 'https://images.unsplash.com/photo-1611843467160-25afb8df1074?w=600',
        'mitsubishi': [
            'https://images.unsplash.com/photo-1597007061818-53e5c8f5e2a8?w=600',
            'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=600'
        ],
        'evo': 'https://images.unsplash.com/photo-1597007061818-53e5c8f5e2a8?w=600',
        'lexus': [
            'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600'
        ],
        'default': [
            'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600',
            'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600',
            'https://images.unsplash.com/photo-1542362567-b07e54358753?w=600'
        ]
    }
    
    # Procura correspondência
    for key, urls in car_images.items():
        if key in query_lower:
            if isinstance(urls, list):
                return urls[0]
            return urls
    
    return car_images['default'][0]

def download_image(url, timeout=10):
    """Baixa imagem e retorna bytes"""
    try:
        response = requests.get(url, headers=HEADERS, timeout=timeout, allow_redirects=True)
        if response.status_code == 200:
            content_type = response.headers.get('content-type', '')
            if 'image' in content_type or url.endswith(('.jpg', '.jpeg', '.png', '.webp')):
                return response.content
    except Exception as e:
        print(f"Erro download: {e}")
    return None

def upload_to_supabase_storage(image_bytes, filename, bucket='parts-images'):
    """Faz upload da imagem para Supabase Storage"""
    try:
        # Upload direto
        file_path = f"parts/{filename}"
        
        # Tenta via API REST do Supabase
        upload_url = f"{SUPABASE_URL}/storage/v1/object/{bucket}/{file_path}"
        
        response = requests.post(
            upload_url,
            headers={
                'Authorization': f'Bearer {SUPABASE_KEY}',
                'Content-Type': 'image/jpeg',
                'x-upsert': 'true'
            },
            data=image_bytes
        )
        
        if response.status_code in [200, 200]:
            # Retorna URL pública
            public_url = f"{SUPABASE_URL}/storage/v1/object/public/{bucket}/{file_path}"
            return public_url
        
        print(f"Erro upload: {response.status_code} - {response.text}")
        
    except Exception as e:
        print(f"Erro upload: {e}")
    
    return None

def update_part_image(part_id, image_url):
    """Atualiza o anúncio com a nova URL da imagem"""
    try:
        response = supabase.table('parts').update({
            'images': [image_url]
        }).eq('id', part_id).execute()
        
        return len(response.data) > 0
    except Exception as e:
        print(f"Erro update: {e}")
        return False

def get_parts_without_images():
    """Busca anúncios sem imagens ou com imagens placeholder"""
    try:
        # Partes sem imagens
        response = supabase.table('parts').select(
            'id, title, description, images, brands(name), categories(name)'
        ).is_('images', None).execute()
        
        # Partes com array vazio
        response2 = supabase.table('parts').select(
            'id, title, description, images, brands(name), categories(name)'
        ).eq('images', '{}').execute()
        
        # Partes com imagens placeholder genéricas
        response3 = supabase.table('parts').select(
            'id, title, description, images, brands(name), categories(name)'
        ).execute()
        
        all_parts = response.data + response2.data
        parts_no_images = []
        
        # Filtra partes sem imagens válidas
        for part in all_parts:
            images = part.get('images') or []
            if not images or images == [] or (len(images) == 1 and 'no_image' in str(images[0]).lower()):
                parts_no_images.append(part)
        
        # Adiciona partes com imagens placeholder
        for part in response3.data:
            if part not in parts_no_images:
                images = part.get('images') or []
                if any('placeholder' in str(img).lower() or 'no_image' in str(img).lower() for img in images):
                    parts_no_images.append(part)
        
        return parts_no_images
        
    except Exception as e:
        print(f"Erro buscar partes: {e}")
        return []

def main():
    print("=" * 60)
    print("🔍 Busca de Imagens para Anúncios")
    print("=" * 60)
    
    # Busca partes sem imagens
    parts = get_parts_without_images()
    print(f"\n📦 Anúncios sem imagens: {len(parts)}")
    
    if not parts:
        print("✅ Todos os anúncios já têm imagens!")
        return
    
    # Processa cada parte
    updated = 0
    errors = 0
    
    for i, part in enumerate(parts):
        print(f"\n[{i+1}/{len(parts)}] Processando: {part['title'][:50]}...")
        
        # Constrói query de busca
        brand = part.get('brands', {}).get('name', '') if isinstance(part.get('brands'), dict) else ''
        category = part.get('categories', {}).get('name', '') if isinstance(part.get('categories'), dict) else ''
        
        query = f"{brand} {part['title']} {category}".strip()
        
        # Busca imagem
        image_url = get_car_placeholder_url(query)
        
        if image_url:
            # Tenta fazer download e upload
            image_bytes = download_image(image_url)
            
            if image_bytes:
                filename = f"{part['id']}.jpg"
                uploaded_url = upload_to_supabase_storage(image_bytes, filename)
                
                if uploaded_url:
                    if update_part_image(part['id'], uploaded_url):
                        print(f"  ✅ Atualizado: {uploaded_url[:60]}...")
                        updated += 1
                    else:
                        print("  ❌ Erro ao atualizar banco")
                        errors += 1
                else:
                    # Usa URL direta se upload falhar
                    if update_part_image(part['id'], image_url):
                        print(f"  ✅ URL direta: {image_url[:60]}...")
                        updated += 1
                    else:
                        errors += 1
            else:
                print(f"  ⚠️ Usando placeholder")
                if update_part_image(part['id'], image_url):
                    updated += 1
        
        time.sleep(0.5)  # Rate limiting
    
    print("\n" + "=" * 60)
    print(f"📊 Resumo:")
    print(f"   ✅ Atualizados: {updated}")
    print(f"   ❌ Erros: {errors}")
    print("=" * 60)

if __name__ == "__main__":
    main()