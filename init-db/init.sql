-- Create databases for all microservices
-- Note: PostgreSQL does not support IF NOT EXISTS for CREATE DATABASE
-- These will fail if databases already exist, but that's ok for init script

CREATE DATABASE user_service_db;
CREATE DATABASE reservation_service_db;
CREATE DATABASE institution_service_db;
CREATE DATABASE payment_service_db;


