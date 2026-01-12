-- ========================================
-- CHEDOPARTI DATABASE SETUP SCRIPT
-- Creación de tablas e inserción de datos de prueba
-- ========================================

-- Crear base de datos (si no existe)
-- CREATE DATABASE IF NOT EXISTS chedoparti CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE chedoparti;

-- ========================================
-- 1. TABLA USERS
-- ========================================
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    avatar VARCHAR(500),
    phone VARCHAR(20),
    role ENUM('admin', 'user') NOT NULL DEFAULT 'user',
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_email (email),
    INDEX idx_users_role (role)
);

-- ========================================
-- 2. TABLA COURTS
-- ========================================
CREATE TABLE IF NOT EXISTS courts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    sport ENUM('Padel', 'Tenis', 'Fútbol', 'Basquet') NOT NULL,
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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_courts_sport (sport),
    INDEX idx_courts_active (active)
);

-- ========================================
-- 3. TABLA RESERVATIONS
-- ========================================
CREATE TABLE IF NOT EXISTS reservations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    court_id BIGINT NOT NULL,
    user_id BIGINT NULL,
    user_phone VARCHAR(20),
    user_name VARCHAR(100),
    start_at TIMESTAMP NOT NULL,
    end_at TIMESTAMP NOT NULL,
    price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    status ENUM('confirmed', 'cancelled', 'pending') NOT NULL DEFAULT 'pending',
    type ENUM('Normal', 'Fijo', 'Torneo', 'Invitado') NOT NULL DEFAULT 'Normal',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (court_id) REFERENCES courts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_reservations_court (court_id),
    INDEX idx_reservations_user (user_id),
    INDEX idx_reservations_date (start_at),
    INDEX idx_reservations_status (status)
);

-- ========================================
-- 4. TABLA TOURNAMENTS
-- ========================================
CREATE TABLE IF NOT EXISTS tournaments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    sport ENUM('Padel', 'Tenis', 'Fútbol', 'Basquet') NOT NULL,
    category VARCHAR(50),
    gender ENUM('Hombres', 'Mujeres', 'Mixto') NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    inscription_status ENUM('Abierta', 'Cerrada', 'Finalizada') NOT NULL DEFAULT 'Abierta',
    tournament_status ENUM('Programado', 'En Curso', 'Finalizado', 'Cancelado') NOT NULL DEFAULT 'Programado',
    max_participants INT NOT NULL,
    current_participants INT NOT NULL DEFAULT 0,
    entry_fee DECIMAL(10,2) DEFAULT 0.00,
    prize_pool DECIMAL(10,2),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_tournaments_sport (sport),
    INDEX idx_tournaments_status (tournament_status),
    INDEX idx_tournaments_date (start_date)
);

-- ========================================
-- 5. TABLA COURT_SCHEDULES
-- ========================================
CREATE TABLE IF NOT EXISTS court_schedules (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    court_id BIGINT NOT NULL,
    day_of_week ENUM('lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo') NOT NULL,
    open_time TIME NOT NULL,
    close_time TIME NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (court_id) REFERENCES courts(id) ON DELETE CASCADE,
    UNIQUE KEY unique_court_day (court_id, day_of_week),
    INDEX idx_schedules_court (court_id)
);

-- ========================================
-- 6. TABLA HOLIDAY_SCHEDULES
-- ========================================
CREATE TABLE IF NOT EXISTS holiday_schedules (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    court_id BIGINT NULL, -- NULL = aplicar a todas las canchas
    date DATE NOT NULL,
    name VARCHAR(100) NOT NULL,
    open_time TIME,
    close_time TIME,
    closed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (court_id) REFERENCES courts(id) ON DELETE CASCADE,
    INDEX idx_holiday_schedules_date (date),
    INDEX idx_holiday_schedules_court (court_id)
);

