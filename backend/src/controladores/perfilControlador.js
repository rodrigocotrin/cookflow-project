// Arquivo: src/controladores/perfilControlador.js
const db = require('../config/bd'); // Verifique se o caminho está correto

const listarReceitasDoUsuario = async (requisicao, resposta) => {
    const { id: id_usuario } = requisicao.usuario;

    try {
        const query = `
            SELECT 
                r.id_receita, r.titulo, r.descricao, r.dificuldade, c.nome AS nome_categoria
            FROM receitas r
            JOIN categorias c ON r.id_categoria = c.id_categoria
            WHERE r.id_usuario = $1
            ORDER BY r.data_criacao DESC;
        `;
        const resultado = await db.query(query, [id_usuario]);
        return resposta.status(200).json(resultado.rows);
    } catch (erro) {
        // ... (bloco catch existente) ...
    }
};

const listarReceitasFavoritas = async (requisicao, resposta) => {
    const { id: id_usuario } = requisicao.usuario;

    try {
        const query = `
            SELECT 
                r.id_receita, r.titulo, r.descricao, c.nome as nome_categoria, u.nome as nome_usuario
            FROM favoritos f
            JOIN receitas r ON f.id_receita = r.id_receita
            JOIN usuarios u ON r.id_usuario = u.id_usuario
            JOIN categorias c ON r.id_categoria = c.id_categoria
            WHERE f.id_usuario = $1;
        `;
        const resultado = await db.query(query, [id_usuario]);
        return resposta.status(200).json(resultado.rows);
    } catch (erro) {
        console.error('Erro ao listar receitas favoritas:', erro);
        return resposta.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
};

module.exports = {
    listarReceitasDoUsuario,
    listarReceitasFavoritas,
};