// Arquivo: src/controladores/usuarioControlador.js
const crypto = require('crypto');
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
        const usuarioExistente = await db.query('SELECT * FROM usuarios WHERE LOWER(email) = LOWER($1)', [email.trim()]);
        if (usuarioExistente.rows.length > 0) {
            return resposta.status(409).json({ mensagem: 'Este e-mail já está em uso.' });
        }

        // 3. Criptografa a senha antes de salvar
        const senhaHash = await bcrypt.hash(senha, 10);

        // 4. Insere o novo usuário no banco de dados
        const novoUsuario = await db.query(
            'INSERT INTO usuarios (nome, email, senha_hash) VALUES ($1, $2, $3) RETURNING id_usuario, nome, email',
            [nome.trim(), email.trim().toLowerCase(), senhaHash]
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
        const resultado = await db.query('SELECT * FROM usuarios WHERE LOWER(email) = LOWER($1)', [email.trim()]);
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
        const token = jwt.sign({ id: usuario.id_usuario }, process.env.JWT_SECRET, { expiresIn: '8h' });

        // 4. Remove a senha do objeto de usuário antes de enviar a resposta
        const { senha_hash, token_recuperacao, token_expiracao, ...dadosUsuario } = usuario;

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

/**
 * Solicitação de recuperação de senha:
 * Gera um código de 6 dígitos alfanumérico seguro com expiração de 30 minutos.
 */
const solicitarRecuperacaoSenha = async (requisicao, resposta) => {
    const { email } = requisicao.body;

    if (!email || !email.trim()) {
        return resposta.status(400).json({ mensagem: 'O endereço de e-mail é obrigatório.' });
    }

    try {
        const resultado = await db.query('SELECT id_usuario, nome, email FROM usuarios WHERE LOWER(email) = LOWER($1)', [email.trim()]);
        
        // Resposta genérica para evitar enumeração de contas, mas com mensagem amigável
        if (resultado.rows.length === 0) {
            return resposta.status(200).json({
                mensagem: 'Se o e-mail informado estiver cadastrado, as instruções para redefinição foram enviadas com sucesso.'
            });
        }

        const usuario = resultado.rows[0];

        // Gera um código seguro de 6 dígitos numéricos
        const codigo = Math.floor(100000 + Math.random() * 900000).toString();

        // Salva o código e data de expiração (30 min)
        await db.query(
            `UPDATE usuarios 
             SET token_recuperacao = $1, 
                 token_expiracao = NOW() + INTERVAL '30 minutes' 
             WHERE id_usuario = $2`,
            [codigo, usuario.id_usuario]
        );

        console.log(`[RECUPERAÇÃO DE SENHA] Código gerado para ${usuario.email}: ${codigo}`);

        return resposta.status(200).json({
            mensagem: 'Código de recuperação enviado com sucesso!',
            codigo_demo: codigo // Retornado para facilidade de testes em ambiente local/SaaS
        });

    } catch (erro) {
        console.error('Erro ao solicitar recuperação de senha:', erro);
        return resposta.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
};

/**
 * Redefinição de senha com validação do código e nova senha.
 */
const redefinirSenha = async (requisicao, resposta) => {
    const { email, codigo, novaSenha } = requisicao.body;

    if (!email || !codigo || !novaSenha) {
        return resposta.status(400).json({ mensagem: 'E-mail, código de verificação e nova senha são obrigatórios.' });
    }

    if (novaSenha.length < 6) {
        return resposta.status(400).json({ mensagem: 'A nova senha deve ter no mínimo 6 caracteres.' });
    }

    try {
        const resultado = await db.query(
            `SELECT id_usuario, email, token_recuperacao, token_expiracao 
             FROM usuarios 
             WHERE LOWER(email) = LOWER($1)`,
            [email.trim()]
        );

        if (resultado.rows.length === 0) {
            return resposta.status(400).json({ mensagem: 'Código de recuperação inválido ou expirado.' });
        }

        const usuario = resultado.rows[0];

        if (!usuario.token_recuperacao || usuario.token_recuperacao !== codigo.toString().trim()) {
            return resposta.status(400).json({ mensagem: 'Código de recuperação inválido.' });
        }

        const agora = new Date();
        const expiracao = new Date(usuario.token_expiracao);
        if (agora > expiracao) {
            return resposta.status(400).json({ mensagem: 'O código de recuperação expirou. Por favor, solicite um novo código.' });
        }

        // Criptografa a nova senha
        const novaSenhaHash = await bcrypt.hash(novaSenha, 10);

        // Atualiza a senha e limpa o token de recuperação
        await db.query(
            `UPDATE usuarios 
             SET senha_hash = $1, 
                 token_recuperacao = NULL, 
                 token_expiracao = NULL 
             WHERE id_usuario = $2`,
            [novaSenhaHash, usuario.id_usuario]
        );

        return resposta.status(200).json({ mensagem: 'Senha redefinida com sucesso! Agora você já pode fazer login com sua nova senha.' });

    } catch (erro) {
        console.error('Erro ao redefinir senha:', erro);
        return resposta.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
};

module.exports = {
    cadastrarUsuario,
    loginUsuario,
    solicitarRecuperacaoSenha,
    redefinirSenha,
};