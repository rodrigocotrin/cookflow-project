// Arquivo: src/controladores/interacaoControlador.js
const db = require('../config/bd');

/**
 * Avaliar uma receita (1 a 5 estrelas) com suporte a UPSERT.
 * Se o usuário já avaliou, atualiza a nota existente.
 */
const avaliarReceita = async (requisicao, resposta) => {
    const { id: id_usuario } = requisicao.usuario;
    const { id: id_receita } = requisicao.params;
    const { nota } = requisicao.body;

    const notaNumerica = parseFloat(nota);
    if (isNaN(notaNumerica) || notaNumerica < 1 || notaNumerica > 5) {
        return resposta.status(400).json({ mensagem: 'A nota deve ser um número entre 1 e 5.' });
    }

    try {
        const receita = await db.query('SELECT id_receita FROM receitas WHERE id_receita = $1', [id_receita]);
        if (receita.rowCount === 0) {
            return resposta.status(404).json({ mensagem: 'Receita não encontrada.' });
        }

        // UPSERT na tabela avaliacoes
        const avaliacaoQuery = `
            INSERT INTO avaliacoes (id_usuario, id_receita, nota) 
            VALUES ($1, $2, $3)
            ON CONFLICT (id_usuario, id_receita) 
            DO UPDATE SET nota = EXCLUDED.nota, data_criacao = CURRENT_TIMESTAMP
            RETURNING *;
        `;
        const resultadoAvaliacao = await db.query(avaliacaoQuery, [id_usuario, id_receita, notaNumerica]);

        // Recalcula a média e contagem atualizadas
        const statsQuery = `
            SELECT 
                COALESCE(ROUND(AVG(nota), 1), 0) AS media_avaliacoes, 
                COUNT(id_avaliacao) AS total_avaliacoes 
            FROM avaliacoes 
            WHERE id_receita = $1;
        `;
        const stats = await db.query(statsQuery, [id_receita]);

        return resposta.status(200).json({
            mensagem: 'Avaliação registrada com sucesso!',
            avaliacao: resultadoAvaliacao.rows[0],
            media_avaliacoes: parseFloat(stats.rows[0].media_avaliacoes).toFixed(1),
            total_avaliacoes: parseInt(stats.rows[0].total_avaliacoes, 10),
        });

    } catch (erro) {
        console.error('Erro ao avaliar receita:', erro);
        return resposta.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
};

/**
 * Adicionar comentário com nota opcional em transação única.
 */
const adicionarComentario = async (requisicao, resposta) => {
    const { id: id_usuario } = requisicao.usuario;
    const { id: id_receita } = requisicao.params;
    const { conteudo, nota } = requisicao.body;

    if (!conteudo || conteudo.trim() === '') {
        return resposta.status(400).json({ mensagem: 'O conteúdo do comentário não pode estar vazio.' });
    }

    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');

        const receita = await client.query('SELECT id_receita FROM receitas WHERE id_receita = $1', [id_receita]);
        if (receita.rowCount === 0) {
            await client.query('ROLLBACK');
            return resposta.status(404).json({ mensagem: 'Receita não encontrada.' });
        }

        // Se uma nota válida foi fornecida, faz UPSERT na avaliação
        if (nota !== undefined && nota !== null && nota > 0) {
            const notaNumerica = parseFloat(nota);
            if (notaNumerica >= 1 && notaNumerica <= 5) {
                await client.query(
                    `INSERT INTO avaliacoes (id_usuario, id_receita, nota) 
                     VALUES ($1, $2, $3)
                     ON CONFLICT (id_usuario, id_receita) 
                     DO UPDATE SET nota = EXCLUDED.nota, data_criacao = CURRENT_TIMESTAMP`,
                    [id_usuario, id_receita, notaNumerica]
                );
            }
        }

        // Insere o novo comentário
        const novoComentario = await client.query(
            'INSERT INTO comentarios (id_usuario, id_receita, conteudo) VALUES ($1, $2, $3) RETURNING *',
            [id_usuario, id_receita, conteudo.trim()]
        );

        // Busca dados atualizados da receita para sincronização instantânea
        const stats = await client.query(
            `SELECT COALESCE(ROUND(AVG(nota), 1), 0) AS media_avaliacoes, COUNT(id_avaliacao) AS total_avaliacoes 
             FROM avaliacoes WHERE id_receita = $1`,
            [id_receita]
        );

        await client.query('COMMIT');

        return resposta.status(201).json({
            mensagem: 'Comentário publicado com sucesso!',
            comentario: novoComentario.rows[0],
            media_avaliacoes: parseFloat(stats.rows[0].media_avaliacoes).toFixed(1),
            total_avaliacoes: parseInt(stats.rows[0].total_avaliacoes, 10),
        });

    } catch (erro) {
        await client.query('ROLLBACK');
        console.error('Erro ao adicionar comentário:', erro);
        return resposta.status(500).json({ mensagem: 'Erro interno do servidor.' });
    } finally {
        client.release();
    }
};

