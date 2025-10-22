// Arquivo: backend/src/servidor.js (VERSÃO COM CORREÇÃO DEFINITIVA DE CORS)
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
    'https://cookflow.rodrigocotrin.com',
    process.env.FRONTEND_URL,       // Sua URL de produção (ex: 'https://cookflow-project.vercel.app')
    process.env.FRONTEND_URL_LOCAL  // Sua URL local (ex: 'http://localhost:5173')
];

const corsOptions = {
    origin: (origin, callback) => {
        // Expressão Regular para validar as URLs de preview da Vercel para este projeto.
        // Aceita 'https://cookflow-project.vercel.app' e 'https://cookflow-project-QUALQUERCOISA.vercel.app'
        const vercelPattern = /^https:\/\/cookflow-project(-[a-z0-9-]+)?\.vercel\.app$/;

        // Permite a requisição se a origem:
        // 1. Estiver na whitelist estática (produção, local).
        // 2. Corresponder ao padrão de preview/produção da Vercel.
        // 3. Não tiver origem (ex: Postman, Insomnia).
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
