import { Request, Response } from 'express';
import { prisma } from '../prisma';
import bcrypt from 'bcryptjs';
import { TransactionType } from '@prisma/client';

export class UserController {
  
  // MÉTODO DE CADASTRO (REGISTER)
  async register(req: Request, res: Response) {
    const { email, password, displayName } = req.body;

    // 1. Validação básica
    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
    }

    try {
      // 2. Verifica se já existe
      const userExists = await prisma.user.findUnique({ where: { email } });
      if (userExists) {
        return res.status(400).json({ error: 'Usuário já cadastrado.' });
      }

      // 3. Criptografa a senha
      const passwordHash = await bcrypt.hash(password, 8);

      // 4. Transação no Banco (Usuário + Bônus)
      const result = await prisma.$transaction(async (tx) => {
        
        // Cria o usuário
        const newUser = await tx.user.create({
          data: {
            email,
            passwordHash,
            displayName,
            vbucksBalance: 10000 // Saldo inicial
          }
        });

        // Cria o registro no histórico
        await tx.transaction.create({
          data: {
            userId: newUser.id,
            type: TransactionType.INITIAL_BONUS, // Usa o Enum correto
            amount: 10000,
            description: 'Bônus Inicial'
          }
        });

        return newUser;
      });

      // 5. Retorna sucesso
      return res.status(201).json({
        id: result.id,
        email: result.email,
        balance: result.vbucksBalance,
        message: 'Usuário criado com sucesso'
      });

    } catch (error: any) {
      console.error("Erro no cadastro:", error); 
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // MÉTODO DE LOGIN
  async login(req: Request, res: Response) {
    const { email, password } = req.body;

    try {
      // 1. Busca usuário
      const user = await prisma.user.findUnique({ where: { email } });

      if (!user) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }

      // 2. Compara senha
      const passwordMatch = await bcrypt.compare(password, user.passwordHash);

      if (!passwordMatch) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }

      // 3. Retorna dados (Token Fake)
      return res.json({
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        balance: user.vbucksBalance,
        token: 'fake-jwt-token-123456'
      });

    } catch (error) {
      console.error("Erro no login:", error);
      return res.status(500).json({ error: 'Erro no login' });
    }
  }
}