-- ========================================
-- 7. TABLA PRICING_RULES
-- ========================================
CREATE TABLE IF NOT EXISTS pricing_rules (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    court_id BIGINT NULL, -- NULL = aplicar a todas las canchas
    days_of_week JSON NOT NULL, -- ["lunes", "martes", "miercoles"]
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    price_type VARCHAR(50) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (court_id) REFERENCES courts(id) ON DELETE CASCADE,
    INDEX idx_pricing_rules_court (court_id),
    INDEX idx_pricing_rules_active (active)
);

-- ========================================
-- 8. TABLA HOLIDAY_PRICING
-- ========================================
CREATE TABLE IF NOT EXISTS holiday_pricing (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    court_id BIGINT NULL, -- NULL = aplicar a todas las canchas
    date DATE NOT NULL,
    name VARCHAR(100) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (court_id) REFERENCES courts(id) ON DELETE CASCADE,
    INDEX idx_holiday_pricing_date (date),
    INDEX idx_holiday_pricing_court (court_id)
);

-- ========================================
-- 9. TABLA STATS_MONTHLY
-- ========================================
CREATE TABLE IF NOT EXISTS stats_monthly (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    month VARCHAR(20) NOT NULL,
    year INT NOT NULL,
    reservations_count INT NOT NULL DEFAULT 0,
    revenue DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    court_usage DECIMAL(5,2) NOT NULL DEFAULT 0.00, -- Porcentaje
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_month_year (month, year),
    INDEX idx_stats_year (year)
);

-- ========================================
-- 10. TABLA ACTIVITY_HISTORY
-- ========================================
CREATE TABLE IF NOT EXISTS activity_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NULL,
    user_name VARCHAR(100) NOT NULL,
    action VARCHAR(200) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id BIGINT,
    details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_activity_user (user_id),
    INDEX idx_activity_date (created_at),
    INDEX idx_activity_entity (entity_type, entity_id)
);

-- ========================================
-- INSERTAR DATOS DE PRUEBA
-- ========================================

-- 1. USUARIOS
INSERT INTO users (id, name, email, password, avatar, phone, role, active) VALUES
(1, 'Admin Usuario', 'admin@example.com', '$2b$10$example_hashed_password_admin', '', '+54 11 1234-5678', 'admin', TRUE),
(2, 'Juan Pérez', 'juan.perez@example.com', '$2b$10$example_hashed_password_juan', '', '+54 11 2345-6789', 'user', TRUE),
(3, 'Ana García', 'ana.garcia@example.com', '$2b$10$example_hashed_password_ana', '', '+54 11 3456-7890', 'user', TRUE),
(4, 'Carlos Martín', 'carlos.martin@example.com', '$2b$10$example_hashed_password_carlos', '', '+54 11 4567-8901', 'user', TRUE),
(5, 'María López', 'maria.lopez@example.com', '$2b$10$example_hashed_password_maria', '', '+54 11 5678-9012', 'user', TRUE),
(6, 'Diego Rodríguez', 'diego.rodriguez@example.com', '$2b$10$example_hashed_password_diego', '', '+54 11 6789-0123', 'user', TRUE);

