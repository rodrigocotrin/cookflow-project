// Arquivo: src/intermediarios/autenticacao.js
const jwt = require('jsonwebtoken');

const verificarLogin = (requisicao, resposta, next) => {
    // 1. Pega o token do cabeçalho da requisição
    const cabecalhoAuth = requisicao.headers['authorization'];
    const token = cabecalhoAuth && cabecalhoAuth.split(' ')[1]; // Formato "Bearer TOKEN"

    // 2. Se não houver token, retorna erro de não autorizado
    if (!token) {
        return resposta.status(401).json({ mensagem: 'Acesso negado. Token não fornecido.' });
    }

    try {
        // 3. Verifica se o token é válido usando nosso segredo
        const decodificado = jwt.verify(token, process.env.JWT_SECRET);

        // 4. Adiciona os dados do usuário (o 'id' que salvamos no token) ao objeto da requisição
        requisicao.usuario = decodificado;

        // 5. Chama a próxima função/controlador na fila
        next();
    } catch (erro) {
        // 6. Se o token for inválido, retorna erro
        return resposta.status(403).json({ mensagem: 'Token inválido.' });
    }
};

module.exports = verificarLogin;