import { successResponse, errorResponse, corsHeaders, requireAuth } from '../utils/base.ts';
import { google } from 'npm:googleapis@126.0.1';
import { Buffer } from 'node:buffer';
import { Readable } from 'node:stream';

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders() });
  }

  const { response: authRes } = await requireAuth(req);
  if (authRes) return authRes;

  try {
    const { modelUrl, title } = await req.json();

    if (!modelUrl) {
      throw new Error('A URL do modelo é obrigatória');
    }

    const serviceAccountJsonStr = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_JSON');
    const folderId = Deno.env.get('GOOGLE_DRIVE_FOLDER_ID');

    if (!serviceAccountJsonStr || !folderId) {
      throw new Error('Integração com Google Drive não está configurada (Credenciais ausentes)');
    }

    // Initialize Google Auth
    const credentials = JSON.parse(serviceAccountJsonStr);
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/drive.file'],
    });

    const drive = google.drive({ version: 'v3', auth });

    // Download the 3D model
    const fileRes = await fetch(modelUrl);
    if (!fileRes.ok) {
      throw new Error(`Falha ao baixar o modelo 3D da origem: ${fileRes.statusText}`);
    }
    
    // We get the arrayBuffer and wrap it in a Node Buffer for googleapis compatibility
    const arrayBuffer = await fileRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Sanitize title for filename
    const safeTitle = (title || 'Modelo 3D').replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const fileName = `${safeTitle}_${Date.now()}.glb`;

    // Upload to Google Drive
    // Using multipart upload with media stream/buffer
    const uploadRes = await drive.files.create({
      requestBody: {
        name: fileName,
        parents: [folderId],
      },
      media: {
        mimeType: 'model/gltf-binary',
        body: Readable.from([buffer]),
      },
      fields: 'id, webViewLink',
    });

    return new Response(JSON.stringify(successResponse({
      id: uploadRes.data.id,
      webViewLink: uploadRes.data.webViewLink,
      fileName,
    }, 'Modelo salvo no Google Drive com sucesso!')), {
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });

  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
    return new Response(JSON.stringify(errorResponse(errorMessage)), {
      status: 400,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });
  }
});
