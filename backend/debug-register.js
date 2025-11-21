const fetch = require('node-fetch');

async function debugRegister() {
  console.log("🕵️‍♂️ Investigando o cadastro...");
  
  try {
    const response = await fetch('http://localhost:4002/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: "debug@teste.com",
        password: "123",
        displayName: "Debug User"
      })
    });

    const text = await response.text();
    console.log("RESPOSTA DO SERVIDOR:", text);

  } catch (e) {
    console.log("Erro de conexão:", e.message);
  }
}

debugRegister();