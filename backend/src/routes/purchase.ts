import { Router } from 'express';
import { prisma } from '../prisma';
import jwt from 'jsonwebtoken';

const router = Router();

function authMiddleware(req: any, res: any, next: any) {
  const auth = req.headers.authorization?.split(' ')[1];
  if (!auth) return res.status(401).send({ error: 'no token' });
  try {
    const payload: any = jwt.verify(auth, process.env.JWT_SECRET || 'dev');
    req.userId = payload.userId;
    next();
  } catch (e) {
    return res.status(401).send({ error: 'invalid token' });
  }
}

router.post('/', authMiddleware, async (req: any, res) => {
  const { cosmeticId } = req.body;
  const userId = req.userId;
  if (!cosmeticId) return res.status(400).send({ error: 'missing cosmeticId' });

  // transaction
  try {
    const result = await prisma.$transaction(async (prismaTx) => {
      const user = await prismaTx.user.findUnique({ where: { id: userId }});
      if (!user) throw new Error('user not found');
      const cosmetic = await prismaTx.cosmetic.findUnique({ where: { id: cosmeticId }});
      if (!cosmetic) throw new Error('cosmetic not found');
      const already = await prismaTx.purchase.findFirst({ where: { userId, cosmeticId, status: 'completed' }});
      if (already) throw new Error('already owned');
      if (user.vbucksBalance < cosmetic.priceVbucks) throw new Error('insufficient');

      // deduct balance and create purchase
      await prismaTx.user.update({ where: { id: userId }, data: { vbucksBalance: user.vbucksBalance - cosmetic.priceVbucks }});
      const purchase = await prismaTx.purchase.create({
        data: {
          userId,
          cosmeticId,
          amount: cosmetic.priceVbucks,
          status: 'completed'
        }
      });
      return purchase;
    });
    res.json(result);
  } catch (err: any) {
    res.status(400).send({ error: err.message });
  }
});

router.post('/refund', authMiddleware, async (req: any, res) => {
  const { purchaseId } = req.body;
  const userId = req.userId;
  try {
    await prisma.$transaction(async (prismaTx) => {
      const purchase = await prismaTx.purchase.findUnique({ where: { id: purchaseId }});
      if (!purchase || purchase.userId !== userId) throw new Error('not found');
      if (purchase.status !== 'completed') throw new Error('already refunded');

      // refund
      await prismaTx.user.update({ where: { id: userId }, data: { vbucksBalance: { increment: purchase.amount } }});
      await prismaTx.purchase.update({ where: { id: purchaseId }, data: { status: 'refunded' }});
    });
    res.json({ ok: true });
  } catch (err: any) {
    res.status(400).send({ error: err.message });
  }
});

export default router;
