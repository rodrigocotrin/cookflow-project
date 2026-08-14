// Arquivo: backend/src/servidor.js (VERSÃO FINAL CORRIGIDA)
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Importações das rotas
const usuarioRotas = require('./rotas/usuarioRotas');
const receitaRotas = require('./rotas/receitaRotas');
const perfilRotas = require('./rotas/perfilRotas');
const interacaoRotas = require('./rotas/interacaoRotas');
const listaComprasRotas = require('./rotas/listaComprasRotas');
const uploadRotas = require('./rotas/uploadRotas');

const app = express();

// --- Configuração de CORS Universal e Pré-flight Completo ---
const corsOptions = {
    origin: (origin, callback) => {
        // Permite qualquer origem da aplicação, subdomínios, Vercel e chamadas de API
        callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    optionsSuccessStatus: 200
};

// --- Middlewares Globais ---
app.use(cors(corsOptions));
app.use(express.json());

// Garante cabeçalhos CORS em todas as respostas, inclusive em erros
app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS,PATCH');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
    }
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    next();
});

// --- Servir Arquivos Estáticos de Uploads ---
const uploadDirStatic = process.env.VERCEL
    ? path.join('/tmp', 'uploads')
    : path.join(__dirname, '../uploads');
app.use('/uploads', express.static(uploadDirStatic));

// --- Rotas Públicas de Verificação de Saúde e Diagnóstico ---
app.get('/', (requisicao, resposta) => {
    resposta.json({
        status: 'online',
        mensagem: 'Bem-vindo à API do CookFlow!',
    });
});

app.get('/api', (requisicao, resposta) => {
    resposta.json({ mensagem: 'API do CookFlow está funcionando corretamente!' });
});

app.get('/api/status-banco', async (requisicao, resposta) => {
    const varsEncontradas = {
        POSTGRES_URL: Boolean(process.env.POSTGRES_URL),
        DATABASE_URL: Boolean(process.env.DATABASE_URL),
        POSTGRES_PRISMA_URL: Boolean(process.env.POSTGRES_PRISMA_URL),
        POSTGRES_URL_NON_POOLING: Boolean(process.env.POSTGRES_URL_NON_POOLING),
        DB_HOST: process.env.DB_HOST || 'não definido',
        NODE_ENV: process.env.NODE_ENV || 'não definido',
        VERCEL: Boolean(process.env.VERCEL)
    };

    try {
        const db = require('./config/bd');
        const res = await db.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
        const tabelas = res.rows.map(r => r.table_name);
        
        let contagemReceitas = 0;
        if (tabelas.includes('receitas')) {
            const rCount = await db.query("SELECT COUNT(*) FROM receitas");
            contagemReceitas = parseInt(rCount.rows[0].count, 10);
        }

        return resposta.status(200).json({
            banco_conectado: true,
            total_tabelas: tabelas.length,
            tabelas_existentes: tabelas,
            total_receitas: contagemReceitas,
            variaveis_de_ambiente: varsEncontradas
        });
    } catch (erro) {
        console.error('Erro no diagnóstico de banco:', erro);
        return resposta.status(200).json({
            banco_conectado: false,
            mensagem: 'Não foi possível conectar ao banco de dados.',
            erro_detalhado: erro.message,
            codigo_erro: erro.code,
            variaveis_de_ambiente: varsEncontradas,
            solucao: (!varsEncontradas.POSTGRES_URL && !varsEncontradas.DATABASE_URL)
                ? 'Nenhuma URL de conexão (POSTGRES_URL ou DATABASE_URL) foi encontrada nas Environment Variables da Vercel. Adicione a connection string do Neon nas configurações do projeto na Vercel.'
                : 'A URL de conexão foi encontrada, mas o banco recusou a conexão. Verifique no Neon se a senha está correta ou se o banco está ativo.'
        });
    }
});

// --- Registro das Rotas da Aplicação ---
app.use('/api', usuarioRotas);
app.use('/api', receitaRotas);
app.use('/api', perfilRotas);
app.use('/api', interacaoRotas);
app.use('/api', uploadRotas);
app.use('/api/lista-de-compras', listaComprasRotas);

// Middleware Global de Tratamento de Erros
app.use((err, req, res, next) => {
    console.error('Erro na requisição:', err);
    res.status(err.status || 500).json({
        mensagem: err.message || 'Erro interno no servidor.',
        erro: process.env.NODE_ENV === 'production' ? undefined : err.stack
    });
});

// Inicializa o servidor localmente apenas fora da Vercel
if (!process.env.VERCEL && process.env.NODE_ENV !== 'test') {
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
        console.log(`🚀 Servidor CookFlow rodando com sucesso na porta ${PORT}`);
    });
}

// Exporta a instância do app para a Vercel
module.exports = app;
