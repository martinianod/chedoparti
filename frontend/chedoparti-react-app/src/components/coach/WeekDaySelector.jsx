import React from 'react';

/**
 * Week Day Selector Component
 * Multi-select toggle buttons for days of the week
 */
const DAYS = [
  { value: 0, label: 'Dom', fullLabel: 'Domingo' },
  { value: 1, label: 'Lun', fullLabel: 'Lunes' },
  { value: 2, label: 'Mar', fullLabel: 'Martes' },
  { value: 3, label: 'Mié', fullLabel: 'Miércoles' },
  { value: 4, label: 'Jue', fullLabel: 'Jueves' },
  { value: 5, label: 'Vie', fullLabel: 'Viernes' },
  { value: 6, label: 'Sáb', fullLabel: 'Sábado' },
];

export default function WeekDaySelector({ selectedDays = [], onChange, className = '', disabled = false }) {
  const handleToggle = (dayValue) => {
    if (disabled) return;
    
    const isSelected = selectedDays.includes(dayValue);
    
    if (isSelected) {
      // Remove day
      onChange(selectedDays.filter((d) => d !== dayValue));
    } else {
      // Add day (keep sorted)
      const newDays = [...selectedDays, dayValue].sort((a, b) => a - b);
      onChange(newDays);
    }
  };

  const handleSelectAll = () => {
    if (disabled) return;
    
    if (selectedDays.length === DAYS.length) {
      // Deselect all
      onChange([]);
    } else {
      // Select all
      onChange(DAYS.map((d) => d.value));
    }
  };

  return (
    <div className={className}>
      <div className="flex flex-wrap gap-2">
        {DAYS.map((day) => {
          const isSelected = selectedDays.includes(day.value);
          
          return (
            <button
              key={day.value}
              type="button"
              onClick={() => handleToggle(day.value)}
              disabled={disabled}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                isSelected
                  ? 'bg-navy dark:bg-gold text-white dark:text-navy ring-2 ring-navy dark:ring-gold'
                  : 'bg-gray-100 dark:bg-navy-light text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-navy'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              title={day.fullLabel}
            >
              {day.label}
            </button>
          );
        })}
        
        {/* Select All Button */}
        <button
          type="button"
          onClick={handleSelectAll}
          disabled={disabled}
          className={`px-4 py-2 rounded-lg font-medium border-2 border-dashed transition-all ${
            selectedDays.length === DAYS.length
              ? 'border-navy dark:border-gold text-navy dark:text-gold'
              : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          {selectedDays.length === DAYS.length ? 'Ninguno' : 'Todos'}
        </button>
      </div>

      {/* Selected Days Summary */}
      {selectedDays.length > 0 && (
        <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
          <span className="font-medium">Seleccionados:</span>{' '}
          {selectedDays
            .map((dayValue) => DAYS.find((d) => d.value === dayValue)?.fullLabel)
            .join(', ')}
        </div>
      )}
    </div>
  );
}
