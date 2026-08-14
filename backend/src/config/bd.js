// Arquivo: backend/src/config/bd.js
const { Pool } = require('pg');

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

let pool;

// Suporta todas as convenções de variáveis de conexão da Vercel / Neon / Supabase
const urlConexaoProducao = 
    process.env.POSTGRES_URL || 
    process.env.DATABASE_URL || 
    process.env.POSTGRES_PRISMA_URL || 
    process.env.POSTGRES_URL_NON_POOLING;

if (urlConexaoProducao) {
    console.log("A conectar à base de dados de PRODUÇÃO (Neon/Vercel)...");
    pool = new Pool({
        connectionString: urlConexaoProducao,
        ssl: {
            rejectUnauthorized: false
        },
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000
    });
} else {
    console.log("A conectar à base de dados LOCAL...");
    pool = new Pool({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE || 'cookflow_db'
    });
}

pool.on('error', (err) => {
    console.error('Erro inesperado no pool de banco de dados:', err);
});

module.exports = {
    query: (text, params) => pool.query(text, params),
    pool: pool 
};