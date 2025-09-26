// Arquivo: src/rotas/receitaRotas.js
const express = require('express');
const receitaControlador = require('../controladores/receitaControlador');
const verificarLogin = require('../intermediarios/autenticacao');

const rotas = express.Router();

// ... (rotas existentes) ...
rotas.get('/receitas', receitaControlador.listarReceitas);
rotas.get('/receitas/:id', receitaControlador.detalharReceita);

// Rotas protegidas (precisam de token)
rotas.post('/receitas', verificarLogin, receitaControlador.cadastrarReceita);
rotas.put('/receitas/:id', verificarLogin, receitaControlador.atualizarReceita);
rotas.delete('/receitas/:id', verificarLogin, receitaControlador.deletarReceita);

// --- NOVAS ROTAS PARA FAVORITOS ---
rotas.post('/receitas/:id/favoritar', verificarLogin, receitaControlador.favoritarReceita);
rotas.delete('/receitas/:id/favoritar', verificarLogin, receitaControlador.desfavoritarReceita);


module.exports = rotas;