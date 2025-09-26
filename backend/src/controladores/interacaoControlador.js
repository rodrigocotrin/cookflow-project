// Arquivo: src/controladores/interacaoControlador.js
const db = require('../config/bd'); // Verifique o caminho

const avaliarReceita = async (requisicao, resposta) => {
    const { id: id_usuario } = requisicao.usuario;
    const { id: id_receita } = requisicao.params;
    const { nota } = requisicao.body;

    // Valida se a nota foi enviada e está entre 1 e 5
    if (!nota || nota < 1 || nota > 5) {
        return resposta.status(400).json({ mensagem: 'A nota é obrigatória e deve ser um número entre 1 e 5.' });
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

module.exports = {
    avaliarReceita,
};