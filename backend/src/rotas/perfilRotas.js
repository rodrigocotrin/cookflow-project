// Arquivo: src/rotas/perfilRotas.js
const express = require('express');
const perfilControlador = require('../controladores/perfilControlador');
const verificarLogin = require('../intermediarios/autenticacao');

const rotas = express.Router();

// Todas as rotas de perfil precisam de autenticação
rotas.use(verificarLogin);

// Endpoint para listar as receitas criadas pelo usuário logado
rotas.get('/perfil/minhas-receitas', perfilControlador.listarReceitasDoUsuario);

// Endpoint para listar as receitas favoritadas pelo usuário logado
rotas.get('/perfil/favoritos', perfilControlador.listarReceitasFavoritas);

module.exports = rotas;