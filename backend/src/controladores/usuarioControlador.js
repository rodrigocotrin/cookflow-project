// Arquivo: src/controladores/usuarioControlador.js
const bcrypt = require('bcrypt');
const db = require('../config/bd'); 

const cadastrarUsuario = async (requisicao, resposta) => {
    const { nome, email, senha } = requisicao.body;

    // 1. Validação básica de entrada
    if (!nome || !email || !senha) {
        return resposta.status(400).json({ mensagem: 'Todos os campos são obrigatórios.' });
    }

    try {
        // 2. Verifica se o e-mail já existe no banco
        const usuarioExistente = await db.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        if (usuarioExistente.rows.length > 0) {
            return resposta.status(409).json({ mensagem: 'Este e-mail já está em uso.' });
        }

        // 3. Criptografa a senha antes de salvar
        // O segundo argumento (10) é o "custo" do hash, um bom padrão de segurança.
        const senhaHash = await bcrypt.hash(senha, 10);

        // 4. Insere o novo usuário no banco de dados
        const novoUsuario = await db.query(
            'INSERT INTO usuarios (nome, email, senha_hash) VALUES ($1, $2, $3) RETURNING id_usuario, nome, email',
            [nome, email, senhaHash]
        );

        // 5. Retorna uma resposta de sucesso com os dados do usuário criado (sem a senha)
        return resposta.status(201).json(novoUsuario.rows[0]);

    } catch (erro) {
        console.error('Erro no cadastro do usuário:', erro);
        return resposta.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
};

module.exports = {
    cadastrarUsuario,
};