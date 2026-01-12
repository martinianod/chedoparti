import { useState, useCallback, useEffect } from 'react';
import { useAppNotifications } from './useAppNotifications';
import { handleApiError } from '../utils/errorHandler';

/**
 * Custom hook para manejar la búsqueda de miembros/socios
 * Usado principalmente por ADMINs para buscar y seleccionar socios
 * 
 * @param {Object} options - Opciones de configuración
 * @param {boolean} options.enabled - Si la búsqueda está habilitada
 * @param {string} options.filterByRole - Filtrar por rol específico (ej: 'COACH')
 * @param {Function} options.onSelect - Callback cuando se selecciona un miembro
 * @returns {Object} Estado y funciones de búsqueda
 */
export function useMemberSearch({ enabled = true, filterByRole = null, onSelect } = {}) {
  const { reservation: notifications } = useAppNotifications();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  /**
   * Realiza la búsqueda de miembros en la API
   */
  const searchMembers = useCallback(
    async (term) => {
      if (!enabled || !term || term.length < 2) {
        setResults([]);
        setShowDropdown(false);
        return;
      }

      setIsSearching(true);
      try {
        const { usersApi } = await import('../services/api');
        const response = await usersApi.searchMembers(term);
        let members = response.data || [];

        // Filtrar por rol si se especifica
        if (filterByRole) {
          members = members.filter(
            (m) => m.role === filterByRole || (m.roles && m.roles.includes(filterByRole))
          );
        }

        setResults(members);
        setShowDropdown(members.length > 0);
      } catch (error) {
        console.error('❌ Error searching members:', error);
        handleApiError(error, notifications, { showNotification: false });
        setResults([]);
        setShowDropdown(false);
      } finally {
        setIsSearching(false);
      }
    },
    [enabled, filterByRole, notifications]
  );

  /**
   * Debounced search effect
   */
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm) {
        searchMembers(searchTerm);
      }
    }, 300); // Wait 300ms after user stops typing

    return () => clearTimeout(timeoutId);
  }, [searchTerm, searchMembers]);

  /**
   * Maneja la selección de un miembro
   */
  const handleSelect = useCallback(
    (member) => {
      setSelectedMember(member);
      setSearchTerm(member.name);
      setShowDropdown(false);

      // Callback externo
      if (onSelect && typeof onSelect === 'function') {
        onSelect(member);
      }
    },
    [onSelect]
  );

  /**
   * Maneja el cambio en el campo de búsqueda
   */
  const handleSearchChange = useCallback((value) => {
    setSearchTerm(value);

    // Si se limpia el campo, limpiar también la selección
    if (!value) {
      setSelectedMember(null);
      setResults([]);
      setShowDropdown(false);
    }
  }, []);

  /**
   * Limpia toda la búsqueda
   */
  const clear = useCallback(() => {
    setSearchTerm('');
    setResults([]);
    setShowDropdown(false);
    setSelectedMember(null);
  }, []);

  return {
    // Estado
    searchTerm,
    results,
    showDropdown,
    selectedMember,
    isSearching,
    
    // Funciones
    setSearchTerm: handleSearchChange,
    handleSelect,
    clear,
    
    // Helpers
    hasSelection: !!selectedMember,
  };
}
