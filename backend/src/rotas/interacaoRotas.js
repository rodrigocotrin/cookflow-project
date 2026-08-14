// Arquivo: src/rotas/interacaoRotas.js
const express = require('express');
const interacaoControlador = require('../controladores/interacaoControlador');
const verificarLogin = require('../intermediarios/autenticacao');

const rotas = express.Router();

// --- ROTA PÚBLICA ---
rotas.get('/receitas/:id/comentarios', interacaoControlador.listarComentarios);

// --- APLICA O MIDDLEWARE DE AUTENTICAÇÃO ---
rotas.use(verificarLogin);

// --- ROTAS PROTEGIDAS ---
rotas.get('/receitas/:id/minha-avaliacao', interacaoControlador.obterMinhaAvaliacao);
rotas.post('/receitas/:id/avaliar', interacaoControlador.avaliarReceita);
rotas.post('/receitas/:id/comentar', interacaoControlador.adicionarComentario);
rotas.put('/comentarios/:id_comentario', interacaoControlador.editarComentario);
rotas.delete('/comentarios/:id_comentario', interacaoControlador.deletarComentario);

module.exports = rotas;