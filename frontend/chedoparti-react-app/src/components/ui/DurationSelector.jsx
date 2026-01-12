import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Componente reutilizable para selector de duración con validación de disponibilidad
 * Funciona tanto para crear como editar reservas
 */
const DurationSelector = ({
  value,
  onChange,
  startTime,
  courtId,
  date,
  reservations = [],
  excludeReservationId = null,
  error = '',
  required = false,
  disabled = false,
  className = '',
}) => {
  const { t } = useTranslation();

  // Función para validar disponibilidad de horario
  const isDurationAvailable = (
    startTime,
    durationStr,
    courtId,
    date,
    excludeReservationId = null
  ) => {
    if (!startTime || typeof startTime !== 'string' || !durationStr || !courtId || !date) return false;

    // Convertir duración de "HH:MM" a minutos
    const [dh, dm] = durationStr.split(':').map(Number);
    const durationMins = dh * 60 + dm;

    const [sh, sm] = startTime.split(':').map(Number);
    const start = sh * 60 + sm;
    const end = start + durationMins;

    // Filtrar reservaciones para la misma cancha y fecha, excluyendo la actual si aplica
    const res = reservations.filter(
      (r) => r.courtId == courtId && r.date === date && r.id !== excludeReservationId
    );

    for (const r of res) {
      if (!r.time || !r.duration) continue;
      const [rh, rm] = r.time.split(':').map(Number);
      const rStart = rh * 60 + rm;

      // Convertir duración de la reserva existente
      let rDurationMins;
      if (r.duration.includes(':')) {
        const [rdh, rdm] = r.duration.split(':').map(Number);
        rDurationMins = rdh * 60 + rdm;
      } else {
        rDurationMins = parseInt(r.duration) || 60;
      }

      const rEnd = rStart + rDurationMins;

      // Verificar superposición
      if (start < rEnd && end > rStart) {
        return false;
      }
    }

    return true;
  };

  // Función helper para obtener el label de duración traducido
  const getDurationLabel = (durationMins) => {
    switch (durationMins) {
      case 30:
        return t('durationSelector.minutes30');
      case 60:
        return t('durationSelector.hour1');
      case 90:
        return t('durationSelector.hour1min30');
      case 120:
        return t('durationSelector.hours2');
      case 150:
        return t('durationSelector.hours2min30');
      case 180:
        return t('durationSelector.hours3');
      default:
        return `${durationMins} min`;
    }
  };

  // Función para obtener duraciones disponibles
  const getAvailableDurations = (startTime, courtId, date, excludeReservationId = null) => {
    if (!startTime || !courtId || !date) return [];

    // Duraciones posibles en minutos: 30min, 1h, 1.5h, 2h, 2.5h, 3h
    const possibleDurations = [30, 60, 90, 120, 150, 180];
    const availableDurations = [];

    for (const durationMins of possibleDurations) {
      // Convertir minutos a formato "HH:MM"
      const hours = Math.floor(durationMins / 60);
      const minutes = durationMins % 60;
      const durationStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

      // Verificar si esta duración está disponible
      if (isDurationAvailable(startTime, durationStr, courtId, date, excludeReservationId)) {
        availableDurations.push({
          value: durationStr,
          label: getDurationLabel(durationMins),
          minutes: durationMins,
        });
      }
    }

    return availableDurations;
  };

  // Calcular duraciones disponibles usando useMemo para evitar loops infinitos
  const availableDurations = useMemo(() => {
    if (!startTime || !courtId || !date) return [];
    return getAvailableDurations(startTime, courtId, date, excludeReservationId);
  }, [startTime, courtId, date, excludeReservationId, reservations]);

  const isCalculating = false; // Ya no necesitamos estado de carga

  const handleSelectChange = (e) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };

  const baseClasses =
    'w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700';
  const finalClasses = `${baseClasses} ${className}`;

  return (
    <div>
      <label className="block text-sm font-medium mb-1">
        {t('durationSelector.duration')}
        {availableDurations.length > 0 && !isCalculating && (
          <span className="text-xs text-green-600 dark:text-green-400 ml-1">
            ({availableDurations.length} {t('durationSelector.optionsAvailable')})
          </span>
        )}
        {isCalculating && (
          <span className="text-xs text-blue-600 dark:text-blue-400 ml-1">
            ({t('durationSelector.calculating')})
          </span>
        )}
      </label>

      <select
        name="duration"
        value={value}
        onChange={handleSelectChange}
        className={finalClasses}
        required={required}
        disabled={disabled || availableDurations.length === 0 || isCalculating}
      >
        {isCalculating ? (
          <option value="">{t('durationSelector.calculatingAvailability')}</option>
        ) : availableDurations.length === 0 ? (
          <option value="">{t('durationSelector.noOptionsAvailable')}</option>
        ) : (
          availableDurations.map((duration) => (
            <option key={duration.value} value={duration.value}>
              {duration.label}
            </option>
          ))
        )}
      </select>

      {/* Error de validación */}
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}

      {/* Mensaje informativo cuando no hay opciones */}
      {!isCalculating && availableDurations.length === 0 && startTime && courtId && (
        <p className="text-amber-600 dark:text-amber-400 text-sm mt-1">
          ⚠️ {t('durationSelector.noAvailableDurations')}
        </p>
      )}

      {/* Información adicional sobre disponibilidad */}
      {availableDurations.length > 0 && !isCalculating && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {t('durationSelector.availabilityInfo')}
        </p>
      )}
    </div>
  );
};

export default DurationSelector;
