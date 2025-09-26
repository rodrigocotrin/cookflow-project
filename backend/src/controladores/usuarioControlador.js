// Arquivo: src/controladores/usuarioControlador.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
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

const loginUsuario = async (requisicao, resposta) => {
    const { email, senha } = requisicao.body;

    if (!email || !senha) {
        return resposta.status(400).json({ mensagem: 'E-mail e senha são obrigatórios.' });
    }

    try {
        // 1. Busca o usuário no banco de dados pelo e-mail
        const resultado = await db.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        const usuario = resultado.rows[0];

        if (!usuario) {
            return resposta.status(404).json({ mensagem: 'Usuário ou senha inválidos.' });
        }

        // 2. Compara a senha enviada com a senha criptografada no banco
        const senhaCorreta = await bcrypt.compare(senha, usuario.senha_hash);

        if (!senhaCorreta) {
            return resposta.status(401).json({ mensagem: 'Usuário ou senha inválidos.' });
        }

        // 3. Se a senha estiver correta, gera o token JWT
        // O token irá conter o ID do usuário e expirar em 8 horas.
        const token = jwt.sign({ id: usuario.id_usuario }, process.env.JWT_SECRET, { expiresIn: '8h' });

        // 4. Remove a senha do objeto de usuário antes de enviar a resposta
        const { senha_hash, ...dadosUsuario } = usuario;

        // 5. Retorna os dados do usuário e o token
        return resposta.status(200).json({
            usuario: dadosUsuario,
            token
        });

    } catch (erro) {
        console.error('Erro no login:', erro);
        return resposta.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
};

module.exports = {
    cadastrarUsuario,
     loginUsuario,
};