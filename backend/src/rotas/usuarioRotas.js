// Arquivo: src/rotas/usuarioRotas.js
const express = require('express');
const usuarioControlador = require('../controladores/usuarioControlador');

const rotas = express.Router();

// Rotas de Autenticação e Conta
rotas.post('/usuarios', usuarioControlador.cadastrarUsuario);
rotas.post('/login', usuarioControlador.loginUsuario);
rotas.post('/recuperar-senha', usuarioControlador.solicitarRecuperacaoSenha);
rotas.post('/redefinir-senha', usuarioControlador.redefinirSenha);

module.exports = rotas;