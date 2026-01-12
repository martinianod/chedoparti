import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FiX, FiSave } from 'react-icons/fi';
import ModalBackdrop from './shared/ModalBackdrop';
import Button from './Button';
import Input from './Input';
import SaveButton from './SaveButton';
import courtsConfig from '../../config/courts.json';
import SportIcon from './SportIcon';

export default function CourtFormModal({
  open,
  onClose,
  onSubmit,
  court = null, // null para crear, objeto para editar
}) {
  const isEditing = court !== null;
  const [saving, setSaving] = useState(false);
  const sportsList = Object.keys(courtsConfig);
  const [currentSport, setCurrentSport] = useState(court?.sport || 'Padel');

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: court?.name || '',
      type: court?.type || '',
      sport: court?.sport || 'Padel',
      indoor: court?.indoor || false,
      surface: court?.surface || '',
      lights: court?.lights || false,
      net: court?.net || false,
      size: court?.size || '',
      active: court?.active !== undefined ? court.active : true,
      ...court, // Spread cualquier campo adicional
    },
  });

  const sport = watch('sport');
  const fields = courtsConfig[currentSport]?.fields || [];
  const iconName = courtsConfig[currentSport]?.icon || '';

  // Actualizar el deporte actual cuando cambie
  useEffect(() => {
    setCurrentSport(sport);
  }, [sport]);

  // Reset form when court changes
  useEffect(() => {
    if (open) {
      reset({
        name: court?.name || '',
        type: court?.type || '',
        sport: court?.sport || 'Padel',
        indoor: court?.indoor || false,
        surface: court?.surface || '',
        lights: court?.lights || false,
        net: court?.net || false,
        size: court?.size || '',
        active: court?.active !== undefined ? court.active : true,
        ...court,
      });
      setCurrentSport(court?.sport || 'Padel');
    }
  }, [court, open, reset]);

  // Manejar cierre con Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && open) {
        onClose();
      }
    };

    if (open) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [open, onClose]);

  const handleFormSubmit = async (data) => {
    setSaving(true);
    try {
      await onSubmit(data);
      onClose();
    } catch (error) {
      console.error('Error submitting court:', error);
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <ModalBackdrop
      onClick={onClose}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-navy/10 dark:bg-gold/20 rounded-lg">
              <SportIcon name={iconName} className="w-6 h-6 text-navy dark:text-gold" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-navy dark:text-gold">
                {isEditing ? 'Editar Cancha' : 'Nueva Cancha'}
              </h3>
              {isEditing && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  ID: {court.id} • {court.name}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Cerrar modal"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-6">
          {/* Información básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nombre de la Cancha *
              </label>
              <Input
                {...register('name', { required: 'El nombre es obligatorio' })}
                placeholder="Ej: Cancha Padel 1"
                error={errors.name?.message}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Deporte *
              </label>
              <select
                {...register('sport', { required: 'El deporte es obligatorio' })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-navy focus:border-navy dark:bg-gray-700 dark:text-white"
              >
                {sportsList.map((sport) => (
                  <option key={sport} value={sport}>
                    {sport}
                  </option>
                ))}
              </select>
              {errors.sport && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.sport.message}
                </p>
              )}
            </div>
          </div>

          {/* Campos dinámicos según el deporte */}
          {fields.length > 0 && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                Configuración de {currentSport}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {fields.map((field) => (
                  <div key={field.name}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {field.label}
                      {field.required && ' *'}
                    </label>
                    {field.type === 'select' ? (
                      <select
                        {...register(field.name, {
                          required: field.required ? `${field.label} es obligatorio` : false,
                        })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-navy focus:border-navy dark:bg-gray-700 dark:text-white"
                      >
                        <option value="">Seleccionar...</option>
                        {field.options?.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    ) : field.type === 'boolean' ? (
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          {...register(field.name)}
                          className="h-4 w-4 text-navy focus:ring-navy border-gray-300 rounded"
                        />
                        <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                          {field.label}
                        </label>
                      </div>
                    ) : (
                      <Input
                        {...register(field.name, {
                          required: field.required ? `${field.label} es obligatorio` : false,
                        })}
                        type={field.type || 'text'}
                        placeholder={field.placeholder}
                        error={errors[field.name]?.message}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Configuración adicional */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
              Configuración Adicional
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  {...register('indoor')}
                  className="h-4 w-4 text-navy focus:ring-navy border-gray-300 rounded"
                />
                <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Cancha cubierta (Indoor)
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  {...register('lights')}
                  className="h-4 w-4 text-navy focus:ring-navy border-gray-300 rounded"
                />
                <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Iluminación artificial
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  {...register('net')}
                  className="h-4 w-4 text-navy focus:ring-navy border-gray-300 rounded"
                />
                <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Red disponible
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  {...register('active')}
                  className="h-4 w-4 text-navy focus:ring-navy border-gray-300 rounded"
                />
                <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Cancha activa
                </label>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Cancelar
            </Button>
            <SaveButton type="submit" saving={saving} disabled={saving}>
              <FiSave className="mr-2" />
              {isEditing ? 'Guardar Cambios' : 'Crear Cancha'}
            </SaveButton>
          </div>
        </form>
      </div>
    </ModalBackdrop>
  );
}
