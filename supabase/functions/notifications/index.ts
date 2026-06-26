import { successResponse, errorResponse, corsHeaders, requireAuth } from '../utils/base.ts';

/**
 * Notificações Edge Function
 * Responsável por enviar e-mails e alertas reais de produção via Resend API.
 */
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders() });
  }

  // Security: Require auth
  const { response: authRes } = await requireAuth(req);
  if (authRes) return authRes;

  try {
    const { type, to, subject, body, metadata } = await req.json();

    // Validação básica
    if (!to || !type) {
      throw new Error('Destinatário e tipo de notificação são obrigatórios');
    }

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    let sentReal = false;
    let apiResponse = null;

    if (RESEND_API_KEY && type === 'email') {
      console.log(`[EMAIL PRODUCTION] Enviando e-mail real para ${to}...`);
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: 'DAIG Logistix Onboarding <onboarding@resend.dev>',
          to: to,
          subject: subject || 'Notificação do Sistema',
          html: body,
        }),
      });

      apiResponse = await response.json();
      sentReal = response.ok;
      console.log(`[EMAIL PRODUCTION] Resposta da API Resend:`, apiResponse);
    } else {
      // Simulação fallback para desenvolvimento local sem chave configurada
      console.log(`[EMAIL SIMULATION] -------------------`);
      console.log(`Type: ${type}`);
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject || 'Sem Assunto'}`);
      console.log(`Body: ${body}`);
      console.log(`Metadata: ${JSON.stringify(metadata || {})}`);
      console.log(`-------------------------------------`);
    }

    return new Response(JSON.stringify(successResponse({
      sent: true,
      sent_real: sentReal,
      api_response: apiResponse,
      timestamp: new Date().toISOString()
    }, sentReal ? 'Notificação enviada por e-mail com sucesso' : 'Notificação simulada com sucesso')), {
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });

  } catch (err) {
    return new Response(JSON.stringify(errorResponse(err.message)), {
      status: 400,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });
  }
});
