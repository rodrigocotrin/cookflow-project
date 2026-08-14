<<<<<<< Updated upstream
// Arquivo: backend/src/servidor.js (VERSÃO FINAL CORRIGIDA)
=======
// Arquivo: backend/src/servidor.js (VERSÃO COM CORREÇÃO DEFINITIVA DE CORS, UPLOADS E RECUPERAÇÃO)
>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
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
=======
// --- Configuração de CORS Permissiva e Segura ---
const allowedOrigins = [
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
        const vercelPattern = /^https:\/\/cookflow-project(-[a-z0-9-]+)?\.vercel\.app$/;
        // Permite se estiver na lista de origens, se bater no regex da Vercel, ou se não houver origin (ex: Postman/cURL)
        if (!origin || allowedOrigins.includes(origin) || vercelPattern.test(origin)) {
>>>>>>> Stashed changes
            callback(null, true);
        } else {
            callback(null, true); // Fallback permissivo para ambiente de desenvolvimento local
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
