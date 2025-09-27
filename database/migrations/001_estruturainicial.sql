-- CookFlow - Scripts DDL para PostgreSQL (Versão em Português)
-- Migration 001: Cria a estrutura inicial completa do banco de dados.

-- Garante um ambiente limpo, deletando as tabelas se já existirem (em ordem reversa de criação).
DROP TABLE IF EXISTS comentarios;
DROP TABLE IF EXISTS avaliacoes;
DROP TABLE IF EXISTS favoritos;
DROP TABLE IF EXISTS receitas_ingredientes;
DROP TABLE IF EXISTS ingredientes;
DROP TABLE IF EXISTS receitas;
DROP TABLE IF EXISTS categorias;
DROP TABLE IF EXISTS usuarios;

-- Tabela de usuários: Armazena informações de login e perfil.
CREATE TABLE usuarios (
    id_usuario SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de categorias: Agrupa as receitas por tipo.
CREATE TABLE categorias (
    id_categoria SERIAL PRIMARY KEY,
    nome VARCHAR(50) UNIQUE NOT NULL
);

-- Tabela de receitas: Contém todos os detalhes de uma receita.
CREATE TABLE receitas (
    id_receita SERIAL PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_categoria INT NOT NULL,
    titulo VARCHAR(150) NOT NULL,
    descricao TEXT,
    url_imagem VARCHAR(255),
    tempo_preparo_minutos INT NOT NULL,
    dificuldade VARCHAR(20) NOT NULL CHECK (dificuldade IN ('Fácil', 'Médio', 'Difícil')),
    instrucoes TEXT NOT NULL,
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_categoria) REFERENCES categorias(id_categoria) ON DELETE RESTRICT
);

-- Tabela de ingredientes: Lista de todos os ingredientes possíveis.
CREATE TABLE ingredientes (
    id_ingrediente SERIAL PRIMARY KEY,
    nome VARCHAR(100) UNIQUE NOT NULL
);

-- Tabela associativa receitas_ingredientes: Conecta receitas a ingredientes, com quantidade e medida.
CREATE TABLE receitas_ingredientes (
    id_receita INT NOT NULL,
    id_ingrediente INT NOT NULL,
    quantidade DECIMAL(10, 2) NOT NULL,
    unidade_medida VARCHAR(50) NOT NULL,
    PRIMARY KEY (id_receita, id_ingrediente),
    FOREIGN KEY (id_receita) REFERENCES receitas(id_receita) ON DELETE CASCADE,
    FOREIGN KEY (id_ingrediente) REFERENCES ingredientes(id_ingrediente) ON DELETE RESTRICT
);

-- Tabela de favoritos: Registra quais usuários favoritaram quais receitas.
CREATE TABLE favoritos (
    id_usuario INT NOT NULL,
    id_receita INT NOT NULL,
    PRIMARY KEY (id_usuario, id_receita),
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_receita) REFERENCES receitas(id_receita) ON DELETE CASCADE
);

-- Tabela de avaliações: Armazena as notas (1 a 5 estrelas) dadas pelos usuários.
CREATE TABLE avaliacoes (
    id_avaliacao SERIAL PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_receita INT NOT NULL,
    nota DECIMAL(2, 1) NOT NULL CHECK (nota BETWEEN 1.0 AND 5.0), -- ALTERADO AQUI
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (id_usuario, id_receita),
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_receita) REFERENCES receitas(id_receita) ON DELETE CASCADE
);

-- Tabela de comentários: Armazena os comentários textuais dos usuários nas receitas.
CREATE TABLE comentarios (
    id_comentario SERIAL PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_receita INT NOT NULL,
    conteudo TEXT NOT NULL,
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_receita) REFERENCES receitas(id_receita) ON DELETE CASCADE
);

--- MASSA DE DADOS DE TESTE ---
INSERT INTO usuarios (nome, email, senha_hash) VALUES
('Rodrigo Cotrin', 'rodrigo.cotrin@email.com', '$2b$10$exemploDeHashParaRodrigo'),
('Randu Costa', 'randu.costa@email.com', '$2b$10$exemploDeHashParaRandu');
INSERT INTO categorias (nome) VALUES ('Sobremesa'), ('Prato Principal'), ('Lanche'), ('Vegano');
INSERT INTO ingredientes (nome) VALUES ('Farinha de Trigo'), ('Açúcar'), ('Ovo'), ('Leite'), ('Chocolate em Pó'), ('Manteiga'), ('Peito de Frango'), ('Arroz'), ('Feijão'), ('Cebola'), ('Alho');
INSERT INTO receitas (id_usuario, id_categoria, titulo, descricao, tempo_preparo_minutos, dificuldade, instrucoes) VALUES
(1, 1, 'Bolo de Chocolate Fofinho', 'Um bolo de chocolate clássico, perfeito para o café da tarde.', 60, 'Fácil', '1. Misture os ingredientes secos. 2. Adicione os líquidos. 3. Asse por 40 minutos em forno pré-aquecido a 180°C.'),
(2, 2, 'Frango Grelhado com Legumes', 'Uma opção saudável e rápida para o almoço ou jantar.', 30, 'Fácil', '1. Tempere o frango. 2. Grelhe em uma frigadeira quente. 3. Sirva com legumes.');
INSERT INTO receitas_ingredientes (id_receita, id_ingrediente, quantidade, unidade_medida) VALUES
(1, 1, 300, 'g'), (1, 2, 200, 'g'), (1, 3, 3, 'unidade(s)'), (1, 4, 240, 'ml'), (1, 5, 50, 'g'), (1, 6, 100, 'g'),
(2, 7, 500, 'g'), (2, 10, 1, 'unidade(s)'), (2, 11, 2, 'dente(s)');
INSERT INTO favoritos (id_usuario, id_receita) VALUES (1, 2);
INSERT INTO avaliacoes (id_usuario, id_receita, nota) VALUES (2, 1, 5);
INSERT INTO comentarios (id_usuario, id_receita, conteudo) VALUES (2, 1, 'Fiz e ficou incrível! Recomendo muito.');

select * from usuarios

SELECT * FROM receitas WHERE titulo LIKE '%Bolo de Cenoura%';
-- Você deve ver sua nova receita na tabela.

SELECT * FROM receitas_ingredientes WHERE id_receita = (SELECT id_receita FROM receitas WHERE titulo LIKE '%Bolo de Cenoura%');
-- Você deve ver todos os 7 ingredientes associados à sua nova receita.

SELECT * FROM receitas WHERE id_receita = 3;

select * from favoritos

INSERT INTO receitas_ingredientes (id_receita, id_ingrediente, quantidade, unidade_medida) VALUES (2, 3, 1, 'unidade(s)');