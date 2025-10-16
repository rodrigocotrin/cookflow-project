// Arquivo: backend/src/servidor.js (VERSÃO FINAL PARA DEPLOY)
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

// Configuração de CORS para permitir requisições apenas do seu frontend em produção
const corsOptions = {
  origin: process.env.FRONTEND_URL, // Ex: https://cookflow-project.vercel.app
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Middleware para processar JSON
app.use(express.json());

// --- Registro Padronizado das Rotas ---
// Todas as suas rotas existentes, funcionando perfeitamente.
app.use('/api', usuarioRotas);
app.use('/api', receitaRotas);
app.use('/api', perfilRotas);
app.use('/api', interacaoRotas);
app.use('/api/lista-de-compras', listaComprasRotas); 

// Rota de verificação da saúde da API
app.get('/api', (requisicao, resposta) => {
    resposta.json({ mensagem: 'API do CookFlow está funcionando corretamente!' });
});

// IMPORTANTE: Para a Vercel, não usamos app.listen.
// Em vez disso, exportamos a instância do app.
module.exports = app;