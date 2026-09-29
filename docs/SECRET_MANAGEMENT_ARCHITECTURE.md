# DAIG Secret Management Architecture

Para mantermos as chaves (Stripe, AWS, Supabase, Banco de Dados) 100% seguras sem quebrar a forma como o código atual foi feito, a arquitetura deve dividir as chaves em duas categorias: **Públicas (Frontend)** e **Privadas (Backend/Infra)**.

Nenhum código da aplicação precisa ser refatorado. A mudança é apenas de **onde** as chaves vêm durante o build e a execução.

## 1. Categorias de Chaves

### 🟢 Chaves Públicas (Frontend)
Estas chaves precisam ser enviadas para o aplicativo (React/iOS) para ele funcionar. **Não há problema** em elas estarem visíveis no navegador ou no app, pois elas apenas identificam o projeto (têm permissões limitadas pelo RLS do Supabase).
* `VITE_SUPABASE_URL`
* `VITE_SUPABASE_ANON_KEY`
* `VITE_STRIPE_PUBLIC_KEY`

**Onde ficam armazenadas?**
* **Localmente (Dev):** Em um arquivo `.env` na máquina do desenvolvedor (este arquivo NUNCA deve ser commitado e deve constar no `.gitignore`).
* **Na Nuvem (GitHub Actions / Vercel):** Cadastradas como **"Repository Secrets"**. O fluxo de CI/CD puxa essas chaves e as injeta no build do aplicativo iOS/Web.

### 🔴 Chaves Privadas e Críticas (Backend e Infraestrutura)
Estas são chaves administrativas. Se vazarem, um invasor pode assumir recursos da AWS ou roubar dinheiro via Stripe. Elas **NUNCA** devem passar pelo frontend ou estar em arquivos `.env` soltos em repositórios.
* `AWS_ACCESS_KEY_ID` e `AWS_SECRET_ACCESS_KEY`
* `STRIPE_SECRET_KEY`
* `STRIPE_WEBHOOK_SECRET`
* Senhas de Banco de Dados (`POSTGRES_PASSWORD`)

**Onde ficam armazenadas?**
* **Edge Functions (Supabase):** Injetadas via Supabase Vault utilizando o comando oficial do CLI:
  `supabase secrets set STRIPE_SECRET_KEY=sk_live_...`
  *O backend lê essas chaves em tempo de execução via `Deno.env.get('STRIPE_SECRET_KEY')` direto da memória segura do servidor.*
* **Infraestrutura (AWS/Terraform):** Injetadas via variáveis de ambiente seguras no GitHub Actions ou em um gerenciador local de senhas, nunca via `terraform.tfvars` commitado.

---

## 2. Ferramentas Recomendadas para a Equipe

Para evitar que a equipe fique trocando o arquivo `.env` via WhatsApp ou Slack (o que é inseguro), recomendo adotar uma das seguintes soluções para sincronização segura:

### Opção A: Supabase Vault + Doppler (Recomendação Ouro)
O **Doppler** (doppler.com) é um "Cofre Universal" (Secret Ops). 
1. Você cadastra o `.env` inteiro no painel web seguro do Doppler.
2. Na máquina de qualquer desenvolvedor do projeto, em vez de criar um `.env` manual, o desenvolvedor digita:
   `doppler run -- npm run dev`
3. O Doppler baixa as chaves diretamente para a memória do node na inicialização. Se a chave da AWS for rotacionada, todos os devs recebem a chave nova na hora.

### Opção B: Dotenv-Vault
O pacote oficial da biblioteca `dotenv` tem uma extensão chamada [Dotenv-Vault](https://www.dotenv.org/).
1. É gerado um arquivo `.env.vault` que **pode ser commitado** (ele é altamente criptografado).
2. O desenvolvedor digita `npx dotenv-vault login` no terminal e a chave de descriptografia permite ler as chaves locais.

---

## 3. Plano de Implementação Imediato (Branch `feat/secure-secrets-architecture`)

1. **Rotacionar o que vazou:** (Você já está fazendo com a AWS). Garantir que nenhuma `STRIPE_SECRET_KEY` esteja presente no histórico de commits.
2. **Atualizar CI/CD:** O `.github/workflows/ios-build.yml` já foi atualizado por nós para ler do *GitHub Secrets*.
3. **Limpar `.env` atual:** Deletar qualquer arquivo `.env` local que contenha chaves administrativas da AWS, mantendo apenas chaves `VITE_` de desenvolvimento.
4. **Alimentar Edge Functions:** Executar no terminal local conectado ao projeto Supabase:
   ```bash
   supabase secrets set STRIPE_SECRET_KEY=sk_test_123
   supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_123
   ```

A aplicação DAIG já foi programada para ler `Deno.env.get()` no backend e `import.meta.env.VITE_` no frontend, portanto **nenhuma linha de código fonte precisará ser reescrita**. Apenas a injeção na infraestrutura muda.
