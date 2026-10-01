---
name: Vercel CI/CD Pipeline Learnings
description: Memória técnica de resolução de problemas no deploy da Vercel via GitHub Actions
---

# 🚨 Memória Técnica: Deploy da Vercel via GitHub Actions

Para garantir que a esteira de CI/CD (Pipeline) permaneça verde e nunca mais tenhamos falhas de compatibilidade ou bloqueios da Vercel, todos os agentes devem obedecer estritamente às seguintes regras estabelecidas na sessão de guerra de 30/09/2026:

### 1. JAMAIS use Actions de Terceiros para a Vercel
- **O Problema:** A action `amondnet/vercel-action` (e similares) está abandonada. Ela injeta internamente versões jurássicas da CLI da Vercel (ex: `v25.1.0`), o que causa rejeição imediata da API da Vercel (`Error! Your Vercel CLI version is outdated. This endpoint requires version 47.2.2 or later.`).
- **A Solução:** Use sempre o comando nativo e oficial via bash: `npx vercel@latest deploy --prod --yes --token=${{ secrets.VERCEL_TOKEN }}`. Isso garante que sempre estaremos rodando a versão mais blindada e rápida da CLI.

### 2. Tratamento de ORG_ID e PROJECT_ID
- **O Problema:** O erro `Set up and deploy? [Y/n]` (loop infinito de terminal na Vercel) acontece porque a CLI perde o contexto do projeto. Na maioria das vezes, isso ocorre por desalinhamento no momento em que o humano cria as variáveis em GitHub Secrets, ou pelo IAM de autenticação via browser vs CLI.
- **A Solução e Análise de Risco:** O `VERCEL_ORG_ID` e o `VERCEL_PROJECT_ID` **não são senhas**. São identificadores públicos de rota. Portanto, **é 100% SEGURO chumbá-los (hardcode)** diretamente no arquivo `.github/workflows/cicd.yml` dentro de uma flag `env:`. Isso remove completamente a dependência de o desenvolvedor configurar "Secrets" não-sensíveis perfeitamente.
- **Cuidado Máximo:** A ÚNICA credencial que deve vir de `secrets` encriptados é o `VERCEL_TOKEN`.

### 3. Anatomia Perfeita do Job de Deploy
Sempre padronizar a etapa de deploy no GitHub Actions desta forma:

```yaml
      - name: Deploy to Vercel
        env:
          VERCEL_ORG_ID: team_vGsuKJoz23dvYBv9w3Suwz5T
          VERCEL_PROJECT_ID: prj_bzImAckASS02KBx5vBirTr2hseIs
        run: npx vercel@latest deploy --prod --yes --token=${{ secrets.VERCEL_TOKEN }}
```

Estas diretrizes formam o Padrão Ouro de estabilidade para os repositórios baseados em Vite e Vercel deste Workspace.
