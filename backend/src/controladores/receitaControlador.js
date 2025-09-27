// Arquivo: src/controladores/receitaControlador.js
const db = require('../config/bd');

const cadastrarReceita = async (requisicao, resposta) => {
    // O ID do usuário vem do nosso middleware de autenticação, que o adicionou ao objeto 'requisicao'
    const { id: id_usuario } = requisicao.usuario;
    const { titulo, descricao, id_categoria, tempo_preparo_minutos, dificuldade, instrucoes, ingredientes } = requisicao.body;

    // Validação de entrada
    if (!titulo || !id_categoria || !tempo_preparo_minutos || !dificuldade || !instrucoes || !ingredientes || ingredientes.length === 0) {
        return resposta.status(400).json({ mensagem: 'Todos os campos obrigatórios devem ser fornecidos.' });
    }

    const client = await db.pool.connect(); // Pega um cliente do pool de conexões

    try {
        // Inicia a transação
        await client.query('BEGIN');

        // 1. Insere a receita na tabela 'receitas'
        const receitaQuery = `
            INSERT INTO receitas (id_usuario, id_categoria, titulo, descricao, tempo_preparo_minutos, dificuldade, instrucoes)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id_receita;
        `;
        const receitaValores = [id_usuario, id_categoria, titulo, descricao, tempo_preparo_minutos, dificuldade, instrucoes];
        const resultadoReceita = await client.query(receitaQuery, receitaValores);
        const id_receita = resultadoReceita.rows[0].id_receita;

        // 2. Itera sobre os ingredientes para inseri-los
        for (const ingrediente of ingredientes) {
            // Verifica se o ingrediente já existe na tabela 'ingredientes'
            let resultadoIngrediente = await client.query('SELECT id_ingrediente FROM ingredientes WHERE nome = $1', [ingrediente.nome]);
            let id_ingrediente;

            if (resultadoIngrediente.rows.length === 0) {
                // Se não existe, insere e pega o novo ID
                const novoIngredienteResult = await client.query('INSERT INTO ingredientes (nome) VALUES ($1) RETURNING id_ingrediente', [ingrediente.nome]);
                id_ingrediente = novoIngredienteResult.rows[0].id_ingrediente;
            } else {
                // Se já existe, apenas pega o ID
                id_ingrediente = resultadoIngrediente.rows[0].id_ingrediente;
            }

            // 3. Associa o ingrediente à receita na tabela 'receitas_ingredientes'
            const receitaIngredienteQuery = `
                INSERT INTO receitas_ingredientes (id_receita, id_ingrediente, quantidade, unidade_medida)
                VALUES ($1, $2, $3, $4);
            `;
            const receitaIngredienteValores = [id_receita, id_ingrediente, ingrediente.quantidade, ingrediente.unidade_medida];
            await client.query(receitaIngredienteQuery, receitaIngredienteValores);
        }

        // Se tudo deu certo, commita a transação
        await client.query('COMMIT');

        // Retorna uma resposta de sucesso
        return resposta.status(201).json({ id_receita, titulo, mensagem: 'Receita cadastrada com sucesso!' });

    } catch (erro) {
        // Se algo deu errado, desfaz todas as operações (rollback)
        await client.query('ROLLBACK');
        console.error('Erro ao cadastrar receita:', erro);
        return resposta.status(500).json({ mensagem: 'Erro interno do servidor.' });
    } finally {
        // Libera o cliente de volta para o pool, independentemente do resultado
        client.release();
    }
};

