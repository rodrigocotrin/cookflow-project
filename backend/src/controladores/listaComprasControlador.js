// Arquivo: src/controladores/listaComprasControlador.js
const db = require('../config/bd');

const gerarListaDeCompras = async (requisicao, resposta) => {
    const { ids_receitas } = requisicao.body;

    if (!ids_receitas || !Array.isArray(ids_receitas) || ids_receitas.length === 0) {
        return resposta.status(400).json({ mensagem: 'Forneça um array de IDs de receitas.' });
    }

    try {
        const query = `
            SELECT 
                i.nome, 
                ri.quantidade, 
                ri.unidade_medida
            FROM receitas_ingredientes ri
            JOIN ingredientes i ON ri.id_ingrediente = i.id_ingrediente
            WHERE ri.id_receita = ANY($1::int[]);
        `;
        const resultado = await db.query(query, [ids_receitas]);
        const todosIngredientes = resultado.rows;

        const listaConsolidada = new Map();

        for (const ingrediente of todosIngredientes) {
            const chave = `${ingrediente.nome}_${ingrediente.unidade_medida}`;

            // --- CORREÇÃO AQUI ---
            // Converte a quantidade (que vem como texto) para um número de ponto flutuante
            const quantidadeNumerica = parseFloat(ingrediente.quantidade);

            if (listaConsolidada.has(chave)) {
                const itemExistente = listaConsolidada.get(chave);
                // Agora estamos somando NÚMEROS, e não textos
                itemExistente.quantidade += quantidadeNumerica;
            } else {
                listaConsolidada.set(chave, {
                    nome: ingrediente.nome,
                    // Armazena a quantidade já como número
                    quantidade: quantidadeNumerica,
                    unidade_medida: ingrediente.unidade_medida,
                });
            }
        }

        const listaFinal = Array.from(listaConsolidada.values());

        return resposta.status(200).json(listaFinal);

    } catch (erro) {
        console.error('Erro ao gerar lista de compras:', erro);
        return resposta.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
};

module.exports = {
    gerarListaDeCompras,
};