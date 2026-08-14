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

// --- Configuração de CORS Universal e Pré-flight Completo ---
const corsOptions = {
    origin: (origin, callback) => {
        // Permite qualquer origem da aplicação, subdomínios, Vercel e chamadas de API
        callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    optionsSuccessStatus: 200
};

// --- Middlewares Globais ---
app.use(cors(corsOptions));
app.use(express.json());

// Garante cabeçalhos CORS em todas as respostas, inclusive em erros
app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS,PATCH');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
    }
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    next();
});

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

// Middleware Global de Tratamento de Erros
app.use((err, req, res, next) => {
    console.error('Erro na requisição:', err);
    res.status(err.status || 500).json({
        mensagem: err.message || 'Erro interno no servidor.',
        erro: process.env.NODE_ENV === 'production' ? undefined : err.stack
    });
});

const PORT = process.env.PORT || 3001;

// Inicializa o servidor localmente se não for ambiente de testes
if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`🚀 Servidor CookFlow rodando com sucesso na porta ${PORT}`);
    });
}

// Exporta a instância do app para a Vercel
module.exports = app;
