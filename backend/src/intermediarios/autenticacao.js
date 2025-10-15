// Arquivo: src/intermediarios/autenticacao.js
const jwt = require('jsonwebtoken');

const verificarLogin = (requisicao, resposta, next) => {
    const cabecalhoAuth = requisicao.headers['authorization'];
    const token = cabecalhoAuth && cabecalhoAuth.split(' ')[1];

    if (!token) {
        return resposta.status(401).json({ mensagem: 'Acesso negado. Token não fornecido.' });
    }

    try {
        const decodificado = jwt.verify(token, process.env.JWT_SECRET);
        requisicao.usuario = decodificado;
        next();
    } catch (erro) {
        return resposta.status(403).json({ mensagem: 'Token inválido.' });
    }
};

module.exports = verificarLogin;