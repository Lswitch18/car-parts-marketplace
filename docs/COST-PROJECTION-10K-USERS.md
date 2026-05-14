# GAID - Projeção de Custos: 10.000 Usuários (MAU)
> **Cenário:** 10.000 usuários ativos por mês, 2.000 anúncios ativos e fluxo constante de mensagens e fotos.

---

## 1. Infraestrutura de Servidor e Banco de Dados

### **Supabase (Pro Plan)**
Para 10.000 usuários, o plano gratuito do Supabase pode ficar apertado no armazenamento de banco de dados (500MB). O plano Pro é o ideal para garantir performance.
- **Custo:** $25.00/mês.
- **O que inclui:** 8GB de banco de dados, 100GB de storage para fotos, 50.000 usuários de autenticação.
- **Status:** **$25.00**

### **Hospedagem (Vercel Pro)**
Embora o plano Hobby aguente muito tráfego, o plano Pro oferece melhores tempos de resposta e suporte a domínios profissionais com segurança avançada.
- **Custo:** $20.00/mês.
- **Status:** **$20.00**

---

## 2. Comunicação e IA

### **E-mail (Amazon SES)**
Para 10.000 usuários, estimamos cerca de 25.000 e-mails/mês (boas-vindas, recuperação de senha, avisos de venda e códigos OTP).
- **Custo:** $0.10 por 1.000 e-mails.
- **Cálculo:** 25 x $0.10 = **$2.50**

### **Inteligência Artificial (Gemini 1.5 Flash)**
Mesmo com 1.000 novos anúncios por mês, o custo do Gemini é baixíssimo ou zero se usarmos o tier gratuito com limite de taxa (Rate Limit).
- **Custo Estimado:** **$5.00** (Margem de segurança para uso intenso de visão computacional).

---

## 3. Resumo Financeiro Mensal (Estimativa)

| Serviço | Item | Custo (USD) |
| :--- | :--- | :--- |
| **Supabase** | DB, Auth, Storage | $25.00 |
| **Vercel** | Hosting & Edge | $20.00 |
| **Amazon SES** | 25k E-mails | $2.50 |
| **Google Gemini** | IA de Peças | $5.00 |
| **Domínio** | gaid.jp | $1.50 (anualizado) |
| **TOTAL ESTIMADO** | | **$54.00** |

---

## 4. Viabilidade Econômica (Ponto de Equilíbrio)

Se a GAID cobrar uma pequena comissão ou taxa de serviço por transação:

- **Cenário de Vendas:** 10.000 usuários gerando **200 vendas** por mês.
- **Ticket Médio:** ¥15.000 (~$100.00).
- **Taxa da Plataforma (2%):** $2.00 por venda.
- **Receita Mensal:** 200 x $2.00 = **$400.00**.

**Lucro Líquido Estimado:** $400.00 (Receita) - $54.00 (Custos) = **$346.00 / mês**.

---

## 5. Conclusão do Estudo

A plataforma GAID é **extremamente eficiente**. Com um custo fixo de aproximadamente **$55 dólares**, você consegue manter uma comunidade de 10.000 pessoas. 

**O risco financeiro é mínimo**, pois os custos só aumentam significativamente quando o volume de usuários e vendas também aumenta, garantindo que a receita sempre cubra as despesas.

---
*Estudo gerado em 11 de Maio de 2026 para planejamento de escala da plataforma GAID.*
