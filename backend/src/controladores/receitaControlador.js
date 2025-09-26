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

module.exports = {
    cadastrarReceita,
}; 