const listarReceitas = async (requisicao, resposta) => {
    // Pega os parâmetros de consulta da URL
    const { busca, categoria, dificuldade } = requisicao.query;

    try {
        let queryBase = `
            SELECT 
                r.id_receita, 
                r.titulo, 
                r.descricao, 
                r.dificuldade, 
                c.nome AS nome_categoria,
                u.nome AS nome_usuario
            FROM receitas r
            JOIN usuarios u ON r.id_usuario = u.id_usuario
            JOIN categorias c ON r.id_categoria = c.id_categoria
        `;

        const condicoes = [];
        const valores = [];
        let contadorParam = 1;

        if (busca) {
            // Busca por título da receita OU por nome de ingrediente
            condicoes.push(`(r.titulo ILIKE $${contadorParam} OR r.id_receita IN (
                SELECT ri.id_receita FROM receitas_ingredientes ri
                JOIN ingredientes i ON ri.id_ingrediente = i.id_ingrediente
                WHERE i.nome ILIKE $${contadorParam}
            ))`);
            valores.push(`%${busca}%`);
            contadorParam++;
        }

        if (categoria) {
            condicoes.push(`r.id_categoria = $${contadorParam}`);
            valores.push(categoria);
            contadorParam++;
        }

        if (dificuldade) {
            condicoes.push(`r.dificuldade = $${contadorParam}`);
            valores.push(dificuldade);
            contadorParam++;
        }

        // Se houver condições, adiciona a cláusula WHERE
        if (condicoes.length > 0) {
            queryBase += ` WHERE ${condicoes.join(' AND ')}`;
        }

        queryBase += ';';

        const resultado = await db.query(queryBase, valores);

        return resposta.status(200).json(resultado.rows);

    } catch (erro) {
        console.error('Erro ao listar receitas:', erro);
        return resposta.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
};

const detalharReceita = async (requisicao, resposta) => {
    const { id } = requisicao.params;

    try {
        // 1. Consulta principal para buscar os detalhes da receita
        const receitaQuery = `
            SELECT 
                r.id_receita, r.titulo, r.descricao, r.instrucoes, r.dificuldade, 
                r.tempo_preparo_minutos, c.nome AS nome_categoria, u.nome AS nome_usuario
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

        // 2. Consulta para buscar os ingredientes daquela receita
        const ingredientesQuery = `
            SELECT 
                i.nome, ri.quantidade, ri.unidade_medida
            FROM receitas_ingredientes ri
            JOIN ingredientes i ON ri.id_ingrediente = i.id_ingrediente
            WHERE ri.id_receita = $1;
        `;
        const resultadoIngredientes = await db.query(ingredientesQuery, [id]);
        receita.ingredientes = resultadoIngredientes.rows;

        // --- NOVA LÓGICA PARA CÁLCULO DA MÉDIA ---
        // 3. Consulta para calcular a média e o total de avaliações
        const avaliacaoQuery = `
            SELECT 
                COALESCE(AVG(nota), 0) AS media_avaliacoes, 
                COUNT(nota) AS total_avaliacoes 
            FROM avaliacoes 
            WHERE id_receita = $1;
        `;
        const resultadoAvaliacao = await db.query(avaliacaoQuery, [id]);
        
        // Formata a média para ter apenas uma casa decimal
        receita.media_avaliacoes = parseFloat(resultadoAvaliacao.rows[0].media_avaliacoes).toFixed(1);
        receita.total_avaliacoes = parseInt(resultadoAvaliacao.rows[0].total_avaliacoes, 10);
        // ------------------------------------------

        // 4. Retorna o objeto completo da receita
        return resposta.status(200).json(receita);

    } catch (erro) {
        console.error('Erro ao detalhar receita:', erro);
        return resposta.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
};

// --- NOVA FUNÇÃO PARA ATUALIZAR UMA RECEITA ---
const atualizarReceita = async (requisicao, resposta) => {
    const { id: id_usuario_logado } = requisicao.usuario;
    const { id: id_receita_a_editar } = requisicao.params;
    const { titulo, descricao, id_categoria, tempo_preparo_minutos, dificuldade, instrucoes, ingredientes } = requisicao.body;

    // Validação de entrada
    if (!titulo || !id_categoria || !tempo_preparo_minutos || !dificuldade || !instrucoes || !ingredientes || ingredientes.length === 0) {
        return resposta.status(400).json({ mensagem: 'Todos os campos obrigatórios devem ser fornecidos.' });
    }

    const client = await db.pool.connect();

    try {
        await client.query('BEGIN');

        // 1. Verifica se a receita existe e se pertence ao usuário logado
        const receitaExistente = await client.query('SELECT * FROM receitas WHERE id_receita = $1 AND id_usuario = $2', [id_receita_a_editar, id_usuario_logado]);
        if (receitaExistente.rows.length === 0) {
            await client.query('ROLLBACK');
            return resposta.status(404).json({ mensagem: 'Receita não encontrada ou não pertence ao usuário.' });
        }

        // 2. Deleta os ingredientes antigos da receita na tabela de associação
        await client.query('DELETE FROM receitas_ingredientes WHERE id_receita = $1', [id_receita_a_editar]);

        // 3. Atualiza os dados principais na tabela 'receitas'
        const updateQuery = `
            UPDATE receitas 
            SET titulo = $1, descricao = $2, id_categoria = $3, tempo_preparo_minutos = $4, dificuldade = $5, instrucoes = $6
            WHERE id_receita = $7;
        `;
        await client.query(updateQuery, [titulo, descricao, id_categoria, tempo_preparo_minutos, dificuldade, instrucoes, id_receita_a_editar]);

        // 4. Re-insere os ingredientes (lógica idêntica à de criação)
        for (const ingrediente of ingredientes) {
            let resultadoIngrediente = await client.query('SELECT id_ingrediente FROM ingredientes WHERE nome = $1', [ingrediente.nome]);
            let id_ingrediente;

            if (resultadoIngrediente.rows.length === 0) {
                const novoIngredienteResult = await client.query('INSERT INTO ingredientes (nome) VALUES ($1) RETURNING id_ingrediente', [ingrediente.nome]);
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

// --- NOVA FUNÇÃO PARA DELETAR UMA RECEITA ---
const deletarReceita = async (requisicao, resposta) => {
    const { id: id_usuario_logado } = requisicao.usuario;
    const { id: id_receita_a_deletar } = requisicao.params;

    try {
        // 1. Verifica se a receita existe e se pertence ao usuário logado antes de deletar
        const resultado = await db.query('DELETE FROM receitas WHERE id_receita = $1 AND id_usuario = $2 RETURNING *', [id_receita_a_deletar, id_usuario_logado]);

        // 2. Se o 'rowCount' for 0, significa que nenhuma linha foi deletada
        // Isso acontece se a receita não existe ou não pertence ao usuário.
        if (resultado.rowCount === 0) {
            return resposta.status(404).json({ mensagem: 'Receita não encontrada ou não pertence ao usuário.' });
        }

        // 3. Retorna uma resposta de sucesso sem conteúdo no corpo.
        return resposta.status(204).send();

    } catch (erro) {
        console.error('Erro ao deletar receita:', erro);
        return resposta.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
};


// --- NOVA FUNÇÃO PARA FAVORITAR UMA RECEITA ---
const favoritarReceita = async (requisicao, resposta) => {
    const { id: id_usuario } = requisicao.usuario;
    const { id: id_receita } = requisicao.params;

    try {
        // Verifica se a receita existe
        const receita = await db.query('SELECT id_receita FROM receitas WHERE id_receita = $1', [id_receita]);
        if (receita.rowCount === 0) {
            return resposta.status(404).json({ mensagem: 'Receita não encontrada.' });
        }

        // Verifica se a receita já não foi favoritada pelo usuário
        const favoritoExistente = await db.query('SELECT * FROM favoritos WHERE id_usuario = $1 AND id_receita = $2', [id_usuario, id_receita]);
        if (favoritoExistente.rowCount > 0) {
            return resposta.status(409).json({ mensagem: 'Receita já favoritada por este usuário.' });
        }

        // Insere o registro na tabela de favoritos
        await db.query('INSERT INTO favoritos (id_usuario, id_receita) VALUES ($1, $2)', [id_usuario, id_receita]);

        return resposta.status(201).json({ mensagem: 'Receita favoritada com sucesso.' });

    } catch (erro) {
        console.error('Erro ao favoritar receita:', erro);
        return resposta.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
};

// --- NOVA FUNÇÃO PARA DESFAVORITAR UMA RECEITA ---
const desfavoritarReceita = async (requisicao, resposta) => {
    const { id: id_usuario } = requisicao.usuario;
    const { id: id_receita } = requisicao.params;

    try {
        // Tenta deletar o registro da tabela de favoritos
        const resultado = await db.query('DELETE FROM favoritos WHERE id_usuario = $1 AND id_receita = $2', [id_usuario, id_receita]);

        // Se rowCount for 0, o favorito não existia
        if (resultado.rowCount === 0) {
            return resposta.status(404).json({ mensagem: 'Receita não encontrada na lista de favoritos.' });
        }

        return resposta.status(204).send(); // Sucesso, sem conteúdo

    } catch (erro) {
        console.error('Erro ao desfavoritar receita:', erro);
        return resposta.status(500).json({ mensagem: 'Erro interno do servidor.' });
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
};


