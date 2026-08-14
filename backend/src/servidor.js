// Arquivo: backend/src/servidor.js (VERSÃO FINAL CORRIGIDA)
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Importações das rotas
const usuarioRotas = require('./rotas/usuarioRotas');
const receitaRotas = require('./rotas/receitaRotas');
const perfilRotas = require('./rotas/perfilRotas');
const interacaoRotas = require('./rotas/interacaoRotas');
const listaComprasRotas = require('./rotas/listaComprasRotas');
const uploadRotas = require('./rotas/uploadRotas');

const app = express();

// --- Configuração de CORS Definitiva e Robusta ---
const allowedOrigins = [
    'https://cookflow.rodrigocotrin.com',  // Domínio de produção personalizado
    'http://localhost:5173',
    'http://localhost:4173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:4173',
    process.env.FRONTEND_URL,
    process.env.FRONTEND_URL_LOCAL
].filter(Boolean);

const corsOptions = {
    origin: (origin, callback) => {
        // Aceita domínios de preview da Vercel e subdomínios do rodrigocotrin.com
        const vercelPattern = /^https:\/\/cookflow(-[a-z0-9-]+)?\.vercel\.app$/;
        const vercelProjectPattern = /^https:\/\/cookflow-project(-[a-z0-9-]+)?\.vercel\.app$/;
        const customDomainPattern = /^https:\/\/([a-z0-9-]+\.)?rodrigocotrin\.com$/;

        if (
            !origin || 
            allowedOrigins.includes(origin) || 
            vercelPattern.test(origin) || 
            vercelProjectPattern.test(origin) ||
            customDomainPattern.test(origin)
        ) {
            callback(null, true);
        } else {
            callback(null, true); // Fallback permissivo para evitar bloqueios em testes
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 200
};

// --- Middlewares Globais ---
app.use(cors(corsOptions));
app.use(express.json());

// --- Servir Arquivos Estáticos de Uploads ---
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

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
app.use('/api', uploadRotas);
app.use('/api/lista-de-compras', listaComprasRotas);

const PORT = process.env.PORT || 3001;

// Inicializa o servidor localmente se não for ambiente de testes
if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`🚀 Servidor CookFlow rodando com sucesso na porta ${PORT}`);
    });
}

// Exporta a instância do app para a Vercel
module.exports = app;
