import React, { useState, useEffect } from 'react';
import { FiX, FiSave, FiCheck } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { courtsApi, usersApi } from '../../services/api';
import { useAppNotifications } from '../../hooks/useAppNotifications';

export default function CoachQuotaModal({ open, onClose, coach, onUpdate }) {
  const { t } = useTranslation();
  const { showSuccess, showError } = useAppNotifications();
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [courts, setCourts] = useState([]);
  
  const [formData, setFormData] = useState({
    weeklyHourQuota: 0,
    assignedCourts: []
  });

  useEffect(() => {
    if (open && coach) {
      loadData();
    }
  }, [open, coach]);

  const loadData = async () => {
    try {
      setLoading(true);
      // Load available courts
      const courtsResponse = await courtsApi.list();
      setCourts(courtsResponse.data);

      // Initialize form with coach data
      setFormData({
        weeklyHourQuota: coach.weeklyHourQuota || 0,
        assignedCourts: coach.assignedCourts || []
      });
    } catch (error) {
      console.error('Error loading modal data:', error);
      showError('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleCourtToggle = (courtId) => {
    setFormData(prev => {
      const current = prev.assignedCourts;
      const exists = current.includes(courtId);
      
      if (exists) {
        return { ...prev, assignedCourts: current.filter(id => id !== courtId) };
      } else {
        return { ...prev, assignedCourts: [...current, courtId] };
      }
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      const updatedCoach = await usersApi.update(coach.id, {
        weeklyHourQuota: Number(formData.weeklyHourQuota),
        assignedCourts: formData.assignedCourts
      });

      showSuccess('Configuración de entrenador actualizada');
      if (onUpdate) onUpdate(updatedCoach.data);
      onClose();
    } catch (error) {
      console.error('Error saving coach config:', error);
      showError('Error al guardar la configuración');
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-navy w-full max-w-lg rounded-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-navy-light">
          <h3 className="text-lg font-semibold text-navy dark:text-gold">
            Gestionar Entrenador: {coach?.name}
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {loading ? (
            <div className="text-center py-8">Cargando...</div>
          ) : (
            <div className="space-y-6">
              {/* Quota Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Cuota Semanal de Horas
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="0"
                    value={formData.weeklyHourQuota}
                    onChange={(e) => setFormData({...formData, weeklyHourQuota: e.target.value})}
                    className="w-32"
                  />
                  <span className="text-sm text-gray-500">horas por semana (0 = sin límite)</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  El entrenador no podrá crear más reservas que este límite semanal.
                </p>
              </div>

              {/* Courts Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Canchas Asignadas
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto p-2 border border-gray-200 dark:border-gray-700 rounded-md">
                  {courts.map(court => (
                    <div 
                      key={court.id}
                      onClick={() => handleCourtToggle(court.id)}
                      className={`
                        flex items-center justify-between p-3 rounded-md cursor-pointer border transition-all
                        ${formData.assignedCourts.includes(court.id)
                          ? 'bg-navy/10 border-navy dark:bg-gold/20 dark:border-gold'
                          : 'bg-white dark:bg-navy border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                        }
                      `}
                    >
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">{court.name}</span>
                        <span className="text-xs text-gray-500">{court.sport}</span>
                      </div>
                      {formData.assignedCourts.includes(court.id) && (
                        <FiCheck className="text-navy dark:text-gold" />
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  El entrenador solo podrá reservar en las canchas seleccionadas.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-navy-light flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving || loading} className="flex items-center gap-2">
            <FiSave />
            {saving ? 'Guardando...' : 'Guardar Configuración'}
          </Button>
        </div>
      </div>
    </div>
  );
}
