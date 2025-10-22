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
    process.env.FRONTEND_URL,       // (ex: 'https://cookflow.rodrigocotrin.com')
    process.env.FRONTEND_URL_LOCAL  // (ex: 'http://localhost:5173')
];

const corsOptions = {
    origin: (origin, callback) => {
        // Padrão 1: Aceita domínios de preview/produção antigos da Vercel
        const vercelPattern = /^https:\/\/cookflow-project(-[a-z0-9-]+)?\.vercel\.app$/;

        // --- ESTA É A NOVA LINHA ---
        // Padrão 2: Aceita SEU domínio de produção (ex: cookflow.rodrigocotrin.com)
        const productionPattern = /^https://cookflow\.rodrigocotrin\.com$/;
        
        // Permite a requisição se a origem:
        // 1. Estiver na whitelist estática (variáveis de ambiente).
        // 2. Corresponder ao padrão antigo da Vercel.
        // 3. Corresponder ao SEU NOVO PADRÃO DE PRODUÇÃO.
        // 4. Não tiver origem (ex: Postman, Insomnia).
        if (
            whitelist.includes(origin) || 
            vercelPattern.test(origin) ||
            productionPattern.test(origin) ||  // <<< ADIÇÃO DA NOVA REGRA
            !origin
        ) {
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
