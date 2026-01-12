import React, { useState, useEffect } from 'react';
import AccessibleModal from '../../../components/ui/AccessibleModal';
import CourtSelector from './CourtSelector';
import WeekDaySelector from '../../../components/coach/WeekDaySelector';
import TimeSelector from '../../../components/ui/TimeSelector';
import SimpleDurationSelector from '../../../components/coach/SimpleDurationSelector';
import { useAppNotifications } from '../../../hooks/useAppNotifications';

/**
 * Schedule Form Modal
 * Create or edit a class schedule
 */
export default function ScheduleFormModal({
  open,
  onClose,
  onSubmit,
  initialData = null,
  groups = [],
  courts = [],
  sport = null,
  hideGroupSelector = false, // New prop to hide group selector
}) {
  const { reservation: notifications } = useAppNotifications();
  const [formData, setFormData] = useState({
    groupId: null,
    date: '',
    startTime: '09:00',
    duration: '01:00',
    courtIds: [],
    isRecurring: false,
    recurringDays: [],
    notes: '',
  });

  const [conflicts, setConflicts] = useState([]);
  const [totalCapacity, setTotalCapacity] = useState(0);

  useEffect(() => {
    if (initialData) {
      setFormData({
        groupId: initialData.groupId || null,
        date: initialData.date || '',
        startTime: initialData.startTime || '09:00',
        duration: initialData.duration || '01:00',
        courtIds: initialData.courtIds || [],
        isRecurring: initialData.isRecurring || false,
        recurringDays: initialData.recurringDays || [],
        notes: initialData.notes || '',
      });
    } else {
      // Reset form for new schedule
      setFormData({
        groupId: null,
        date: new Date().toISOString().split('T')[0],
        startTime: '09:00',
        duration: '01:00',
        courtIds: [],
        isRecurring: false,
        recurringDays: [],
        notes: '',
      });
    }
  }, [initialData, open]);

  // Calculate total capacity when courts change
  useEffect(() => {
    const selectedCourts = courts.filter((c) => formData.courtIds.includes(c.id));
    const capacity = selectedCourts.reduce((sum, court) => sum + (court.capacity || 4), 0);
    setTotalCapacity(capacity);
  }, [formData.courtIds, courts]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleCourtIdsChange = (courtIds) => {
    setFormData((prev) => ({
      ...prev,
      courtIds,
    }));
  };

  const handleRecurringDaysChange = (days) => {
    setFormData((prev) => ({
      ...prev,
      recurringDays: days,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    if (!formData.groupId) {
      notifications.error('Debes seleccionar un grupo');
      return;
    }

    if (formData.courtIds.length === 0) {
      notifications.error('Debes seleccionar al menos una cancha');
      return;
    }

    if (formData.isRecurring && formData.recurringDays.length === 0) {
      notifications.error('Debes seleccionar al menos un día para la recurrencia');
      return;
    }

    // Calculate end time
    const [hours, minutes] = formData.duration.split(':').map(Number);
    const [startHour, startMinute] = formData.startTime.split(':').map(Number);
    const totalMinutes = startHour * 60 + startMinute + hours * 60 + minutes;
    const endHour = Math.floor(totalMinutes / 60);
    const endMinute = totalMinutes % 60;
    const endTime = `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`;

    const payload = {
      ...formData,
      startDate: formData.date, // API expects startDate for recurring schedules
      endTime,
    };

    if (initialData?.id) {
      payload.id = initialData.id;
    }

    onSubmit(payload);
  };

  const isEditMode = !!initialData?.id;
  const selectedGroup = groups.find((g) => g.id === Number(formData.groupId));

  // Filter courts by sport
  const filteredCourts = sport ? courts.filter((c) => c.sport === sport) : courts;

  return (
    <AccessibleModal
      open={open}
      onClose={onClose}
      title={isEditMode ? 'Editar Clase' : 'Programar Clase'}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Group Selection */}
              {!hideGroupSelector && (
                <div>
                  <label htmlFor="groupId" className="label">
                    Grupo *
                  </label>
                  <select
                    id="groupId"
                    name="groupId"
                    value={formData.groupId || ''}
                    onChange={handleChange}
                    required
                    className="input"
                  >
                    <option value="">Seleccionar grupo...</option>
                    {groups
                      .filter((g) => !g.isArchived)
                      .map((group) => (
                        <option key={group.id} value={group.id}>
                          {group.name} ({group.sport} - {group.level})
                        </option>
                      ))}
                  </select>
                  {selectedGroup && (
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      Capacidad del grupo: {(selectedGroup.studentIds || []).length}/{selectedGroup.capacity || 12}
                    </p>
                  )}
                </div>
              )}

              {/* Group Info (when hidden selector) */}
              {hideGroupSelector && selectedGroup && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-300">
                    Grupo: {selectedGroup.name}
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                    {selectedGroup.sport} • {selectedGroup.level} • {(selectedGroup.studentIds || []).length} alumnos
                  </p>
                </div>
              )}

              {/* Date & Time */}
              <div className="space-y-4">
                <div>
                  <label htmlFor="date" className="label">
                    Fecha *
                  </label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                    className="input"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="startTime" className="label">
                      Hora de inicio *
                    </label>
                    <TimeSelector
                      id="startTime"
                      name="startTime"
                      value={formData.startTime}
                      onChange={(value) => setFormData((prev) => ({ ...prev, startTime: value }))}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="duration" className="label">
                      Duración *
                    </label>
                    <SimpleDurationSelector
                      id="duration"
                      name="duration"
                      value={formData.duration}
                      onChange={(value) => setFormData((prev) => ({ ...prev, duration: value }))}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label htmlFor="notes" className="label">
                  Notas
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                  className="input"
                  placeholder="Información adicional sobre la clase..."
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Court Selection */}
              <div>
                <label className="label mb-2">
                  Canchas * {sport && `(${sport})`}
                </label>
                <div className="max-h-[300px] overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-2">
                  <CourtSelector
                    courts={filteredCourts}
                    selectedCourtIds={formData.courtIds}
                    onChange={handleCourtIdsChange}
                    sport={sport}
                  />
                </div>
              </div>

              {/* Recurring Schedule */}
              <div className="bg-gray-50 dark:bg-navy-light rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-3">
                  <input
                    type="checkbox"
                    id="isRecurring"
                    name="isRecurring"
                    checked={formData.isRecurring}
                    onChange={handleChange}
                    className="w-5 h-5 text-navy focus:ring-gold border-gray-300 rounded"
                  />
                  <label htmlFor="isRecurring" className="font-semibold text-gray-900 dark:text-gray-100">
                    Repetir semanalmente
                  </label>
                </div>

                {formData.isRecurring && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      Selecciona los días de la semana en los que se repetirá esta clase:
                    </p>
                    <WeekDaySelector
                      selectedDays={formData.recurringDays}
                      onChange={handleRecurringDaysChange}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Full Width Sections */}
          <div className="mt-6 space-y-4">
            {/* Summary */}
            {formData.courtIds.length > 0 && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
                  Resumen de la clase
                </h4>
                <div className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
                  <p>
                    <strong>Grupo:</strong> {selectedGroup?.name || 'No seleccionado'}
                  </p>
                  <p>
                    <strong>Canchas:</strong> {formData.courtIds.length} seleccionada(s)
                  </p>
                  <p>
                    <strong>Capacidad total:</strong> {totalCapacity} personas
                  </p>
                  {selectedGroup && (
                    <p>
                      <strong>Alumnos en el grupo:</strong> {(selectedGroup.studentIds || []).length}
                    </p>
                  )}
                  {formData.isRecurring && formData.recurringDays.length > 0 && (
                    <p>
                      <strong>Se repetirá:</strong> {formData.recurringDays.length} día(s) por semana
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Conflicts Warning */}
            {conflicts.length > 0 && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <h4 className="font-semibold text-red-900 dark:text-red-300 mb-2">
                  ⚠️ Conflictos detectados
                </h4>
                <ul className="list-disc list-inside text-sm text-red-800 dark:text-red-200">
                  {conflicts.map((conflict, index) => (
                    <li key={index}>{conflict}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

        {/* Actions - Sticky Footer */}
        <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 sticky bottom-0 -mx-4 -mb-4 p-4 z-10">
          <button type="button" onClick={onClose} className="btn btn-outline">
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary">
            {isEditMode ? 'Guardar cambios' : formData.isRecurring ? 'Crear clases' : 'Programar clase'}
          </button>
        </div>
      </form>
    </AccessibleModal>
  );
}
