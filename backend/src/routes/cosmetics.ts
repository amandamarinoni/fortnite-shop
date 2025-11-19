import { Router } from 'express';
import { prisma } from '../prisma';
const router = Router();

router.get('/', async (req, res) => {
  const { q, type, rarity, page = '1', limit = '20', isNew, isOnShop } = req.query;
  const pageNum = parseInt(page as string, 10) || 1;
  const take = Math.min(parseInt(limit as string, 10) || 20, 100);
  const where: any = {};
  if (q) where.name = { contains: q as string, mode: 'insensitive' };
  if (type) where.type = type;
  if (rarity) where.rarity = rarity;
  if (isNew === 'true') where.isNew = true;
  if (isOnShop === 'true') where.isOnShop = true;

  const items = await prisma.cosmetic.findMany({
    where,
    skip: (pageNum - 1) * take,
    take
  });
  res.json({ items, page: pageNum });
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const item = await prisma.cosmetic.findUnique({ where: { id }});
  if (!item) return res.status(404).send({ error: 'not found' });
  res.json(item);
});

export default router;
