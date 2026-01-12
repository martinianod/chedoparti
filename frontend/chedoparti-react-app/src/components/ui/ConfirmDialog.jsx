import React from 'react';
import ModalBackdrop from './shared/ModalBackdrop';
import Button from './Button';
import { AlertTriangle, HelpCircle, Trash2, DollarSign, Edit, XCircle } from 'lucide-react';

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = '¿Estás seguro?',
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'warning', // 'warning', 'danger', 'info', 'success'
  icon,
  isLoading = false,
}) {
  if (!open) return null;

  // Iconos por tipo de variante
  const getIcon = () => {
    if (icon) return icon;

    switch (variant) {
      case 'danger':
        return <Trash2 className="w-6 h-6 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-6 h-6 text-yellow-500" />;
      case 'info':
        return <HelpCircle className="w-6 h-6 text-blue-500" />;
      case 'price':
        return <DollarSign className="w-6 h-6 text-green-500" />;
      case 'edit':
        return <Edit className="w-6 h-6 text-blue-500" />;
      case 'cancel':
        return <XCircle className="w-6 h-6 text-orange-500" />;
      default:
        return <AlertTriangle className="w-6 h-6 text-yellow-500" />;
    }
  };

  // Colores por variante
  const getColors = () => {
    switch (variant) {
      case 'danger':
        return {
          bg: 'bg-red-50 dark:bg-red-900/20',
          border: 'border-red-200 dark:border-red-800',
          confirmBtn: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50 dark:bg-yellow-900/20',
          border: 'border-yellow-200 dark:border-yellow-800',
          confirmBtn: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
        };
      case 'info':
        return {
          bg: 'bg-blue-50 dark:bg-blue-900/20',
          border: 'border-blue-200 dark:border-blue-800',
          confirmBtn: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
        };
      case 'price':
        return {
          bg: 'bg-green-50 dark:bg-green-900/20',
          border: 'border-green-200 dark:border-green-800',
          confirmBtn: 'bg-green-600 hover:bg-green-700 focus:ring-green-500',
        };
      case 'edit':
        return {
          bg: 'bg-blue-50 dark:bg-blue-900/20',
          border: 'border-blue-200 dark:border-blue-800',
          confirmBtn: 'bg-navy hover:bg-navy/90 focus:ring-navy',
        };
      case 'cancel':
        return {
          bg: 'bg-orange-50 dark:bg-orange-900/20',
          border: 'border-orange-200 dark:border-orange-800',
          confirmBtn: 'bg-orange-600 hover:bg-orange-700 focus:ring-orange-500',
        };
      default:
        return {
          bg: 'bg-yellow-50 dark:bg-yellow-900/20',
          border: 'border-yellow-200 dark:border-yellow-800',
          confirmBtn: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
        };
    }
  };

  const colors = getColors();

  return (
    <ModalBackdrop onClose={onClose}>
      <div
        className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full mx-4 shadow-2xl transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon y Header */}
        <div className={`p-6 ${colors.bg} ${colors.border} border-2 rounded-t-xl`}>
          <div className="flex items-center justify-center mb-4">{getIcon()}</div>
          <h3 className="text-lg font-semibold text-center text-gray-900 dark:text-white">
            {title}
          </h3>
        </div>

        {/* Message */}
        <div className="p-6">
          <p className="text-gray-600 dark:text-gray-300 text-center whitespace-pre-line">
            {message}
          </p>
        </div>

        {/* Botones */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <Button onClick={onClose} variant="secondary" disabled={isLoading}>
            {cancelText}
          </Button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed ${colors.confirmBtn}`}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Procesando...</span>
              </div>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </ModalBackdrop>
  );
}
