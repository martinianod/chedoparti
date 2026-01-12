import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FiPlus, FiTrash2, FiSave, FiClock, FiDollarSign, FiCalendar } from 'react-icons/fi';
import useAuth from '../../hooks/useAuth';
import { useAppNotifications } from '../../hooks/useAppNotifications';
import { usersApi, courtsApi } from '../../services/api';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function CoachAvailability() {
  const { t } = useTranslation();
  const { user, updateUser } = useAuth();
  const { showSuccess, showError } = useAppNotifications();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [availability, setAvailability] = useState([]);
  const [assignedCourts, setAssignedCourts] = useState([]);
  const [weeklyHourQuota, setWeeklyHourQuota] = useState(0);
  const [courts, setCourts] = useState([]);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Get fresh user data
        const userResponse = await usersApi.get(user.id || user.email);
        const userData = userResponse.data;
        
        setAvailability(userData.availability || []);
        setAssignedCourts(userData.assignedCourts || []);
        setWeeklyHourQuota(userData.weeklyHourQuota || 0);

        // Get courts info to display names
        const courtsResponse = await courtsApi.list();
        setCourts(courtsResponse.data);
      } catch (error) {
        console.error('Error loading coach data:', error);
        showError('Error al cargar la configuración');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadData();
    }
  }, [user]);

  const handleAddSlot = () => {
    setAvailability([
      ...availability,
      { day: 'Lunes', startTime: '09:00', endTime: '10:00', price: 0 }
    ]);
  };

  const handleRemoveSlot = (index) => {
    const newAvailability = [...availability];
    newAvailability.splice(index, 1);
    setAvailability(newAvailability);
  };

  const handleSlotChange = (index, field, value) => {
    const newAvailability = [...availability];
    newAvailability[index] = { ...newAvailability[index], [field]: value };
    setAvailability(newAvailability);
  };

  const calculateTotalHours = () => {
    return availability.reduce((total, slot) => {
      const start = parseInt(slot.startTime.split(':')[0]) + parseInt(slot.startTime.split(':')[1]) / 60;
      const end = parseInt(slot.endTime.split(':')[0]) + parseInt(slot.endTime.split(':')[1]) / 60;
      return total + (end - start);
    }, 0);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Validate quota
      const totalHours = calculateTotalHours();
      if (weeklyHourQuota > 0 && totalHours > weeklyHourQuota) {
        showError(`Has excedido tu cuota de ${weeklyHourQuota} horas semanales. Total actual: ${totalHours.toFixed(1)}hs`);
        setSaving(false);
        return;
      }

      // Update user
      await usersApi.update(user.id, {
        availability: availability
      });

      // Update local user context if needed
      // updateUser({ ...user, availability }); 

      showSuccess('Disponibilidad guardada exitosamente');
    } catch (error) {
      console.error('Error saving availability:', error);
      showError('Error al guardar los cambios');
    } finally {
      setSaving(false);
    }
  };

  const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  if (loading) {
    return <div className="p-8 text-center">Cargando configuración...</div>;
  }

  const totalHours = calculateTotalHours();
  const isOverQuota = weeklyHourQuota > 0 && totalHours > weeklyHourQuota;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-navy dark:text-gold">Mi Disponibilidad</h1>
          <p className="text-gray-600 dark:text-gray-400">Configura tus horarios y precios para las clases</p>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={saving || isOverQuota}
          className="flex items-center gap-2"
        >
          <FiSave />
          {saving ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-navy p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-2">
            <FiClock className="text-2xl text-navy dark:text-gold" />
            <h3 className="font-semibold text-lg">Cuota Semanal</h3>
          </div>
          <div className="text-3xl font-bold text-navy dark:text-gold">
            {totalHours.toFixed(1)} <span className="text-sm font-normal text-gray-500">/ {weeklyHourQuota > 0 ? weeklyHourQuota : '∞'} hs</span>
          </div>
          {isOverQuota && (
            <p className="text-red-500 text-sm mt-2">Has excedido tu límite de horas asignado.</p>
          )}
        </div>

        <div className="bg-white dark:bg-navy p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-2">
            <FiCalendar className="text-2xl text-navy dark:text-gold" />
            <h3 className="font-semibold text-lg">Canchas Asignadas</h3>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {assignedCourts.length > 0 ? (
              assignedCourts.map(courtId => {
                const court = courts.find(c => c.id === courtId);
                return (
                  <span key={courtId} className="px-3 py-1 bg-navy/10 dark:bg-gold/20 text-navy dark:text-gold rounded-full text-sm font-medium">
                    {court ? court.name : `Cancha ${courtId}`}
                  </span>
                );
              })
            ) : (
              <p className="text-gray-500">No tienes canchas asignadas</p>
            )}
          </div>
        </div>
      </div>

      {/* Availability Editor */}
      <div className="bg-white dark:bg-navy rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Horarios Definidos</h2>
          <Button onClick={handleAddSlot} variant="outline" size="sm" className="flex items-center gap-2">
            <FiPlus /> Agregar Horario
          </Button>
        </div>
        
        <div className="p-6">
          {availability.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No has definido horarios de disponibilidad.
            </div>
          ) : (
            <div className="space-y-4">
              {availability.map((slot, index) => (
                <div key={index} className="flex flex-wrap md:flex-nowrap items-end gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="w-full md:w-48">
                    <label className="block text-sm font-medium mb-1">Día</label>
                    <select
                      value={slot.day}
                      onChange={(e) => handleSlotChange(index, 'day', e.target.value)}
                      className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2"
                    >
                      {daysOfWeek.map(day => (
                        <option key={day} value={day}>{day}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="w-full md:w-32">
                    <label className="block text-sm font-medium mb-1">Desde</label>
                    <Input
                      type="time"
                      value={slot.startTime}
                      onChange={(e) => handleSlotChange(index, 'startTime', e.target.value)}
                    />
                  </div>

                  <div className="w-full md:w-32">
                    <label className="block text-sm font-medium mb-1">Hasta</label>
                    <Input
                      type="time"
                      value={slot.endTime}
                      onChange={(e) => handleSlotChange(index, 'endTime', e.target.value)}
                    />
                  </div>

                  <div className="w-full md:w-40">
                    <label className="block text-sm font-medium mb-1">Precio (Hora)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                      <Input
                        type="number"
                        value={slot.price}
                        onChange={(e) => handleSlotChange(index, 'price', Number(e.target.value))}
                        className="pl-8"
                      />
                    </div>
                  </div>

                  <div className="w-full md:w-auto pb-1">
                    <button
                      onClick={() => handleRemoveSlot(index)}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                      title="Eliminar horario"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
