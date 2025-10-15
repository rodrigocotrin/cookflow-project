// Arquivo: backend/src/rotas/listaComprasRotas.js
const express = require('express');
const listaComprasControlador = require('../controladores/listaComprasControlador');
const verificarLogin = require('../intermediarios/autenticacao');

const rotas = express.Router();

// NOVO: Rota GET para buscar as receitas selecionáveis
// Endpoint: GET /api/lista-de-compras/receitas
rotas.get('/receitas', verificarLogin, listaComprasControlador.listarReceitasParaPlanejador);

// Rota POST para gerar a lista
// Endpoint: POST /api/lista-de-compras
rotas.post('/', verificarLogin, listaComprasControlador.gerarListaDeCompras);

module.exports = rotas;