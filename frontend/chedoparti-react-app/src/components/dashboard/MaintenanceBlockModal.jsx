import React from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle } from 'lucide-react';
import { getArgentinaDate } from '../../utils/dateUtils';
import Card from '../ui/Card';

/**
 * MaintenanceBlockModal - Modal para crear/editar bloqueos por mantenimiento
 * Solo accesible para ADMIN
 */
export default function MaintenanceBlockModal({
  open,
  onClose,
  onSubmit,
  initialData = null,
  courts = [],
}) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    defaultValues: initialData || {
      courtId: courts.length > 0 ? courts[0].id : '',
      date: getArgentinaDate(),
      startTime: '08:00',
      endTime: '09:00',
      reason: '',
      recurring: false,
      recurringDays: [],
      recurringEndDate: '',
    },
  });

  const isRecurring = watch('recurring');

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmitHandler = async (data) => {
    try {
      await onSubmit({
        ...data,
        courtId: parseInt(data.courtId),
        type: 'MAINTENANCE',
        status: 'blocked',
      });
      handleClose();
    } catch (error) {
      console.error('Error creating maintenance block:', error);
    }
  };

  const weekDays = [
    { value: 1, label: 'Lunes' },
    { value: 2, label: 'Martes' },
    { value: 3, label: 'Miércoles' },
    { value: 4, label: 'Jueves' },
    { value: 5, label: 'Viernes' },
    { value: 6, label: 'Sábado' },
    { value: 0, label: 'Domingo' },
  ];

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={handleClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <Card className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                      <AlertTriangle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-navy dark:text-gold">
                        {initialData ? 'Editar Bloqueo' : 'Nuevo Bloqueo por Mantenimiento'}
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Bloquea horarios para mantenimiento de canchas
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleClose}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmitHandler)} className="space-y-6">
                  {/* Cancha */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Cancha <span className="text-red-500">*</span>
                    </label>
                    <select
                      {...register('courtId', { required: 'Selecciona una cancha' })}
                      className="input w-full"
                    >
                      <option value="">Seleccionar cancha...</option>
                      {courts.map((court) => (
                        <option key={court.id} value={court.id}>
                          {court.name}
                        </option>
                      ))}
                    </select>
                    {errors.courtId && (
                      <p className="text-red-500 text-sm mt-1">{errors.courtId.message}</p>
                    )}
                  </div>

                  {/* Fecha */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Fecha <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      {...register('date', { required: 'Selecciona una fecha' })}
                      className="input w-full"
                    />
                    {errors.date && (
                      <p className="text-red-500 text-sm mt-1">{errors.date.message}</p>
                    )}
                  </div>

                  {/* Horarios */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Hora Inicio <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="time"
                        {...register('startTime', { required: 'Selecciona hora de inicio' })}
                        className="input w-full"
                      />
                      {errors.startTime && (
                        <p className="text-red-500 text-sm mt-1">{errors.startTime.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Hora Fin <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="time"
                        {...register('endTime', { required: 'Selecciona hora de fin' })}
                        className="input w-full"
                      />
                      {errors.endTime && (
                        <p className="text-red-500 text-sm mt-1">{errors.endTime.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Razón */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Razón del Mantenimiento <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      {...register('reason', { required: 'Describe la razón del mantenimiento' })}
                      className="input w-full"
                      rows={3}
                      placeholder="Ej: Reparación de superficie, cambio de iluminación..."
                    />
                    {errors.reason && (
                      <p className="text-red-500 text-sm mt-1">{errors.reason.message}</p>
                    )}
                  </div>

                  {/* Recurrente */}
                  <div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        {...register('recurring')}
                        className="rounded border-gray-300 text-navy focus:ring-navy"
                      />
                      <span className="text-sm font-medium">Bloqueo recurrente</span>
                    </label>
                  </div>

                  {/* Opciones de recurrencia */}
                  {isRecurring && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="space-y-4 pl-6 border-l-2 border-orange-300 dark:border-orange-700"
                    >
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Días de la semana
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {weekDays.map((day) => (
                            <label key={day.value} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                value={day.value}
                                {...register('recurringDays')}
                                className="rounded border-gray-300 text-navy focus:ring-navy"
                              />
                              <span className="text-sm">{day.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Fecha de fin de recurrencia
                        </label>
                        <input
                          type="date"
                          {...register('recurringEndDate')}
                          className="input w-full"
                        />
                      </div>
                    </motion.div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="btn btn-outline flex-1"
                      disabled={isSubmitting}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary flex-1"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Guardando...' : initialData ? 'Actualizar' : 'Crear Bloqueo'}
                    </button>
                  </div>
                </form>
              </Card>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
