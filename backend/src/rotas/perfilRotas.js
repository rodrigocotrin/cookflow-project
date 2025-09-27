// Arquivo: src/rotas/perfilRotas.js (VERSÃO CORRIGIDA)
const express = require('express');
const perfilControlador = require('../controladores/perfilControlador');
const verificarLogin = require('../intermediarios/autenticacao');

const rotas = express.Router();

// Em vez de usar 'rotas.use()', vamos aplicar o middleware diretamente em cada rota.
// Isso garante que ele não "vaze" para outros arquivos.

// Endpoint para listar as receitas criadas pelo usuário logado
rotas.get('/perfil/minhas-receitas', verificarLogin, perfilControlador.listarReceitasDoUsuario);

// Endpoint para listar as receitas favoritadas pelo usuário logado
rotas.get('/perfil/favoritos', verificarLogin, perfilControlador.listarReceitasFavoritas);

module.exports = rotas;