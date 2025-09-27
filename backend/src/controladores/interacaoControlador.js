// Arquivo: src/controladores/interacaoControlador.js
const db = require('../config/bd'); // Verifique o caminho

const avaliarReceita = async (requisicao, resposta) => {
    const { id: id_usuario } = requisicao.usuario;
    const { id: id_receita } = requisicao.params;
    const { nota } = requisicao.body;

    // Valida se a nota é um número válido entre 1 e 5
    if (typeof nota !== 'number' || nota < 1 || nota > 5) { 
        return resposta.status(400).json({ mensagem: 'A nota é obrigatória e deve ser um número entre 1 e 5 (ex: 3.5).' });
    }

    try {
        // Verifica se a receita existe
        const receita = await db.query('SELECT id_receita FROM receitas WHERE id_receita = $1', [id_receita]);
        if (receita.rowCount === 0) {
            return resposta.status(404).json({ mensagem: 'Receita não encontrada.' });
        }

        // Verifica se o usuário já avaliou esta receita
        // A restrição UNIQUE no banco de dados já nos protege, mas esta verificação fornece uma mensagem de erro melhor.
        const avaliacaoExistente = await db.query('SELECT * FROM avaliacoes WHERE id_usuario = $1 AND id_receita = $2', [id_usuario, id_receita]);
        if (avaliacaoExistente.rowCount > 0) {
            return resposta.status(409).json({ mensagem: 'Você já avaliou esta receita.' });
        }

        // Insere a nova avaliação no banco
        const novaAvaliacao = await db.query(
            'INSERT INTO avaliacoes (id_usuario, id_receita, nota) VALUES ($1, $2, $3) RETURNING *',
            [id_usuario, id_receita, nota]
        );

        return resposta.status(201).json(novaAvaliacao.rows[0]);

    } catch (erro) {
        console.error('Erro ao avaliar receita:', erro);
        return resposta.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
};


// --- NOVA FUNÇÃO PARA ADICIONAR UM COMENTÁRIO ---
const adicionarComentario = async (requisicao, resposta) => {
    const { id: id_usuario } = requisicao.usuario;
    const { id: id_receita } = requisicao.params;
    const { conteudo } = requisicao.body;

    if (!conteudo || conteudo.trim() === '') {
        return resposta.status(400).json({ mensagem: 'O conteúdo do comentário não pode estar vazio.' });
    }

    try {
        const receita = await db.query('SELECT id_receita FROM receitas WHERE id_receita = $1', [id_receita]);
        if (receita.rowCount === 0) {
            return resposta.status(404).json({ mensagem: 'Receita não encontrada.' });
        }

        // --- NOVA VALIDAÇÃO ANTI-SPAM ---
        // Verifica se o usuário já postou um comentário idêntico nesta receita
        const comentarioExistente = await db.query(
            'SELECT * FROM comentarios WHERE id_usuario = $1 AND id_receita = $2 AND conteudo = $3',
            [id_usuario, id_receita, conteudo]
        );

        if (comentarioExistente.rowCount > 0) {
            return resposta.status(409).json({ mensagem: 'Você já postou este comentário nesta receita.' });
        }
        // ------------------------------------

        const novoComentario = await db.query(
            'INSERT INTO comentarios (id_usuario, id_receita, conteudo) VALUES ($1, $2, $3) RETURNING *',
            [id_usuario, id_receita, conteudo]
        );

        return resposta.status(201).json(novoComentario.rows[0]);

    } catch (erro) {
        console.error('Erro ao adicionar comentário:', erro);
        return resposta.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
};

// --- NOVA FUNÇÃO PARA LISTAR COMENTÁRIOS DE UMA RECEITA ---
const listarComentarios = async (requisicao, resposta) => {
    const { id: id_receita } = requisicao.params;

    try {
        const query = `
            SELECT c.id_comentario, c.conteudo, c.data_criacao, u.nome AS nome_usuario
            FROM comentarios c
            JOIN usuarios u ON c.id_usuario = u.id_usuario
            WHERE c.id_receita = $1
            ORDER BY c.data_criacao DESC;
        `;
        const resultado = await db.query(query, [id_receita]);
        return resposta.status(200).json(resultado.rows);
    } catch (erro) {
        console.error('Erro ao listar comentários:', erro);
        return resposta.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
};

module.exports = {
    avaliarReceita,
    adicionarComentario, 
    listarComentarios,   
};
