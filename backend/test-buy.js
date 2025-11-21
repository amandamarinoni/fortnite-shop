// Se der erro de "module not found: node-fetch", instale: npm install node-fetch@2
const fetch = require('node-fetch');

// Certifique-se de que esta é a mesma porta que aparece no "🔥 Servidor rodando..."
const PORTA = 4002; 
const BASE_URL = `http://localhost:${PORTA}`;

async function testFullFlow() {
  console.log(`🚀 INICIANDO TESTE DE COMPRA AUTOMÁTICA na porta ${PORTA}...\n`);

  try {
    // PASSO 1: LOGIN
    console.log("🔑 1. Tentando Logar como Admin...");
    const loginRes = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: "admin@fortnite.com", password: "123" })
    });
    
    const user = await loginRes.json();
    
    if (!user.id) {
      throw new Error("Falha no login. Verifique se o usuário existe ou se a senha está certa.");
    }
    console.log(`   ✅ Logado como: ${user.displayName} | Saldo: ${user.balance} V-Bucks`);

    // PASSO 2: LISTAR LOJA
    console.log("\n🛍️ 2. Buscando itens na loja...");
    const shopRes = await fetch(`${BASE_URL}/shop`);
    const items = await shopRes.json();

    if (!Array.isArray(items) || items.length === 0) {
      throw new Error("A loja está vazia! Rode o 'node test-sync.js' primeiro para trazer itens.");
    }
    
    const itemToBuy = items[0]; // Pega o primeiro item da lista
    console.log(`   ✅ Item escolhido: ${itemToBuy.name} (Custa: ${itemToBuy.priceVbucks} V-Bucks)`);

    // PASSO 3: COMPRAR
    console.log(`\n💸 3. Tentando comprar o item...`);
    const buyRes = await fetch(`${BASE_URL}/shop/buy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.id,
        cosmeticId: itemToBuy.id
      })
    });

    const receipt = await buyRes.json();

    if (buyRes.status === 200) {
      console.log("   🎉 COMPRA REALIZADA COM SUCESSO!");
      console.log("   🧾 Recibo:", receipt);
      console.log("\n   Dica: Verifique no Prisma Studio se o saldo diminuiu e o item apareceu no 'UserItem'.");
    } else {
      console.log("   ❌ ERRO NA COMPRA:", receipt.error);
    }

  } catch (error) {
    console.error("💥 ERRO CRÍTICO:", error.message);
    console.log("   Dica: O servidor está rodando? Use 'npm run dev' em outro terminal.");
  }
}

testFullFlow();