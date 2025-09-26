// Arquivo: backend/src/servidor.js

const express = require('express');
// Não precisamos mais do 'db' aqui por enquanto, ele será usado nos controllers.

const app = express();
const porta = 3001;

app.get('/', (requisicao, resposta) => {
    resposta.json({ mensagem: 'API do CookFlow está funcionando!' });
});

app.listen(porta, () => {
    console.log(`Servidor do CookFlow rodando na porta ${porta}`);
});