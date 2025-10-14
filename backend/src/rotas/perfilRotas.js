// Arquivo: src/rotas/perfilRotas.js
const express = require('express');
const perfilControlador = require('../controladores/perfilControlador');
const verificarLogin = require('../intermediarios/autenticacao');

const rotas = express.Router();

// Endpoint para listar as receitas do utilizador para o planejador (combina criadas e favoritas)
rotas.get('/planejador/receitas', verificarLogin, perfilControlador.listarReceitasParaPlanejador);

// Endpoints para a página de perfil
rotas.get('/perfil/minhas-receitas', verificarLogin, perfilControlador.listarReceitasDoUsuario);
rotas.get('/perfil/favoritos', verificarLogin, perfilControlador.listarReceitasFavoritas);

module.exports = rotas;