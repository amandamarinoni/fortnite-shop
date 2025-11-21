import { Request, Response } from 'express';
import { prisma } from '../prisma'; 
import { ShopService } from '../services/ShopService'; 
export class ShopController {
  
  // 1. LISTAR ITENS DA LOJA
  // Rota: GET /shop
  // Objetivo: Mostrar o "cardápio" de itens disponíveis para compra
  async list(req: Request, res: Response) {
    try {
      console.log("🛍️  A buscar itens na loja...");
      const items = await prisma.cosmetic.findMany({
        where: { isOnShop: true }, // Apenas itens ativos na loja
        orderBy: { isNew: 'desc' } // Novos aparecem primeiro
      });
      return res.json(items);
    } catch (error) {
      console.error("Erro ao listar loja:", error);
      return res.status(500).json({ error: 'Erro interno ao listar a loja.' });
    }
  }

  // 2. COMPRAR ITEM
  // Rota: POST /shop/buy
  // Objetivo: Receber o pedido de compra e passar para o serviço processar
  async purchase(req: Request, res: Response) {
    const shopService = new ShopService();
    
    // O Frontend envia estes dados no corpo da requisição (JSON)
    const { userId, cosmeticId } = req.body;

    // Validação básica: Se faltar dados, nem chamamos o serviço
    if (!userId || !cosmeticId) {
      return res.status(400).json({ error: 'Os campos userId e cosmeticId são obrigatórios.' });
    }

    try {
      // Chama o "Cozinheiro" (ShopService) para fazer a transação segura
      const result = await shopService.purchaseItem(userId, cosmeticId);
      
      // Se deu certo, devolvemos os detalhes da compra
      return res.json(result);
    } catch (error: any) {
      // Se deu erro (sem saldo, item repetido), devolvemos erro 400
      return res.status(400).json({ error: error.message });
    }
  }

  // 3. DEVOLVER ITEM (REFUND)
  // Rota: POST /shop/refund
  // Objetivo: Desfazer uma compra e devolver os V-Bucks
  async refund(req: Request, res: Response) {
    const shopService = new ShopService();
    const { userId, cosmeticId } = req.body;

    if (!userId || !cosmeticId) {
      return res.status(400).json({ error: 'Os campos userId e cosmeticId são obrigatórios.' });
    }

    try {
      const result = await shopService.refundItem(userId, cosmeticId);
      return res.json(result);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
}