-- 2. CANCHAS
INSERT INTO courts (id, name, sport, type, indoor, lights, surface, surface_type, glass_type, size, hoops, scoreboard, active) VALUES
(1, 'Padel 1', 'Padel', 'blanda', TRUE, TRUE, 'Sintético', 'alfombra', 'blindex', NULL, NULL, FALSE, TRUE),
(2, 'Padel 2', 'Padel', 'dura', FALSE, FALSE, 'Cemento', 'cemento', 'cemento', NULL, NULL, FALSE, TRUE),
(3, 'Padel 3', 'Padel', 'mixta', TRUE, FALSE, 'Alfombra', 'alfombra', 'blindex', NULL, NULL, FALSE, TRUE),
(4, 'Tenis 1', 'Tenis', 'césped', FALSE, TRUE, 'Hierba', 'hierba', NULL, NULL, NULL, FALSE, TRUE),
(5, 'Tenis 2', 'Tenis', 'dura', TRUE, FALSE, 'Cemento', 'cemento', NULL, NULL, NULL, FALSE, TRUE),
(6, 'Tenis 3', 'Tenis', 'blanda', FALSE, TRUE, 'Polvo de ladrillo', 'polvo', NULL, NULL, NULL, FALSE, TRUE),
(7, 'Fútbol 1', 'Fútbol', 'sintético', FALSE, TRUE, 'Sintético', NULL, NULL, '5 jugadores', NULL, FALSE, TRUE),
(8, 'Fútbol 2', 'Fútbol', 'césped', FALSE, FALSE, 'Césped', NULL, NULL, '7 jugadores', NULL, FALSE, TRUE),
(9, 'Fútbol 3', 'Fútbol', 'mixta', FALSE, TRUE, 'Sintético', NULL, NULL, '11 jugadores', NULL, FALSE, TRUE),
(10, 'Basquet 1', 'Basquet', 'madera', TRUE, TRUE, 'Madera', 'madera', NULL, NULL, '2', TRUE, TRUE),
(11, 'Basquet 2', 'Basquet', 'cemento', FALSE, FALSE, 'Cemento', 'cemento', NULL, NULL, '1', FALSE, TRUE),
(12, 'Basquet 3', 'Basquet', 'sintético', TRUE, TRUE, 'Sintético', 'sintetico', NULL, NULL, '2', TRUE, TRUE);

-- 3. HORARIOS DE CANCHAS (para cada cancha, todos los días de la semana)
INSERT INTO court_schedules (court_id, day_of_week, open_time, close_time, active) VALUES
-- Cancha 1 (Padel 1)
(1, 'lunes', '08:00', '23:00', TRUE),
(1, 'martes', '08:00', '23:00', TRUE),
(1, 'miercoles', '08:00', '23:00', TRUE),
(1, 'jueves', '08:00', '23:00', TRUE),
(1, 'viernes', '08:00', '01:00', TRUE),
(1, 'sabado', '09:00', '01:00', TRUE),
(1, 'domingo', '09:00', '22:00', TRUE),
-- Cancha 2 (Padel 2)
(2, 'lunes', '08:00', '23:00', TRUE),
(2, 'martes', '08:00', '23:00', TRUE),
(2, 'miercoles', '08:00', '23:00', TRUE),
(2, 'jueves', '08:00', '23:00', TRUE),
(2, 'viernes', '08:00', '01:00', TRUE),
(2, 'sabado', '09:00', '01:00', TRUE),
(2, 'domingo', '09:00', '22:00', TRUE),
-- Cancha 3 (Padel 3)
(3, 'lunes', '08:00', '23:00', TRUE),
(3, 'martes', '08:00', '23:00', TRUE),
(3, 'miercoles', '08:00', '23:00', TRUE),
(3, 'jueves', '08:00', '23:00', TRUE),
(3, 'viernes', '08:00', '01:00', TRUE),
(3, 'sabado', '09:00', '01:00', TRUE),
(3, 'domingo', '09:00', '22:00', TRUE);

-- 4. REGLAS DE PRECIOS
INSERT INTO pricing_rules (court_id, days_of_week, start_time, end_time, price_type, price, active) VALUES
-- Precios generales (court_id NULL = todas las canchas)
(NULL, '["lunes", "martes", "miercoles", "jueves"]', '08:00', '18:00', 'normal', 2000.00, TRUE),
(NULL, '["lunes", "martes", "miercoles", "jueves"]', '18:00', '23:00', 'noche', 2500.00, TRUE),
(NULL, '["viernes", "sabado"]', '08:00', '01:00', 'fin_de_semana', 3000.00, TRUE),
(NULL, '["domingo"]', '09:00', '22:00', 'domingo', 2800.00, TRUE);

