import { useMemo } from 'react';
import { getNextReservation } from '../utils/reservationGrouping';

/**
 * Hook for calculating Socio dashboard statistics
 * @param {Array} reservations - User's reservations
 * @param {Array} classes - User's classes
 * @returns {Object} Statistics object
 */
export function useSocioStats(reservations = [], classes = []) {
  const stats = useMemo(() => {
    const now = new Date();

    // Filter upcoming reservations
    const upcomingReservations = reservations.filter((r) => {
      if (r.status === 'cancelled' || r.status === 'deleted') return false;
      
      try {
        const resDate = new Date(r.date || r.startAt?.split('T')[0]);
        const resTime = r.time || r.startAt?.split('T')[1]?.substring(0, 5) || '00:00';
        const [hours, minutes] = resTime.split(':').map(Number);
        resDate.setHours(hours, minutes, 0, 0);
        
        return resDate > now;
      } catch {
        return false;
      }
    });

    // Filter upcoming classes
    const upcomingClasses = classes.filter((c) => {
      try {
        const classDate = new Date(c.date || c.startAt?.split('T')[0]);
        const classTime = c.time || c.startAt?.split('T')[1]?.substring(0, 5) || '00:00';
        const [hours, minutes] = classTime.split(':').map(Number);
        classDate.setHours(hours, minutes, 0, 0);
        
        return classDate > now;
      } catch {
        return false;
      }
    });

    // Find next reservation
    const nextReservation = getNextReservation(upcomingReservations);

    // Calculate attendance rate for classes
    const attendedClasses = classes.filter(
      (c) => c.attendance === 'confirmed' || c.attendance === 'attended'
    ).length;
    const totalPastClasses = classes.filter((c) => {
      try {
        const classDate = new Date(c.date || c.startAt?.split('T')[0]);
        return classDate < now;
      } catch {
        return false;
      }
    }).length;
    const attendanceRate =
      totalPastClasses > 0
        ? Math.round((attendedClasses / totalPastClasses) * 100)
        : 0;

    // Count by type
    const reservationsByType = upcomingReservations.reduce((acc, r) => {
      const type = r.type || 'Normal';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    // Count by sport
    const reservationsBySport = upcomingReservations.reduce((acc, r) => {
      const sport = r.sport || 'Padel';
      acc[sport] = (acc[sport] || 0) + 1;
      return acc;
    }, {});

    return {
      // Counts
      totalReservations: reservations.length,
      upcomingReservationsCount: upcomingReservations.length,
      totalClasses: classes.length,
      upcomingClassesCount: upcomingClasses.length,
      
      // Next items
      nextReservation,
      nextClass: upcomingClasses[0] || null,
      
      // Attendance
      attendanceRate,
      attendedClasses,
      totalPastClasses,
      
      // By type
      reservationsByType,
      
      // By sport
      reservationsBySport,
      
      // Status
      hasUpcomingActivity:
        upcomingReservations.length > 0 || upcomingClasses.length > 0,
    };
  }, [reservations, classes]);

  return stats;
}

export default useSocioStats;
