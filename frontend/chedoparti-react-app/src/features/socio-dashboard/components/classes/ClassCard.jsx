import React from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Clock, MapPin, Users, Check, X, Eye } from 'lucide-react';
import { formatTime, formatDuration, formatShortDate } from '../../utils/dateFormatters';

/**
 * Enhanced Class Card Component
 * Displays class with purple theme and attendance actions
 */
export default function ClassCard({ classData, onConfirm, onDecline, onDetailClick }) {
  const handleConfirm = (e) => {
    e.stopPropagation();
    if (onConfirm) {
      onConfirm(classData.id);
    }
  };

  const handleDecline = (e) => {
    e.stopPropagation();
    if (onDecline && window.confirm('¿Confirmas que no asistirás a esta clase?')) {
      onDecline(classData.id);
    }
  };

  const handleDetail = () => {
    if (onDetailClick) {
      onDetailClick(classData);
    }
  };

  // Format date and time
  const date = classData.date || classData.startAt?.split('T')[0];
  const time = formatTime(classData.time || classData.startAt);
  const duration = formatDuration(classData.duration || '01:00');
  const formattedDate = formatShortDate(date);

  // Attendance status
  const attendance = classData.attendance || 'pending';
  const attendanceConfig = {
    confirmed: { label: 'Confirmado', color: 'green', icon: Check },
    declined: { label: 'No asistiré', color: 'red', icon: X },
    pending: { label: 'Pendiente', color: 'yellow', icon: Clock },
  };
  const attendanceInfo = attendanceConfig[attendance] || attendanceConfig.pending;
  const AttendanceIcon = attendanceInfo.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border-l-4 border-l-purple-500 border-r border-t border-b border-gray-200 dark:border-gray-700 overflow-hidden cursor-pointer"
      onClick={handleDetail}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            {/* Icon */}
            <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20">
              <GraduationCap className="w-5 h-5 text-purple-600 dark:text-purple-400" aria-hidden="true" />
            </div>
            
            {/* Title */}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {classData.className || classData.name || 'Clase de Pádel'}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {classData.coachName || 'Entrenador'}
                {classData.level && ` • ${classData.level}`}
              </p>
            </div>
          </div>

          {/* Detail Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleDetail}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
            aria-label="Ver detalle"
            title="Ver detalle"
          >
            <Eye className="w-4 h-4" />
          </motion.button>
        </div>

        {/* Details */}
        <div className="space-y-2 mb-3">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Clock className="w-4 h-4" aria-hidden="true" />
            <span>{formattedDate} • {time} • {duration}</span>
          </div>

          {classData.location && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <MapPin className="w-4 h-4" aria-hidden="true" />
              <span>{classData.location}</span>
            </div>
          )}

          {classData.studentCount && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Users className="w-4 h-4" aria-hidden="true" />
              <span>{classData.studentCount} estudiantes</span>
            </div>
          )}
        </div>

        {/* Attendance Status & Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
          {/* Status Badge */}
          <span
            className={`px-3 py-1 text-xs font-medium rounded-full flex items-center gap-1 ${
              attendanceInfo.color === 'green'
                ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
                : attendanceInfo.color === 'red'
                ? 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300'
            }`}
          >
            <AttendanceIcon className="w-3 h-3" />
            <span>{attendanceInfo.label}</span>
          </span>

          {/* Action Buttons (only if pending) */}
          {attendance === 'pending' && (
            <div className="flex gap-2">
              {onConfirm && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleConfirm}
                  className="px-3 py-1 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/60 flex items-center gap-1"
                >
                  <Check className="w-3 h-3" />
                  <span>Confirmar</span>
                </motion.button>
              )}
              
              {onDecline && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDecline}
                  className="px-3 py-1 text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/60 flex items-center gap-1"
                >
                  <X className="w-3 h-3" />
                  <span>No voy</span>
                </motion.button>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
