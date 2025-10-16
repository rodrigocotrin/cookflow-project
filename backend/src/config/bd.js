// Arquivo: backend/src/config/bd.js

const { Pool } = require('pg');
require('dotenv').config();

// Verifica se a variável de ambiente principal está definida
if (!process.env.DATABASE_URL) {
    throw new Error("FATAL: A variável de ambiente DATABASE_URL não está definida no ambiente de produção.");
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // ESTA É A LINHA QUE RESOLVE O PROBLEMA
    // Ela força o Node.js a usar uma conexão SSL, exigida pelo Neon.tech
    ssl: {
        rejectUnauthorized: false
    }
});

module.exports = {
    query: (text, params) => pool.query(text, params),
};