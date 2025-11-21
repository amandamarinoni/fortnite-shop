const fetch = require('node-fetch');

async function testLogin() {
  console.log("🔑 Tentando fazer login...");

  try {
    const response = await fetch('http://localhost:4002/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: "admin@fortnite.com",
        password: "123"
      })
    });

    const data = await response.json();

    if (response.status === 200) {
      console.log("✅ LOGIN SUCESSO!");
      console.log("👤 Usuário:", data.displayName);
      console.log("💰 Saldo:", data.balance);
      console.log("🎫 Token:", data.token);
    } else {
      console.log("❌ ERRO NO LOGIN:", data);
    }

  } catch (error) {
    console.error("❌ Falha na conexão:", error);
  }
}

testLogin();