// test-sync.js

// Se estiver a usar Node.js 18 ou superior, o fetch é nativo e não precisa de instalar nada.
// Se estiver a usar uma versão antiga e der erro "MODULE_NOT_FOUND", 
// rode no terminal: npm install node-fetch@2 e descomente a linha abaixo:
const fetch = require('node-fetch'); 

async function testSync() {
  // IMPORTANTE: A porta deve ser a mesma que aparece no seu terminal do servidor (4002)
  const PORTA = 4002; 
  const url = `http://localhost:${PORTA}/sync`;
  
  console.log(`⏳ A enviar comando de sincronização para ${url} ...`);
  
  try {
    const response = await fetch(url, {
      method: 'POST'
    });

    // Lemos a resposta como texto puro primeiro para diagnosticar erros
    const text = await response.text();
    
    try {
      // Tentamos transformar em JSON
      const data = JSON.parse(text);
      
      if (response.ok) {
        console.log("✅ SUCESSO! Itens salvos no banco.");
        console.log("Detalhes da resposta:", data);
        console.log("\n🚀 Próximo passo: Abra o Prisma Studio (npx prisma studio) e verifique a tabela 'Cosmetic'.");
      } else {
        console.log("⚠️ O servidor respondeu, mas deu erro na lógica:", data);
      }
    } catch (jsonError) {
      console.log("❌ ERRO CRÍTICO: O servidor não retornou JSON.");
      console.log("Provavelmente a rota está errada ou aconteceu um erro interno.");
      console.log("Conteúdo recebido (início):");
      console.log(text.substring(0, 200)); 
    }

  } catch (e) {
    console.error("❌ Erro de conexão:", e.message);
    console.log("Dica: O servidor está a rodar? Verifique se o terminal do 'npm run dev' mostra a porta 4002.");
  }
}

testSync();