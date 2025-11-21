const fetch = require('node-fetch');

const PORTA = 4002;
const BASE_URL = `http://localhost:${PORTA}`;

async function runMasterTest() {
  console.log("🔥 INICIANDO TESTE DE FLUXO COMPLETO (E2E) 🔥\n");

  try {
    // ---------------------------------------------------------
    // 1. CADASTRO (Garante que o usuário existe)
    // ---------------------------------------------------------
    console.log("1️⃣  Tentando Cadastrar usuário...");
    const regRes = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: "master@teste.com", password: "123", displayName: "Master User" })
    });
    
    if (regRes.status === 201) console.log("   ✅ Usuário criado com sucesso!");
    else if (regRes.status === 400) console.log("   ℹ️  Usuário já existia (tudo bem).");
    else console.log("   ❌ Erro no cadastro:", await regRes.text());


    // ---------------------------------------------------------
    // 2. SINCRONIZAÇÃO (Garante que tem itens)
    // ---------------------------------------------------------
    console.log("\n2️⃣  Sincronizando Loja...");
    await fetch(`${BASE_URL}/sync`, { method: 'POST' });
    console.log("   ✅ Loja sincronizada.");


    // ---------------------------------------------------------
    // 3. LOGIN (Pega o ID e Token)
    // ---------------------------------------------------------
    console.log("\n3️⃣  Fazendo Login...");
    const loginRes = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: "master@teste.com", password: "123" })
    });
    const user = await loginRes.json();
    
    if (!user.id) throw new Error("Falha fatal no login. O servidor está respondendo?");
    console.log(`   ✅ Logado como: ${user.displayName} | Saldo: ${user.balance}`);


    // ---------------------------------------------------------
    // 4. ESCOLHER ITEM
    // ---------------------------------------------------------
    console.log("\n4️⃣  Olhando a vitrine...");
    const shopRes = await fetch(`${BASE_URL}/shop`);
    const items = await shopRes.json();

    if (items.length === 0) throw new Error("Loja vazia mesmo após sync!");
    
    const itemToBuy = items[0];
    console.log(`   ✅ Vou comprar: ${itemToBuy.name} (Preço: ${itemToBuy.priceVbucks})`);


    // ---------------------------------------------------------
    // 5. COMPRAR
    // ---------------------------------------------------------
    console.log(`\n5️⃣  Passando o cartão...`);
    const buyRes = await fetch(`${BASE_URL}/shop/buy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, cosmeticId: itemToBuy.id })
    });

    const receipt = await buyRes.json();

    if (buyRes.status === 200) {
      console.log("\n🎉🎉🎉 SUCESSO TOTAL! 🎉🎉🎉");
      console.log("🧾 Recibo da Compra:", receipt);
      console.log("---------------------------------------------");
      console.log("🚀 SEU BACKEND ESTÁ 100% FUNCIONAL!");
    } else {
      console.log("\n❌ Falha na compra:", receipt.error);
    }

  } catch (error) {
    console.error("\n💥 ERRO CRÍTICO NO TESTE:", error.message);
  }
}

runMasterTest();