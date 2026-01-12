import React, { useState } from 'react';
import Card from '../../../components/ui/Card';
import AttendanceRow from './AttendanceRow';
import useAuth from '../../../hooks/useAuth';
import useGroups from '../../../hooks/useGroups';
import useCoachSchedules from '../../../hooks/useCoachSchedules';
import useAttendance from '../../../hooks/useAttendance';
import { getArgentinaDate } from '../../../utils/dateUtils';

/**
 * Attendance View
 * Main page for tracking attendance
 */
export default function AttendanceView() {
  const { user } = useAuth();
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [weekStart, setWeekStart] = useState(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(today.setDate(diff));
    return monday.toISOString().split('T')[0];
  });

  // Fetch groups
  const { groups, isLoading: groupsLoading } = useGroups(user?.id);

  // Fetch schedules for the selected group and week
  const { schedules = [], isLoading: schedulesLoading } = useCoachSchedules(
    user?.id,
    weekStart,
    { groupId: selectedGroupId }
  );

  // Fetch attendance
  const {
    attendance,
    isLoading: attendanceLoading,
    markAttendance,
  } = useAttendance(selectedGroupId, weekStart);

  const handlePrevWeek = () => {
    const prevWeek = new Date(weekStart);
    prevWeek.setDate(prevWeek.getDate() - 7);
    setWeekStart(prevWeek.toISOString().split('T')[0]);
  };

  const handleNextWeek = () => {
    const nextWeek = new Date(weekStart);
    nextWeek.setDate(nextWeek.getDate() + 7);
    setWeekStart(nextWeek.toISOString().split('T')[0]);
  };

  const handleThisWeek = () => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(today.setDate(diff));
    setWeekStart(monday.toISOString().split('T')[0]);
  };

  const handleMarkAttendance = (scheduleId, studentId, status) => {
    markAttendance({
      scheduleId,
      studentId,
      status,
      date: new Date().toISOString().split('T')[0], // Record date
    });
  };

  // Get selected group details
  const selectedGroup = groups.find((g) => g.id === Number(selectedGroupId));
  
  // Get students from the selected group (mocked for now as we don't have full student objects in group)
  // In a real app, we would fetch students for the group or have them populated
  const students = selectedGroup?.students || [];

  // Sort schedules by date/time
  const sortedSchedules = [...schedules].sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.startTime.localeCompare(b.startTime);
  });

  const weekEndDate = new Date(weekStart);
  weekEndDate.setDate(weekEndDate.getDate() + 6);
  const weekRangeDisplay = `${new Date(weekStart).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })} - ${weekEndDate.toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })}`;

  return (
    <div className="p-4 md:p-8">
      <Card className="mb-6">
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-navy dark:text-gold mb-1">
              Control de Asistencia
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Registra la asistencia de tus grupos
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Group Selector */}
            <div>
              <label htmlFor="group" className="label">
                Grupo
              </label>
              <select
                id="group"
                value={selectedGroupId}
                onChange={(e) => setSelectedGroupId(e.target.value)}
                className="input"
              >
                <option value="">Seleccionar grupo...</option>
                {groups
                  .filter((g) => !g.isArchived)
                  .map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name} ({group.sport})
                    </option>
                  ))}
              </select>
            </div>

            {/* Week Navigation */}
            <div className="flex items-end gap-2">
              <button type="button" onClick={handlePrevWeek} className="btn btn-outline px-3">
                ←
              </button>
              <div className="flex-1 text-center">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {weekRangeDisplay}
                </div>
              </div>
              <button type="button" onClick={handleThisWeek} className="btn btn-primary px-4">
                Hoy
              </button>
              <button type="button" onClick={handleNextWeek} className="btn btn-outline px-3">
                →
              </button>
            </div>
          </div>
        </div>
      </Card>

      {selectedGroupId ? (
        <Card className="overflow-hidden">
          {sortedSchedules.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              No hay clases programadas para este grupo en esta semana.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr>
                    <th className="p-4 bg-gray-50 dark:bg-navy-light border-b border-gray-200 dark:border-gray-700 font-semibold text-gray-700 dark:text-gray-300 sticky left-0 z-20 shadow-sm min-w-[200px]">
                      Alumno
                    </th>
                    {sortedSchedules.map((schedule) => {
                      const date = new Date(schedule.date);
                      const dayName = date.toLocaleDateString('es-AR', { weekday: 'short' });
                      const dayNum = date.getDate();
                      
                      return (
                        <th key={schedule.id} className="p-2 bg-gray-50 dark:bg-navy-light border-b border-gray-200 dark:border-gray-700 text-center min-w-[100px]">
                          <div className="font-bold text-navy dark:text-gold capitalize">
                            {dayName} {dayNum}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {schedule.startTime}
                          </div>
                        </th>
                      );
                    })}
                    <th className="p-4 bg-gray-50 dark:bg-navy-light border-b border-gray-200 dark:border-gray-700 font-semibold text-gray-700 dark:text-gray-300 text-center min-w-[100px]">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {/* Mock students for now since we don't have the full relation yet */}
                  {/* In real implementation, iterate over selectedGroup.students */}
                  {[1, 2, 3, 4, 5].map((studentId) => (
                    <AttendanceRow
                      key={studentId}
                      student={{
                        id: studentId,
                        firstName: `Alumno`,
                        lastName: `${studentId}`,
                        level: 'Intermedio'
                      }}
                      schedules={sortedSchedules}
                      attendance={attendance}
                      onMarkAttendance={handleMarkAttendance}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      ) : (
        <div className="text-center py-12 bg-gray-50 dark:bg-navy-light rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            Selecciona un grupo para ver y registrar la asistencia
          </p>
        </div>
      )}
    </div>
  );
}
