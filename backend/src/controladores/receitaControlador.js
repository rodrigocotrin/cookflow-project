// Arquivo: src/controladores/receitaControlador.js
const db = require('../config/bd');

// Função de validação atualizada para incluir a verificação da imagem
const IMAGEM_PADRAO = 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=800&q=80';

const validarCorpoReceita = (corpo) => {
    const { titulo, id_categoria, tempo_preparo_minutos, dificuldade, instrucoes, ingredientes } = corpo;
    if (!titulo || titulo.trim() === '') return 'O campo "título" é obrigatório.';
    if (!id_categoria) return 'O campo "categoria" é obrigatório.';
    if (!tempo_preparo_minutos) return 'O campo "tempo de preparo" é obrigatório.';
    if (!dificuldade) return 'O campo "dificuldade" é obrigatório.';
    if (!instrucoes || instrucoes.trim() === '') return 'O campo "instruções" é obrigatório.';
    if (!ingredientes || !Array.isArray(ingredientes) || ingredientes.length === 0) {
        return 'A receita deve ter pelo menos um ingrediente.';
    }
    for (const ing of ingredientes) {
        if (!ing.nome || !ing.quantidade || !ing.unidade_medida) {
            return 'Todos os campos de um ingrediente (nome, quantidade, unidade) são obrigatórios.';
        }
    }
    return null; // Nenhum erro
};

const cadastrarReceita = async (requisicao, resposta) => {
    const { id: id_usuario } = requisicao.usuario;
    const erroValidacao = validarCorpoReceita(requisicao.body);
    if (erroValidacao) {
        return resposta.status(400).json({ mensagem: erroValidacao });
    }
    
    let { titulo, descricao, url_imagem, id_categoria, tempo_preparo_minutos, dificuldade, instrucoes, ingredientes } = requisicao.body;
    if (!url_imagem || url_imagem.trim() === '') {
        url_imagem = IMAGEM_PADRAO;
    }

    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');
        const receitaQuery = `
            INSERT INTO receitas (id_usuario, id_categoria, titulo, descricao, url_imagem, tempo_preparo_minutos, dificuldade, instrucoes)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id_receita;
        `;
        const resultadoReceita = await client.query(receitaQuery, [id_usuario, id_categoria, titulo.trim(), descricao ? descricao.trim() : '', url_imagem.trim(), tempo_preparo_minutos, dificuldade, instrucoes.trim()]);
        const id_receita = resultadoReceita.rows[0].id_receita;

        for (const ingrediente of ingredientes) {
            let resultadoIngrediente = await client.query('SELECT id_ingrediente FROM ingredientes WHERE LOWER(nome) = LOWER($1)', [ingrediente.nome.trim()]);
            let id_ingrediente;
            if (resultadoIngrediente.rows.length === 0) {
                const novoIngredienteResult = await client.query('INSERT INTO ingredientes (nome) VALUES ($1) RETURNING id_ingrediente', [ingrediente.nome.trim()]);
                id_ingrediente = novoIngredienteResult.rows[0].id_ingrediente;
            } else {
                id_ingrediente = resultadoIngrediente.rows[0].id_ingrediente;
            }
            const receitaIngredienteQuery = `
                INSERT INTO receitas_ingredientes (id_receita, id_ingrediente, quantidade, unidade_medida)
                VALUES ($1, $2, $3, $4);
            `;
            await client.query(receitaIngredienteQuery, [id_receita, id_ingrediente, ingrediente.quantidade, ingrediente.unidade_medida]);
        }
        await client.query('COMMIT');
        return resposta.status(201).json({ id_receita, titulo, mensagem: 'Receita cadastrada com sucesso!' });
    } catch (erro) {
        await client.query('ROLLBACK');
        console.error('Erro ao cadastrar receita:', erro);
        return resposta.status(500).json({ mensagem: 'Erro interno do servidor.' });
    } finally {
        client.release();
    }
};

