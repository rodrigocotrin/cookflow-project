// Arquivo: src/rotas/receitaRotas.js
const express = require('express');
const receitaControlador = require('../controladores/receitaControlador');
const verificarLogin = require('../intermediarios/autenticacao');

const rotas = express.Router();

// Rotas públicas
rotas.get('/receitas', receitaControlador.listarReceitas);
rotas.get('/receitas/:id', receitaControlador.detalharReceita);

// Rotas protegidas (precisam de token)
rotas.post('/receitas', verificarLogin, receitaControlador.cadastrarReceita);
// --- NOVA ROTA PROTEGIDA PARA ATUALIZAR UMA RECEITA ---
rotas.put('/receitas/:id', verificarLogin, receitaControlador.atualizarReceita);

module.exports = rotas;