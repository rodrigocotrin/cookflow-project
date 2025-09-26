// Arquivo: src/servidor.js
const express = require('express');
const usuarioRotas = require('./rotas/usuarioRotas'); // Importa nossas rotas de usuário
const receitaRotas = require('./rotas/receitaRotas');

const app = express();
const porta = 3001;

// Middleware para permitir que o Express entenda requisições com corpo em formato JSON
app.use(express.json());

// Diz ao aplicativo para usar as rotas de usuário que definimos
// Todas as rotas em 'usuarioRotas' serão prefixadas com '/api'
app.use('/api', usuarioRotas);
app.use('/api', receitaRotas);

// Rota de teste
app.get('/', (requisicao, resposta) => {
    resposta.json({ mensagem: 'API do CookFlow está funcionando!' });
});

app.listen(porta, () => {
    console.log(`Servidor do CookFlow rodando na porta ${porta}`);
});