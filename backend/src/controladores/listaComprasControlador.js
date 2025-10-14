// Arquivo: src/controladores/listaComprasControlador.js
const db = require('../config/bd');

const gerarListaDeCompras = async (requisicao, resposta) => {
    const { ids_receitas } = requisicao.body;

    if (!ids_receitas || !Array.isArray(ids_receitas) || ids_receitas.length === 0) {
        return resposta.status(400).json({ mensagem: 'Forneça um array de IDs de receitas.' });
    }

    try {
        // A query agora também busca o título da receita de origem
        const query = `
            SELECT 
                i.nome, 
                ri.quantidade, 
                ri.unidade_medida,
                r.titulo AS receita_origem
            FROM receitas_ingredientes ri
            JOIN ingredientes i ON ri.id_ingrediente = i.id_ingrediente
            JOIN receitas r ON ri.id_receita = r.id_receita
            WHERE ri.id_receita = ANY($1::int[]);
        `;
        const resultado = await db.query(query, [ids_receitas]);
        const todosIngredientes = resultado.rows;

        const listaConsolidada = new Map();

        for (const ingrediente of todosIngredientes) {
            const quantidadeNumerica = parseFloat(ingrediente.quantidade);
            const chave = `${ingrediente.nome}_${ingrediente.unidade_medida}`;

            const fonte = {
                receita: ingrediente.receita_origem,
                quantidade: quantidadeNumerica,
            };

            if (listaConsolidada.has(chave)) {
                const itemExistente = listaConsolidada.get(chave);
                itemExistente.quantidade_total += quantidadeNumerica;
                itemExistente.fontes.push(fonte);
            } else {
                listaConsolidada.set(chave, {
                    nome: ingrediente.nome,
                    unidade_medida: ingrediente.unidade_medida,
                    quantidade_total: quantidadeNumerica,
                    fontes: [fonte],
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