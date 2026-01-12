import React, { useState } from 'react';

/**
 * Preset color palette for groups
 */
export const GROUP_COLORS = [
  { name: 'Azul', value: '#3B82F6' },
  { name: 'Verde', value: '#10B981' },
  { name: 'Ámbar', value: '#F59E0B' },
  { name: 'Rojo', value: '#EF4444' },
  { name: 'Púrpura', value: '#8B5CF6' },
  { name: 'Rosa', value: '#EC4899' },
  { name: 'Cian', value: '#06B6D4' },
  { name: 'Lima', value: '#84CC16' },
  { name: 'Naranja', value: '#F97316' },
  { name: 'Índigo', value: '#6366F1' },
  { name: 'Turquesa', value: '#14B8A6' },
  { name: 'Violeta', value: '#A855F7' },
];

/**
 * Color Picker Component
 * Dropdown with preset color palette for groups
 */
export default function ColorPicker({ value, onChange, className = '' }) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedColor = GROUP_COLORS.find((c) => c.value === value) || GROUP_COLORS[0];

  const handleSelect = (color) => {
    onChange(color.value);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-navy-light hover:bg-gray-50 dark:hover:bg-navy transition-colors"
      >
        <span
          className="w-6 h-6 rounded-full border-2 border-white dark:border-navy shadow-sm"
          style={{ backgroundColor: selectedColor.value }}
        />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
          {selectedColor.name}
        </span>
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute z-20 mt-2 w-64 bg-white dark:bg-navy-light border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
            <div className="grid grid-cols-6 gap-2">
              {GROUP_COLORS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => handleSelect(color)}
                  className={`w-8 h-8 rounded-full transition-all hover:scale-110 ${
                    color.value === value
                      ? 'ring-2 ring-navy dark:ring-gold ring-offset-2 dark:ring-offset-navy-light'
                      : ''
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                  aria-label={`Seleccionar color ${color.name}`}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
