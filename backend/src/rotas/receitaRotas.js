// Arquivo: src/rotas/receitaRotas.js
const express = require('express');
const receitaControlador = require('../controladores/receitaControlador');
const verificarLogin = require('../intermediarios/autenticacao'); // Nosso "segurança"

const rotas = express.Router();

// Para criar uma receita, o usuário PRECISA estar logado.
// Por isso, colocamos o middleware `verificarLogin` antes de chamar o controlador.
rotas.post('/receitas', verificarLogin, receitaControlador.cadastrarReceita);

module.exports = rotas;