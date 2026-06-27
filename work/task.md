# Lista de Tarefas (Work in Progress)

## Concluídas ✅
- [x] **Tradução Leilão:** Implementar a tradução para a parte de leilão do sistema.
- [x] **App iOS:** Configurar e realizar o build do aplicativo para a plataforma iOS (Capacitor/Xcode).
- [x] **Domínio:** Configurar o domínio daig.jp para a aplicação de produção.
- [x] **Vídeo de Marketing:** Realizar teste de vídeo de marketing utilizando o Google Omni Video Generation.
- [x] **Favicon:** Alterar a logo que aparece nas abas do navegador (favicon).
- [x] **Inserir atalho de tradução de língua no modo mobile** (Adicionado no Header).
- [x] **Remover lista de carros da Índia até Indonésia na Home** (Marcas BYD, Zeekr e NIO removidas).
- [x] **Segurança: Proteção de rotas** - aceitar requisição somente de usuário autenticado.
- [x] **Segurança: Verificar RLS no banco de dados** - Auditoria realizada nas tabelas B2B e contratos.
- [x] **Segurança: Implementar Rate Limit / Anti-DDoS** - Implementado no webhook do Stripe.
- [x] **Segurança: Teste de vulnerabilidade** - Auditoria de arquitetura e defesas aplicadas.
- [x] Criar a Edge Function `save-to-drive` no Supabase
  - [x] Implementar a autenticação com Google Drive API usando Service Account
  - [x] Implementar o download do modelo `.glb` recebido pela URL
  - [x] Implementar o upload do arquivo para o Google Drive
- [x] Atualizar `api.ts` do frontend
  - [x] Adicionar método `api.ai.saveToDrive`
- [x] Atualizar o componente `CreateListing.tsx`
  - [x] Adicionar lógica para chamar `saveToDrive` quando a geração 3D for concluída com sucesso
- [x] Deploy da nova Edge Function para o Supabase
- [x] Commit e Push das mudanças do Frontend

## Pendentes ⏳
- [ ] **Gravação de Vídeo:** Gravar um vídeo demonstrativo apresentando o sistema e explicando as funcionalidades.
