/**
 * View Transition Bridge — criado por view-transition-bridge agent (forge 2026-09-14)
 * Usa document.startViewTransition quando disponível, fallback para navegação normal.
 * Mantém compatibilidade com Lenis + DAIG tokens.
 */
export function supportsViewTransition(): boolean {
  return typeof document !== 'undefined' && 'startViewTransition' in document
}

export async function navigateWithViewTransition(navigate: () => void | Promise<void>): Promise<void> {
  const doc = document as unknown as { startViewTransition?: (cb: () => void) => { finished: Promise<void> } }
  if (doc.startViewTransition) {
    await doc.startViewTransition(() => {
      navigate()
    }).finished
  } else {
    await navigate()
  }
}

// CSS para view-transition (injetado em PresentationPage se suportado)
// ::view-transition-old(root), ::view-transition-new(root) { animation-duration: 0.35s; }