const listarReceitas = async (requisicao, resposta) => {
    const { busca, categoria, dificuldade, ordenar } = requisicao.query;
    try {
        let queryBase = `
            SELECT 
                r.id_receita, 
                r.titulo, 
                r.descricao, 
                r.dificuldade, 
                r.tempo_preparo_minutos,
                r.url_imagem,
                r.data_criacao,
                c.nome AS nome_categoria, 
                u.nome AS nome_usuario,
                COALESCE(ROUND(AVG(a.nota), 1), 0) AS media_avaliacoes,
                COUNT(a.id_avaliacao) AS total_avaliacoes
            FROM receitas r
            JOIN usuarios u ON r.id_usuario = u.id_usuario
            JOIN categorias c ON r.id_categoria = c.id_categoria
            LEFT JOIN avaliacoes a ON r.id_receita = a.id_receita
        `;
        const condicoes = [];
        const valores = [];
        let contadorParam = 1;

        if (busca && busca.trim() !== '') {
            condicoes.push(`(r.titulo ILIKE $${contadorParam} OR r.descricao ILIKE $${contadorParam} OR r.id_receita IN (
                SELECT ri.id_receita FROM receitas_ingredientes ri
                JOIN ingredientes i ON ri.id_ingrediente = i.id_ingrediente
                WHERE i.nome ILIKE $${contadorParam}
            ))`);
            valores.push(`%${busca.trim()}%`);
            contadorParam++;
        }
        if (categoria && categoria.trim() !== '') {
            const catLimpa = categoria.trim();
            const catSemPlural = catLimpa.replace(/s$/i, '');
            condicoes.push(`(c.nome ILIKE $${contadorParam} OR c.nome ILIKE $${contadorParam + 1} OR c.id_categoria::text = $${contadorParam + 2})`);
            valores.push(`%${catLimpa}%`, `%${catSemPlural}%`, catLimpa);
            contadorParam += 3;
        }
        if (dificuldade && dificuldade.trim() !== '') {
            condicoes.push(`r.dificuldade ILIKE $${contadorParam}`);
            valores.push(`%${dificuldade.trim()}%`);
            contadorParam++;
        }

        if (condicoes.length > 0) {
            queryBase += ` WHERE ${condicoes.join(' AND ')}`;
        }
        
        queryBase += ` GROUP BY r.id_receita, r.titulo, r.descricao, r.dificuldade, r.tempo_preparo_minutos, r.url_imagem, r.data_criacao, u.nome, c.nome `;

        if (ordenar === 'mais_avaliadas') {
            queryBase += ` ORDER BY media_avaliacoes DESC, total_avaliacoes DESC, r.data_criacao DESC; `;
        } else if (ordenar === 'mais_rapidas') {
            queryBase += ` ORDER BY r.tempo_preparo_minutos ASC, r.data_criacao DESC; `;
        } else {
            queryBase += ` ORDER BY r.data_criacao DESC; `;
        }
        
        const resultado = await db.query(queryBase, valores);
        return resposta.status(200).json(resultado.rows);
    } catch (erro) {
        console.error('Erro ao listar receitas:', erro);
        return resposta.status(500).json({ mensagem: 'Erro ao listar receitas.', detalhe: erro.message });
    }
};

