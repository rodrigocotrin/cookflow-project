// Arquivo: backend/src/servidor.js (VERSÃO DEFINITIVA COM CORS CORRIGIDO)
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

// --- Configuração de CORS Definitiva ---
// Lista de origens estáticas permitidas (produção e local)
const whitelist = [
    process.env.FRONTEND_URL, // Sua URL de produção
    process.env.FRONTEND_URL_LOCAL // Sua URL local de desenvolvimento
];

const corsOptions = {
    origin: function (origin, callback) {
        // A Vercel adiciona a variável de ambiente VERCEL_URL para deploys de preview.
        // Construímos a URL completa do preview do frontend a partir dela.
        const previewUrl = process.env.VERCEL_URL && `https://cookflow-project-${process.env.VERCEL_GIT_COMMIT_SHA.substring(0, 8)}-${process.env.VERCEL_GIT_REPO_SLUG}.vercel.app`;

        // Permite a origem se ela estiver na nossa lista, se for a URL de preview, ou se não houver origem (testes de API)
        if (whitelist.indexOf(origin) !== -1 || origin === previewUrl || !origin) {
            callback(null, true);
        } else {
            // Se a origem não for permitida, rejeita a requisição.
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