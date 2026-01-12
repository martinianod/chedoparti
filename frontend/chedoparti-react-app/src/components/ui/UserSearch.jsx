import React, { useState, useEffect, useRef } from 'react';
import { FiSearch, FiUser, FiCheck } from 'react-icons/fi';

/**
 * Componente de búsqueda de usuarios que busca por múltiples campos
 * @param {Object} props
 * @param {Function} props.onUserSelect - Callback cuando se selecciona un usuario
 * @param {string} props.placeholder - Placeholder del input
 * @param {Array} props.users - Lista de usuarios para buscar
 * @param {Object} props.selectedUser - Usuario actualmente seleccionado
 * @param {string} props.label - Label del campo
 * @param {boolean} props.required - Si es requerido
 */
export default function UserSearch({
  onUserSelect,
  placeholder = 'Buscar por nombre, email, teléfono o número de socio...',
  users = [],
  selectedUser = null,
  label = 'Cliente',
  required = false,
}) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Filtrar usuarios basado en la búsqueda
  useEffect(() => {
    if (!query.trim()) {
      setFilteredUsers([]);
      return;
    }

    const searchTerm = query.toLowerCase().trim();
    const filtered = users
      .filter((user) => {
        // Buscar en nombre completo
        const fullName =
          `${user.name || ''} ${user.firstName || ''} ${user.lastName || ''}`.toLowerCase();
        if (fullName.includes(searchTerm)) return true;

        // Buscar en email
        if (user.email && user.email.toLowerCase().includes(searchTerm)) return true;

        // Buscar en teléfono (sin espacios ni guiones)
        if (user.phone) {
          const cleanPhone = user.phone.replace(/[\s-]/g, '');
          const cleanSearch = searchTerm.replace(/[\s-]/g, '');
          if (cleanPhone.includes(cleanSearch)) return true;
        }

        // Buscar en número de socio
        if (user.membershipNumber && user.membershipNumber.toLowerCase().includes(searchTerm))
          return true;

        // Buscar en ID
        if (user.id && user.id.toString().includes(searchTerm)) return true;

        return false;
      })
      .slice(0, 8); // Limitar a 8 resultados

    setFilteredUsers(filtered);
    setHighlightedIndex(-1);
  }, [query, users]);

  // Inicializar con usuario seleccionado
  useEffect(() => {
    if (selectedUser) {
      const displayName =
        selectedUser.name ||
        `${selectedUser.firstName || ''} ${selectedUser.lastName || ''}`.trim() ||
        selectedUser.email ||
        'Usuario seleccionado';
      setQuery(displayName);
    }
  }, [selectedUser]);

  // Manejar selección de usuario
  const handleSelectUser = (user) => {
    const displayName =
      user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email;

    setQuery(displayName);
    setIsOpen(false);
    setHighlightedIndex(-1);
    onUserSelect(user);
  };

  // Manejar teclas
  const handleKeyDown = (e) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev < filteredUsers.length - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : filteredUsers.length - 1));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && filteredUsers[highlightedIndex]) {
          handleSelectUser(filteredUsers[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  // Manejar cambio de input
  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setIsOpen(true);

    // Si se borra el input, limpiar selección
    if (!value.trim()) {
      onUserSelect(null);
    }
  };

  // Formatear información del usuario para mostrar
  const formatUserInfo = (user) => {
    const name = user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim();
    const details = [];

    if (user.membershipNumber) details.push(`#${user.membershipNumber}`);
    if (user.email && name.toLowerCase() !== user.email.toLowerCase()) details.push(user.email);
    if (user.phone) details.push(user.phone);

    return {
      name: name || user.email || 'Usuario',
      details: details.join(' • '),
    };
  };

  // Resaltar texto que coincide
  const highlightMatch = (text, search) => {
    if (!search) return text;

    const regex = new RegExp(`(${search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark
          key={index}
          className="bg-yellow-200 dark:bg-yellow-600 text-gray-900 dark:text-white"
        >
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => query && setIsOpen(true)}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                   focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                   bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                   placeholder-gray-500 dark:placeholder-gray-400"
          required={required}
        />

        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />

        {selectedUser && (
          <FiCheck className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500 w-4 h-4" />
        )}
      </div>

      {/* Dropdown de resultados */}
      {isOpen && filteredUsers.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 
                   rounded-lg shadow-lg max-h-64 overflow-y-auto"
        >
          {filteredUsers.map((user, index) => {
            const userInfo = formatUserInfo(user);
            const isHighlighted = index === highlightedIndex;

            return (
              <div
                key={user.id || user.email}
                onClick={() => handleSelectUser(user)}
                className={`px-4 py-3 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-b-0
                          ${
                            isHighlighted
                              ? 'bg-blue-50 dark:bg-blue-900/20'
                              : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0 mr-3">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                      <FiUser className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {highlightMatch(userInfo.name, query)}
                    </div>
                    {userInfo.details && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {highlightMatch(userInfo.details, query)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Mensaje cuando no hay resultados */}
      {isOpen && query && filteredUsers.length === 0 && (
        <div
          className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 
                       rounded-lg shadow-lg p-4"
        >
          <div className="text-center text-gray-500 dark:text-gray-400 text-sm">
            No se encontraron usuarios que coincidan con "{query}"
          </div>
        </div>
      )}
    </div>
  );
}
