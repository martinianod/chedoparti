import { useState, useEffect, useCallback } from 'react';
import { usersApi } from '../services/api';
import { handleApiError } from '../utils/errorHandler';
import { useAppNotifications } from './useAppNotifications';

/**
 * Custom hook para manejar la configuración y cuotas de coaches
 * 
 * @param {Object} user - Usuario actual
 * @param {boolean} open - Si el modal/componente está abierto
 * @param {Array} reservations - Lista de reservas para calcular cuotas
 * @returns {Object} Configuración del coach y funciones relacionadas
 */
export function useCoachConfig(user, open, reservations = []) {
  const { reservation: notifications } = useAppNotifications();
  const [config, setConfig] = useState(null);
  const [weeklyReservations, setWeeklyReservations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const isCoach = user?.role === 'COACH' || user?.roles?.includes('COACH');

  /**
   * Calcula el número de semana del año
   */
  const getWeekNumber = useCallback((date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return weekNo;
  }, []);

  /**
   * Calcula las horas ya reservadas en la semana actual
   */
  const calculateWeeklyHours = useCallback(
    (targetDate) => {
      if (!weeklyReservations.length) return 0;

      const targetWeek = getWeekNumber(new Date(targetDate));

      return weeklyReservations.reduce((total, res) => {
        const resDate = new Date(res.date);
        if (getWeekNumber(resDate) === targetWeek) {
          // Calcular duración de esta reserva
          let duration = 1; // Default 1h
          if (res.duration) {
            if (res.duration.includes(':')) {
              const [h, m] = res.duration.split(':').map(Number);
              duration = h + m / 60;
            } else {
              duration = parseFloat(res.duration);
            }
          }
          return total + duration;
        }
        return total;
      }, 0);
    },
    [weeklyReservations, getWeekNumber]
  );

  /**
   * Valida si una nueva reserva excede la cuota semanal
   */
  const validateWeeklyQuota = useCallback(
    (reservationDate, durationString) => {
      if (!config?.weeklyHourQuota || config.weeklyHourQuota <= 0) {
        return { valid: true };
      }

      // Calcular duración de la nueva reserva
      const [newDurH, newDurM] = durationString.split(':').map(Number);
      const newDurationHours = newDurH + newDurM / 60;

      // Calcular horas ya reservadas esta semana
      const weeklyHours = calculateWeeklyHours(reservationDate);

      if (weeklyHours + newDurationHours > config.weeklyHourQuota) {
        return {
          valid: false,
          message: `Excederías tu cuota semanal de ${config.weeklyHourQuota} horas. Llevas reservadas ${weeklyHours.toFixed(1)}hs esta semana.`,
          currentHours: weeklyHours,
          quota: config.weeklyHourQuota,
        };
      }

      return { valid: true, currentHours: weeklyHours, quota: config.weeklyHourQuota };
    },
    [config, calculateWeeklyHours]
  );

  /**
   * Valida si una cancha está asignada al coach
   */
  const validateAssignedCourt = useCallback(
    (courtId) => {
      if (!config?.assignedCourts || config.assignedCourts.length === 0) {
        return { valid: true };
      }

      const isAssigned = config.assignedCourts.includes(Number(courtId));

      if (!isAssigned) {
        return {
          valid: false,
          message: 'No tienes permiso para reservar en esta cancha. Por favor selecciona una de tus canchas asignadas.',
          assignedCourts: config.assignedCourts,
        };
      }

      return { valid: true, assignedCourts: config.assignedCourts };
    },
    [config]
  );

  /**
   * Carga la configuración del coach
   */
  useEffect(() => {
    const loadCoachData = async () => {
      if (!isCoach || !open || !user) return;

      setIsLoading(true);
      try {
        // Cargar configuración del usuario
        const userResponse = await usersApi.get(user.id || user.email);
        setConfig({
          assignedCourts: userResponse.data.assignedCourts || [],
          weeklyHourQuota: userResponse.data.weeklyHourQuota || 0,
        });

        // Filtrar reservas del coach
        const myReservations = reservations.filter(
          (r) => r.userId === user.id || r.userId === user.email
        );
        setWeeklyReservations(myReservations);
      } catch (error) {
        console.error('Error loading coach data:', error);
        handleApiError(error, notifications, { showNotification: false });
      } finally {
        setIsLoading(false);
      }
    };

    loadCoachData();
  }, [user, open, reservations, isCoach, notifications]);

  return {
    config,
    weeklyReservations,
    isLoading,
    validateWeeklyQuota,
    validateAssignedCourt,
    calculateWeeklyHours,
    getWeekNumber,
  };
}
