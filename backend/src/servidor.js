// Arquivo: backend/src/servidor.js (VERSÃO FINAL APRIMORADA)
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

// --- Middlewares ---
const corsOptions = {
  origin: process.env.FRONTEND_URL,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());

// --- Registro Padronizado das Rotas ---
app.use('/api', usuarioRotas);
app.use('/api', receitaRotas);
app.use('/api', perfilRotas);
app.use('/api', interacaoRotas);
app.use('/api/lista-de-compras', listaComprasRotas); 

// --- Rotas de Verificação de Saúde da API ---

// Rota de verificação na RAIZ (/) - ADICIONADA PARA CONVENIÊNCIA
app.get('/', (requisicao, resposta) => {
    resposta.json({ 
        status: 'online', 
        mensagem: 'Bem-vindo à API do CookFlow!',
        documentacao: 'Acesse /api para os endpoints da aplicação.'
    });
});

// Rota de verificação principal em /api
app.get('/api', (requisicao, resposta) => {
    resposta.json({ mensagem: 'API do CookFlow está funcionando corretamente!' });
});

// Exporta a instância do app para a Vercel
module.exports = app;