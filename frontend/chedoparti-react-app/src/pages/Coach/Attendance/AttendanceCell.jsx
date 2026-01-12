import React from 'react';

/**
 * Attendance Cell Component
 * Interactive cell to toggle attendance status
 */
export default function AttendanceCell({ status, onChange, disabled = false }) {
  // Status: 'present', 'absent', 'late', 'excused', null (not set)
  
  const handleClick = () => {
    if (disabled) return;

    // Cycle through statuses: null -> present -> absent -> late -> excused -> null
    let nextStatus;
    switch (status) {
      case 'present':
        nextStatus = 'absent';
        break;
      case 'absent':
        nextStatus = 'late';
        break;
      case 'late':
        nextStatus = 'excused';
        break;
      case 'excused':
        nextStatus = null;
        break;
      default:
        nextStatus = 'present';
    }
    
    onChange(nextStatus);
  };

  const getStatusColor = () => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800';
      case 'absent':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800';
      case 'late':
        return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800';
      case 'excused':
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800';
      default:
        return 'bg-gray-50 text-gray-400 border-gray-200 dark:bg-gray-800 dark:text-gray-500 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'present':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'absent':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      case 'late':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'excused':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getTooltip = () => {
    switch (status) {
      case 'present': return 'Presente';
      case 'absent': return 'Ausente';
      case 'late': return 'Tarde';
      case 'excused': return 'Justificado';
      default: return 'Sin registrar';
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      title={getTooltip()}
      className={`w-full h-12 rounded-lg border flex items-center justify-center transition-all ${getStatusColor()} ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      }`}
    >
      {getStatusIcon()}
    </button>
  );
}
