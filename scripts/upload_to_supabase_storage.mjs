import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';
import WebSocket from 'ws';

if (typeof globalThis.WebSocket === 'undefined') {
  globalThis.WebSocket = WebSocket;
}

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://clqubcryhbrjlupkgeva.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const BUCKET_NAME = 'daig-docs';

const FILES = [
  { relPath: 'docs/diag/daig_architecture_diagram.png', name: 'daig_architecture_diagram.png', contentType: 'image/png' },
  { relPath: 'docs/diag/daig_software_flow.png', name: 'daig_software_flow.png', contentType: 'image/png' },
  { relPath: 'docs/diag/env_configuracoes.xlsx', name: 'env_configuracoes.xlsx', contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
  { relPath: 'docs/diag/MODELO_DE_NEGOCIO_JAPAO.md', name: 'MODELO_DE_NEGOCIO_JAPAO.md', contentType: 'text/markdown' },
  { relPath: 'docs/diag/ESTUDO_DE_MERCADO_JAPAO.md', name: 'ESTUDO_DE_MERCADO_JAPAO.md', contentType: 'text/markdown' },
  { relPath: 'docs/diag/ARQUITETURA_E_FLUXO_SOFTWARE.md', name: 'ARQUITETURA_E_FLUXO_SOFTWARE.md', contentType: 'text/markdown' },
  { relPath: 'docs/diag/INDEX.md', name: 'INDEX.md', contentType: 'text/markdown' },
  { relPath: 'exports/relatorio_financeiro.xlsx', name: 'relatorio_financeiro.xlsx', contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
  { relPath: 'exports/contrato_parceria_b2b.docx', name: 'contrato_parceria_b2b.docx', contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
  { relPath: 'daig_documentacao.zip', name: 'daig_documentacao.zip', contentType: 'application/zip' }
];

async function main() {
  console.log(`🚀 Criando/Verificando bucket '${BUCKET_NAME}' no Supabase Cloud Storage...`);

  // Tenta criar o bucket público se não existir
  const { error: bucketErr } = await supabase.storage.createBucket(BUCKET_NAME, {
    public: true,
  });

  if (bucketErr && !bucketErr.message.includes('already exists')) {
    console.log(`⚠️ Aviso do bucket: ${bucketErr.message}`);
  } else {
    console.log(`✅ Bucket '${BUCKET_NAME}' ativo!`);
  }

  const publicUrls = {};

  for (const fileItem of FILES) {
    const fullPath = path.resolve(fileItem.relPath);
    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️ Arquivo ${fileItem.relPath} não encontrado, pulando...`);
      continue;
    }

    const fileBuffer = fs.readFileSync(fullPath);
    console.log(`⬆️ Enviando '${fileItem.name}' para a nuvem...`);

    const { error: uploadErr } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileItem.name, fileBuffer, {
        contentType: fileItem.contentType,
        upsert: true,
      });

    if (uploadErr) {
      console.error(`❌ Erro ao enviar ${fileItem.name}:`, uploadErr.message);
    } else {
      const { data: publicData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(fileItem.name);

      publicUrls[fileItem.name] = publicData.publicUrl;
      console.log(`   ✅ Link público gerado: ${publicData.publicUrl}`);
    }
  }

  console.log('\n🎉 Upload de todos os arquivos concluído com sucesso!');
  console.log('📌 Links de acesso direto aos documentos:');
  console.log(JSON.stringify(publicUrls, null, 2));
}

main().catch(console.error);
