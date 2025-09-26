const express = require('express');
const usuarioRotas = require('./rotas/usuarioRotas');
const receitaRotas = require('./rotas/receitaRotas');
const perfilRotas = require('./rotas/perfilRotas'); 

const app = express();
const porta = 3001;

app.use(express.json());

app.use('/api', usuarioRotas);
app.use('/api', receitaRotas);
app.use('/api', perfilRotas); 

// Rota de teste
app.get('/', (requisicao, resposta) => {
    resposta.json({ mensagem: 'API do CookFlow está funcionando!' });
});

app.listen(porta, () => {
    console.log(`Servidor do CookFlow rodando na porta ${porta}`);
});