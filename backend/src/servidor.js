// Arquivo: backend/src/servidor.js (VERSÃO FINAL COM CORS DINÂMICO)
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

// --- Configuração de CORS Robusta ---
// Lista de origens permitidas
const whitelist = [
    process.env.FRONTEND_URL, // Sua URL de produção: https://cookflow-project.vercel.app
    process.env.FRONTEND_URL_LOCAL // Sua URL local: http://localhost:5173
];

// Adiciona dinamicamente a URL de preview da Vercel à whitelist, se existir
if (process.env.VERCEL_URL) {
    whitelist.push(`https-/${process.env.VERCEL_URL}`);
}

const corsOptions = {
    origin: function (origin, callback) {
        // Permite requisições se a origem estiver na whitelist (ou se não houver origem, como em testes de API)
        if (whitelist.indexOf(origin) !== -1 || !origin) {
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