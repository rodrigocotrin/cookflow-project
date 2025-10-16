// Arquivo: backend/src/config/bd.js (VERSÃO FINAL E CORRIGIDA)
const { Pool } = require('pg');

// Em ambientes de produção como a Vercel, as variáveis de ambiente são injetadas diretamente.
// Não é necessário chamar require('dotenv').config() aqui.

// Verifica se a variável de ambiente de conexão, fornecida pela Vercel/Neon, existe.
if (!process.env.POSTGRES_URL) {
    throw new Error("ERRO CRÍTICO: A variável de ambiente POSTGRES_URL não foi encontrada. Verifique as configurações do projeto na Vercel.");
}

const pool = new Pool({
    // Usa a string de conexão completa fornecida pela Vercel.
    // Ela já contém usuário, senha, host, porta e nome do banco.
    connectionString: process.env.POSTGRES_URL,
    
    // Esta configuração é essencial para que a conexão SSL com o Neon funcione.
    ssl: {
        rejectUnauthorized: false
    }
});

module.exports = {
    query: (text, params) => pool.query(text, params),
};