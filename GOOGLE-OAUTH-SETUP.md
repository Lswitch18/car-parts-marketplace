# Configurar Google OAuth no Supabase

## Passo 1: Criar Projeto no Google Cloud Console

1. Acesse: https://console.cloud.google.com/
2. Crie um novo projeto ou selecione um existente
3. Vá em **APIs e Serviços** > **Tela de consentimento OAuth**
4. Selecione **Externo** e clique em **Criar**
5. Preencha:
   - Nome do app: `JAPANCAR PARTS`
   - Email de suporte: seu email
   - Email de contato do desenvolvedor: seu email
6. Clique em **Salvar e continuar**
7. Na tela de Escopos, clique em **Salvar e continuar**
8. Na tela de Usuários de teste, adicione seu email e clique em **Salvar e continuar**

## Passo 2: Criar Credenciais OAuth

1. Vá em **APIs e Serviços** > **Credenciais**
2. Clique em **Criar Credenciais** > **ID do cliente OAuth**
3. Selecione tipo: **Aplicativo Web**
4. Nome: `JAPANCAR PARTS Web`
5. **URIs de redirecionamento autorizados**:
   - `https://clqubcryhbrjlupkgeva.supabase.co/auth/v1/callback`
6. Clique em **Criar**
7. Copie o **Client ID** e **Client Secret**

## Passo 3: Configurar no Supabase

1. Acesse seu projeto Supabase
2. Vá em **Authentication** > **Providers** > **Google**
3. Ative o toggle **Enable Sign in with Google**
4. Cole:
   - **Client ID**: do Google Cloud Console
   - **Client Secret**: do Google Cloud Console
5. Clique em **Save**

## Passo 4: Configurar no .env (opcional para desenvolvimento local)

Se quiser testar localmente, adicione:
```
VITE_SUPABASE_URL=https://clqubcryhbrjlupkgeva.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_qmK1AvvoZuK_Vgc5ZE26uw_KeLoNOFt
```

## URIs de redirecionamento necessários

No Google Cloud Console, adicione:
- `https://clqubcryhbrjlupkgeva.supabase.co/auth/v1/callback` (produção)
- `http://localhost:5173/dashboard` (desenvolvimento)

## Verificar configuração

Depois de configurar, teste o login com Google no site. Se der erro:
- Verifique se o Client ID está correto
- Verifique se a tela de consentimento OAuth está publicada
- Verifique se as URIs de redirecionamento estão corretas
