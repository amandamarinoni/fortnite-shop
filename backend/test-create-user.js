const fetch = require('node-fetch'); // Se der erro, usaremos o nativo do Node 18+

// Se você estiver usando Node 18 ou superior, o fetch é nativo.
// Caso contrário, instale: npm install node-fetch

async function testRegister() {
  console.log("📡 Tentando criar usuário Admin...");

  try {
    const response = await fetch('http://localhost:4002/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: "admin@fortnite.com",
        password: "123",
        displayName: "Admin"
      })
    });

    const data = await response.json();

    if (response.status === 201) {
      console.log("✅ SUCESSO! Usuário criado.");
      console.log("💰 Saldo:", data.balance);
      console.log("🆔 ID:", data.id);
    } else {
      console.log("❌ ERRO:", data);
    }

  } catch (error) {
    console.log("❌ Falha na conexão. O servidor está rodando?");
    console.error(error);
  }
}

testRegister();