# 📊 Propuesta de Refactor: Manejo de Estado Optimizado

## 🎯 Objetivo

Mejorar la sincronización y escalabilidad del estado sin la complejidad de Redux.

## 🏗️ Arquitectura Propuesta

### 1. GlobalProvider Consolidado

```javascript
// src/providers/GlobalProvider.jsx
<GlobalProvider>
  <AuthProvider>
    <UIProvider>
      {' '}
      // theme + sidebar + modales globales
      <DataProvider>
        {' '}
        // reservas + canchas + usuarios (cache)
        <App />
      </DataProvider>
    </UIProvider>
  </AuthProvider>
</GlobalProvider>
```

### 2. Nuevos Contextos Especializados

#### UIContext (consolidar Theme + Sidebar + Modales)

```javascript
// src/context/UIContext.jsx
const UIContext = createContext();

const uiReducer = (state, action) => {
  switch (action.type) {
    case 'TOGGLE_THEME':
      return { ...state, theme: state.theme === 'dark' ? 'light' : 'dark' };
    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarCollapsed: !state.sidebarCollapsed };
    case 'SHOW_MODAL':
      return { ...state, modals: { ...state.modals, [action.id]: action.props } };
    case 'HIDE_MODAL':
      return { ...state, modals: { ...state.modals, [action.id]: null } };
    default:
      return state;
  }
};

export function UIProvider({ children }) {
  const [state, dispatch] = useReducer(uiReducer, {
    theme: 'light',
    sidebarCollapsed: false,
    modals: {},
  });

  return <UIContext.Provider value={{ state, dispatch }}>{children}</UIContext.Provider>;
}
```

#### DataContext (Cache de API + Sincronización)

```javascript
// src/context/DataContext.jsx
const DataContext = createContext();

const dataReducer = (state, action) => {
  switch (action.type) {
    case 'SET_RESERVATIONS':
      return { ...state, reservations: action.payload };
    case 'UPDATE_RESERVATION':
      return {
        ...state,
        reservations: state.reservations.map((r) =>
          r.id === action.payload.id ? { ...r, ...action.payload } : r
        ),
      };
    case 'SET_COURTS':
      return { ...state, courts: action.payload };
    case 'UPDATE_COURT':
      return {
        ...state,
        courts: state.courts.map((c) =>
          c.id === action.payload.id ? { ...c, ...action.payload } : c
        ),
      };
    default:
      return state;
  }
};
```

### 3. Hooks Mejorados

#### useDataSync Hook

```javascript
// src/hooks/useDataSync.js
export function useDataSync() {
  const { state, dispatch } = useContext(DataContext);

  const updateReservation = async (id, data) => {
    // Optimistic update
    dispatch({ type: 'UPDATE_RESERVATION', payload: { id, ...data } });

    try {
      const result = await reservationsApi.update(id, data);
      dispatch({ type: 'UPDATE_RESERVATION', payload: result });
      return result;
    } catch (error) {
      // Revert optimistic update
      const original = state.reservations.find((r) => r.id === id);
      dispatch({ type: 'UPDATE_RESERVATION', payload: original });
      throw error;
    }
  };

  return {
    reservations: state.reservations,
    courts: state.courts,
    updateReservation,
    updateCourt,
    // ... más funciones
  };
}
```

## 🚀 Beneficios vs Context Actual

### ✅ Ventajas del Refactor

1. **Sincronización Automática**: No más useEffect manuales
2. **Optimistic Updates**: UI responsive con rollback en error
3. **Cache Inteligente**: Reducir llamadas API redundantes
4. **Debugging Mejorado**: Estado centralizado más fácil de debuggear
5. **Modales Globales**: Gestión centralizada de modales/overlays

### 📊 Comparación de Opciones

| Aspecto            | Context Actual | Context Mejorado | Redux Toolkit |
| ------------------ | -------------- | ---------------- | ------------- |
| **Complejidad**    | ⭐⭐           | ⭐⭐⭐           | ⭐⭐⭐⭐⭐    |
| **Sincronización** | ⭐⭐           | ⭐⭐⭐⭐⭐       | ⭐⭐⭐⭐⭐    |
| **Performance**    | ⭐⭐⭐         | ⭐⭐⭐⭐         | ⭐⭐⭐⭐⭐    |
| **Debugging**      | ⭐⭐           | ⭐⭐⭐           | ⭐⭐⭐⭐⭐    |
| **Bundle Size**    | ⭐⭐⭐⭐⭐     | ⭐⭐⭐⭐         | ⭐⭐⭐        |
| **Learning Curve** | ⭐⭐⭐⭐⭐     | ⭐⭐⭐⭐         | ⭐⭐          |

## 🎯 Recomendación Final

### **Para Esta Aplicación: Context API Mejorado** ⭐

**Razones:**

- Mantiene simplicidad existente
- Resuelve problemas de sincronización
- Escalable para funcionalidades futuras
- No requiere reescribir toda la aplicación
- Team familiar con Context API

### **Considera Redux Solo Si:**

- El equipo crece significativamente
- Necesitas time-travel debugging frecuente
- La app se vuelve una SPA compleja con 20+ páginas
- Requieres middleware avanzado (sagas, observables)

## 📋 Plan de Implementación

### Fase 1: Preparación

1. Crear UIContext consolidado
2. Migrar Theme + Sidebar a UIContext
3. Testing para verificar no hay regresiones

### Fase 2: Cache de Datos

1. Crear DataContext con reducers
2. Implementar hooks de sincronización
3. Migrar Dashboard y ReservationsList

### Fase 3: Optimizaciones

1. Implementar optimistic updates
2. Cache inteligente con TTL
3. Modales globales centralizados

### Estimación: 2-3 semanas de desarrollo incremental

## 🔧 Herramientas Complementarias

Si decides mantener Context API:

- **React Query/TanStack Query**: Para cache de API y sincronización
- **Zustand**: Alternative más simple que Redux para estado global específico
- **Jotai**: Para estado atómico granular
