# Biblioteca Élfica — API

API REST em **Node.js + Express** que alimenta o app [Biblioteca Élfica](https://github.com/Haimcer/biblioteca-elfica): livros, escritores, categorias, curtidas, comentários, seguidores e biblioteca do usuário.

## Stack

Node.js · Express · PostgreSQL (Knex) · Firebase Admin (validação de token) · AWS S3 (upload de arquivos) · Multer

## Rotas principais

| Rota | O que faz |
|---|---|
| `/usuarios` | perfil do usuário |
| `/escritores` | cadastro e perfil de escritor |
| `/livros` | CRUD de livros, capa e arquivo |
| `/categorias` | categorias do catálogo |
| `/curtidas`, `/curtida-perfil` | curtidas em livros e perfis |
| `/comentarios` | comentários |
| `/seguidores` | seguir escritores |
| `/biblioteca` | biblioteca pessoal |

As rotas protegidas exigem o token do Firebase no header `Authorization: Bearer <token>`.

## Como rodar

```bash
npm install
cp .env.example .env   # preencha banco, AWS e o caminho da conta de serviço do Firebase
npm run dev
```

O esquema do banco está em `src/schema.sql`.

## Estrutura

```txt
src/
 ├─ routes/        definição das rotas
 ├─ controllers/   regras de cada recurso
 ├─ models/        acesso ao banco (Knex)
 ├─ middleware/    autenticação Firebase e upload
 ├─ utils/         upload para S3
 └─ db/            conexão PostgreSQL
```

---

Desenvolvido por [Allan Ribeiro](https://github.com/Haimcer)
