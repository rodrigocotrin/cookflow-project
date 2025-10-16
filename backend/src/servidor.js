// Arquivo: backend/src/servidor.js (VERSÃO COM ORDEM DE ROTAS CORRIGIDA)
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

// --- Middlewares Globais ---
// Configurados primeiro para serem aplicados a todas as requisições
const corsOptions = {
  origin: process.env.FRONTEND_URL, // Ex: https://cookflow-project.vercel.app
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());

// --- Rotas Públicas de Verificação de Saúde ---
// Definidas ANTES das rotas da API para garantir que sejam correspondidas primeiro.
app.get('/', (requisicao, resposta) => {
    resposta.json({ 
        status: 'online', 
        mensagem: 'Bem-vindo à API do CookFlow!',
        documentacao: 'Acesse /api para os endpoints da aplicação.'
    });
});

app.get('/api', (requisicao, resposta) => {
    resposta.json({ mensagem: 'API do CookFlow está funcionando corretamente!' });
});


// --- Registro das Rotas da Aplicação ---
// Estas rotas podem conter seus próprios middlewares de autenticação.
app.use('/api', usuarioRotas);
app.use('/api', receitaRotas);
app.use('/api', perfilRotas);
app.use('/api', interacaoRotas);
app.use('/api/lista-de-compras', listaComprasRotas); 

// Exporta a instância do app para a Vercel
module.exports = app;