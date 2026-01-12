# 🎯 DEMO - Chedoparti Club Management System

## 🚀 Modo Demo Activo

Esta aplicación está configurada en **MODO DEMO** con APIs mock completas. No requiere conexión a backend.

## 👥 Credenciales de Demo por Rol

### 🔧 ADMINISTRADOR

- **Email:** `admin@chedoparti.com`
- **Password:** `admin123`
- **Permisos:** Acceso completo al sistema
- **Menú disponible:**
  - Dashboard ✅
  - Reservas ✅
  - Canchas ✅ (solo admin)
  - Horarios ✅ (solo admin)
  - Torneos ✅
  - Estadísticas ✅
  - Historial ✅ (solo admin)
  - Configuración ✅ (solo admin)

### 🏓 SOCIO

- **Email:** `socio@chedoparti.com`
- **Password:** `socio123`
- **Permisos:** Usuario regular del club
- **Menú disponible:**
  - Dashboard ✅
  - Reservas ✅

### 🎾 ENTRENADOR/COACH

- **Email:** `coach@chedoparti.com`
- **Password:** `coach123`
- **Permisos:** Gestión de torneos y estadísticas
- **Menú disponible:**
  - Dashboard ✅
  - Reservas ✅
  - Torneos ✅
  - Estadísticas ✅

## 🏟️ Datos de Demo

### Canchas Disponibles (7 total)

- **2 Canchas de Padel** (Cancha 1 y 2)
- **5 Canchas de Tenis** (Cancha 3, 4, 5, 6 y 7)

### Reservas

- **15 reservas de muestra** distribuidas entre Nov 11-18, 2025
- Diferentes deportes, horarios y precios realistas
- Estados: Confirmada, Pendiente, Completada

## 🧪 Cómo Probar el Sistema de Privacidad

1. **Iniciar sesión como ADMIN** (`admin@chedoparti.com` / `admin123`)
   - Ve todas las reservas con información completa
   - Puede editar cualquier reserva

2. **Cambiar a SOCIO** (`socio@chedoparti.com` / `socio123`)
   - Solo ve sus propias reservas completas (algunas están asignadas al socio)
   - Las demás aparecen como "Reservado" sin información sensible

3. **Probar como COACH** (`coach@chedoparti.com` / `coach123`)
   - Similar al socio, pero con acceso a torneos y estadísticas
   - Ve sus propias reservas, las demás están protegidas

4. **Observar diferencias visuales**
   - Filas con información privada tienen fondo gris claro
   - Texto en cursiva para datos protegidos
   - Botón "Editar" deshabilitado para reservas de otros
5. **⚠️ Importante: Limpiar localStorage entre pruebas**
   - Abre DevTools (F12)
   - Ve a Application > Local Storage
   - Borra `token` antes de cambiar de usuario
   - Esto asegura que el filtro de privacidad se aplique correctamente

## 🛠️ Comandos de Desarrollo

```bash
# Iniciar en modo demo (ya configurado)
npm run dev

# Compilar para producción
npm run build

# Vista previa de producción
npm run preview

# Test básico de funcionamiento
npm run smoke
```

## 🔄 Cambiar entre Modo Demo y Backend Real

### Modo Demo (Actual) ✅

```javascript
// src/services/api.js
// APIs reales comentadas, usando mocks
```

### Modo Backend Real

1. Descomentar APIs reales en `src/services/api.js`
2. Descomentar proxy en `vite.config.js`
3. Configurar variable de entorno:
   ```bash
   VITE_API_BASE_URL=http://localhost:8989/api npm run dev
   ```

## 🌐 Características Destacadas

- ✅ **Autenticación JWT simulada** con roles diferenciados
- ✅ **Sidebar dinámico** que cambia según permisos de usuario
- ✅ **Sistema de reservas completo** con calendario visual
- ✅ **Gestión de canchas** con configuración de precios y horarios
- ✅ **Dashboard responsive** con estadísticas en tiempo real
- ✅ **Internacionalización** (Español/Inglés)
- ✅ **Tema claro/oscuro** persistente
- ✅ **PWA ready** con manifest y service worker

## 🎨 Diseño y UX

- **Colores del club:** Navy (#1e3a8a) y Gold (#f59e0b)
- **Framework:** Tailwind CSS con componentes reutilizables
- **Iconos:** Feather Icons (react-icons/fi)
- **Responsive:** Mobile-first design

## 📱 Funcionalidades por Rol

## 📱 Funcionalidades por Rol

| Funcionalidad          | Admin | Socio       | Coach       |
| ---------------------- | ----- | ----------- | ----------- |
| Ver Dashboard          | ✅    | ✅          | ✅          |
| Hacer Reservas         | ✅    | ✅          | ✅          |
| Ver Todas las Reservas | ✅    | 🔒 Limitado | 🔒 Limitado |
| Gestionar Canchas      | ✅    | ❌          | ❌          |
| Configurar Horarios    | ✅    | ❌          | ❌          |
| Gestionar Torneos      | ✅    | ❌          | ✅          |
| Ver Estadísticas       | ✅    | ❌          | ✅          |
| Ver Historial          | ✅    | ❌          | ❌          |
| Configuración          | ✅    | ❌          | ❌          |

### 🔒 Sistema de Privacidad en Reservas

**ADMINISTRADOR** - Acceso completo:

- ✅ Ve todos los datos de todas las reservas
- ✅ Puede editar/eliminar cualquier reserva
- ✅ Ve nombres, teléfonos, precios y notas completas

**SOCIO/COACH** - Vista restringida:

- ✅ Ve sus **propias reservas** con información completa
- 🔒 Ve otras reservas como **"Reservado"** sin datos sensibles
- 🔒 No puede editar reservas de otros usuarios
- 🔒 Los precios y notas privadas están ocultos
- ✅ Puede ver horarios ocupados para planificar nuevas reservas

---

**🔗 Enlaces útiles:**

- Puerto dev: http://localhost:5173
- Documentación técnica: `/README.md`
- Instrucciones AI: `/.github/copilot-instructions.md`