-- 5. HORARIOS FERIADOS
INSERT INTO holiday_schedules (court_id, date, name, open_time, close_time, closed) VALUES
(NULL, '2025-12-25', 'Navidad', '10:00', '20:00', FALSE),
(NULL, '2026-01-01', 'Año Nuevo', '12:00', '20:00', FALSE),
(NULL, '2025-05-01', 'Día del Trabajador', NULL, NULL, TRUE);

-- 6. PRECIOS FERIADOS
INSERT INTO holiday_pricing (court_id, date, name, start_time, end_time, price, active) VALUES
(NULL, '2025-12-25', 'Navidad', '10:00', '20:00', 4000.00, TRUE),
(NULL, '2026-01-01', 'Año Nuevo', '12:00', '20:00', 4500.00, TRUE);

-- 7. RESERVAS
INSERT INTO reservations (id, court_id, user_id, user_phone, user_name, start_at, end_at, price, status, type, notes) VALUES
(1001, 1, 2, '+54 11 2345-6789', 'Juan Pérez', '2025-11-06 12:00:00', '2025-11-06 13:00:00', 2500.00, 'confirmed', 'Normal', 'Reserva estándar'),
(1002, 1, 3, '+54 11 3456-7890', 'Ana García', '2025-11-06 13:00:00', '2025-11-06 14:00:00', 2800.00, 'confirmed', 'Fijo', 'Turno fijo semanal'),
(1003, 2, NULL, '+54 11 1111-1111', 'Club Torneo', '2025-11-06 14:00:00', '2025-11-06 15:00:00', 0.00, 'confirmed', 'Torneo', 'Semifinal torneo primavera'),
(1004, 2, 4, '+54 11 4567-8901', 'Carlos Martín', '2025-11-06 15:00:00', '2025-11-06 16:00:00', 2000.00, 'confirmed', 'Invitado', 'Reserva para invitado especial'),
(1005, 3, 5, '+54 11 5678-9012', 'María López', '2025-11-07 09:00:00', '2025-11-07 10:00:00', 2000.00, 'pending', 'Normal', 'Reserva pendiente de confirmación'),
(1006, 4, 6, '+54 11 6789-0123', 'Diego Rodríguez', '2025-11-07 10:00:00', '2025-11-07 11:00:00', 1800.00, 'confirmed', 'Normal', 'Clase de tenis'),
(1007, 1, 2, '+54 11 2345-6789', 'Juan Pérez', '2025-11-08 19:00:00', '2025-11-08 20:00:00', 2500.00, 'confirmed', 'Normal', 'Reserva nocturna'),
(1008, 7, NULL, '+54 11 2222-2222', 'Equipo Local', '2025-11-08 20:00:00', '2025-11-08 21:00:00', 3500.00, 'confirmed', 'Normal', 'Partido de fútbol 5');

-- 8. TORNEOS
INSERT INTO tournaments (id, name, sport, category, gender, start_date, end_date, inscription_status, tournament_status, max_participants, current_participants, entry_fee, prize_pool, description) VALUES
(1, 'Torneo Primavera Padel', 'Padel', 'A', 'Hombres', '2025-11-15', '2025-11-17', 'Abierta', 'Programado', 16, 8, 5000.00, 50000.00, 'Torneo de Padel categoría A masculino'),
(2, 'Torneo Tenis Damas', 'Tenis', 'B', 'Mujeres', '2025-11-20', '2025-11-22', 'Abierta', 'Programado', 12, 6, 3000.00, 30000.00, 'Torneo de Tenis femenino categoría B'),
(3, 'Copa Fútbol 5', 'Fútbol', 'Libre', 'Mixto', '2025-12-01', '2025-12-03', 'Abierta', 'Programado', 8, 3, 8000.00, 80000.00, 'Torneo de fútbol 5 equipos mixtos'),
(4, 'Basquet 3x3', 'Basquet', 'Juvenil', 'Mixto', '2025-12-10', '2025-12-12', 'Cerrada', 'Programado', 12, 12, 2000.00, 24000.00, 'Torneo de basquet 3vs3 juvenil');