const detalharReceita = async (requisicao, resposta) => {
    const { id } = requisicao.params;
    try {
        const receitaQuery = `
            SELECT 
                r.id_receita, r.titulo, r.descricao, r.instrucoes, r.dificuldade, 
                r.tempo_preparo_minutos, c.nome AS nome_categoria, u.nome AS nome_usuario, u.id_usuario,
                r.id_categoria, r.url_imagem
            FROM receitas r
            JOIN usuarios u ON r.id_usuario = u.id_usuario
            JOIN categorias c ON r.id_categoria = c.id_categoria
            WHERE r.id_receita = $1;
        `;
        const resultadoReceita = await db.query(receitaQuery, [id]);
        if (resultadoReceita.rows.length === 0) {
            return resposta.status(404).json({ mensagem: 'Receita não encontrada.' });
        }
        const receita = resultadoReceita.rows[0];

        const ingredientesQuery = `
            SELECT i.nome, ri.quantidade, ri.unidade_medida
            FROM receitas_ingredientes ri
            JOIN ingredientes i ON ri.id_ingrediente = i.id_ingrediente
            WHERE ri.id_receita = $1;
        `;
        const resultadoIngredientes = await db.query(ingredientesQuery, [id]);
        receita.ingredientes = resultadoIngredientes.rows;

        const avaliacaoQuery = `
            SELECT COALESCE(AVG(nota), 0) AS media_avaliacoes, COUNT(nota) AS total_avaliacoes 
            FROM avaliacoes WHERE id_receita = $1;
        `;
        const resultadoAvaliacao = await db.query(avaliacaoQuery, [id]);
        receita.media_avaliacoes = parseFloat(resultadoAvaliacao.rows[0].media_avaliacoes).toFixed(1);
        receita.total_avaliacoes = parseInt(resultadoAvaliacao.rows[0].total_avaliacoes, 10);
        return resposta.status(200).json(receita);
    } catch (erro) {
        console.error('Erro ao detalhar receita:', erro);
        return resposta.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
};
    
const atualizarReceita = async (requisicao, resposta) => {
    const { id: id_usuario_logado } = requisicao.usuario;
    const { id: id_receita_a_editar } = requisicao.params;
    const erroValidacao = validarCorpoReceita(requisicao.body);
    if (erroValidacao) {
        return resposta.status(400).json({ mensagem: erroValidacao });
    }
    
    let { titulo, descricao, url_imagem, id_categoria, tempo_preparo_minutos, dificuldade, instrucoes, ingredientes } = requisicao.body;
    if (!url_imagem || url_imagem.trim() === '') {
        url_imagem = IMAGEM_PADRAO;
    }
    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');
        const receitaExistente = await client.query('SELECT * FROM receitas WHERE id_receita = $1 AND id_usuario = $2', [id_receita_a_editar, id_usuario_logado]);
        if (receitaExistente.rows.length === 0) {
            await client.query('ROLLBACK');
            return resposta.status(404).json({ mensagem: 'Receita não encontrada ou não pertence ao usuário.' });
        }
        await client.query('DELETE FROM receitas_ingredientes WHERE id_receita = $1', [id_receita_a_editar]);
        const updateQuery = `
            UPDATE receitas 
            SET titulo = $1, descricao = $2, url_imagem = $3, id_categoria = $4, tempo_preparo_minutos = $5, dificuldade = $6, instrucoes = $7
            WHERE id_receita = $8;
        `;
        await client.query(updateQuery, [titulo.trim(), descricao ? descricao.trim() : '', url_imagem.trim(), id_categoria, tempo_preparo_minutos, dificuldade, instrucoes.trim(), id_receita_a_editar]);
        
        for (const ingrediente of ingredientes) {
            let resultadoIngrediente = await client.query('SELECT id_ingrediente FROM ingredientes WHERE LOWER(nome) = LOWER($1)', [ingrediente.nome.trim()]);
            let id_ingrediente;
            if (resultadoIngrediente.rows.length === 0) {
                const novoIngredienteResult = await client.query('INSERT INTO ingredientes (nome) VALUES ($1) RETURNING id_ingrediente', [ingrediente.nome.trim()]);
                id_ingrediente = novoIngredienteResult.rows[0].id_ingrediente;
            } else {
                id_ingrediente = resultadoIngrediente.rows[0].id_ingrediente;
            }
            const receitaIngredienteQuery = `
                INSERT INTO receitas_ingredientes (id_receita, id_ingrediente, quantidade, unidade_medida)
                VALUES ($1, $2, $3, $4);
            `;
            await client.query(receitaIngredienteQuery, [id_receita_a_editar, id_ingrediente, ingrediente.quantidade, ingrediente.unidade_medida]);
        }
        await client.query('COMMIT');
        return resposta.status(200).json({ mensagem: 'Receita atualizada com sucesso!' });
    } catch (erro) {
        await client.query('ROLLBACK');
        console.error('Erro ao atualizar receita:', erro);
        return resposta.status(500).json({ mensagem: 'Erro interno do servidor.' });
    } finally {
        client.release();
    }
};

