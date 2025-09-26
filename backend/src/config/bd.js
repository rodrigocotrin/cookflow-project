// Arquivo: backend/src/configuracao/bancoDeDados.js

// Carrega a biblioteca 'pg' para interagir com o PostgreSQL
const { Pool } = require('pg');

// Carrega as variáveis de ambiente do arquivo .env
require('dotenv').config();

// Cria um "pool" de conexões com o banco de dados
// O pool gerencia múltiplas conexões de forma eficiente
const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
});

// Exporta um objeto com um método 'query' que usa o pool
module.exports = {
    query: (text, params) => pool.query(text, params),
};