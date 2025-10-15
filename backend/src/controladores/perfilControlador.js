// Arquivo: src/controladores/perfilControlador.js
const db = require('../config/bd');

const listarReceitasDoUsuario = async (requisicao, resposta) => {
    const { id: id_usuario } = requisicao.usuario;
    try {
        const query = `
            SELECT r.id_receita, r.titulo, r.descricao, r.dificuldade, c.nome AS nome_categoria
            FROM receitas r
            JOIN categorias c ON r.id_categoria = c.id_categoria
            WHERE r.id_usuario = $1
            ORDER BY r.data_criacao DESC;
        `;
        const resultado = await db.query(query, [id_usuario]);
        return resposta.status(200).json(resultado.rows);
    } catch (erro) {
        console.error('Erro ao listar receitas do utilizador:', erro);
        return resposta.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
};

const listarReceitasFavoritas = async (requisicao, resposta) => {
    const { id: id_usuario } = requisicao.usuario;
    try {
        const query = `
            SELECT r.id_receita, r.titulo, r.descricao, c.nome as nome_categoria, u.nome as nome_usuario
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

// --- NOVA FUNÇÃO PARA O PLANEJADOR ---
const listarReceitasParaPlanejador = async (requisicao, resposta) => {
    const { id: id_usuario } = requisicao.usuario;
    try {
        // Esta query combina as receitas criadas PELO utilizador com as receitas favoritadas POR ELE.
        // O UNION remove duplicados automaticamente (caso o utilizador favorite uma receita que ele mesmo criou).
        const query = `
            SELECT id_receita, titulo FROM receitas WHERE id_usuario = $1
            UNION
            SELECT r.id_receita, r.titulo FROM favoritos f
            JOIN receitas r ON f.id_receita = r.id_receita
            WHERE f.id_usuario = $1
            ORDER BY titulo ASC;
        `;
        const resultado = await db.query(query, [id_usuario]);
        return resposta.status(200).json(resultado.rows);
    } catch (erro) {
        console.error('Erro ao listar receitas para o planejador:', erro);
        return resposta.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
};

const obterDadosCompletosPerfil = async (requisicao, resposta) => {
    const { id: id_usuario } = requisicao.usuario;
    try {
        // As queries existentes para usuário, minhas receitas e favoritos continuam iguais
        const usuarioQuery = 'SELECT nome, data_criacao FROM usuarios WHERE id_usuario = $1';
        const minhasReceitasQuery = `
            SELECT id_receita, titulo, descricao, url_imagem
            FROM receitas WHERE id_usuario = $1 ORDER BY data_criacao DESC`;
        const favoritosQuery = `
            SELECT r.id_receita, r.titulo, r.url_imagem, u.nome AS nome_usuario
            FROM favoritos f JOIN receitas r ON f.id_receita = r.id_receita
            JOIN usuarios u ON r.id_usuario = u.id_usuario WHERE f.id_usuario = $1 ORDER BY r.titulo ASC`;

        // --- NOVA QUERY ADICIONADA ---
        // Busca os comentários e a nota de avaliação associada que o usuário fez
        const minhasAvaliacoesQuery = `
            SELECT 
                c.id_comentario, c.conteudo, c.data_criacao,
                a.nota,
                r.id_receita, r.titulo, r.url_imagem
            FROM comentarios c
            JOIN receitas r ON c.id_receita = r.id_receita
            LEFT JOIN avaliacoes a ON c.id_usuario = a.id_usuario AND c.id_receita = a.id_receita
            WHERE c.id_usuario = $1
            ORDER BY c.data_criacao DESC;
        `;
        
        // Executando todas as queries em paralelo para máxima eficiência
        const [
            resultadoUsuario,
            resultadoMinhasReceitas,
            resultadoFavoritos,
            resultadoMinhasAvaliacoes // Executando a nova query
        ] = await Promise.all([
            db.query(usuarioQuery, [id_usuario]),
            db.query(minhasReceitasQuery, [id_usuario]),
            db.query(favoritosQuery, [id_usuario]),
            db.query(minhasAvaliacoesQuery, [id_usuario]) // Nova query
        ]);

        const dadosCompletos = {
            usuario: resultadoUsuario.rows[0],
            minhasReceitas: resultadoMinhasReceitas.rows,
            receitasFavoritas: resultadoFavoritos.rows,
            minhasAvaliacoes: resultadoMinhasAvaliacoes.rows, // NOVO DADO NA RESPOSTA
        };
        return resposta.status(200).json(dadosCompletos);
    } catch (erro) {
        console.error('Erro ao obter dados completos do perfil:', erro);
        return resposta.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
};

module.exports = {
    listarReceitasDoUsuario,
    listarReceitasFavoritas,
    listarReceitasParaPlanejador,
    obterDadosCompletosPerfil, 
};