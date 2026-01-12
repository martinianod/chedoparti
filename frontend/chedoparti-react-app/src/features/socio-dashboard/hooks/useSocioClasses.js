import { useMemo } from 'react';
import { useStudentClasses, useAttendanceConfirmation } from '../../../hooks/useStudentClasses';
import { filterByDateRange } from '../utils/reservationGrouping';

/**
 * Hook for managing Socio classes
 * Specialized wrapper for class operations in Socio context
 * 
 * @param {string} userId - User ID
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 * @returns {Object} Classes data and operations
 */
export function useSocioClasses(userId, startDate, endDate) {
  // Fetch classes for the user
  const { classes: allClasses, isLoading, error } = useStudentClasses(
    userId,
    startDate,
    endDate
  );

  const { confirmAttendance } = useAttendanceConfirmation();

  // Filter and process classes
  const userClasses = useMemo(() => {
    if (!allClasses) return [];

    let filtered = allClasses;

    // Filter by date range (additional filtering if needed)
    if (startDate && endDate) {
      filtered = filterByDateRange(filtered, startDate, endDate);
    }

    return filtered;
  }, [allClasses, startDate, endDate]);

  // Separate upcoming and past classes
  const { upcomingClasses, pastClasses } = useMemo(() => {
    const now = new Date();

    const upcoming = userClasses.filter((c) => {
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

    const past = userClasses.filter((c) => {
      try {
        const classDate = new Date(c.date || c.startAt?.split('T')[0]);
        const classTime = c.time || c.startAt?.split('T')[1]?.substring(0, 5) || '00:00';
        const [hours, minutes] = classTime.split(':').map(Number);
        classDate.setHours(hours, minutes, 0, 0);
        
        return classDate <= now;
      } catch {
        return false;
      }
    });

    return { upcomingClasses: upcoming, pastClasses: past };
  }, [userClasses]);

  return {
    classes: userClasses,
    upcomingClasses,
    pastClasses,
    isLoading,
    error,
    confirmAttendance,
    declineAttendance: (classId) => confirmAttendance(classId, 'declined'),
  };
}

export default useSocioClasses;
