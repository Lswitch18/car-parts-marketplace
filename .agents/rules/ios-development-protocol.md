# Protocolo do Time de Agentes iOS 📱🤖

Esta regra define o protocolo de atuação do time de agentes responsáveis pelo desenvolvimento do App iOS (Marketplace DAIG).

## Membros do Time
- **Engenheiro iOS (ios-marketplace-builder):** Responsável por compilação (xcodebuild, Capacitor, Vite), infraestrutura de build (GitHub Actions macos-14) e integração com Appetize.io.
- **Design & Animações (gsap-interactive-web-components):** Responsável por garantir que a UI mobile (React) atenda aos padrões Cyber Neon com animações fluidas em 60/120fps.
- **Engenharia de Segurança (shift-left-sast-security):** Responsável por validar credenciais (Supabase, Stripe) no CI/CD e nos fluxos do app.

## 🛡️ Diretrizes de Prevenção de Amnésia (Context Loss)

Para evitar a perda de contexto em reloads de sessão (como perdas de logs do Appetize.io ou GitHub Actions), **TODOS os agentes do time iOS** devem seguir obrigatoriamente este fluxo de depuração:

1. **Sempre documentar antes de agir:** Ao receber um log de erro (ex: erro de build, crash no Appetize, falha no .env), o agente DEVE salvar o log em um arquivo físico no projeto (ex: `docs/active_bug.md` ou no diretório `scratch/` dos artefatos).
2. **Registro de Solução (RAG):** Após corrigir o bug, o agente DEVE atualizar as regras do projeto ou gerar um sumário da correção usando o comando `/learn` para que a solução seja indexada na memória permanente.
3. **Proibição de Dependência Exclusiva do Chat:** Agentes nunca devem manter configurações complexas de infraestrutura apenas no histórico do chat. Tudo deve ser refletido nos arquivos `.github/workflows/`, `.env.example`, ou em documentos na pasta `docs/`.

## ⚙️ Fluxo Oficial Atual (Set 2026)
- **Infra:** AWS EC2 Mac foi descontinuada. O time agora utiliza **GitHub Actions** (runner `macos-14` gratuito).
- **Simulação:** Geração de `.zip` do arquivo `App.app` e deploy para testes visuais no **Appetize.io**.
