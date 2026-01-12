import React from 'react';

/**
 * Simple Duration Selector Component
 * Dropdown for selecting duration in 30-minute intervals without complex validation
 */
export default function SimpleDurationSelector({ id, name, value, onChange, required = false, className = '' }) {
  // Common durations (30 min to 3 hours)
  const durations = [
    { value: '00:30', label: '30 minutos' },
    { value: '01:00', label: '1 hora' },
    { value: '01:30', label: '1 hora 30 min' },
    { value: '02:00', label: '2 horas' },
    { value: '02:30', label: '2 horas 30 min' },
    { value: '03:00', label: '3 horas' },
  ];

  return (
    <select
      id={id}
      name={name}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      className={`input ${className}`}
    >
      {durations.map((duration) => (
        <option key={duration.value} value={duration.value}>
          {duration.label}
        </option>
      ))}
    </select>
  );
}
