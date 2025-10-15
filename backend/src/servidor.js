// Arquivo: backend/src/servidor.js (VERSÃO REFATORADA)
const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Importações das rotas
const usuarioRotas = require('./rotas/usuarioRotas');
const receitaRotas = require('./rotas/receitaRotas');
const perfilRotas = require('./rotas/perfilRotas');
const interacaoRotas = require('./rotas/interacaoRotas');
const listaComprasRotas = require('./rotas/listaComprasRotas'); // Apenas esta rota é necessária agora

const app = express();
const porta = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// --- Registro Padronizado das Rotas ---
app.use('/api', usuarioRotas);
app.use('/api', receitaRotas);
app.use('/api', perfilRotas);
app.use('/api', interacaoRotas);

// REMOVIDO: app.use('/api/planejador', planejadorRotas);
// ATUALIZADO: Todas as funcionalidades do planejador agora estão sob esta rota
app.use('/api/lista-de-compras', listaComprasRotas); 

// Rota de verificação
app.get('/api', (requisicao, resposta) => {
    resposta.json({ mensagem: 'API do CookFlow está a funcionar!' });
});

app.listen(porta, () => {
    console.log(`Servidor do CookFlow a rodar na porta ${porta}`);
});