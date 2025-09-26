const express = require('express');
const interacaoControlador = require('../controladores/interacaoControlador');
const verificarLogin = require('../intermediarios/autenticacao');

const rotas = express.Router();

// Aplica o middleware de autenticação para todas as rotas de interação
rotas.use(verificarLogin);

// Endpoint para um usuário avaliar uma receita
rotas.post('/receitas/:id/avaliar', interacaoControlador.avaliarReceita);

module.exports = rotas;