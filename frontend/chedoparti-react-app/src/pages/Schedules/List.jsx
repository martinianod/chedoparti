import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSchedules } from '../../hooks/useInstitutionSync';
import Card from '../../components/ui/Card.jsx';
import { FiClock, FiCalendar, FiTrash2, FiPlus } from 'react-icons/fi';
import DeleteButton from '../../components/ui/DeleteButton';
import SaveButton from '../../components/ui/SaveButton';
import { useAppNotifications } from '../../hooks/useAppNotifications';
import TimeSelector from '../../components/ui/TimeSelector';

export default function SchedulesPanel() {
  const { t } = useTranslation();
  const { schedule: notifications } = useAppNotifications();
  
  // Usar hook global
  const { 
    groups: initialGroups, 
    feriados: initialFeriados, 
    intervalMinutes: initialInterval,
    isLoading: loading, 
    updateSchedule, 
    isSaving: saving 
  } = useSchedules();

  const [intervalMinutes, setIntervalMinutes] = useState(60);
  const [groups, setGroups] = useState([]);
  const [schedule, setSchedule] = useState({ feriados: [] });

  // Sincronizar estado local con datos del hook cuando cargan
  useEffect(() => {
    if (!loading) {
      setGroups(initialGroups || []);
      setSchedule({ feriados: initialFeriados || [] });
      setIntervalMinutes(initialInterval || 60);
    }
  }, [loading, initialGroups, initialFeriados, initialInterval]);

  const days = [
    { key: 'lunes', label: t('schedules.days.lunes') },
    { key: 'martes', label: t('schedules.days.martes') },
    { key: 'miercoles', label: t('schedules.days.miercoles') },
    { key: 'jueves', label: t('schedules.days.jueves') },
    { key: 'viernes', label: t('schedules.days.viernes') },
    { key: 'sabado', label: t('schedules.days.sabado') },
    { key: 'domingo', label: t('schedules.days.domingo') },
  ];

  async function handleSubmit(e) {
    e.preventDefault();
    
    // Validate time ranges
    for (const group of groups) {
      for (const horario of group.horarios) {
        if (horario.open >= horario.close) {
          notifications.error(t('schedules.invalid_time_range') || 'La hora de apertura debe ser anterior al cierre');
          return;
        }
      }
    }

    try {
      await updateSchedule({
        groups,
        feriados: schedule.feriados || [],
        slotInterval: intervalMinutes,
      });
      // Notification is handled by the hook
    } catch (error) {
      console.error('Error saving schedule:', error);
    }
  }

  function handleGroupDaysChange(groupIdx, dayKey) {
    setGroups((prev) => {
      const updatedGroups = prev.map((group, idx) => {
        if (idx !== groupIdx) return group;
        const daysSet = new Set(group.days);
        if (daysSet.has(dayKey)) {
          daysSet.delete(dayKey);
        } else {
          daysSet.add(dayKey);
        }
        return { ...group, days: Array.from(daysSet) };
      });

      // Eliminar automáticamente grupos que no tengan días asignados
      const filteredGroups = updatedGroups.filter((group) => group.days.length > 0);

      // Mostrar notificación si se eliminó un grupo automáticamente
      if (filteredGroups.length < updatedGroups.length) {
        setTimeout(() => {
          notifications.groupAutoDeleted();
        }, 100);
      }

      return filteredGroups;
    });
  }

  function handleHorarioChange(groupIdx, idx, field, value) {
    setGroups((prev) => {
      return prev.map((group, gidx) => {
        if (gidx !== groupIdx) return group;
        const horarios = [...group.horarios];
        horarios[idx] = { ...horarios[idx], [field]: value };
        return { ...group, horarios };
      });
    });
  }

  function addHorario(groupIdx) {
    setGroups((prev) => {
      return prev.map((group, idx) => {
        if (idx !== groupIdx) return group;
        return { ...group, horarios: [...group.horarios, { open: '08:00', close: '23:00' }] };
      });
    });
  }

  function removeHorario(groupIdx, idx) {
    setGroups((prev) => {
      return prev.map((group, gidx) => {
        if (gidx !== groupIdx) return group;
        const horarios = [...group.horarios];
        horarios.splice(idx, 1);
        return { ...group, horarios };
      });
    });
  }

  function addGroup() {
    // Calcular días restantes disponibles
    const usedDays = groups.flatMap((g) => g.days);
    const availableDays = days.filter((d) => !usedDays.includes(d.key));

    // Solo permitir agregar si hay días disponibles
    if (availableDays.length === 0) {
      notifications.noDaysAvailable();
      return;
    }

    setGroups((prev) => [...prev, { days: [], horarios: [{ open: '08:00', close: '23:00' }] }]);
  }

  // Calcular días disponibles para mostrar en el botón
  const usedDays = groups.flatMap((g) => g.days);
  const availableDays = days.filter((d) => !usedDays.includes(d.key));
  const canAddGroup = availableDays.length > 0;

  function removeGroup(idx) {
    setGroups((prev) => prev.filter((_, i) => i !== idx));
  }

  if (loading) {
    return (
      <div className="p-3 sm:p-4 lg:p-6">
        <Card className="p-4 sm:p-6 lg:p-8 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              <span className="hidden sm:inline">{t('schedules.loading')}</span>
              <span className="sm:hidden">{t('schedules.loading_short')}</span>
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 lg:p-6">
      <Card className="p-4 sm:p-6 lg:p-8 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4 sm:mb-6 text-gray-900 dark:text-white flex items-center gap-2">
          <FiClock className="inline-block" size={20} />
          <span className="hidden sm:inline">{t('schedules.config_title')}</span>
          <span className="sm:hidden">{t('schedules.title_short')}</span>
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 lg:space-y-8">
          {/* Grupos de días y horarios */}
          <div className="mb-4 sm:mb-6 lg:mb-8">
            <label className="block font-semibold mb-2 sm:mb-3 text-sm sm:text-base text-gray-700 dark:text-gray-200">
              <span className="hidden sm:inline">{t('schedules.configure_days_hours')}</span>
              <span className="sm:hidden">{t('schedules.configure_days_hours_short')}</span>
            </label>
            {groups.map((group, groupIdx) => {
              // Calcular días disponibles para este grupo
              const usedDays = groups.flatMap((g, idx) => (idx === groupIdx ? [] : g.days));
              const availableDays = days.filter((d) => !usedDays.includes(d.key));
              return (
                <div
                  key={groupIdx}
                  className="mb-4 sm:mb-6 border rounded-xl p-3 sm:p-4 lg:p-5 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-2 gap-2">
                    <span className="font-semibold text-base sm:text-lg text-gray-900 dark:text-white">
                      {t('schedules.group')} {groupIdx + 1}
                    </span>
                    <div className="flex justify-end">
                      <DeleteButton onClick={() => removeGroup(groupIdx)}>
                        <span className="hidden sm:inline">{t('schedules.delete_group')}</span>
                        <span className="sm:hidden">{t('schedules.delete_group_short')}</span>
                      </DeleteButton>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-3 lg:gap-4 mb-4">
                    {availableDays.map(({ key, label }) => (
                      <label
                        key={key}
                        className="flex items-center gap-2 cursor-pointer p-2 sm:p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={group.days.includes(key)}
                          onChange={() => handleGroupDaysChange(groupIdx, key)}
                          className="form-checkbox h-4 w-4 sm:h-5 sm:w-5 text-green-600 border-gray-300 dark:border-gray-700 focus:ring-green-500"
                        />
                        <span className="text-xs sm:text-sm lg:text-base text-gray-800 dark:text-gray-200">
                          {label}
                        </span>
                      </label>
                    ))}
                  </div>
                  {/* Horarios para este grupo */}
                  <div className="mb-2 sm:mb-3">
                    <span className="font-semibold text-sm sm:text-base text-gray-700 dark:text-gray-200">
                      <span className="hidden sm:inline">{t('schedules.selected_days_hours')}</span>
                      <span className="sm:hidden">{t('schedules.selected_days_hours_short')}</span>
                    </span>
                  </div>
                  <div className="space-y-3">
                    {group.horarios.map((horario, idx) => (
                      <div
                        key={idx}
                        className="flex flex-col sm:flex-row gap-3 p-3 sm:p-2 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700"
                      >
                        <div className="flex gap-3 flex-1">
                          <TimeSelector
                            label={t('schedules.opening')}
                            value={horario.open}
                            onChange={(value) => handleHorarioChange(groupIdx, idx, 'open', value)}
                            placeholder="Hora inicio"
                            className="text-sm sm:text-base"
                          />
                          <TimeSelector
                            label={t('schedules.closing')}
                            value={horario.close}
                            onChange={(value) => handleHorarioChange(groupIdx, idx, 'close', value)}
                            placeholder="Hora fin"
                            className="text-sm sm:text-base"
                          />
                        </div>
                        <div className="flex justify-center sm:justify-end sm:items-end">
                          <DeleteButton
                            onClick={() => removeHorario(groupIdx, idx)}
                            disabled={group.horarios.length === 1}
                            className="w-full sm:w-auto"
                          >
                            <span className="hidden sm:inline">
                              {t('schedules.delete_schedule')}
                            </span>
                            <span className="sm:hidden">{t('schedules.delete_schedule_full')}</span>
                          </DeleteButton>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm sm:btn-xs font-semibold px-3 py-2 sm:py-1 flex items-center justify-center gap-1 mt-3 sm:mt-2 w-full sm:w-auto"
                    onClick={() => addHorario(groupIdx)}
                  >
                    <FiPlus className="w-4 h-4" />
                    <span className="hidden sm:inline">{t('schedules.add_schedule')}</span>
                    <span className="sm:hidden">{t('schedules.add_schedule_short')}</span>
                  </button>
                </div>
              );
            })}

            {/* Botón para agregar grupo */}
            <div className="mt-4 sm:mt-6">
              <button
                type="button"
                onClick={addGroup}
                className={`btn font-semibold py-2 sm:py-3 px-4 sm:px-6 flex items-center justify-center gap-2 w-full sm:w-auto text-sm sm:text-base ${
                  canAddGroup
                    ? 'btn-primary'
                    : 'btn-gray-300 dark:btn-gray-600 cursor-not-allowed opacity-50'
                }`}
                disabled={!canAddGroup}
                title={
                  canAddGroup
                    ? t('schedules.add_group', { count: availableDays.length })
                    : t('schedules.no_days_available')
                }
              >
                <FiPlus className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">
                  {canAddGroup
                    ? t('schedules.add_group', { count: availableDays.length })
                    : t('schedules.no_days_available')}
                </span>
                <span className="sm:hidden">
                  {canAddGroup ? t('schedules.add_group_short') : t('schedules.no_days')}
                </span>
              </button>
            </div>
          </div>

          {/* Feriados */}
          <HolidaysManager schedule={schedule} setSchedule={setSchedule} />

          {/* Intervalo */}
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
              <label className="font-medium mb-2 sm:mb-0 text-sm sm:text-base text-gray-700 dark:text-gray-200 sm:min-w-fit">
                <span className="hidden sm:inline">{t('schedules.interval_title')}</span>
                <span className="sm:hidden">{t('schedules.interval_title_short')}</span>
              </label>
              <input
                type="number"
                min="10"
                max="180"
                step="5"
                value={intervalMinutes}
                onChange={(e) => setIntervalMinutes(Number(e.target.value))}
                className="input input-sm sm:input w-full sm:w-32 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100"
              />
            </div>
          </div>

          {/* Botón guardar */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <SaveButton
              type="submit"
              className="w-full sm:w-auto text-sm sm:text-base font-semibold py-3 sm:py-2 px-6 sm:px-8"
              disabled={saving}
            >
              <span className="hidden sm:inline">
                {saving ? t('schedules.saving') : t('schedules.save_config')}
              </span>
              <span className="sm:hidden">
                {saving ? t('schedules.saving_short') : t('schedules.save_config_short')}
              </span>
            </SaveButton>
          </div>
        </form>
      </Card>
    </div>
  );
}

function HolidaysManager({ schedule, setSchedule }) {
  const { t } = useTranslation();
  const { schedule: notifications, validation } = useAppNotifications();
  const [fecha, setFecha] = useState('');
  const [open, setOpen] = useState('08:00');
  const [close, setClose] = useState('23:00');

  function addHoliday() {
    if (!fecha) {
      validation.required('fecha para el feriado');
      return;
    }

    // Verificar si la fecha ya existe
    const existingHoliday = (schedule.feriados || []).find((h) => h.fecha === fecha);
    if (existingHoliday) {
      validation.duplicateDate();
      return;
    }

    // Validar que la hora de apertura sea menor que la de cierre
    if (open >= close) {
      validation.invalidTimeRange();
      return;
    }

    setSchedule((sch) => ({
      ...sch,
      feriados: [...(sch.feriados || []), { fecha, open, close }],
    }));

    setFecha('');
    setOpen('08:00');
    setClose('23:00');
    notifications.holidayAdded();
  }

  function removeHoliday(idx) {
    setSchedule((sch) => ({
      ...sch,
      feriados: sch.feriados.filter((_, i) => i !== idx),
    }));
  }

  return (
    <div className="mt-6 sm:mt-8">
      <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-gray-900 dark:text-white flex items-center gap-2">
        <FiCalendar className="inline-block" size={18} />
        <span className="hidden sm:inline">{t('schedules.holidays_title')}</span>
        <span className="sm:hidden">{t('schedules.holidays_title_short')}</span>
      </h2>

      {/* Form para agregar feriados - Responsivo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-wrap gap-3 mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col">
          <label className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            {t('schedules.date')}
          </label>
          <input
            type="date"
            className="input input-sm sm:input border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
          />
        </div>
        <TimeSelector
          label={t('schedules.opening')}
          value={open}
          onChange={setOpen}
          placeholder="Hora inicio"
        />
        <TimeSelector
          label={t('schedules.closing')}
          value={close}
          onChange={setClose}
          placeholder="Hora fin"
        />
        <div className="flex flex-col lg:justify-end sm:col-span-2 lg:col-span-1">
          <button
            type="button"
            onClick={addHoliday}
            className="btn btn-primary font-semibold py-2 sm:py-3 px-4 sm:px-6 flex items-center justify-center gap-2 w-full lg:w-auto"
          >
            <FiPlus className="w-4 h-4" />
            <span>{t('schedules.add_holiday')}</span>
          </button>
        </div>
      </div>

      {/* Lista de feriados - Responsive cards */}
      <div className="space-y-2 sm:space-y-3">
        {(schedule.feriados || []).length === 0 ? (
          <div className="text-center py-6 text-gray-500 dark:text-gray-400 text-sm sm:text-base">
            {t('schedules.no_holidays')}
          </div>
        ) : (
          (schedule.feriados || []).map((f, idx) => (
            <div
              key={idx}
              className="flex flex-col sm:flex-row sm:justify-between sm:items-center border rounded-lg p-3 sm:p-4 text-sm sm:text-base bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow gap-2 sm:gap-0"
            >
              <div className="flex items-center gap-2 text-gray-800 dark:text-gray-100">
                <FiCalendar className="w-4 h-4 text-navy dark:text-gold flex-shrink-0" />
                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3">
                  <span className="font-medium">{f.fecha}</span>
                  <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    {f.open} a {f.close}
                  </span>
                </div>
              </div>
              <div className="flex justify-end sm:justify-start">
                <DeleteButton onClick={() => removeHoliday(idx)} className="w-full sm:w-auto">
                  <span className="hidden sm:inline">{t('schedules.delete_holiday')}</span>
                  <span className="sm:hidden">{t('schedules.delete_holiday_full')}</span>
                </DeleteButton>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
