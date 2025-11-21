import { prisma } from '../prisma';

export class ShopService {

  /**
   * COMPRAR ITEM
   * 1. Verifica saldo
   * 2. Verifica se já tem o item
   * 3. Cria transação atômica (Tudo ou Nada)
   */
  async purchaseItem(userId: string, cosmeticId: string) {
    
    // O prisma.$transaction garante que se faltar luz no meio do processo,
    // o dinheiro não some. Ou faz tudo, ou não faz nada.
    return await prisma.$transaction(async (tx) => {
      
      // 1. Buscar dados atualizados dentro da transação
      const user = await tx.user.findUnique({ where: { id: userId } });
      const item = await tx.cosmetic.findUnique({ where: { id: cosmeticId } });

      if (!user) throw new Error("Usuário não encontrado.");
      if (!item) throw new Error("Item não encontrado.");

      // 2. Regra de Negócio: Verificar Saldo
      if (user.vbucksBalance < item.priceVbucks) {
        throw new Error(`Saldo insuficiente. Você tem ${user.vbucksBalance}, mas o item custa ${item.priceVbucks}.`);
      }

      // 3. Regra de Negócio: Verificar se já possui
      const alreadyOwns = await tx.userItem.findUnique({
        where: {
          userId_cosmeticId: { userId, cosmeticId }
        }
      });

      if (alreadyOwns) {
        throw new Error("Você já possui este item no inventário.");
      }

      // 4. Executar a Compra (Débito + Entrega + Recibo)
      
      // A: Debitar V-Bucks
      await tx.user.update({
        where: { id: userId },
        data: { vbucksBalance: { decrement: item.priceVbucks } }
      });

      // B: Adicionar ao Inventário
      await tx.userItem.create({
        data: {
          userId,
          cosmeticId
        }
      });

      // C: Gerar Extrato (Transaction)
      await tx.transaction.create({
        data: {
          userId,
          type: 'PURCHASE', // Deve bater com o Enum do schema.prisma
          amount: -item.priceVbucks, // Valor negativo pois saiu dinheiro
          itemId: item.id,
          description: `Compra de ${item.name}`
        }
      });

      return { 
        success: true, 
        message: `Compra realizada com sucesso! Agora você tem ${item.name}.`,
        newItemName: item.name,
        remainingBalance: user.vbucksBalance - item.priceVbucks
      };
    });
  }

  /**
   * DEVOLVER ITEM (Refund)
   * 1. Verifica posse
   * 2. Remove do inventário
   * 3. Devolve dinheiro
   */
  async refundItem(userId: string, cosmeticId: string) {
    return await prisma.$transaction(async (tx) => {
      
      // 1. Verificar se o usuário realmente tem o item e pegar o preço dele
      const inventoryItem = await tx.userItem.findUnique({
        where: { userId_cosmeticId: { userId, cosmeticId } },
        include: { cosmetic: true } // Já traz os dados do item junto
      });

      if (!inventoryItem) throw new Error("Você não possui este item para devolver.");

      const refundAmount = inventoryItem.cosmetic.priceVbucks;

      // 2. Remover do inventário
      await tx.userItem.delete({
        where: { userId_cosmeticId: { userId, cosmeticId } }
      });

      // 3. Reembolsar usuário
      await tx.user.update({
        where: { id: userId },
        data: { vbucksBalance: { increment: refundAmount } }
      });

      // 4. Registrar no Extrato
      await tx.transaction.create({
        data: {
          userId,
          type: 'REFUND',
          amount: refundAmount, // Valor positivo pois entrou dinheiro
          itemId: cosmeticId,
          description: `Devolução de ${inventoryItem.cosmetic.name}`
        }
      });

      return { 
        success: true, 
        message: `Item devolvido. ${refundAmount} V-Bucks creditados na conta.`,
        refundedAmount: refundAmount 
      };
    });
  }
}