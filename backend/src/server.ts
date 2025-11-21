import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { prisma } from './prisma';
import { UserController } from './controllers/UserController';
import { ShopController } from './controllers/ShopController';
import { SyncService } from './services/SyncService';

dotenv.config();

const app = express();
const PORT = 4002; 

app.use(express.json());
app.use(cors());

// --- INSTANCIANDO AS CLASSES ---
const userController = new UserController();
const shopController = new ShopController();
const syncService = new SyncService();

// --- ROTAS ---

app.get('/health', (req, res) => {
  return res.json({ status: 'Server is running! 🚀' });
});

app.post('/register', userController.register);
app.post('/login', userController.login);

app.get('/shop', shopController.list);
app.post('/shop/buy', shopController.purchase);
app.post('/shop/refund', shopController.refund);

app.post('/sync', async (req, res) => {
  try {
    const result = await syncService.syncStoreData();
    return res.json(result);
  } catch (error) {
    console.error("Erro no sync:", error); 
    return res.status(500).json({ error: 'Erro ao sincronizar.' });
  }
});

// --- INICIALIZAÇÃO ---
const start = async () => {
  try {
    await prisma.$connect();
    console.log('📦 Banco de dados conectado com sucesso!'); 
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🔥 Servidor rodando na porta ${PORT}`); 
    });
  } catch (error) {
    console.error("❌ Erro fatal ao iniciar:", error); 
    process.exit(1);
  }
};

start();