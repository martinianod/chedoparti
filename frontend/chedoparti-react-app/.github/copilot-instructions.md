# Chedoparti Frontend - AI Coding Instructions

## Architecture Overview

This is a **React + Vite + Tailwind** padel club management frontend that expects a microservices backend with JWT authentication. The app uses:

- **Routing**: React Router with lazy loading and protected routes via `ProtectedRoute` wrapper
- **State Management**: React Context for auth (`AuthContext`), sidebar (`SidebarContext`), and theme (`ThemeContext`)
- **API Layer**: Centralized in `src/services/api.js` with Axios interceptors for JWT token injection
- **Mock System**: Complete mock APIs in `src/services/api.mock.js` for development without backend

## Critical Development Patterns

### API Architecture

The backend expects specific microservice endpoints:

```javascript
// Institution-scoped courts
/institution/institutions/{id}/courts
// Reservation service
/reservation/reservations
/reservation/availability
// Auth service
/auth/login → returns { token, user }
```

**Key Pattern**: All API calls go through `apiClient` (src/api/client.js) which automatically injects Bearer tokens except for auth endpoints.

### Environment Configuration

```bash
# Development with backend
VITE_API_BASE_URL=http://localhost:8989/api

# Development with mocks (uses api.mock.js)
VITE_API_BASE_URL=/api
```

The Vite proxy in `vite.config.js` forwards `/api/*` to `localhost:8989` (API Gateway).

### Authentication Flow

1. Login stores JWT in localStorage via `AuthContext.login()`
2. `apiClient` interceptor adds `Authorization: Bearer ${token}` to all non-auth requests
3. `ProtectedRoute` checks auth state and redirects to `/login` if needed
4. Token validation happens on app bootstrap via `authApi.me()`

### Mock Development Workflow

- **🎭 Demo Mode Active**: All backend connections disabled, using mock APIs exclusively
- Real APIs in `src/services/api.js` (currently commented out)
- Mock versions in `src/services/api.mock.js` (currently active)
- Mock data includes realistic courts, reservations, tournaments from `src/mock/*.json`
- Switch modes by commenting/uncommenting code in `api.js` and `vite.config.js`

### Component Structure Conventions

- **Pages**: Feature-complete views in `src/pages/[Feature]/[Action].jsx`
- **Layout**: `DashboardLayout` wraps all authenticated pages with sidebar + topbar
- **UI Components**: Reusable components in `src/components/ui/` follow compound pattern
- **Sports Configuration**: Dynamic form fields defined in `src/config/courts.json`

### State Management Patterns

```javascript
// Context providers wrap entire app in App.jsx
<AuthProvider>
  <SidebarProvider>
    <ThemeProvider>
```

**Critical**: Always use `useAuth()`, `useSidebar()`, `useTheme()` hooks, never access contexts directly.

## Development Commands

```bash
# 🎭 MODO DEMO: Start with mock APIs only (ready for demo)
npm run dev

# Credenciales de Demo por Rol:
# ADMIN: admin@chedoparti.com / admin123
# SOCIO: socio@chedoparti.com / socio123
# COACH: coach@chedoparti.com / coach123

# Para backend real (requiere cambios en código)
# 1. Descomente APIs reales en src/services/api.js
# 2. Descomente proxy en vite.config.js
# 3. VITE_API_BASE_URL=http://localhost:8989/api npm run dev

# Build for production
npm run build

# Test production build locally
npm run preview

# Smoke test (validates build)
npm run smoke
```

## Key Files to Understand

- `src/App.jsx` - Route definitions and lazy loading setup
- `src/api/client.js` - Axios configuration and JWT interceptor
- `src/services/api.js` - All real backend API definitions
- `src/context/AuthContext.jsx` - Authentication state and localStorage management
- `src/components/Layout/DashboardLayout.jsx` - Main authenticated app layout
- `vite.config.js` - Development proxy configuration

## Common Integration Points

**Adding New APIs**: Define in `src/services/api.js` following existing pattern, add mock version in `api.mock.js`

**New Protected Pages**: Add route inside `<ProtectedRoute>` wrapper in App.jsx, lazy load for performance

**Sports/Court Types**: Extend configurations in `src/config/courts.json` with field definitions

**Internationalization**: Add translations to `src/locales/es/` and `src/locales/en/`, use `useTranslation()` hook

**Styling**: Use Tailwind classes with dark mode support (`dark:` prefix), theme state managed by ThemeContext
