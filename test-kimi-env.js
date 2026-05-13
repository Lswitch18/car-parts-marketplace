// test-kimi-env.mjs - Versão ES Module
import axios from 'axios';

// Pega a chave da variável de ambiente
const API_KEY = process.env.KIMI_API_KEY || process.env.OPENAI_API_KEY;

console.log('🔑 Testando chave da API do Kimi...\n');

// Verifica se a chave existe
if (!API_KEY) {
  console.error('❌ ERRO: Variável de ambiente não encontrada!');
  console.error('\n📌 Configure sua chave primeiro:');
  console.error('   export KIMI_API_KEY="sua-chave-aqui"');
  console.error('   ou');
  console.error('   export OPENAI_API_KEY="sua-chave-aqui"');
  process.exit(1);
}

// Mostra os primeiros caracteres da chave (por segurança)
const keyPreview = API_KEY.substring(0, 10) + '...' + API_KEY.substring(API_KEY.length - 4);
console.log(`✅ Chave encontrada: ${keyPreview}`);
console.log('📡 Enviando requisição de teste...\n');

// Função para testar a API do Kimi
async function testKimiAPI() {
  try {
    const response = await axios.post(
      'https://api.moonshot.ai/v1/chat/completions',
      {
        model: 'moonshot-v1-8k',
        messages: [
          {
            role: 'system',
            content: 'Você é um assistente útil.'
          },
          {
            role: 'user',
            content: 'Diga apenas "API funcionando corretamente!" se você receber esta mensagem.'
          }
        ],
        temperature: 0.3,
        max_tokens: 50
      },
      {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );
    
    console.log('✅ SUCESSO! API respondendo normalmente.');
    console.log('\n📨 Resposta da API:');
    console.log('─'.repeat(50));
    console.log(response.data.choices[0].message.content);
    console.log('─'.repeat(50));
    console.log(`\n📊 Estatísticas:`);
    console.log(`   - Modelo usado: ${response.data.model}`);
    console.log(`   - Tokens de entrada: ${response.data.usage.prompt_tokens}`);
    console.log(`   - Tokens de saída: ${response.data.usage.completion_tokens}`);
    console.log(`   - Total tokens: ${response.data.usage.total_tokens}`);
    
    return true;
  } catch (error) {
    console.error('❌ ERRO na requisição:');
    
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Mensagem: ${error.response.data.error?.message || JSON.stringify(error.response.data)}`);
      
      if (error.response.status === 401) {
        console.error('\n⚠️  Chave inválida! Verifique sua chave da API Moonshot.');
      } else if (error.response.status === 429) {
        console.error('\n⚠️  Limite de requisições excedido.');
      } else if (error.response.status === 402) {
        console.error('\n⚠️  Créditos insuficientes.');
      }
    } else if (error.request) {
      console.error(`   Sem resposta do servidor: ${error.message}`);
    } else {
      console.error(`   Erro: ${error.message}`);
    }
    
    return false;
  }
}

// Executa o teste
testKimiAPI().then(success => {
  if (success) {
    console.log('\n🎉 Tudo certo! Sua chave está funcionando!');
  }
});