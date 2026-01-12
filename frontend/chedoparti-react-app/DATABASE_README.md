# 📊 Estructuras de Base de Datos - Chedoparti Frontend

Este directorio contiene todas las estructuras de datos necesarias para implementar el backend que soporte el frontend de Chedoparti.

## 📋 Archivos Incluidos

### 1. `database-structures.json`

**Especificación completa de todas las entidades** que espera el frontend, incluyendo:

- Estructuras de tablas detalladas
- Datos de ejemplo para cada entidad
- Endpoints API esperados
- Reglas de validación
- Relaciones entre tablas
- Formatos de respuesta API

### 2. `database-setup.sql` (MySQL)

**Script SQL para MySQL/MariaDB** con:

- Creación de todas las tablas
- Inserción de datos de prueba
- Índices y constraints
- Datos realistas para testing

### 3. `database-setup-postgresql.sql` (PostgreSQL)

**Script SQL para PostgreSQL** adaptado con:

- Sintaxis específica de PostgreSQL
- Tipos de datos BIGSERIAL
- JSONB para campos JSON
- Constraints CHECK en lugar de ENUM

## 🗂️ Entidades Principales

### 👥 **Users**

- **Propósito**: Autenticación y gestión de usuarios
- **Campos clave**: name, email, password (hashed), role (admin/user)
- **Endpoints**: `/login`, `/me`, `/users/*`

### 🏟️ **Courts**

- **Propósito**: Gestión de canchas deportivas
- **Deportes soportados**: Padel, Tenis, Fútbol, Basquet
- **Campos dinámicos**: Configuración específica por deporte
- **Endpoints**: `/courts/*`, `/courts/active`

### 📅 **Reservations**

- **Propósito**: Sistema de reservas de canchas
- **Campos clave**: start_at, end_at, price, status, type
- **Tipos**: Normal, Fijo, Torneo, Invitado
- **Endpoints**: `/reservations/*`, `/reservations/availability`

### 🏆 **Tournaments**

- **Propósito**: Gestión de torneos deportivos
- **Estados**: Programado, En Curso, Finalizado, Cancelado
- **Inscripciones**: Abierta, Cerrada, Finalizada
- **Endpoints**: `/tournaments/*`

### ⏰ **Court Schedules & Pricing**

- **Horarios**: Configuración por día de semana
- **Precios**: Reglas dinámicas por horario y día
- **Feriados**: Horarios y precios especiales
- **Endpoints**: `/schedules`, `/pricing`

### 📈 **Stats & History**

- **Estadísticas**: Datos mensuales para gráficos
- **Historial**: Log de actividades del sistema
- **Endpoints**: `/stats/overview`, `/reservations/history`

## 🚀 Instrucciones de Uso

### Para MySQL/MariaDB:

```bash
# 1. Crear la base de datos
mysql -u root -p -e "CREATE DATABASE chedoparti CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 2. Ejecutar el script
mysql -u root -p chedoparti < database-setup.sql
```

### Para PostgreSQL:

```bash
# 1. Crear la base de datos
createdb chedoparti

# 2. Ejecutar el script
psql -d chedoparti -f database-setup-postgresql.sql
```

### Para verificar la instalación:

```sql
-- Verificar tablas creadas
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'chedoparti'; -- MySQL
-- O
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'; -- PostgreSQL

-- Verificar datos insertados
SELECT 'Users' as tabla, COUNT(*) as total FROM users
UNION ALL SELECT 'Courts', COUNT(*) FROM courts
UNION ALL SELECT 'Reservations', COUNT(*) FROM reservations;
```

## 🔑 Endpoints API Esperados

El frontend espera estos endpoints con las siguientes estructuras:

### Autenticación

- `POST /api/login` → `{ access_token: string, user: User }`
- `GET /api/me` → `User`

### Canchas

- `GET /api/courts` → `Court[]` o respuesta paginada
- `GET /api/courts/active` → `Court[]` (solo activas)
- `GET /api/courts/{id}` → `Court`
- `POST /api/courts` → `Court`
- `PUT /api/courts/{id}` → `Court`
- `DELETE /api/courts/{id}` → `boolean`

### Reservas

- `GET /api/reservations` → `Reservation[]` o paginada
- `GET /api/reservations/{id}` → `Reservation`
- `POST /api/reservations` → `Reservation`
- `PUT /api/reservations/{id}` → `Reservation`
- `DELETE /api/reservations/{id}` → `boolean`
- `PATCH /api/reservations/{id}/status?status=...&reason=...` → `Reservation`
- `POST /api/reservations/{id}/cancel` → `Reservation`
- `GET /api/reservations/availability?date=...&courtId=...` → `AvailabilitySlot[]`
- `GET /api/reservations/history` → `ActivityHistory[]`

### Otros

- `GET /api/tournaments` → `Tournament[]`
- `GET /api/schedules` → `{ groups: Schedule[], feriados: Holiday[] }`
- `PUT /api/schedules` → `Schedule`
- `GET /api/pricing` → `PricingRule[]`
- `PUT /api/pricing` → `PricingRule`
- `GET /api/stats/overview` → `{ mes: string, reservas: number }[]`

## 📝 Notas Importantes

1. **Contraseñas**: Usar bcrypt para hashear (ejemplo: `$2b$10$...`)
2. **Fechas**: Formato ISO 8601 (`YYYY-MM-DDTHH:MM:SSZ`)
3. **Precios**: Usar decimales para precisión monetaria
4. **Paginación**: El frontend soporta tanto arrays simples como respuestas paginadas con `{ content: [], page: 0, totalElements: 0 }`
5. **Errores**: Estructura estándar `{ timestamp, status, error, message, path }`
6. **JSON**: Para campos dinámicos como `days_of_week` en pricing_rules
7. **Índices**: Incluidos para optimizar consultas frecuentes

## 🔧 Personalización

### Agregar nuevo deporte:

1. Actualizar CHECK constraints en `courts.sport`
2. Agregar campos específicos en la tabla `courts`
3. Actualizar `src/config/courts.json` en el frontend

### Modificar precios:

1. Ajustar registros en `pricing_rules`
2. Agregar reglas especiales en `holiday_pricing`

### Nuevos tipos de reserva:

1. Actualizar CHECK constraint en `reservations.type`
2. Implementar lógica de negocio en el backend

---

**Nota**: Los datos de ejemplo incluyen usuarios, canchas, reservas y estadísticas realistas para facilitar el testing y desarrollo del frontend. 🎯
