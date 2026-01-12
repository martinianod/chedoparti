import { createContext, useContext, useReducer, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';

// 🎯 UIContext - Contexto consolidado para UI state (theme + sidebar + modales)
const UIContext = createContext(null);

// 🔄 Reducer para manejar todo el estado de UI
const uiReducer = (state, action) => {
  switch (action.type) {
    case 'TOGGLE_THEME':
      return {
        ...state,
        theme: state.theme === 'dark' ? 'light' : 'dark',
      };

    case 'SET_THEME':
      return {
        ...state,
        theme: action.payload,
      };

    case 'TOGGLE_SIDEBAR':
      return {
        ...state,
        sidebarCollapsed: !state.sidebarCollapsed,
      };

    case 'SET_SIDEBAR_COLLAPSED':
      return {
        ...state,
        sidebarCollapsed: action.payload,
      };

    case 'SHOW_MODAL':
      return {
        ...state,
        modals: {
          ...state.modals,
          [action.payload.id]: {
            isOpen: true,
            props: action.payload.props || {},
          },
        },
      };

    case 'HIDE_MODAL':
      return {
        ...state,
        modals: {
          ...state.modals,
          [action.payload]: {
            ...state.modals[action.payload],
            isOpen: false,
          },
        },
      };

    case 'CLEAR_MODAL':
      const { [action.payload]: removed, ...remainingModals } = state.modals;
      return {
        ...state,
        modals: remainingModals,
      };

    default:
      return state;
  }
};

// 🏗️ Estado inicial
const initialState = {
  theme: 'light',
  sidebarCollapsed: false,
  modals: {},
};

// 🎛️ UIProvider - Provider consolidado
export function UIProvider({ children }) {
  // Inicializar estado desde localStorage
  const [state, dispatch] = useReducer(uiReducer, initialState, (initial) => {
    try {
      const savedTheme = localStorage.getItem('theme');
      const savedSidebar = localStorage.getItem('sidebar-collapsed');

      return {
        ...initial,
        theme: savedTheme || initial.theme,
        sidebarCollapsed: savedSidebar ? JSON.parse(savedSidebar) : initial.sidebarCollapsed,
      };
    } catch {
      return initial;
    }
  });

  // 🎨 Efecto para aplicar tema al DOM
  useEffect(() => {
    const root = document.documentElement;
    if (state.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    try {
      localStorage.setItem('theme', state.theme);
    } catch (error) {
      console.warn('Cannot save theme to localStorage:', error);
    }
  }, [state.theme]);

  // 📱 Efecto para persistir estado del sidebar
  useEffect(() => {
    try {
      localStorage.setItem('sidebar-collapsed', JSON.stringify(state.sidebarCollapsed));
    } catch (error) {
      console.warn('Cannot save sidebar state to localStorage:', error);
    }
  }, [state.sidebarCollapsed]);

  // 🚀 Acciones optimizadas con useMemo para mejor performance
  const actions = useMemo(
    () => ({
      // Theme actions
      toggleTheme: () => dispatch({ type: 'TOGGLE_THEME' }),
      setTheme: (theme) => dispatch({ type: 'SET_THEME', payload: theme }),

      // Sidebar actions
      toggleSidebar: () => dispatch({ type: 'TOGGLE_SIDEBAR' }),
      setSidebarCollapsed: (collapsed) =>
        dispatch({
          type: 'SET_SIDEBAR_COLLAPSED',
          payload: collapsed,
        }),

      // Modal actions
      showModal: (id, props = {}) =>
        dispatch({
          type: 'SHOW_MODAL',
          payload: { id, props },
        }),
      hideModal: (id) => dispatch({ type: 'HIDE_MODAL', payload: id }),
      clearModal: (id) => dispatch({ type: 'CLEAR_MODAL', payload: id }),

      // Utilidad para verificar si un modal está abierto
      isModalOpen: (id) => state.modals[id]?.isOpen || false,
      getModalProps: (id) => state.modals[id]?.props || {},
    }),
    [state.modals]
  );

  // 📦 Value optimizado para evitar re-renders innecesarios
  const value = useMemo(
    () => ({
      // Estado
      theme: state.theme,
      sidebarCollapsed: state.sidebarCollapsed,
      modals: state.modals,

      // Acciones
      ...actions,

      // Helpers derivados
      isDark: state.theme === 'dark',
      isLight: state.theme === 'light',
    }),
    [state, actions]
  );

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

UIProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// 🎯 Hook principal para acceder a UIContext
export function useUI() {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
}

// 🎨 Hook específico para tema (backward compatibility)
export function useTheme() {
  const { theme, isDark, isLight, toggleTheme, setTheme } = useUI();

  return {
    theme,
    isDark,
    isLight,
    toggle: toggleTheme,
    setTheme,
  };
}

// 📱 Hook específico para sidebar (backward compatibility)
export function useSidebar() {
  const { sidebarCollapsed, toggleSidebar, setSidebarCollapsed } = useUI();

  return {
    collapsed: sidebarCollapsed,
    toggleSidebar,
    setCollapsed: setSidebarCollapsed,
  };
}

// 🪟 Hook específico para modales
export function useModal(modalId) {
  const { showModal, hideModal, clearModal, isModalOpen, getModalProps } = useUI();

  return {
    isOpen: isModalOpen(modalId),
    props: getModalProps(modalId),
    show: (props) => showModal(modalId, props),
    hide: () => hideModal(modalId),
    clear: () => clearModal(modalId),
  };
}

export default UIContext;
