---
name: video-web-optimizer
description: >
  Diretrizes e técnicas de engenharia de alta performance para otimização, compressão e renderização de vídeo em background na web (Hero 3D, WebGL Canvas, WebM/AV1/H.264, poster blur-up, remoção de trilha de áudio inútil e renderização horizontal contínua sem travamentos).
---

# Video Web Optimizer & High-Performance Media Skill

Esta skill define as melhores práticas para otimização de vídeos pesados em sites de alto impacto visual (Three.js, WebGL e landing pages imersivas):

## 1. Por que NÃO usar GIF para vídeos de fundo?
- **GIFs são extremamente pesados**: um GIF de 5 segundos em 1080p pode pesar mais de 40 MB sem compressão de quadros delta moderna e roda em apenas 256 cores (gerando bandas feias de gradiente).
- **Formatos ideais**:
  1. **WebM (Codec VP9 ou AV1)**: redução de 65% a 85% no tamanho com qualidade visual impecável e suporte nativo a hardware decoding no Chrome, Firefox e Safari moderno.
  2. **MP4 (H.264 High Profile, CRF 26-28)**: fallback universal universalmente acelerado por GPU.

## 2. Receita de Compressão FFmpeg de Alta Performance
Para converter qualquer vídeo bruto (`.mp4` ou `.mov`) de 30MB+ em um background leve de ~1.8MB a 3MB:

```bash
# 1. Remover trilha de áudio inútil (-an), aplicar redimensionamento 720p/1080p e taxa de 30fps
ffmpeg -i input.mp4 -an -vf "scale=1280:-2,fps=30" -c:v libvpx-vp9 -crf 32 -b:v 0 output_optimized.webm

# 2. Versão MP4 leve com compressão H.264 e 'faststart' (início imediato de reprodução antes do download total)
ffmpeg -i input.mp4 -an -vf "scale=1280:-2,fps=30" -c:v libx264 -crf 26 -preset slow -movflags +faststart output_optimized.mp4

# 3. Gerar imagem de Poster ultra-leve WebP (Blur-up placeholder de <30KB)
ffmpeg -ss 00:00:01 -i input.mp4 -vframes 1 -q:v 70 poster.webp
```

## 3. Técnicas de Carregamento & Renderização no Frontend (React / HTML5)
- **Tag Video Otimizada**:
  ```html
  <video
    autoplay
    loop
    muted
    playsinline
    preload="metadata"
    poster="/videos/poster.webp"
    class="object-cover w-full h-full"
  >
    <source src="/videos/stagegarden-bg.webm" type="video/webm" />
    <source src="/videos/stagegarden-bg.mp4" type="video/mp4" />
  </video>
  ```
- **Atributos Mandatórios**:
  - `muted` e `playsinline`: obrigatórios para que navegadores mobile (iOS Safari / Android Chrome) permitam autoplay sem travar a interface.
  - `preload="metadata"`: impede que o browser baixe o vídeo inteiro de uma vez antes que o usuário veja a página.
- **Canvas / WebGL Texture Throttling**:
  - Se o vídeo for renderizado dentro de textura Three.js, limitar `requestVideoFrameCallback` ou sincronizar apenas com a taxa de quadros da tela.

## 4. Transição Lateral (Horizontal Scroll Curtain)
- Ao rolar verticalmente, a viewport congela (`position: sticky` ou `fixed`) e as telas secundárias entram deslizando da direita para a esquerda (`transform: translateX(...)`) usando GSAP ScrollTrigger ou CSS Scroll Snapping horizontal.
