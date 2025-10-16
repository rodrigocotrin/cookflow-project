// Arquivo: backend/src/config/bd.js (ESTE ARQUIVO JÁ ESTÁ CORRETO)

const { Pool } = require('pg');
require('dotenv').config();

// Verifica se a variável de ambiente principal está definida.
// A Vercel usa 'POSTGRES_URL' por padrão na integração com Neon, mas 'DATABASE_URL' também funciona se configurado manualmente.
if (!process.env.DATABASE_URL && !process.env.POSTGRES_URL) {
    throw new Error("FATAL: Nenhuma variável de ambiente de conexão com o banco de dados (DATABASE_URL ou POSTGRES_URL) foi definida.");
}

const pool = new Pool({
    // Usa a variável de ambiente da Vercel/Neon ou a sua variável local.
    connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
    // Esta configuração é essencial para que a conexão SSL com o Neon funcione no ambiente serverless.
    ssl: {
        rejectUnauthorized: false
    }
});

module.exports = {
    query: (text, params) => pool.query(text, params),
};