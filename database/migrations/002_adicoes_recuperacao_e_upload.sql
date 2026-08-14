-- CookFlow - Migration 002: Adiciona colunas para recuperação de senha
-- Permite que usuários solicitem redefinição de senha com token de expiração.

ALTER TABLE usuarios 
ADD COLUMN IF NOT EXISTS token_recuperacao VARCHAR(255),
ADD COLUMN IF NOT EXISTS token_expiracao TIMESTAMP WITH TIME ZONE;

-- Índice para acelerar busca por token de recuperação
CREATE INDEX IF NOT EXISTS idx_usuarios_token_recuperacao ON usuarios(token_recuperacao);
