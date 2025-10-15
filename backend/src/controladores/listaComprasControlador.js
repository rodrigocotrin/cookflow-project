// Arquivo: backend/src/controladores/listaComprasControlador.js
const db = require('../config/bd');

/**
 * NOVO: Lista as receitas que o usuário pode selecionar para o planejador.
 * Inclui as receitas criadas pelo usuário e as que ele favoritou.
 */
const listarReceitasParaPlanejador = async (requisicao, resposta) => {
    const { id: id_usuario } = requisicao.usuario;

    try {
        // A query que busca as receitas, agora com a URL da imagem.
        const query = `
            SELECT DISTINCT
                r.id_receita,
                r.titulo,
                r.url_imagem
            FROM
                receitas r
            LEFT JOIN
                favoritos f ON r.id_receita = f.id_receita
            WHERE
                r.id_usuario = $1 OR f.id_usuario = $1
            ORDER BY
                r.titulo ASC;
        `;
        const resultado = await db.query(query, [id_usuario]);

        // Mapeamento para garantir a consistência dos dados enviados ao frontend
        const receitas = resultado.rows.map(r => ({
            id_receita: r.id_receita,
            titulo: r.titulo,
            url_imagem: r.url_imagem || null,
        }));
        
        return resposta.status(200).json(receitas);
    } catch (erro) {
        console.error('Erro ao listar receitas para o planejador:', erro);
        return resposta.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
};

/**
 * Gera a lista de compras consolidada a partir dos IDs das receitas selecionadas.
 */
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
                ri.unidade_medida,
                r.titulo AS receita_origem
            FROM receitas_ingredientes ri
            JOIN ingredientes i ON ri.id_ingrediente = i.id_ingrediente
            JOIN receitas r ON ri.id_receita = r.id_receita
            WHERE ri.id_receita = ANY($1::int[]);
        `;
        const resultado = await db.query(query, [ids_receitas]);
        const listaConsolidada = new Map();

        for (const ingrediente of resultado.rows) {
            const qtd = parseFloat(ingrediente.quantidade);
            const chave = `${ingrediente.nome}_${ingrediente.unidade_medida}`;
            const fonte = { receita: ingrediente.receita_origem, quantidade: qtd };

            if (listaConsolidada.has(chave)) {
                const item = listaConsolidada.get(chave);
                item.quantidade_total += qtd;
                item.fontes.push(fonte);
            } else {
                listaConsolidada.set(chave, {
                    nome: ingrediente.nome,
                    unidade_medida: ingrediente.unidade_medida,
                    quantidade_total: qtd,
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
    listarReceitasParaPlanejador, // Exportando a nova função
    gerarListaDeCompras,
};