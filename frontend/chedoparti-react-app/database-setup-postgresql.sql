-- ========================================
-- CHEDOPARTI DATABASE SETUP SCRIPT (PostgreSQL/SQL Server Compatible)
-- Creación de tablas e inserción de datos de prueba
-- ========================================

-- ========================================
-- 1. TABLA USERS
-- ========================================
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    avatar VARCHAR(500),
    phone VARCHAR(20),
    role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ========================================
-- 2. TABLA COURTS
-- ========================================
CREATE TABLE courts (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    sport VARCHAR(20) NOT NULL CHECK (sport IN ('Padel', 'Tenis', 'Fútbol', 'Basquet')),
    type VARCHAR(50),
    indoor BOOLEAN DEFAULT FALSE,
    lights BOOLEAN NOT NULL DEFAULT FALSE,
    surface VARCHAR(100) NOT NULL,
    surface_type VARCHAR(50),
    glass_type VARCHAR(50), -- Para Padel
    size VARCHAR(50), -- Para Fútbol
    hoops VARCHAR(10), -- Para Basquet
    scoreboard BOOLEAN DEFAULT FALSE, -- Para Basquet
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_courts_sport ON courts(sport);
CREATE INDEX idx_courts_active ON courts(active);

-- ========================================
-- 3. TABLA RESERVATIONS
-- ========================================
CREATE TABLE reservations (
    id BIGSERIAL PRIMARY KEY,
    court_id BIGINT NOT NULL REFERENCES courts(id) ON DELETE CASCADE,
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    user_phone VARCHAR(20),
    user_name VARCHAR(100),
    start_at TIMESTAMP NOT NULL,
    end_at TIMESTAMP NOT NULL,
    price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('confirmed', 'cancelled', 'pending')),
    type VARCHAR(20) NOT NULL DEFAULT 'Normal' CHECK (type IN ('Normal', 'Fijo', 'Torneo', 'Invitado')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_reservations_court ON reservations(court_id);
CREATE INDEX idx_reservations_user ON reservations(user_id);
CREATE INDEX idx_reservations_date ON reservations(start_at);
CREATE INDEX idx_reservations_status ON reservations(status);

-- ========================================
-- 4. TABLA TOURNAMENTS
-- ========================================
CREATE TABLE tournaments (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    sport VARCHAR(20) NOT NULL CHECK (sport IN ('Padel', 'Tenis', 'Fútbol', 'Basquet')),
    category VARCHAR(50),
    gender VARCHAR(20) NOT NULL CHECK (gender IN ('Hombres', 'Mujeres', 'Mixto')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    inscription_status VARCHAR(20) NOT NULL DEFAULT 'Abierta' CHECK (inscription_status IN ('Abierta', 'Cerrada', 'Finalizada')),
    tournament_status VARCHAR(20) NOT NULL DEFAULT 'Programado' CHECK (tournament_status IN ('Programado', 'En Curso', 'Finalizado', 'Cancelado')),
    max_participants INTEGER NOT NULL,
    current_participants INTEGER NOT NULL DEFAULT 0,
    entry_fee DECIMAL(10,2) DEFAULT 0.00,
    prize_pool DECIMAL(10,2),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_tournaments_sport ON tournaments(sport);
CREATE INDEX idx_tournaments_status ON tournaments(tournament_status);
CREATE INDEX idx_tournaments_date ON tournaments(start_date);

-- ========================================
-- 5. TABLA COURT_SCHEDULES
-- ========================================
CREATE TABLE court_schedules (
    id BIGSERIAL PRIMARY KEY,
    court_id BIGINT NOT NULL REFERENCES courts(id) ON DELETE CASCADE,
    day_of_week VARCHAR(20) NOT NULL CHECK (day_of_week IN ('lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo')),
    open_time TIME NOT NULL,
    close_time TIME NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(court_id, day_of_week)
);
CREATE INDEX idx_schedules_court ON court_schedules(court_id);

-- ========================================
-- 6. TABLA HOLIDAY_SCHEDULES
-- ========================================
CREATE TABLE holiday_schedules (
    id BIGSERIAL PRIMARY KEY,
    court_id BIGINT REFERENCES courts(id) ON DELETE CASCADE, -- NULL = aplicar a todas las canchas
    date DATE NOT NULL,
    name VARCHAR(100) NOT NULL,
    open_time TIME,
    close_time TIME,
    closed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_holiday_schedules_date ON holiday_schedules(date);
CREATE INDEX idx_holiday_schedules_court ON holiday_schedules(court_id);

-- ========================================
-- 7. TABLA PRICING_RULES
-- ========================================
CREATE TABLE pricing_rules (
    id BIGSERIAL PRIMARY KEY,
    court_id BIGINT REFERENCES courts(id) ON DELETE CASCADE, -- NULL = aplicar a todas las canchas
    days_of_week JSONB NOT NULL, -- Para PostgreSQL usar JSONB, para SQL Server usar NVARCHAR(MAX)
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    price_type VARCHAR(50) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_pricing_rules_court ON pricing_rules(court_id);
CREATE INDEX idx_pricing_rules_active ON pricing_rules(active);

-- ========================================
-- 8. TABLA HOLIDAY_PRICING
-- ========================================
CREATE TABLE holiday_pricing (
    id BIGSERIAL PRIMARY KEY,
    court_id BIGINT REFERENCES courts(id) ON DELETE CASCADE, -- NULL = aplicar a todas las canchas
    date DATE NOT NULL,
    name VARCHAR(100) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_holiday_pricing_date ON holiday_pricing(date);
CREATE INDEX idx_holiday_pricing_court ON holiday_pricing(court_id);

-- ========================================
-- 9. TABLA STATS_MONTHLY
-- ========================================
CREATE TABLE stats_monthly (
    id BIGSERIAL PRIMARY KEY,
    month VARCHAR(20) NOT NULL,
    year INTEGER NOT NULL,
    reservations_count INTEGER NOT NULL DEFAULT 0,
    revenue DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    court_usage DECIMAL(5,2) NOT NULL DEFAULT 0.00, -- Porcentaje
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(month, year)
);
CREATE INDEX idx_stats_year ON stats_monthly(year);

-- ========================================
-- 10. TABLA ACTIVITY_HISTORY
-- ========================================
CREATE TABLE activity_history (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    user_name VARCHAR(100) NOT NULL,
    action VARCHAR(200) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id BIGINT,
    details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_activity_user ON activity_history(user_id);
CREATE INDEX idx_activity_date ON activity_history(created_at);
CREATE INDEX idx_activity_entity ON activity_history(entity_type, entity_id);

-- ========================================
-- INSERTAR DATOS DE PRUEBA
-- ========================================

-- 1. USUARIOS
INSERT INTO users (name, email, password, avatar, phone, role, active) VALUES
('Admin Usuario', 'admin@example.com', '$2b$10$example_hashed_password_admin', '', '+54 11 1234-5678', 'admin', TRUE),
('Juan Pérez', 'juan.perez@example.com', '$2b$10$example_hashed_password_juan', '', '+54 11 2345-6789', 'user', TRUE),
('Ana García', 'ana.garcia@example.com', '$2b$10$example_hashed_password_ana', '', '+54 11 3456-7890', 'user', TRUE),
('Carlos Martín', 'carlos.martin@example.com', '$2b$10$example_hashed_password_carlos', '', '+54 11 4567-8901', 'user', TRUE),
('María López', 'maria.lopez@example.com', '$2b$10$example_hashed_password_maria', '', '+54 11 5678-9012', 'user', TRUE),
('Diego Rodríguez', 'diego.rodriguez@example.com', '$2b$10$example_hashed_password_diego', '', '+54 11 6789-0123', 'user', TRUE);

-- 2. CANCHAS
INSERT INTO courts (name, sport, type, indoor, lights, surface, surface_type, glass_type, size, hoops, scoreboard, active) VALUES
('Padel 1', 'Padel', 'blanda', TRUE, TRUE, 'Sintético', 'alfombra', 'blindex', NULL, NULL, FALSE, TRUE),
('Padel 2', 'Padel', 'dura', FALSE, FALSE, 'Cemento', 'cemento', 'cemento', NULL, NULL, FALSE, TRUE),
('Padel 3', 'Padel', 'mixta', TRUE, FALSE, 'Alfombra', 'alfombra', 'blindex', NULL, NULL, FALSE, TRUE),
('Tenis 1', 'Tenis', 'césped', FALSE, TRUE, 'Hierba', 'hierba', NULL, NULL, NULL, FALSE, TRUE),
('Tenis 2', 'Tenis', 'dura', TRUE, FALSE, 'Cemento', 'cemento', NULL, NULL, NULL, FALSE, TRUE),
('Tenis 3', 'Tenis', 'blanda', FALSE, TRUE, 'Polvo de ladrillo', 'polvo', NULL, NULL, NULL, FALSE, TRUE),
('Fútbol 1', 'Fútbol', 'sintético', FALSE, TRUE, 'Sintético', NULL, NULL, '5 jugadores', NULL, FALSE, TRUE),
('Fútbol 2', 'Fútbol', 'césped', FALSE, FALSE, 'Césped', NULL, NULL, '7 jugadores', NULL, FALSE, TRUE),
('Fútbol 3', 'Fútbol', 'mixta', FALSE, TRUE, 'Sintético', NULL, NULL, '11 jugadores', NULL, FALSE, TRUE),
('Basquet 1', 'Basquet', 'madera', TRUE, TRUE, 'Madera', 'madera', NULL, NULL, '2', TRUE, TRUE),
('Basquet 2', 'Basquet', 'cemento', FALSE, FALSE, 'Cemento', 'cemento', NULL, NULL, '1', FALSE, TRUE),
('Basquet 3', 'Basquet', 'sintético', TRUE, TRUE, 'Sintético', 'sintetico', NULL, NULL, '2', TRUE, TRUE);

-- 3. HORARIOS DE CANCHAS (ejemplo para las primeras 3 canchas)
INSERT INTO court_schedules (court_id, day_of_week, open_time, close_time, active) VALUES
-- Cancha 1 (Padel 1)
(1, 'lunes', '08:00', '23:00', TRUE),
(1, 'martes', '08:00', '23:00', TRUE),
(1, 'miercoles', '08:00', '23:00', TRUE),
(1, 'jueves', '08:00', '23:00', TRUE),
(1, 'viernes', '08:00', '23:00', TRUE),
(1, 'sabado', '09:00', '23:00', TRUE),
(1, 'domingo', '09:00', '22:00', TRUE),
-- Cancha 2 (Padel 2)
(2, 'lunes', '08:00', '23:00', TRUE),
(2, 'martes', '08:00', '23:00', TRUE),
(2, 'miercoles', '08:00', '23:00', TRUE),
(2, 'jueves', '08:00', '23:00', TRUE),
(2, 'viernes', '08:00', '23:00', TRUE),
(2, 'sabado', '09:00', '23:00', TRUE),
(2, 'domingo', '09:00', '22:00', TRUE),
-- Cancha 3 (Padel 3)
(3, 'lunes', '08:00', '23:00', TRUE),
(3, 'martes', '08:00', '23:00', TRUE),
(3, 'miercoles', '08:00', '23:00', TRUE),
(3, 'jueves', '08:00', '23:00', TRUE),
(3, 'viernes', '08:00', '23:00', TRUE),
(3, 'sabado', '09:00', '23:00', TRUE),
(3, 'domingo', '09:00', '22:00', TRUE);

-- 4. REGLAS DE PRECIOS (usar formato JSON válido para PostgreSQL)
INSERT INTO pricing_rules (court_id, days_of_week, start_time, end_time, price_type, price, active) VALUES
-- Precios generales (court_id NULL = todas las canchas)
(NULL, '["lunes", "martes", "miercoles", "jueves"]'::jsonb, '08:00', '18:00', 'normal', 2000.00, TRUE),
(NULL, '["lunes", "martes", "miercoles", "jueves"]'::jsonb, '18:00', '23:00', 'noche', 2500.00, TRUE),
(NULL, '["viernes", "sabado"]'::jsonb, '08:00', '23:00', 'fin_de_semana', 3000.00, TRUE),
(NULL, '["domingo"]'::jsonb, '09:00', '22:00', 'domingo', 2800.00, TRUE);

-- 5. HORARIOS FERIADOS
INSERT INTO holiday_schedules (court_id, date, name, open_time, close_time, closed) VALUES
(NULL, '2025-12-25', 'Navidad', '10:00', '20:00', FALSE),
(NULL, '2025-01-01', 'Año Nuevo', '12:00', '20:00', FALSE),
(NULL, '2025-05-01', 'Día del Trabajador', NULL, NULL, TRUE);

-- 6. PRECIOS FERIADOS
INSERT INTO holiday_pricing (court_id, date, name, start_time, end_time, price, active) VALUES
(NULL, '2025-12-25', 'Navidad', '10:00', '20:00', 4000.00, TRUE),
(NULL, '2025-01-01', 'Año Nuevo', '12:00', '20:00', 4500.00, TRUE);

-- 7. RESERVAS
INSERT INTO reservations (court_id, user_id, user_phone, user_name, start_at, end_at, price, status, type, notes) VALUES
(1, 1, '+54 11 2345-6789', 'Juan Pérez', '2025-11-06 12:00:00', '2025-11-06 13:00:00', 2500.00, 'confirmed', 'Normal', 'Reserva estándar'),
(1, 2, '+54 11 3456-7890', 'Ana García', '2025-11-06 13:00:00', '2025-11-06 14:00:00', 2800.00, 'confirmed', 'Fijo', 'Turno fijo semanal'),
(2, NULL, '+54 11 1111-1111', 'Club Torneo', '2025-11-06 14:00:00', '2025-11-06 15:00:00', 0.00, 'confirmed', 'Torneo', 'Semifinal torneo primavera'),
(2, 3, '+54 11 4567-8901', 'Carlos Martín', '2025-11-06 15:00:00', '2025-11-06 16:00:00', 2000.00, 'confirmed', 'Invitado', 'Reserva para invitado especial'),
(3, 4, '+54 11 5678-9012', 'María López', '2025-11-07 09:00:00', '2025-11-07 10:00:00', 2000.00, 'pending', 'Normal', 'Reserva pendiente de confirmación'),
(4, 5, '+54 11 6789-0123', 'Diego Rodríguez', '2025-11-07 10:00:00', '2025-11-07 11:00:00', 1800.00, 'confirmed', 'Normal', 'Clase de tenis');

-- 8. TORNEOS
INSERT INTO tournaments (name, sport, category, gender, start_date, end_date, inscription_status, tournament_status, max_participants, current_participants, entry_fee, prize_pool, description) VALUES
('Torneo Primavera Padel', 'Padel', 'A', 'Hombres', '2025-11-15', '2025-11-17', 'Abierta', 'Programado', 16, 8, 5000.00, 50000.00, 'Torneo de Padel categoría A masculino'),
('Torneo Tenis Damas', 'Tenis', 'B', 'Mujeres', '2025-11-20', '2025-11-22', 'Abierta', 'Programado', 12, 6, 3000.00, 30000.00, 'Torneo de Tenis femenino categoría B'),
('Copa Fútbol 5', 'Fútbol', 'Libre', 'Mixto', '2025-12-01', '2025-12-03', 'Abierta', 'Programado', 8, 3, 8000.00, 80000.00, 'Torneo de fútbol 5 equipos mixtos');

-- 9. ESTADÍSTICAS MENSUALES
INSERT INTO stats_monthly (month, year, reservations_count, revenue, court_usage) VALUES
('Enero', 2025, 32, 64000.00, 75.5),
('Febrero', 2025, 44, 88000.00, 82.3),
('Marzo', 2025, 51, 102000.00, 89.1),
('Abril', 2025, 39, 78000.00, 68.7),
('Mayo', 2025, 65, 130000.00, 92.4),
('Junio', 2025, 72, 144000.00, 95.8);

-- 10. HISTORIAL DE ACTIVIDADES
INSERT INTO activity_history (user_id, user_name, action, entity_type, entity_id, details) VALUES
(1, 'Juan Pérez', 'Reserva creada', 'reservation', 1, 'Reserva para Padel 1 el 06/11/2025 de 12:00 a 13:00'),
(NULL, 'Admin Usuario', 'Cancha creada', 'court', 1, 'Nueva cancha Padel 1 agregada al sistema'),
(2, 'Ana García', 'Reserva cancelada', 'reservation', 5, 'Cancelación de reserva por motivos personales'),
(NULL, 'Admin Usuario', 'Torneo creado', 'tournament', 1, 'Nuevo torneo Primavera Padel programado');

-- Verificar que todo se insertó correctamente
SELECT 'Usuarios creados' as tabla, COUNT(*) as total FROM users
UNION ALL
SELECT 'Canchas creadas', COUNT(*) FROM courts
UNION ALL
SELECT 'Reservas creadas', COUNT(*) FROM reservations
UNION ALL
SELECT 'Torneos creados', COUNT(*) FROM tournaments
UNION ALL
SELECT 'Horarios configurados', COUNT(*) FROM court_schedules
UNION ALL
SELECT 'Reglas de precio', COUNT(*) FROM pricing_rules
UNION ALL
SELECT 'Estadísticas', COUNT(*) FROM stats_monthly
UNION ALL
SELECT 'Historial', COUNT(*) FROM activity_history;

COMMIT;