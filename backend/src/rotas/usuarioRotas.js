// Arquivo: src/rotas/usuarioRotas.js
const express = require('express');
const usuarioControlador = require('../controladores/usuarioControlador');

const rotas = express.Router();

// Define a rota para o cadastro de usuário.
// Usamos o método POST, pois estamos criando um novo recurso.
// O endereço será '/usuarios'
rotas.post('/usuarios', usuarioControlador.cadastrarUsuario);
rotas.post('/login', usuarioControlador.loginUsuario);

module.exports = rotas;