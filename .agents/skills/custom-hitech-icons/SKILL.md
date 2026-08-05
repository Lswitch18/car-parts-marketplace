---
name: custom-hitech-icons
description: "Skill para seleção, estilização e criação de ícones não-genéricos, Hi-Tech e Cyber Neon. Inclui composição de ícones Lucide com badges luminosos, ícones dinâmicos JDM/Auto Parts, SVG morphing, micro-interações e gradientes luminosos."
---

# 🎨 Custom Hi-Tech & Non-Generic Icons Skill

Esta skill define o padrão de design para **ícones não-genéricos, marcantes e de alto impacto visual** no ecossistema DAIG (Auto Parts, SaaS B2B, WMS e Marketplace).

---

## 🚫 1. Anti-Patterns (O que NUNCA fazer com ícones)

1. ❌ **Nunca usar ícones crus/soltos**: Um ícone solto sem tratamento (`<Wrench className="w-5 h-5" />`) parece genérico, amador e sem contraste.
2. ❌ **Nunca usar cores padrão do navegador**: Evite `text-black`, `text-blue-500` cru sem glow/opacidade de fundo.
3. ❌ **Nunca misturar estilos de linhas incompatíveis**: Misturar ícones filled espessos com ícones ultra-thin.
4. ❌ **Nunca usar ícones genéricos para conceitos específicos**: Ex: usar um ícone de pasta (`<Folder />`) para representar um "Desmanche JDM" ou uma "Ordem de Serviço WMS".

---

## 💎 2. Princípios dos Ícones Não-Genéricos (High-Impact System)

### 2.1 — O Conceito de "Icon Wrapper" (Conteinerização Luminosa)
Todo ícone principal deve ser envolvido por uma cápsula/container decorativa que fornece iluminação de fundo, borda sutil e sombra neon:

```tsx
// 🟢 PADRÃO CORRETO: Icon Wrapper Cyber Neon
<div className="p-2.5 rounded-2xl bg-gradient-to-br from-[#0D75FF]/15 to-[#00E5FF]/5 border border-[#0D75FF]/30 shadow-[0_0_20px_rgba(13,117,255,0.25)] text-[#00E5FF] group-hover:scale-110 transition-transform duration-300">
  <Wrench className="w-5 h-5 drop-shadow-[0_0_8px_rgba(0,229,255,0.6)]" />
</div>
```

### 2.2 — Composição Multi-Camada (Layered Icons)
Combine dois ícones para formar um símbolo único de alto nível semântico:

| Conceito | Ícone Base | Ícone de Acento (Badge) | Resultado |
|---|---|---|---|
| **IA em Ordens de Serviço** | `Wrench` | `Sparkles` (cyan animado no canto) | Oficina Inteligente |
| **Garantia de Pagamento Stripe** | `ShieldCheck` | `Lock` | Pagamento Blindado |
| **Estoque WMS Privado** | `Package` | `EyeOff` ou `Key` | Estoque Reservado |
| **Logística Express JDM** | `Truck` | `Zap` | Envio Ultra-Rápido |

---

## 🎨 3. Paleta Temática de Cores por Domínio

| Domínio | Ícone Primário | Fundo / Border | Glow RGB | Uso Recomendado |
|---|---|---|---|---|
| **Oficina & Mecânica** | `text-amber-400` | `bg-amber-500/10 border-amber-500/30` | `rgba(245, 158, 11, 0.3)` | Ordens de Serviço, Manutenção |
| **Desmanche JDM** | `text-red-400` | `bg-red-500/10 border-red-500/30` | `rgba(239, 68, 68, 0.3)` | Veículos Doador, Sucata, Motor |
| **Peças & WMS** | `text-emerald-400` | `bg-emerald-500/10 border-emerald-500/30` | `rgba(16, 185, 129, 0.3)` | Estoque, Prateleiras, QR Codes |
| **Finanças & SaaS B2B** | `text-[#0D75FF]` | `bg-[#0D75FF]/10 border-[#0D75FF]/30` | `rgba(13, 117, 255, 0.3)` | MRR, Stripe, Assinaturas |
| **IA Computacional** | `text-[#00E5FF]` | `bg-[#00E5FF]/10 border-[#00E5FF]/30` | `rgba(0, 229, 255, 0.4)` | Visão por Câmera, OCR, Bot IA |

---

## 🛠️ 4. Ícones Customizados SVG Nativos (Auto Parts & JDM)

Para conceitos onde o Lucide não possui ícones específicos (ex: Turbo, Pistão, ECU/Módulo, Rotor de Freio), use os componentes SVG nativos exportados em `resources/custom-svg-icons.tsx`.

### Exemplo: Ícone de Turbocharger JDM
```tsx
export function TurboIcon({ className = "w-5 h-5", glow = true }: { className?: string; glow?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={`${className} ${glow ? 'drop-shadow-[0_0_8px_rgba(0,229,255,0.6)]' : ''}`}>
      <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 14a4 4 0 1 1 4-4 4 4 0 0 1-4 4z" />
      <path d="M12 8v8M8 12h8" />
      <path d="M16 4.5l-4 3.5M4.5 8l3.5 4M8 19.5l4-3.5M19.5 16l-3.5-4" />
    </svg>
  )
}
```

---

## ⚡ 5. Micro-Interações & Animações nos Ícones

1. **Hover Scale & Rotate**: `group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`.
2. **Pulse Neon**: `animate-pulse` no ícone de IA (`<Sparkles />` ou `<Zap />`).
3. **Spin de Processamento**: `animate-spin` no ícone de atualização (`<RefreshCw />` ou `<Loader2 />`).

---

## 📋 6. Componentes Utilitários de Ícone Prontos

Veja os exemplos em:
- [icon-wrappers.tsx](file:///home/lswitch/car-parts-marketplce/.agents/skills/custom-hitech-icons/examples/icon-wrappers.tsx)
- [custom-svg-icons.tsx](file:///home/lswitch/car-parts-marketplce/.agents/skills/custom-hitech-icons/resources/custom-svg-icons.tsx)
