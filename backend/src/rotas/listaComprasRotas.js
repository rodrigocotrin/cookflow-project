const express = require('express');
const listaComprasControlador = require('../controladores/listaComprasControlador');
const verificarLogin = require('../intermediarios/autenticacao');

const rotas = express.Router();

// A geração da lista de compras é uma funcionalidade para usuários logados
rotas.post('/lista-de-compras', verificarLogin, listaComprasControlador.gerarListaDeCompras);

module.exports = rotas;