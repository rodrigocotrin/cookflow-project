// Arquivo: backend/src/rotas/uploadRotas.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const verificarLogin = require('../intermediarios/autenticacao');

const rotas = express.Router();

// Garante compatibilidade do diretório de uploads tanto local quanto na Vercel (onde apenas /tmp é gravável)
const uploadDir = process.env.VERCEL
    ? path.join('/tmp', 'uploads')
    : path.join(__dirname, '../../uploads');

try {
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }
} catch (e) {
    console.warn('Aviso: Sistema de arquivos somente leitura ou diretório inacessível:', e.message);
}

// Configuração do armazenamento do Multer com fallback seguro
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        try {
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }
        } catch (err) {}
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `receita-${uniqueSuffix}${ext}`);
    }
});

// Filtro para validar formatos de imagem permitidos
const fileFilter = (req, file, cb) => {
    const tiposPermitidos = /jpeg|jpg|png|webp|gif/;
    const extValida = tiposPermitidos.test(path.extname(file.originalname).toLowerCase());
    const mimeValido = tiposPermitidos.test(file.mimetype);

    if (extValida && mimeValido) {
        cb(null, true);
    } else {
        cb(new Error('Apenas arquivos de imagem (JPEG, JPG, PNG, WEBP, GIF) são permitidos.'));
    }
};

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Limite de 5MB
    fileFilter
});

// Rota protegida para upload de imagem
rotas.post('/upload', verificarLogin, (req, res) => {
    upload.single('imagem')(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ mensagem: 'O arquivo de imagem deve ter no máximo 5MB.' });
            }
            return res.status(400).json({ mensagem: `Erro de upload: ${err.message}` });
        } else if (err) {
            return res.status(400).json({ mensagem: err.message });
        }

        if (!req.file) {
            return res.status(400).json({ mensagem: 'Nenhum arquivo de imagem foi enviado.' });
        }

        const urlImagem = `/uploads/${req.file.filename}`;
        return res.status(201).json({
            mensagem: 'Upload realizado com sucesso!',
            url: urlImagem,
            filename: req.file.filename
        });
    });
});

module.exports = rotas;
