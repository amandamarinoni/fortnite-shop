## 👾 Fortnite Shop - Desafio Técnico Full Stack

## 🛒 Visão Geral e Objetivo

Este projeto ("Fortnite Shop") é uma aplicação web full-stack que demonstra a sua capacidade de construir um sistema transacional, modular e integrado.

Objetivo: Permitir que usuários explorem cosméticos do jogo Fortnite, façam compras usando v-bucks, vejam perfis públicos e históricos de transações.

## 🎯 Funcionalidades Principais Implementadas

Autenticação Segura: Cadastro de usuário com e-mail e senha (bcrypt hash). O usuário recebe 10.000 v-bucks de crédito inicial (registrado como transação).

Loja e Filtros: Visualização de cosméticos com filtros (nome, tipo, raridade). Sinalização de itens como “novo”, “à venda” e “já adquirido”.

Transações Atômicas: Usuário autenticado pode comprar cosméticos. A lógica é encapsulada em uma transação de banco de dados (prisma.$transaction) para garantir a integridade.

Devolução e Estorno: Devolução de cosmético a qualquer momento, recebendo de volta os créditos.

Histórico Imutável: Exibição do histórico completo de compras e devoluções (tabela Transaction).

Sincronização Periódica: Integração com API externa do Fortnite para listagem e sincronização de dados (itens novos e à venda).

## 🧱 Stack de Tecnologias

| Camada | Tecnologia | Uso no Projeto |
| :--- | :--- | :--- |
| **Frontend** | React + Vite + TypeScript | Interface de usuário moderna e responsiva. |
| **Estilo** | Tailwind CSS | Estilização rápida e mobile-first. |
| **Backend** | Node.js + TypeScript + Express | Servidor de API RESTful. |
| **Banco de Dados**| PostgreSQL | Persistência de dados transacionais (via Docker/Railway). |
| **ORM** | Prisma | Mapeamento e Migrações de DB. |
| **Infraestrutura**| Docker + `docker-compose` | Empacotamento e execução facilitada. |
| **Testes** | Jest + Supertest (Setup pronto) | Testes unitários para a lógica de negócio (Ex: `ShopService`). |

🔧 Como Rodar o Projeto Localmente

O projeto é executado com um único comando Docker para replicar o ambiente de produção.

Certifique-se de ter instalado: Docker e Docker Compose.

## 1. Configuração

Clone o repositório e entre na pasta raiz:
| Git clone | cd fortnite-shop |
| :--- | :--- |
| [https://github.com/amandamarinoni/fortnite-shop.git] |(https://github.com/amandamarinoni/fortnite-shop.git) |

Crie o arquivo .env na pasta backend/ com a URL de conexão do Docker:
| PORT=4002 |
| --- |
| DATABASE_URL="postgresql://postgres:admin@db:5432/fortnite_app?schema=public" |

## 2. Inicialização

Na raiz do projeto (onde está o docker-compose.yml), execute o comando para construir e subir todos os serviços:

docker-compose up --build -d

(Aguarde o processo de construção e inicialização dos três containers.)

## 3. Acesso e Teste

Frontend (Site): Acesse http://localhost:5173

Backend (API Health Check): Acesse http://localhost:4002/health

💡 Decisões de Arquitetura

1. Integridade Financeira (Transações Atômicas)

A função de compra (ShopService.purchaseItem) usa prisma.$transaction. Isso garante a atomicidade: Débito, entrega do item e registro do histórico ocorrem em conjunto ou são desfeitos (rollback).

2. Sincronização Desacoplada

O SyncService interno da API é o responsável por buscar os dados do Fortnite e atualizar o cache local (Cosmetic), garantindo que a listagem da loja no Front seja rápida e não dependa da latência da API externa.
