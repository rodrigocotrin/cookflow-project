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
    try {
        // Consulta que busca todas as receitas e junta com os nomes dos usuários e categorias
        const query = `
            SELECT 
                r.id_receita, 
                r.titulo, 
                r.descricao, 
                r.dificuldade, 
                r.tempo_preparo_minutos,
                c.nome AS nome_categoria,
                u.nome AS nome_usuario
            FROM receitas r
            JOIN usuarios u ON r.id_usuario = u.id_usuario
            JOIN categorias c ON r.id_categoria = c.id_categoria;
        `;

        const resultado = await db.query(query);

        // Retorna a lista de receitas encontradas
        return resposta.status(200).json(resultado.rows);

    } catch (erro) {
        console.error('Erro ao listar receitas:', erro);
        return resposta.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
};

const detalharReceita = async (requisicao, resposta) => {
    // O :id na URL é acessado via 'requisicao.params'
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

        // Se a receita não for encontrada, retorna erro 404
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

        // 3. Adiciona a lista de ingredientes ao objeto da receita
        receita.ingredientes = resultadoIngredientes.rows;

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

module.exports = {
    cadastrarReceita,
    listarReceitas,
    detalharReceita,
    atualizarReceita, 
};

