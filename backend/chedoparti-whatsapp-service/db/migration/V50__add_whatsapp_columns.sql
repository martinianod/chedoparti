-- V50__add_whatsapp_columns.sql
-- Agrega columnas para teléfono y whatsapp_id a la tabla de usuarios.
-- Ajusta el nombre de la tabla si es distinto en tu user-service.

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS phone VARCHAR(30),
    ADD COLUMN IF NOT EXISTS whatsapp_id VARCHAR(50);

CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_whatsapp_id ON users(whatsapp_id);
