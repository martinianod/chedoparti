import React from 'react';

/**
 * Genera slots de tiempo en intervalos de media hora (00:00, 00:30, 01:00, ..., 23:30)
 * @returns {string[]} Array de strings con formato HH:mm
 */
const generateHalfHourSlots = () => {
  const slots = [];
  for (let hour = 0; hour < 24; hour++) {
    slots.push(`${String(hour).padStart(2, '0')}:00`);
    slots.push(`${String(hour).padStart(2, '0')}:30`);
  }
  return slots;
};

const TIME_SLOTS = generateHalfHourSlots();

/**
 * Selector de tiempo con intervalos de media hora
 * Componente reutilizable y responsive para selección de horas
 * 
 * @param {Object} props
 * @param {string} props.value - Valor actual (formato HH:mm)
 * @param {function} props.onChange - Callback cuando cambia el valor
 * @param {string} [props.label] - Etiqueta opcional para el selector
 * @param {string} [props.placeholder='Seleccionar hora'] - Texto del placeholder
 * @param {string} [props.className] - Clases CSS adicionales
 * @param {boolean} [props.disabled=false] - Si el selector está deshabilitado
 * @param {boolean} [props.required=false] - Si el campo es requerido
 * @param {string} [props.name] - Nombre del campo para formularios
 */
import MobileSelect from './MobileSelect';

export default function TimeSelector({
  value,
  onChange,
  label,
  placeholder = 'Seleccionar hora',
  className = '',
  disabled = false,
  required = false,
  name,
  ...rest
}) {
  const options = TIME_SLOTS.map((slot) => ({
    value: slot,
    label: slot,
  }));

  return (
    <MobileSelect
      value={value}
      onChange={onChange}
      label={label}
      placeholder={placeholder}
      options={options}
      disabled={disabled}
      className={className}
    />
  );
}

/**
 * Hook para obtener los slots de tiempo disponibles
 * Útil si necesitas los slots fuera del componente
 */
export const useTimeSlots = () => TIME_SLOTS;

/**
 * Función helper para validar si un tiempo está en formato válido de media hora
 * @param {string} time - Tiempo en formato HH:mm
 * @returns {boolean} true si es válido (00 o 30 minutos)
 */
export const isValidHalfHourTime = (time) => {
  if (!time || typeof time !== 'string') return false;
  const [hours, minutes] = time.split(':');
  return (
    hours !== undefined &&
    minutes !== undefined &&
    parseInt(hours) >= 0 &&
    parseInt(hours) < 24 &&
    (minutes === '00' || minutes === '30')
  );
};
