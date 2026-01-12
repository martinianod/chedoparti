CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Insert demo user (password: demo123)
INSERT INTO users (email, password, name, phone) VALUES 
('demo@chedoparti.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.9p.i7BfqUvzp0SHO0kjqE2Zt1KQxRKW', 'Demo User', '+5491112345678')
ON CONFLICT (email) DO NOTHING;
