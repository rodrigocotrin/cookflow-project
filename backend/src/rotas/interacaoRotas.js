// Arquivo: src/rotas/interacaoRotas.js
const express = require('express');
const interacaoControlador = require('../controladores/interacaoControlador');
const verificarLogin = require('../intermediarios/autenticacao');

const rotas = express.Router();

// --- ROTAS PÚBLICAS ---
// Esta rota não precisa de login e deve ser definida ANTES do middleware de autenticação.
rotas.get('/receitas/:id/comentarios', interacaoControlador.listarComentarios);


// --- APLICA O MIDDLEWARE DE AUTENTICAÇÃO ---
// Todas as rotas definidas ABAIXO desta linha exigirão um token válido.
rotas.use(verificarLogin);


// --- ROTAS PROTEGIDAS ---
// Endpoint para um usuário avaliar uma receita
rotas.post('/receitas/:id/avaliar', interacaoControlador.avaliarReceita);

// Endpoint para um usuário adicionar um comentário
rotas.post('/receitas/:id/comentar', interacaoControlador.adicionarComentario);

module.exports = rotas;