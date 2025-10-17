// Arquivo: backend/src/config/bd.js (VERSÃO CORRIGIDA E DEFINITIVA)
const { Pool } = require('pg');

// Carrega as variáveis de ambiente do arquivo .env apenas em ambiente de desenvolvimento
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

let pool;

// LÓGICA DE AMBIENTE: Verifica se está em produção (Vercel)
if (process.env.POSTGRES_URL) {
    console.log("A conectar à base de dados de PRODUÇÃO (Vercel/Neon)...");
    pool = new Pool({
        connectionString: process.env.POSTGRES_URL,
        ssl: {
            rejectUnauthorized: false
        }
    });
} else {
    // Se não estiver em produção, usa as credenciais locais do arquivo .env
    console.log("A conectar à base de dados LOCAL...");
    pool = new Pool({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE
    });
}

/**
 * Exporta um objeto que suporta ambos os padrões de uso:
 * 1. db.query(): Para executar queries simples e diretas.
 * 2. db.pool: Para ter acesso ao pool completo e gerenciar transações
 * manualmente com .connect(), .release(), BEGIN, COMMIT, ROLLBACK.
 */
module.exports = {
    query: (text, params) => pool.query(text, params),
    pool: pool 
};