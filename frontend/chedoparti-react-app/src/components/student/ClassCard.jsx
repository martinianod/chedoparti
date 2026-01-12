import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  GraduationCap, 
  Users, 
  User, 
  Calendar, 
  Clock, 
  MapPin,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';

/**
 * ClassCard Component
 * Displays a class with attendance confirmation options
 */
export default function ClassCard({ classData, onConfirm, onDecline, onDetailClick }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm(classData.id);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDecline = async () => {
    setIsLoading(true);
    try {
      await onDecline(classData.id);
    } finally {
      setIsLoading(false);
    }
  };

  const isGroupClass = classData.isGroupClass;
  const bgGradient = isGroupClass 
    ? 'bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20'
    : 'bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-900/20 dark:to-cyan-800/20';
  const borderColor = isGroupClass 
    ? 'border-purple-300 dark:border-purple-700' 
    : 'border-cyan-300 dark:border-cyan-700';
  const accentColor = isGroupClass 
    ? 'text-purple-700 dark:text-purple-300' 
    : 'text-cyan-700 dark:text-cyan-300';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`${bgGradient} ${borderColor} border-2 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          {isGroupClass ? (
            <Users className={`w-5 h-5 ${accentColor}`} />
          ) : (
            <User className={`w-5 h-5 ${accentColor}`} />
          )}
          <span className={`font-bold text-sm uppercase tracking-wide ${accentColor}`}>
            {isGroupClass ? 'Clase Grupal' : 'Clase Individual'}
          </span>
        </div>
        <AttendanceStatusBadge status={classData.attendanceStatus} />
      </div>

      {/* Class Info */}
      <div className="space-y-3 mb-6">
        <h3 className="text-xl font-bold text-navy dark:text-gold">
          {classData.groupName || 'Clase Particular'}
        </h3>

        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
          <GraduationCap className="w-4 h-4" />
          <span className="font-medium">Prof. {classData.coachName}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(classData.date)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>{classData.startTime} - {classData.endTime}</span>
          </div>
          <div className="flex items-center gap-2 md:col-span-2">
            <MapPin className="w-4 h-4" />
            <span>
              {classData.courts.map(c => c.name).join(', ')} • {classData.courts[0].sport}
              {classData.courtCount > 1 && ` (${classData.courtCount} canchas)`}
            </span>
          </div>
        </div>

        {/* Deadline Warning */}
        {classData.attendanceDeadline && classData.attendanceStatus === 'pending' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 bg-amber-100 dark:bg-amber-900/30 p-3 rounded-lg"
          >
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span className="text-xs text-amber-800 dark:text-amber-200">
              Confirmar antes del {formatDeadline(classData.attendanceDeadline)}
            </span>
          </motion.div>
        )}

        {/* Notes */}
        {classData.notes && (
          <div className="text-sm text-gray-600 dark:text-gray-400 italic bg-white/50 dark:bg-navy-dark/50 p-2 rounded">
            💡 {classData.notes}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        {classData.canConfirm && classData.attendanceStatus !== 'confirmed' && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleConfirm}
            disabled={isLoading}
            className="btn btn-primary flex items-center justify-center gap-2 flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckCircle2 className="w-4 h-4" />
            {isLoading ? 'Confirmando...' : 'Asistiré'}
          </motion.button>
        )}
        
        {classData.canConfirm && classData.attendanceStatus !== 'declined' && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleDecline}
            disabled={isLoading}
            className="btn btn-outline flex items-center justify-center gap-2 flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <XCircle className="w-4 h-4" />
            {isLoading ? 'Procesando...' : 'No voy'}
          </motion.button>
        )}

        <button
          onClick={() => onDetailClick?.(classData)}
          className="btn btn-ghost text-sm"
        >
          Ver detalle
        </button>
      </div>
    </motion.div>
  );
}

/**
 * AttendanceStatusBadge Component
 * Shows the current attendance status with appropriate styling
 */
function AttendanceStatusBadge({ status }) {
  const variants = {
    confirmed: {
      scale: [1, 1.05, 1],
      transition: { duration: 0.5 }
    },
    declined: {
      scale: 1
    },
    pending: {
      scale: 1
    }
  };

  const config = {
    confirmed: {
      icon: CheckCircle2,
      text: 'Confirmado',
      className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
    },
    declined: {
      icon: XCircle,
      text: 'No asistiré',
      className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
    },
    pending: {
      icon: Clock,
      text: 'Sin confirmar',
      className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
    }
  };

  const { icon: Icon, text, className } = config[status] || config.pending;

  return (
    <motion.div
      variants={variants}
      animate={status}
      className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${className}`}
    >
      <Icon className="w-3 h-3" />
      <span>{text}</span>
    </motion.div>
  );
}

/**
 * Format date for display
 */
function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('es-AR', { 
    weekday: 'short', 
    day: 'numeric', 
    month: 'short' 
  });
}

/**
 * Format deadline for display
 */
function formatDeadline(deadline) {
  const date = new Date(deadline);
  return date.toLocaleString('es-AR', { 
    day: 'numeric', 
    month: 'short', 
    hour: '2-digit', 
    minute: '2-digit' 
  });
}