const deletarReceita = async (requisicao, resposta) => {
    const { id: id_usuario_logado } = requisicao.usuario;
    const { id: id_receita_a_deletar } = requisicao.params;
    try {
        const resultado = await db.query('DELETE FROM receitas WHERE id_receita = $1 AND id_usuario = $2', [id_receita_a_deletar, id_usuario_logado]);
        if (resultado.rowCount === 0) {
            return resposta.status(404).json({ mensagem: 'Receita não encontrada ou não pertence ao utilizador.' });
        }
        return resposta.status(204).send();
    } catch (erro) {
        console.error('Erro ao deletar receita:', erro);
        return resposta.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
};

const favoritarReceita = async (requisicao, resposta) => {
    const { id: id_usuario } = requisicao.usuario;
    const { id: id_receita } = requisicao.params;
    try {
        const receita = await db.query('SELECT id_receita FROM receitas WHERE id_receita = $1', [id_receita]);
        if (receita.rowCount === 0) {
            return resposta.status(404).json({ mensagem: 'Receita não encontrada.' });
        }
        const favoritoExistente = await db.query('SELECT * FROM favoritos WHERE id_usuario = $1 AND id_receita = $2', [id_usuario, id_receita]);
        if (favoritoExistente.rowCount > 0) {
            return resposta.status(409).json({ mensagem: 'Receita já favoritada por este utilizador.' });
        }
        await db.query('INSERT INTO favoritos (id_usuario, id_receita) VALUES ($1, $2)', [id_usuario, id_receita]);
        return resposta.status(201).json({ mensagem: 'Receita favoritada com sucesso.' });
    } catch (erro) {
        console.error('Erro ao favoritar receita:', erro);
        return resposta.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
};

const desfavoritarReceita = async (requisicao, resposta) => {
    const { id: id_usuario } = requisicao.usuario;
    const { id: id_receita } = requisicao.params;
    try {
        const resultado = await db.query('DELETE FROM favoritos WHERE id_usuario = $1 AND id_receita = $2', [id_usuario, id_receita]);
        if (resultado.rowCount === 0) {
            return resposta.status(404).json({ mensagem: 'Receita não encontrada na lista de favoritos.' });
        }
        return resposta.status(204).send();
    } catch (erro) {
        console.error('Erro ao desfavoritar receita:', erro);
        return resposta.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
};

const listarIngredientes = async (requisicao, resposta) => {
    try {
        const resultado = await db.query('SELECT id_ingrediente, nome FROM ingredientes ORDER BY nome ASC');
        return resposta.status(200).json(resultado.rows);
    } catch (erro) {
        console.error('Erro ao listar ingredientes:', erro);
        return resposta.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
};

const listarCategorias = async (requisicao, resposta) => {
    try {
        const resultado = await db.query('SELECT id_categoria, nome FROM categorias ORDER BY nome ASC');
        return resposta.status(200).json(resultado.rows);
    } catch (erro) {
        console.error('Erro ao listar categorias:', erro);
        return resposta.status(500).json({ mensagem: 'Erro interno ao buscar categorias.' });
    }
};

module.exports = {
    cadastrarReceita,
    listarReceitas,
    detalharReceita,
    atualizarReceita,
    deletarReceita,
    favoritarReceita,
    desfavoritarReceita,
    listarIngredientes,
    listarCategorias,
};