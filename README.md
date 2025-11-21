👾 Fortnite Shop - Desafio Técnico Full Stack

Este projeto implementa uma loja virtual para cosméticos do Fortnite, atendendo a todos os requisitos do desafio técnico: Full Stack (Front/Back/DB), Sincronização de API Externa e Regras de Negócio complexas (transações, estorno).

🚀 Como Rodar o Projeto (Docker Compose)

O projeto foi empacotado com Docker para garantir a execução imediata em qualquer ambiente, conforme solicitado.

Pré-requisitos

Docker & Docker Compose: Devem estar instalados e rodando.

Variável de Ambiente: Você precisa criar o arquivo .env na pasta backend/.

Arquivo backend/.env (Conteúdo)

O Backend está configurado para se conectar a um container PostgreSQL interno.

PORT=4002
# A URL CRÍTICA para a conexão interna do Docker:
DATABASE_URL="postgresql://postgres:admin@db:5432/fortnite_app?schema=public"


Inicialização

Na raiz do projeto (onde está o docker-compose.yml), execute o comando para construir e subir todos os serviços:

docker-compose up --build -d


Acesso

Serviço

Porta

Status

Link de Acesso

Frontend (Site)

5173

OK

http://localhost:5173

Backend (API)

4002

OK

http://localhost:4002/health

Banco (Postgres)

5432

Apenas Docker

-

🛠️ Decisões Técnicas e Arquitetura

O projeto foi construído sobre uma arquitetura limpa (Separation of Concerns: Controllers, Services e Repositório implícito no Prisma) para garantir a testabilidade e manutenção.

1. Modelagem e Integridade Financeira

Esquema de Banco de Dados: Utilizamos PostgreSQL/Prisma com ênfase na atomicidade das transações.

Tabelas Chave:

User: Armazena o saldo (vbucksBalance) e credenciais (senha com bcrypt).

UserItem: Representa o Inventário (o que o usuário possui), garantindo que cada item só possa ser comprado uma vez (@@unique([userId, cosmeticId])).

Transaction: Funciona como um Extrato Imutável, registrando bônus, compras (PURCHASE) e devoluções (REFUND) com valores positivos/negativos.

Transações Atômicas: A lógica de compra (ShopService.purchaseItem) usa prisma.$transaction, garantindo que o débito do V-Bucks, a adição do item ao UserItem e o registro no Transaction ocorram como uma única operação de sucesso ou falha (rollback).

2. Sincronização e Desacoplamento da API Externa

Requisito: Manter a loja sincronizada.

Solução: O SyncService bate na API do Fortnite (/cosmetics/new) e salva os dados na tabela local Cosmetic.

Vantagem: O Frontend sempre consulta a sua API (/shop), que é rápida e não depende da latência da API externa. A sincronização simula um Cron Job que rodaria em intervalos regulares.

3. Solução de Deploy (Cloud)

O projeto é 100% compatível com provedores que oferecem PostgreSQL Serverless (Ex: Neon ou Railway).

Para Produção: O docker-compose.yml e o Dockerfile do Backend já rodam o comando npx prisma migrate deploy no início. Isso garante que as tabelas sejam criadas automaticamente em qualquer serviço de hospedagem que use o PostgreSQL.

📦 Tecnologias

Backend: Node.js, Express, TypeScript

Database: PostgreSQL (via Prisma ORM)

Frontend: React (Vite), TypeScript, Tailwind CSS

DevOps: Docker e Docker Compose
