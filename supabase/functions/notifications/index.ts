import { successResponse, errorResponse, corsHeaders } from '../utils/base.ts';

/**
 * Notificações Edge Function
 * Responsável por simular/enviar e-mails e alertas do sistema.
 */
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders() });
  }

  try {
    const { type, to, subject, body, metadata } = await req.json();

    // Validação básica
    if (!to || !type) {
      throw new Error('Destinatário e tipo de notificação são obrigatórios');
    }

    // Simulação de envio (Logs para o desenvolvedor)
    console.log(`[EMAIL SIMULATION] -------------------`);
    console.log(`Type: ${type}`);
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject || 'Sem Assunto'}`);
    console.log(`Body: ${body}`);
    console.log(`Metadata: ${JSON.stringify(metadata || {})}`);
    console.log(`-------------------------------------`);

    // Aqui no futuro entra a integração com Resend/SendGrid
    // const resendResponse = await fetch('https://api.resend.com/emails', { ... });

    return new Response(JSON.stringify(successResponse({
      sent: true,
      simulated: true,
      timestamp: new Date().toISOString()
    }, 'Notificação processada com sucesso (Simulada)')), {
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });

  } catch (err) {
    return new Response(JSON.stringify(errorResponse(err.message)), {
      status: 400,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });
  }
});
