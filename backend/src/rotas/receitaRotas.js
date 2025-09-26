// Arquivo: src/rotas/receitaRotas.js
const express = require('express');
const receitaControlador = require('../controladores/receitaControlador');
const verificarLogin = require('../intermediarios/autenticacao'); // Nosso "segurança"

const rotas = express.Router();


// Usamos o método GET para buscar/ler informações.
rotas.get('/receitas', receitaControlador.listarReceitas);

// Para criar uma receita, o usuário PRECISA estar logado.
// Rota protegida para criar uma nova receita
rotas.post('/receitas', verificarLogin, receitaControlador.cadastrarReceita);

module.exports = rotas;