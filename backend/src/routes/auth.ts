import { Router } from 'express';
import { prisma } from '../prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const router = Router();

router.post('/register', async (req, res) => {
  const { email, password, displayName } = req.body;
  if (!email || !password) return res.status(400).send({ error: 'missing' });
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(409).send({ error: 'user exists' });
  const hash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: { email, passwordHash: hash, displayName }});
  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'dev', { expiresIn: '7d' });
  res.json({ token, user: { id: user.id, email: user.email, vbucksBalance: user.vbucksBalance }});
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email }});
  if (!user) return res.status(401).send({ error: 'invalid' });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).send({ error: 'invalid' });
  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'dev', { expiresIn: '7d' });
  res.json({ token, user: { id: user.id, email: user.email, vbucksBalance: user.vbucksBalance }});
});

export default router;
