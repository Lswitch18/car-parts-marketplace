# GAID - Pesquisa Técnica: Soluções de Baixo Custo
> **Objetivo:** Implementar funcionalidades avançadas com custo operacional próximo de zero para a fase inicial.

---

## 1. API de Pagamento (Checkout & Escrow)

### **Recomendação: Stripe**
O Stripe é o padrão ouro para marketplaces no Japão devido à sua facilidade de integração e suporte a cartões locais e internacionais.

- **Custo:** Gratuito para implementar. Você só paga quando vende (Taxa aproximada de 3.6% no Japão).
- **Vantagens:**
  - **Stripe Connect:** Permite criar o fluxo de "Escrow" (reter o dinheiro e repassar ao vendedor apenas após a entrega).
  - **Segurança:** Não precisamos lidar com dados de cartão no nosso servidor (PCI Compliance).

---

## 2. Servidor de E-mail (Transacional)

Para enviar códigos de confirmação e notificações de venda.

### **Opção A: Resend (Recomendado para início)**
- **Custo:** **Grátis** até 3.000 e-mails por mês.
- **Destaque:** Interface extremamente moderna e fácil para desenvolvedores.

### **Opção B: Amazon SES (O mais barato do mercado)**
- **Custo:** ~$0.10 para cada 1.000 e-mails enviados.
- **Destaque:** Praticamente impossível de estourar o orçamento, mas a configuração inicial é um pouco mais técnica.

---

## 3. Confirmação de E-mail e Google Login

Já temos a base disso no **Supabase Auth**.

- **Google Login:** Gratuito. Exige apenas a configuração do Client ID no Google Cloud Console.
- **E-mail OTP (Código):** O Supabase permite enviar um código numérico (One-Time Password) em vez de um link.
  - **Fluxo:** Usuário digita e-mail -> Recebe código de 6 dígitos -> Digita no GAID -> Logado.

---

## 4. Inteligência Artificial (Gemini)

Atualmente o **Gemini 1.5 Flash** é a melhor escolha (não existe "Gemini 3" ainda, o 1.5 é o estado da arte em velocidade).

- **Google AI Studio (Gemini 1.5 Flash):**
  - **Custo:** **Grátis** (até 15 requisições por minuto).
  - **Uso no GAID:** Leitura de fotos de peças, preenchimento automático de títulos e descrições, e categorização.
  - **Por que Flash?** É otimizado para velocidade e baixo custo, perfeito para tarefas simples de visão computacional.

---

## 5. Tabela Comparativa de Custos Iniciais

| Funcionalidade | Serviço | Custo Mensal (Base) |
| :--- | :--- | :--- |
| **Autenticação** | Supabase Auth | $0.00 |
| **Banco de Dados** | Supabase DB | $0.00 (até 500MB) |
| **IA (Visão)** | Gemini 1.5 Flash | $0.00 (Tier gratuito) |
| **E-mail** | Resend | $0.00 (até 3k envios) |
| **Pagamentos** | Stripe | $0.00 (Só paga % na venda) |
| **Hospedagem** | Vercel | $0.00 (Hobby Plan) |

---

## Próximos Passos Sugeridos:
1. **Configurar Resend**: Para e-mails de boas-vindas e códigos.
2. **Ativar Google OAuth**: No painel do Supabase.
3. **Integrar Stripe Checkout**: Para o botão "Comprar Agora".

---
*Documento gerado em 11 de Maio de 2026 para a plataforma GAID.*
