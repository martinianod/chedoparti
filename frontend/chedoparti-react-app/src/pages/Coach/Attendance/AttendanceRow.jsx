import React from 'react';
import AttendanceCell from './AttendanceCell';

/**
 * Attendance Row Component
 * Displays a student and their attendance for the week
 */
export default function AttendanceRow({ student, schedules, attendance, onMarkAttendance }) {
  // Calculate stats for this student in this week
  const studentAttendance = attendance.filter((a) => a.studentId === student.id);
  const totalClasses = schedules.length;
  const presentCount = studentAttendance.filter((a) => a.status === 'present' || a.status === 'late').length;
  const attendancePercentage = totalClasses > 0 ? Math.round((presentCount / totalClasses) * 100) : 0;

  return (
    <tr className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-navy-light transition-colors">
      {/* Student Info */}
      <td className="p-4 sticky left-0 bg-white dark:bg-navy z-10 border-r border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-navy/10 dark:bg-gold/20 flex items-center justify-center text-navy dark:text-gold font-bold">
            {student.firstName[0]}
            {student.lastName[0]}
          </div>
          <div>
            <div className="font-semibold text-gray-900 dark:text-gray-100">
              {student.firstName} {student.lastName}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {student.level}
            </div>
          </div>
        </div>
      </td>

      {/* Attendance Cells */}
      {schedules.map((schedule) => {
        const record = attendance.find(
          (a) => a.studentId === student.id && a.scheduleId === schedule.id
        );

        return (
          <td key={schedule.id} className="p-2 min-w-[100px]">
            <AttendanceCell
              status={record?.status || null}
              onChange={(newStatus) => onMarkAttendance(schedule.id, student.id, newStatus)}
            />
          </td>
        );
      })}

      {/* Weekly Stats */}
      <td className="p-4 text-center border-l border-gray-200 dark:border-gray-700">
        <div className="flex flex-col items-center">
          <span className={`text-lg font-bold ${
            attendancePercentage >= 80 ? 'text-green-600 dark:text-green-400' :
            attendancePercentage >= 50 ? 'text-amber-600 dark:text-amber-400' :
            'text-red-600 dark:text-red-400'
          }`}>
            {attendancePercentage}%
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {presentCount}/{totalClasses}
          </span>
        </div>
      </td>
    </tr>
  );
}
