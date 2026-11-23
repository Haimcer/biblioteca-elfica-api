-- SCHEMA ATUALIZADO DO SISTEMA

-- Usuários autenticados via Firebase
CREATE TABLE usuarios (
    id TEXT PRIMARY KEY,
    nome_usuario TEXT NOT NULL,
    email TEXT NOT NULL,
    foto TEXT,
    is_writer BOOLEAN DEFAULT false,
    stripe_account_id TEXT,
    bio TEXT,
    site_pessoal TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Escritores (perfil profissional)
CREATE TABLE escritores (
    id SERIAL PRIMARY KEY,
    usuario_id TEXT REFERENCES usuarios(id) ON DELETE CASCADE,
    nome_completo TEXT NOT NULL,
    data_nascimento DATE NOT NULL,
    cpf TEXT NOT NULL,
    telefone TEXT,
    endereco_linha1 TEXT,
    endereco_linha2 TEXT,
    cidade TEXT,
    estado TEXT,
    cep TEXT,
    pais TEXT,
    conta_bancaria TEXT,
    stripe_account_id TEXT,
    foto TEXT,
    is_anonimo BOOLEAN DEFAULT false,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP
);

-- Categorias dos livros
CREATE TABLE categorias (
    id SERIAL PRIMARY KEY,
    nome TEXT NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Livros
CREATE TABLE livros (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    description TEXT,
    cover_url TEXT,
    download_url TEXT,
    is_premium BOOLEAN DEFAULT false,
    is_free BOOLEAN DEFAULT true,
    price INTEGER,
    category_id INTEGER REFERENCES categorias(id) ON DELETE SET NULL,
    usuario_id TEXT REFERENCES usuarios(id) ON DELETE SET NULL,
    transcricao TEXT,
    regiao TEXT,
    idioma TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Curtidas em livros
CREATE TABLE curtidas (
    id SERIAL PRIMARY KEY,
    usuario_id TEXT REFERENCES usuarios(id) ON DELETE CASCADE,
    livro_id INTEGER REFERENCES livros(id) ON DELETE CASCADE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (usuario_id, livro_id)
);

-- Comentários nos livros
CREATE TABLE comentarios (
    id SERIAL PRIMARY KEY,
    usuario_id TEXT REFERENCES usuarios(id) ON DELETE CASCADE,
    livro_id INTEGER REFERENCES livros(id) ON DELETE CASCADE,
    mensagem TEXT NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seguidores de perfis (usuários e escritores)
CREATE TABLE seguidores (
    id SERIAL PRIMARY KEY,
    usuario_id TEXT REFERENCES usuarios(id) ON DELETE CASCADE,
    seguindo_id TEXT REFERENCES usuarios(id) ON DELETE CASCADE,
    tipo TEXT NOT NULL CHECK (tipo IN ('usuario', 'escritor')),
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (usuario_id, seguindo_id, tipo)
);

-- Curtidas em perfis (usuários e escritores)
CREATE TABLE curtida_perfis (
    id SERIAL PRIMARY KEY,
    usuario_id TEXT REFERENCES usuarios(id) ON DELETE CASCADE,
    curtido_id TEXT REFERENCES usuarios(id) ON DELETE CASCADE,
    tipo_curtido TEXT NOT NULL CHECK (tipo_curtido IN ('usuario', 'escritor')),
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (usuario_id, curtido_id, tipo_curtido)
);

-- Biblioteca do usuário (livros comprados ou salvos)
CREATE TABLE biblioteca (
    id SERIAL PRIMARY KEY,
    usuario_id TEXT REFERENCES usuarios(id) ON DELETE CASCADE,
    livro_id INTEGER REFERENCES livros(id) ON DELETE CASCADE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (usuario_id, livro_id)
);
