---
name: mobile-first-hitech-design
description: "Use esta skill para planejar, desenhar e desenvolver interfaces Mobile-First impecáveis, ultra-modernas e Hi-Tech, com estética Cyber Neon Blue, PWA responsivo, micro-animações dinâmicas e integração de assistentes de IA."
---

# 📱 Mobile-First Hi-Tech Design & AI Skill

Esta skill estabelece o padrão ouro de design **Mobile-First**, experiência do usuário (UX), estética visual **Cyber Neon Hi-Tech** e arquitetura de componentes responsivos para o projeto.

---

## 🎯 1. Princípios Fundamentais do Mobile-First

1. **Thumb-Zone Layout & Ergonomia**:
   - Elementos primários de ação (botões de compra, filtros, envio, leitor QR) devem ser posicionados na parte inferior da tela (área de alcance do polegar).
   - Área mínima de toque: `48px x 48px` para evitar cliques acidentais em dispositivos móveis.
   - Navegação por **Bottom Sheets** (gavetas inferiores) em vez de modais flutuantes centralizados.

2. **Navegação Adaptativa & Haptic Feedback**:
   - Barras de ação fixas no rodapé (`sticky bottom-0`) com efeito *glassmorphism* (`backdrop-blur-xl bg-[#0A0D14]/90`).
   - Suporte nativo a gestos de deslizamento (*swipe*) e feedback visual imediato ao tocar.

3. **Performance & Carregamento Instantâneo**:
   - Layouts com suporte PWA (Progressive Web App).
   - Utilização de **Skeletons** e loaders de neon (`animate-pulse`, `animate-spin`) enquanto os dados são carregados.

---

## 🎨 2. Design System: Estética Cyber Neon Hi-Tech

### Paleta de Cores e Gradientes
- **Fundo Principal**: `#06080F` (Dark Space Void) ou `#0A0D14` (Deep Cyber Base).
- **Cards & Superfícies**: `#0B0E17` com bordas luminosas `border-blue-500/30`.
- **Neon Primário**: `#0D75FF` (Electric Royal Blue).
- **Neon Secundário / Destaques**: `#00E5FF` (Cyan Glow) e `text-cyan-300`.
- **Gradientes Hi-Tech**:
  ```tsx
  bg-gradient-to-r from-[#0D75FF] via-blue-600 to-[#00E5FF]
  shadow-[0_0_30px_rgba(13,117,255,0.35)]
  ```

### Tipografia e Ícones
- **Fontes**: Sans-Serif moderna (Inter/Outfit) para textos e **Monospaced** para números, moedas (`¥`), códigos OEM, VIN e chaves criptográficas.
- **Ícones**: Utilizar bibliotecas modernas como `lucide-react` com dimensões limpas (`w-4 h-4` ou `w-5 h-5`).

---

## 🤖 3. Padrões de Integração com Recursos de IA & Câmera

1. **Leitura por Câmera & OCR**:
   - Componentes móveis com leitor de código de barras / QR Code para identificação automática de peças automotivas.
   - Interface de upload de foto rápida com análise por visão computacional da IA.

2. **Interface de Assistente de Voz**:
   - Botão flutuante de busca por voz com indicador de onda sonora em neon cyan (`animate-pulse`).

---

## 🛠️ 4. Regras Obrigatórias de Código e Internacionalização

1. **Suporte a Internacionalização (`i18n`)**:
   - Todos os rótulos de texto de botões, títulos, placeholders e alertas **devem** ser envolvidos com `t(...)` do hook `useI18n()`.
   - Garantir suporte 100% fluído em **Japonês (`ja`)**, **Português (`pt`)** e **Inglês (`en`)**.

2. **Formatação Limpa de Valores Financeiros**:
   - Formatar moedas em ienes sem siglas redundantes: `¥ ${valor.toLocaleString()}`.

---

## 💡 5. Exemplo de Componente Mobile-First Hi-Tech (React + Tailwind)

```tsx
import { useState } from 'react'
import { useI18n } from '@/modules/shared/lib/i18n'
import { Sparkles, Camera, ArrowRight, ShieldCheck } from 'lucide-react'

export default function HitechActionCard() {
  const { t } = useI18n()
  const [loading, setLoading] = useState(false)

  return (
    <div className="w-full bg-[#0B0E17]/90 border border-blue-500/30 rounded-2xl p-5 shadow-[0_0_30px_rgba(13,117,255,0.15)] backdrop-blur-xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400">
          <Sparkles className="w-4 h-4 text-[#00E5FF] animate-pulse" />
          <span>{t('IA Visão Computacional')}</span>
        </div>
        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-500/10 text-cyan-300 border border-[#00E5FF]/40">
          {t('Mobile Ready')}
        </span>
      </div>

      <h3 className="text-lg font-black text-white tracking-tight">
        {t('Scanner Instantâneo de Peças')}
      </h3>

      <button
        type="button"
        disabled={loading}
        className="w-full min-h-[48px] bg-gradient-to-r from-[#0D75FF] to-[#00E5FF] hover:opacity-90 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-[0_0_25px_rgba(13,117,255,0.35)] flex items-center justify-center space-x-2 cursor-pointer border border-[#00E5FF]/40 active:scale-95"
      >
        <Camera className="w-4 h-4 text-white" />
        <span>{t('Escanear Peça com Câmera')}</span>
        <ArrowRight className="w-4 h-4 text-white" />
      </button>
    </div>
  )
}
```
