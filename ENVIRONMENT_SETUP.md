# Environment Setup Guide

Este arquivo explica como obter cada variável de ambiente necessária para o projeto.

## Variáveis Necessárias

### 1. **Supabase Frontend** 
- `VITE_SUPABASE_URL` - URL do seu projeto Supabase
- `VITE_SUPABASE_ANON_KEY` - Chave anônima publicável

**Como obter:**
1. Acesse [supabase.com](https://supabase.com) e entre no projeto
2. Vá para Settings → API
3. Copie `Project URL` e `Anon public key`

### 2. **PostgreSQL URLs**
- `POSTGRES_URL` - Connection string com pooling
- `POSTGRES_PRISMA_URL` - Connection string com schema
- `POSTGRES_URL_NON_POOLING` - Connection string sem pooling (migrações)

**Como obter:**
1. No Supabase, vá para Settings → Database
2. Copie a connection string
3. Substitua `[YOUR-PASSWORD]` pela senha do usuário postgres

**Formato:**
```
postgresql://postgres:[password]@[host]:[port]/[database]
```

### 3. **POSTGRES_PASSWORD**
Senha do usuário PostgreSQL (normalmente `postgres`)

**Como obter:**
1. No Supabase Settings → Database
2. A senha foi fornecida durante a criação do projeto
3. Se não souber, resete em Database → Reset Password

### 4. **Supabase Backend**
- `SUPABASE_JWT_SECRET` - Chave JWT para autenticação backend
- `SUPABASE_SERVICE_ROLE_KEY` - Chave de serviço (admin)

**Como obter:**
1. No Supabase, vá para Settings → API
2. Copie `JWT Secret` e `Service role key`

## Passos para Configurar

1. **Copie o arquivo de exemplo:**
   ```bash
   cp .env.example .env
   ```

2. **Preencha cada variável** com seus dados do Supabase

3. **Verifique a conexão:**
   ```bash
   npm run dev
   ```

4. **Nunca commite o `.env`** - já está no `.gitignore`

## Verificação

Para verificar se as variáveis estão corretas:

```bash
npm run build
```

Se o build passar, as variáveis estão configuradas corretamente!

## Segurança

⚠️ **IMPORTANTE:**
- Nunca compartilhe suas chaves com ninguém
- Nunca commite `.env` no Git
- Regenere chaves comprometidas imediatamente no Supabase
- Use variáveis diferentes para Development, Preview e Production

## Referências

- [Supabase Docs - API Keys](https://supabase.com/docs/reference/api/authentication)
- [Prisma - Database Connection](https://www.prisma.io/docs/orm/reference/connection-urls)