/**
 * Listar todos os comentários de uma receita junto com a nota de quem comentou.
 */
const listarComentarios = async (req, res) => {
    const { id } = req.params; 

    if (!id) {
        return res.status(400).json({ mensagem: 'O ID da receita não foi fornecido.' });
    }

    try {
        const query = `
            SELECT 
                c.id_comentario, c.conteudo, c.data_criacao,
                u.id_usuario, u.nome AS nome_usuario,
                a.nota AS nota_avaliacao
            FROM comentarios c
            JOIN usuarios u ON c.id_usuario = u.id_usuario
            LEFT JOIN avaliacoes a ON c.id_usuario = a.id_usuario AND c.id_receita = a.id_receita
            WHERE c.id_receita = $1
            ORDER BY c.data_criacao DESC;
        `;
        const { rows } = await db.query(query, [id]); 
        res.status(200).json(rows);
    } catch (error) {
        console.error('Erro ao listar comentários:', error);
        res.status(500).json({ mensagem: 'Erro interno do servidor ao buscar comentários.' });
    }
};

/**
 * Obter a avaliação e comentários do usuário logado nesta receita específica.
 */
const obterMinhaAvaliacao = async (requisicao, resposta) => {
    const { id: id_usuario } = requisicao.usuario;
    const { id: id_receita } = requisicao.params;

    try {
        const resultado = await db.query(
            'SELECT nota FROM avaliacoes WHERE id_usuario = $1 AND id_receita = $2',
            [id_usuario, id_receita]
        );

        return resposta.status(200).json({
            nota: resultado.rows.length > 0 ? parseFloat(resultado.rows[0].nota) : 0
        });
    } catch (erro) {
        console.error('Erro ao buscar minha avaliação:', erro);
        return resposta.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
};

/**
 * Editar comentário existente.
 */
const editarComentario = async (requisicao, resposta) => {
    const { id: id_usuario } = requisicao.usuario;
    const { id_comentario } = requisicao.params;
    const { conteudo } = requisicao.body;

    if (!conteudo || conteudo.trim() === '') {
      return resposta.status(400).json({ mensagem: 'O conteúdo do comentário não pode estar vazio.' });
    }

    try {
      const resultado = await db.query(
        'UPDATE comentarios SET conteudo = $1 WHERE id_comentario = $2 AND id_usuario = $3 RETURNING *',
        [conteudo.trim(), id_comentario, id_usuario]
      );

      if (resultado.rowCount === 0) {
        return resposta.status(404).json({ mensagem: 'Comentário não encontrado ou não pertence ao usuário.' });
      }

      return resposta.status(200).json(resultado.rows[0]);
    } catch (erro) {
      console.error('Erro ao editar comentário:', erro);
      return resposta.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
};      

/**
 * Deletar comentário.
 */
const deletarComentario = async (requisicao, resposta) => {
    const { id: id_usuario } = requisicao.usuario;
    const { id_comentario } = requisicao.params;

    try {
        const resultado = await db.query(
            'DELETE FROM comentarios WHERE id_comentario = $1 AND id_usuario = $2 RETURNING *',
            [id_comentario, id_usuario]
        );

        if (resultado.rowCount === 0) {
            return resposta.status(404).json({ mensagem: 'Comentário não encontrado ou você não tem permissão para deletá-lo.' });
        }

        return resposta.status(200).json({ mensagem: 'Comentário deletado com sucesso!' });
    } catch (erro) {
        console.error('Erro ao deletar comentário:', erro);
        return resposta.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
};

module.exports = {
    avaliarReceita,
    adicionarComentario,
    listarComentarios,
    obterMinhaAvaliacao,
    editarComentario,
    deletarComentario,
};