import axios from 'axios';
import { prisma } from '../prisma';

// ...
export class SyncService {
  
  async syncStoreData() {
    console.log("➡️ DENTRO DO SERVICE: Começando..."); // <--- ESPIÃO 4
    
    let newItems = [];
    
    try {
      console.log("➡️ DENTRO DO SERVICE: Tentando axios.get..."); // <--- ESPIÃO 5
      const response = await axios.get('https://fortnite-api.com/v2/cosmetics/br/new');
      console.log("➡️ DENTRO DO SERVICE: Axios respondeu."); // <--- ESPIÃO 6
      // ... resto do código ...
      
      if (response.data && response.data.data && response.data.data.items) {
        newItems = response.data.data.items;
        console.log(`📡 API Fortnite respondeu com ${newItems.length} itens.`);
      }
    } catch (error) {
      console.log("⚠️ Falha ao contatar API Fortnite (usando dados de teste).");
    }

    // PLANO B: Se a API estiver vazia, usa itens de teste para não travar o projeto
    if (newItems.length === 0) {
      console.log("⚠️ Lista 'New' vazia. Gerando itens de teste para o banco...");
      newItems = [
        {
          id: "test_skin_1",
          name: "Comando Estelar (Teste)",
          description: "Skin de teste gerada localmente",
          type: { value: "outfit" },
          rarity: { value: "legendary" },
          images: { icon: "https://fortnite-api.com/images/cosmetics/br/cid_001_athena_commando_f_default/icon.png", smallIcon: "" },
          shopHistory: ["2024-01-01"]
        },
        {
          id: "test_pickaxe_1",
          name: "Picareta Dourada (Teste)",
          description: "Ferramenta de coleta teste",
          type: { value: "pickaxe" },
          rarity: { value: "epic" },
          images: { icon: "https://fortnite-api.com/images/cosmetics/br/pickaxe_id_013_teslatrap/icon.png", smallIcon: "" },
          shopHistory: ["2024-01-01"]
        }
      ];
    }

    let count = 0;

    // Salva no Banco
    for (const item of newItems) {
      const price = 1200; // Preço fixo para teste

      await prisma.cosmetic.upsert({
        where: { externalId: item.id },
        update: {
          name: item.name,
          isNew: true,
          lastSyncedAt: new Date(),
          imageUrl: item.images.icon || item.images.smallIcon,
        },
        create: {
          externalId: item.id,
          name: item.name,
          type: item.type.value,
          rarity: item.rarity.value,
          priceVbucks: price,
          imageUrl: item.images.icon || item.images.smallIcon,
          isNew: true,
          isOnShop: true
        }
      });
      count++;
    }

    console.log(`✅ Sucesso! ${count} itens salvos no banco.`);
    return { success: true, count };
  }
}