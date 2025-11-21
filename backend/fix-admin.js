const fetch = require('node-fetch');

async function createAdmin() {
  console.log("👷‍♂️ Recriando o usuário Admin...");

  try {
    const response = await fetch('http://localhost:4002/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: "admin@fortnite.com",
        password: "123",
        displayName: "Admin Recriado"
      })
    });

    if (response.status === 201) {
      console.log("✅ SUCESSO! Usuário Admin criado.");
      console.log("👉 Agora pode rodar o 'node test-buy.js' que vai funcionar!");
    } else {
      // Se der erro 400, é porque já existe (o que também é bom)
      console.log("ℹ️  O servidor disse:", await response.text());
    }

  } catch (error) {
    console.error("❌ Erro de conexão:", error.message);
  }
}

createAdmin();