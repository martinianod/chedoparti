import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * Error Message Component
 * Displays error states with retry functionality
 */
export default function ErrorMessage({ error, onRetry, title = 'Error al cargar datos' }) {
  const errorMessage =
    error?.message ||
    error?.response?.data?.error ||
    'Ocurrió un error inesperado. Por favor, intenta nuevamente.';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-12 px-4 text-center"
    >
      {/* Error Icon */}
      <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mb-4">
        <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
      </div>

      {/* Title */}
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>

      {/* Error Message */}
      <p className="text-gray-600 dark:text-gray-400 max-w-md mb-6">
        {errorMessage}
      </p>

      {/* Retry Button */}
      {onRetry && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onRetry}
          className="btn btn-outline px-6 py-3 flex items-center gap-2"
        >
          <RefreshCw className="w-5 h-5" />
          <span>Reintentar</span>
        </motion.button>
      )}
    </motion.div>
  );
}
