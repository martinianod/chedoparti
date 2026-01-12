import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { institutionsApi } from '../services/api';
import { getSlotInterval, generateTimeSlots, getDayOfWeekSpanish } from '../services/institutionConfig';

/**
 * Hook para gestionar configuración de la institución
 * Incluye horarios, precios, reglas de negocio, etc.
 * 
 * @param {number} institutionId - ID de la institución (opcional)
 * @returns {Object} Configuración y métodos de la institución
 */
export function useInstitution(institutionId = null) {
  const [defaultInstitutionId, setDefaultInstitutionId] = useState(institutionId);

  // Obtener ID de institución si no se proporciona
  useEffect(() => {
    if (!institutionId && !defaultInstitutionId) {
      institutionsApi.list()
        .then(response => {
          const institutions = response?.data || [];
          if (institutions.length > 0) {
            setDefaultInstitutionId(institutions[0].id);
          } else {
            setDefaultInstitutionId(1);
          }
        })
        .catch(() => {
          setDefaultInstitutionId(1);
        });
    }
  }, [institutionId, defaultInstitutionId]);

  const effectiveInstitutionId = institutionId || defaultInstitutionId;

  // Query para obtener datos de la institución
  const {
    data: institution,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['institution', effectiveInstitutionId],
    queryFn: async () => {
      if (!effectiveInstitutionId) return null;
      
      try {
        const response = await institutionsApi.getById(effectiveInstitutionId);
        return response?.data || null;
      } catch (error) {
        console.error('[useInstitution] Error fetching institution:', error);
        return null;
      }
    },
    enabled: !!effectiveInstitutionId,
    staleTime: 1000 * 60 * 10, // 10 minutos
    cacheTime: 1000 * 60 * 30, // 30 minutos
  });

  // Configuración de horarios
  const scheduleConfig = useMemo(() => {
    try {
      const stored = window.localStorage.getItem('institution_schedule');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }, []);

  // Intervalo de slots
  const slotInterval = useMemo(() => {
    return getSlotInterval();
  }, []);

  // Generar slots para un día específico
  const getSlotsForDay = useMemo(() => {
    return (date) => {
      const dayOfWeek = getDayOfWeekSpanish(date);
      return generateTimeSlots(dayOfWeek, slotInterval);
    };
  }, [slotInterval]);

  // Configuración de precios (placeholder - se puede extender)
  const pricingConfig = useMemo(() => {
    try {
      const stored = window.localStorage.getItem('institution_pricing');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }, []);

  // Reglas de negocio
  const businessRules = useMemo(() => {
    return {
      // Duración mínima de reserva (en minutos)
      minReservationDuration: 30,
      // Duración máxima de reserva (en minutos)
      maxReservationDuration: 180,
      // Anticipación mínima para reservar (en horas)
      minAdvanceBooking: 0,
      // Anticipación máxima para reservar (en días)
      maxAdvanceBooking: 30,
      // Permitir reservas en el pasado (solo admin)
      allowPastReservations: false,
      // Permitir overlapping de reservas
      allowOverlapping: false,
    };
  }, []);

  return {
    // Datos
    institution,
    scheduleConfig,
    pricingConfig,
    businessRules,
    slotInterval,
    
    // Estados
    isLoading,
    error,
    
    // Métodos
    getSlotsForDay,
    refetch,
    
    // Flags
    isConfigured: !!institution,
    hasSchedule: !!scheduleConfig,
    hasPricing: !!pricingConfig,
  };
}

export default useInstitution;
