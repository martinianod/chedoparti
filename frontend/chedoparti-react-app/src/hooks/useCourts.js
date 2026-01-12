import { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { courtsApi, institutionsApi } from '../services/api';

/**
 * Hook para gestionar canchas con cache y filtrado
 * 
 * @param {Object} options - Opciones de configuración
 * @param {string} options.sport - Deporte para filtrar (opcional)
 * @param {boolean} options.activeOnly - Solo canchas activas (default: true)
 * @param {number} options.institutionId - ID de institución (opcional, se obtiene automáticamente)
 * @returns {Object} { courts, filteredCourts, sports, isLoading, error, refetch }
 */
export function useCourts({ sport = null, activeOnly = true, institutionId = null } = {}) {
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
            setDefaultInstitutionId(1); // Fallback
          }
        })
        .catch(() => {
          setDefaultInstitutionId(1); // Fallback on error
        });
    }
  }, [institutionId, defaultInstitutionId]);

  const effectiveInstitutionId = institutionId || defaultInstitutionId;

  // Query para obtener canchas
  const {
    data: courts = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['courts', effectiveInstitutionId, activeOnly],
    queryFn: async () => {
      if (!effectiveInstitutionId) return [];
      
      try {
        const response = activeOnly
          ? await courtsApi.listActive(effectiveInstitutionId)
          : await courtsApi.list(effectiveInstitutionId, { page: 0, size: 100, sort: 'name' });

        const courtsPayload = response?.data;
        const rawCourts = Array.isArray(courtsPayload?.content)
          ? courtsPayload.content
          : Array.isArray(courtsPayload)
            ? courtsPayload
            : [];

        // Normalizar canchas
        return rawCourts.map((court) => ({
          ...court,
          sport: court?.sport || 'Padel',
        }));
      } catch (error) {
        console.error('[useCourts] Error fetching courts:', error);
        return [];
      }
    },
    enabled: !!effectiveInstitutionId,
    staleTime: 1000 * 60 * 5, // 5 minutos
    cacheTime: 1000 * 60 * 10, // 10 minutos
  });

  // Filtrar canchas por deporte
  const filteredCourts = useMemo(() => {
    if (!sport) return courts;
    return courts.filter((c) => c.sport === sport);
  }, [courts, sport]);

  // Obtener lista de deportes únicos
  const sports = useMemo(() => {
    const unique = new Set(courts.map((court) => court.sport || 'Padel'));
    const list = Array.from(unique);
    return list.length > 0 ? list : ['Padel'];
  }, [courts]);

  return {
    courts,
    filteredCourts,
    sports,
    isLoading,
    error,
    refetch,
    isEmpty: courts.length === 0,
    count: courts.length,
    filteredCount: filteredCourts.length,
  };
}

/**
 * Hook para obtener una cancha específica por ID
 * 
 * @param {number} courtId - ID de la cancha
 * @returns {Object} { court, isLoading, error }
 */
export function useCourt(courtId) {
  const { courts, isLoading, error } = useCourts();

  const court = useMemo(() => {
    return courts.find((c) => c.id === courtId) || null;
  }, [courts, courtId]);

  return {
    court,
    isLoading,
    error,
    exists: !!court,
  };
}

/**
 * Hook para obtener canchas agrupadas por deporte
 * 
 * @returns {Object} { courtsBySport, sports, isLoading, error }
 */
export function useCourtsBySport() {
  const { courts, sports, isLoading, error } = useCourts();

  const courtsBySport = useMemo(() => {
    const grouped = {};
    sports.forEach((sport) => {
      grouped[sport] = courts.filter((c) => c.sport === sport);
    });
    return grouped;
  }, [courts, sports]);

  return {
    courtsBySport,
    sports,
    isLoading,
    error,
  };
}

export default useCourts;
