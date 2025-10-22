// Arquivo: backend/src/servidor.js (VERSÃO FINAL CORRIGIDA)
const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Importações das rotas
const usuarioRotas = require('./rotas/usuarioRotas');
const receitaRotas = require('./rotas/receitaRotas');
const perfilRotas = require('./rotas/perfilRotas');
const interacaoRotas = require('./rotas/interacaoRotas');
const listaComprasRotas = require('./rotas/listaComprasRotas');

const app = express();

// --- Configuração de CORS Definitiva e Robusta ---
const whitelist = [
    'https://cookflow.rodrigocotrin.com',  // Adição manual do seu domínio de produção
    process.env.FRONTEND_URL,             // Mantém a var de env (caso precise)
    process.env.FRONTEND_URL_LOCAL        // Mantém o local (ex: 'http://localhost:5173')
];

const corsOptions = {
    origin: (origin, callback) => {
        // Padrão antigo da Vercel (mantemos, não quebra)
        const vercelPattern = /^https:\/\/cookflow-project(-[a-z0-9-]+)?\.vercel\.app$/;

        // A lógica de verificação:
        // 1. O 'origin' (https://cookflow.rodrigocotrin.com) vai passar no 'whitelist.includes(origin)'
        // 2. Não vai mais dar erro de CORS
        if (whitelist.includes(origin) || vercelPattern.test(origin) || !origin) {
            callback(null, true);
        } else {
            callback(new Error('Acesso não permitido pela política de CORS'));
        }
    },
    optionsSuccessStatus: 200
};

// --- Middlewares Globais ---
app.use(cors(corsOptions));
app.use(express.json());


// --- Rotas Públicas de Verificação de Saúde ---
app.get('/', (requisicao, resposta) => {
    resposta.json({
        status: 'online',
        mensagem: 'Bem-vindo à API do CookFlow!',
    });
});

app.get('/api', (requisicao, resposta) => {
    resposta.json({ mensagem: 'API do CookFlow está funcionando corretamente!' });
});

// --- Registro das Rotas da Aplicação ---
app.use('/api', usuarioRotas);
app.use('/api', receitaRotas);
app.use('/api', perfilRotas);
app.use('/api', interacaoRotas);
app.use('/api/lista-de-compras', listaComprasRotas);

// Exporta a instância do app para a Vercel
module.exports = app;