-- 9. ESTADÍSTICAS MENSUALES
INSERT INTO stats_monthly (month, year, reservations_count, revenue, court_usage) VALUES
('Enero', 2025, 32, 64000.00, 75.5),
('Febrero', 2025, 44, 88000.00, 82.3),
('Marzo', 2025, 51, 102000.00, 89.1),
('Abril', 2025, 39, 78000.00, 68.7),
('Mayo', 2025, 65, 130000.00, 92.4),
('Junio', 2025, 72, 144000.00, 95.8),
('Julio', 2025, 58, 116000.00, 85.2),
('Agosto', 2025, 61, 122000.00, 87.9),
('Septiembre', 2025, 67, 134000.00, 91.3),
('Octubre', 2025, 73, 146000.00, 96.2);

-- 10. HISTORIAL DE ACTIVIDADES
INSERT INTO activity_history (user_id, user_name, action, entity_type, entity_id, details) VALUES
(2, 'Juan Pérez', 'Reserva creada', 'reservation', 1001, 'Reserva para Padel 1 el 06/11/2025 de 12:00 a 13:00'),
(1, 'Admin Usuario', 'Cancha creada', 'court', 1, 'Nueva cancha Padel 1 agregada al sistema'),
(3, 'Ana García', 'Reserva cancelada', 'reservation', 1005, 'Cancelación de reserva por motivos personales'),
(1, 'Admin Usuario', 'Torneo creado', 'tournament', 1, 'Nuevo torneo Primavera Padel programado'),
(4, 'Carlos Martín', 'Reserva modificada', 'reservation', 1004, 'Cambio de horario de 14:00 a 15:00'),
(1, 'Admin Usuario', 'Precio actualizado', 'pricing', 1, 'Actualización de precios para horario nocturno'),
(5, 'María López', 'Reserva creada', 'reservation', 1005, 'Nueva reserva para Padel 3'),
(6, 'Diego Rodríguez', 'Reserva creada', 'reservation', 1006, 'Reserva para clase de tenis');

-- ========================================
-- FINALIZACIÓN
-- ========================================

-- Reiniciar AUTO_INCREMENT para tablas que necesiten IDs específicos
-- ALTER TABLE users AUTO_INCREMENT = 10;
-- ALTER TABLE courts AUTO_INCREMENT = 20;
-- ALTER TABLE reservations AUTO_INCREMENT = 2000;
-- ALTER TABLE tournaments AUTO_INCREMENT = 10;

-- Verificar que todo se insertó correctamente
SELECT 'Usuarios creados:' as tabla, COUNT(*) as total FROM users
UNION ALL
SELECT 'Canchas creadas:' as tabla, COUNT(*) as total FROM courts
UNION ALL
SELECT 'Reservas creadas:' as tabla, COUNT(*) as total FROM reservations
UNION ALL
SELECT 'Torneos creados:' as tabla, COUNT(*) as total FROM tournaments
UNION ALL
SELECT 'Horarios configurados:' as tabla, COUNT(*) as total FROM court_schedules
UNION ALL
SELECT 'Reglas de precio:' as tabla, COUNT(*) as total FROM pricing_rules
UNION ALL
SELECT 'Estadísticas:' as tabla, COUNT(*) as total FROM stats_monthly
UNION ALL
SELECT 'Historial:' as tabla, COUNT(*) as total FROM activity_history;

COMMIT;

-- ========================================
-- NOTAS IMPORTANTES:
-- ========================================
-- 1. Las contraseñas están hasheadas con bcrypt (ejemplo)
-- 2. Los precios están en centavos o pesos argentinos
-- 3. Los horarios están en formato 24 horas
-- 4. Las fechas están en formato ISO (YYYY-MM-DD HH:MM:SS)
-- 5. Los campos JSON requieren MySQL 5.7+ o PostgreSQL 9.3+
-- 6. Ajustar los tipos de datos según el motor de base de datos usado
-- ========================================