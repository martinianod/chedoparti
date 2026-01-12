import React, { useState, useEffect } from 'react';
import AccessibleModal from '../../../components/ui/AccessibleModal';
import ColorPicker, { GROUP_COLORS } from '../../../components/coach/ColorPicker';
import { useSchedulesByGroup } from '../../../hooks/useCoachSchedules';
import ScheduleFormModal from '../Schedule/ScheduleFormModal';
import useAuth from '../../../hooks/useAuth';
import useCoachSchedules from '../../../hooks/useCoachSchedules';
import useStudents from '../../../hooks/useStudents';
import useGroups from '../../../hooks/useGroups';
import { courtsApi } from '../../../services/api';

/**
 * Group Form Modal
 * Create or edit group with student and schedule management
 */
export default function GroupFormModal({ open, onClose, onSubmit, initialData = null }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    color: GROUP_COLORS[0].value,
    sport: 'Padel',
    level: 'Intermediate',
    capacity: 12,
    studentIds: [],
  });

  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [activeTab, setActiveTab] = useState('info'); // 'info', 'students', or 'schedules'
  const [courts, setCourts] = useState([]);
  const [studentSearch, setStudentSearch] = useState('');

  const isEditMode = !!initialData?.id;

  // Fetch students
  const { students: allStudents = [] } = useStudents(user?.id);

  // Fetch group data for student management
  const { addStudentAsync, removeStudentAsync } = useGroups(user?.id);

  // Fetch schedules for this group (only in edit mode)
  const { data: groupSchedules = [], refetch: refetchSchedules } = useSchedulesByGroup(
    isEditMode ? initialData?.id : null
  );

  // Load courts
  useEffect(() => {
    const loadCourts = async () => {
      try {
        const courtsResponse = await courtsApi
          .listActive(user?.institutionId)
          .catch(() => courtsApi.list(user?.institutionId, { page: 0, size: 100, sort: 'name' }));

        const courtsPayload = courtsResponse?.data;
        const rawCourts = Array.isArray(courtsPayload?.content)
          ? courtsPayload.content
          : Array.isArray(courtsPayload)
            ? courtsPayload
            : [];
        
        // Normalize courts
        const normalizedCourts = rawCourts.map((court) => ({
          ...court,
          sport: court?.sport || 'Padel',
        }));

        if (normalizedCourts.length === 0) {
          throw new Error('No courts found');
        }

        setCourts(normalizedCourts);
      } catch {
        // Fallback mock courts if API fails or returns empty
        const mockCourts = [
          { id: 101, name: 'Cancha 1', sport: 'Padel', surface: 'Sintético', isIndoor: true, capacity: 4 },
          { id: 102, name: 'Cancha 2', sport: 'Padel', surface: 'Sintético', isIndoor: true, capacity: 4 },
          { id: 103, name: 'Cancha 3', sport: 'Tenis', surface: 'Polvo', isIndoor: false, capacity: 4 },
          { id: 104, name: 'Cancha 4', sport: 'Tenis', surface: 'Cemento', isIndoor: false, capacity: 4 },
        ];
        setCourts(mockCourts);
      }
    };

    if (user?.institutionId) {
      loadCourts();
    }
  }, [user?.institutionId]);

  // Get schedule hooks for CRUD operations
  const weekStart = new Date().toISOString().split('T')[0];
  const {
    createScheduleAsync,
    updateScheduleAsync,
    deleteScheduleAsync,
    createRecurringAsync,
  } = useCoachSchedules(user?.id, weekStart);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        color: initialData.color || GROUP_COLORS[0].value,
        sport: initialData.sport || 'Padel',
        level: initialData.level || 'Intermediate',
        capacity: initialData.capacity || 12,
        studentIds: initialData.studentIds || [],
      });
      setActiveTab('info'); // Reset to info tab when opening
    } else {
      // Reset form for new group
      setFormData({
        name: '',
        color: GROUP_COLORS[0].value,
        sport: 'Padel',
        level: 'Intermediate',
        capacity: 12,
        studentIds: [],
      });
      setActiveTab('info');
    }
    setStudentSearch('');
  }, [initialData, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'capacity' ? parseInt(value, 10) || 0 : value,
    }));
  };

  const handleColorChange = (color) => {
    setFormData((prev) => ({
      ...prev,
      color,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  // Student management handlers
  const handleAddStudent = async (studentId) => {
    if (!isEditMode) {
      // For new groups, just add to local state
      setFormData(prev => ({
        ...prev,
        studentIds: [...prev.studentIds, studentId]
      }));
    } else {
      // For existing groups, call API
      try {
        await addStudentAsync({ groupId: initialData.id, studentId });
        setFormData(prev => ({
          ...prev,
          studentIds: [...prev.studentIds, studentId]
        }));
      } catch (error) {
        console.error('Error adding student:', error);
      }
    }
  };

  const handleRemoveStudent = async (studentId) => {
    if (!isEditMode) {
      // For new groups, just remove from local state
      setFormData(prev => ({
        ...prev,
        studentIds: prev.studentIds.filter(id => id !== studentId)
      }));
    } else {
      // For existing groups, call API
      try {
        await removeStudentAsync({ groupId: initialData.id, studentId });
        setFormData(prev => ({
          ...prev,
          studentIds: prev.studentIds.filter(id => id !== studentId)
        }));
      } catch (error) {
        console.error('Error removing student:', error);
      }
    }
  };

  // Schedule management handlers
  const handleAddSchedule = () => {
    setSelectedSchedule(null);
    setScheduleModalOpen(true);
  };

  const handleEditSchedule = (schedule) => {
    setSelectedSchedule(schedule);
    setScheduleModalOpen(true);
  };

  const handleDeleteSchedule = async (scheduleId) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta clase?')) {
      try {
        await deleteScheduleAsync(scheduleId);
        refetchSchedules();
      } catch (error) {
        console.error('Error deleting schedule:', error);
      }
    }
  };

  const handleScheduleSubmit = async (scheduleData) => {
    try {
      const payload = {
        ...scheduleData,
        groupId: initialData.id,
        coachId: user?.id,
        institutionId: user?.institutionId,
      };

      if (scheduleData.isRecurring) {
        await createRecurringAsync(payload);
      } else if (selectedSchedule?.id) {
        await updateScheduleAsync({ id: selectedSchedule.id, data: payload });
      } else {
        await createScheduleAsync(payload);
      }

      setScheduleModalOpen(false);
      setSelectedSchedule(null);
      refetchSchedules();
    } catch (error) {
      console.error('Error saving schedule:', error);
    }
  };

  const formatScheduleTime = (schedule) => {
    return `${schedule.startTime} - ${schedule.endTime}`;
  };

  const formatScheduleDays = (schedule) => {
    if (!schedule.isRecurring) return 'Una vez';
    
    const dayNames = {
      0: 'Dom',
      1: 'Lun',
      2: 'Mar',
      3: 'Mié',
      4: 'Jue',
      5: 'Vie',
      6: 'Sáb',
    };
    
    return schedule.recurringDays?.map(d => dayNames[d]).join(', ') || 'No especificado';
  };

  // Filter students
  const groupStudents = allStudents.filter(s => formData.studentIds.includes(s.id));
  const availableStudents = allStudents.filter(s => 
    !formData.studentIds.includes(s.id) &&
    s.sport === formData.sport &&
    (studentSearch === '' || 
     s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
     s.email?.toLowerCase().includes(studentSearch.toLowerCase()))
  );

  return (
    <>
      <AccessibleModal
        open={open}
        onClose={onClose}
        title={isEditMode ? 'Editar Grupo' : 'Crear Grupo'}
        size="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tabs */}
          <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700 -mt-2 mb-4">
            <button
              type="button"
              onClick={() => setActiveTab('info')}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'info'
                  ? 'border-navy dark:border-gold text-navy dark:text-gold'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Información
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('students')}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'students'
                  ? 'border-navy dark:border-gold text-navy dark:text-gold'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Alumnos ({formData.studentIds.length})
            </button>
            {isEditMode && (
              <button
                type="button"
                onClick={() => setActiveTab('schedules')}
                className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === 'schedules'
                    ? 'border-navy dark:border-gold text-navy dark:text-gold'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                Horarios ({groupSchedules.length})
              </button>
            )}
          </div>

          {/* Info Tab */}
          {activeTab === 'info' && (
            <>
              {/* Name */}
              <div>
                <label htmlFor="name" className="label">
                  Nombre del grupo *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Ej: Grupo Avanzado Mañana"
                  className="input"
                />
              </div>

              {/* Color */}
              <div>
                <label className="label mb-2">
                  Color del grupo *
                </label>
                <ColorPicker
                  value={formData.color}
                  onChange={handleColorChange}
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  El color ayuda a identificar rápidamente el grupo en el calendario
                </p>
              </div>

              {/* Sport & Level */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="sport" className="label">
                    Deporte *
                  </label>
                  <select
                    id="sport"
                    name="sport"
                    value={formData.sport}
                    onChange={handleChange}
                    required
                    className="input"
                  >
                    <option value="Padel">Padel</option>
                    <option value="Tenis">Tenis</option>
                    <option value="Fútbol">Fútbol</option>
                    <option value="Basquet">Basquet</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="level" className="label">
                    Nivel *
                  </label>
                  <select
                    id="level"
                    name="level"
                    value={formData.level}
                    onChange={handleChange}
                    required
                    className="input"
                  >
                    <option value="Beginner">Principiante</option>
                    <option value="Intermediate">Intermedio</option>
                    <option value="Advanced">Avanzado</option>
                    <option value="Pro">Profesional</option>
                  </select>
                </div>
              </div>

              {/* Capacity */}
              <div>
                <label htmlFor="capacity" className="label">
                  Capacidad sugerida
                </label>
                <input
                  type="number"
                  id="capacity"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleChange}
                  min="1"
                  max="50"
                  className="input"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Número máximo recomendado de alumnos en el grupo
                </p>
              </div>

              {/* Preview */}
              <div className="bg-gray-50 dark:bg-navy rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Vista previa
                </p>
                <div
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium"
                  style={{
                    backgroundColor: `${formData.color}20`,
                    color: formData.color,
                    border: `2px solid ${formData.color}`,
                  }}
                >
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: formData.color }}
                  />
                  <span>{formData.name || 'Nombre del grupo'}</span>
                  <span className="text-sm opacity-75">
                    • {formData.sport} • {formData.level}
                  </span>
                </div>
              </div>
            </>
          )}

          {/* Students Tab */}
          {activeTab === 'students' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Available Students */}
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Alumnos disponibles ({formData.sport})
                  </h3>
                  
                  {/* Search */}
                  <div className="mb-3">
                    <input
                      type="text"
                      placeholder="Buscar alumno..."
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                      className="input text-sm"
                    />
                  </div>

                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg max-h-[400px] overflow-y-auto">
                    {availableStudents.length === 0 ? (
                      <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                        No hay alumnos disponibles
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {availableStudents.map((student) => (
                          <div
                            key={student.id}
                            className="p-3 hover:bg-gray-50 dark:hover:bg-navy-light flex items-center justify-between group"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                {student.name}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {student.level}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleAddStudent(student.id)}
                              className="ml-2 p-1.5 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors"
                              title="Agregar al grupo"
                            >
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Group Students */}
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Alumnos en el grupo ({formData.studentIds.length}/{formData.capacity})
                  </h3>
                  
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg max-h-[450px] overflow-y-auto">
                    {groupStudents.length === 0 ? (
                      <div className="p-8 text-center text-sm text-gray-500 dark:text-gray-400">
                        <svg
                          className="mx-auto h-12 w-12 text-gray-400 mb-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                        <p>No hay alumnos en este grupo</p>
                        <p className="text-xs mt-1">Agrega alumnos desde la lista de la izquierda</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {groupStudents.map((student) => (
                          <div
                            key={student.id}
                            className="p-3 hover:bg-gray-50 dark:hover:bg-navy-light flex items-center justify-between group"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                {student.name}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {student.level}
                                {student.isMember && (
                                  <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-navy/10 dark:bg-gold/20 text-navy dark:text-gold">
                                    Socio
                                  </span>
                                )}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveStudent(student.id)}
                              className="ml-2 p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                              title="Remover del grupo"
                            >
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Schedules Tab */}
          {activeTab === 'schedules' && isEditMode && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Gestiona los horarios de clases para este grupo
                </p>
                <button
                  type="button"
                  onClick={handleAddSchedule}
                  className="btn btn-primary text-sm"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Agregar horario
                </button>
              </div>

              {groupSchedules.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 dark:bg-navy-light rounded-lg border border-gray-200 dark:border-gray-700">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                    No hay horarios programados
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Agrega un horario para comenzar a programar clases
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {groupSchedules.map((schedule) => (
                    <div
                      key={schedule.id}
                      className="bg-white dark:bg-navy-light border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold text-gray-900 dark:text-gray-100">
                              {formatScheduleTime(schedule)}
                            </span>
                            {schedule.isRecurring && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                                <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Recurrente
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                            <p>
                              <strong>Días:</strong> {formatScheduleDays(schedule)}
                            </p>
                            {schedule.date && !schedule.isRecurring && (
                              <p>
                                <strong>Fecha:</strong> {new Date(schedule.date).toLocaleDateString('es-AR')}
                              </p>
                            )}
                            {schedule.notes && (
                              <p>
                                <strong>Notas:</strong> {schedule.notes}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <button
                            type="button"
                            onClick={() => handleEditSchedule(schedule)}
                            className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-navy rounded-lg transition-colors"
                            title="Editar"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteSchedule(schedule.id)}
                            className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Eliminar"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
            >
              {isEditMode ? 'Guardar cambios' : 'Crear grupo'}
            </button>
          </div>
        </form>
      </AccessibleModal>

      {/* Schedule Form Modal */}
      {isEditMode && (
        <ScheduleFormModal
          open={scheduleModalOpen}
          onClose={() => {
            setScheduleModalOpen(false);
            setSelectedSchedule(null);
          }}
          onSubmit={handleScheduleSubmit}
          initialData={selectedSchedule ? {
            ...selectedSchedule,
            groupId: initialData.id, // Pre-fill group
          } : {
            groupId: initialData.id, // Pre-fill group for new schedules
          }}
          groups={[initialData]} // Only this group
          courts={courts} // Pass all courts - ScheduleFormModal will filter by sport
          sport={formData.sport}
          hideGroupSelector={true} // Hide group selector since we're editing from a specific group
        />
      )}
    </>
  );
}
