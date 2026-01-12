import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FiDollarSign, FiClock, FiCalendar, FiPlus, FiTrash2, FiZap, FiGlobe, FiActivity, FiGrid, FiCheck } from 'react-icons/fi';
import DeleteButton from '../ui/DeleteButton';
import AddButton from '../ui/AddButton';
import TimeBlock from './TimeBlock';
import {
  migratePricingRule,
  createEmptyTimeBlock,
  getTimeBlockTemplates,
  duplicateTimeBlock,
} from '../../utils/pricingMigration';
import {
  detectTimeConflicts,
  sortTimeBlocks,
} from '../../utils/timeBlockValidation';

/**
 * Componente unificado para configuración de precios
 * Soporta selección de alcance (Global, Deporte, Canchas) y selector de días mejorado
 */
export default function GlobalPricingRules({ pricing = [], onChange, courts = [] }) {
  const [rows, setRows] = useState([]);
  const { t } = useTranslation();

  const daysOptions = [
    { value: 'Lunes', label: 'L', full: 'Lunes' },
    { value: 'Martes', label: 'M', full: 'Martes' },
    { value: 'Miércoles', label: 'M', full: 'Miércoles' },
    { value: 'Jueves', label: 'J', full: 'Jueves' },
    { value: 'Viernes', label: 'V', full: 'Viernes' },
    { value: 'Sábado', label: 'S', full: 'Sábado' },
    { value: 'Domingo', label: 'D', full: 'Domingo' },
  ];

  // Obtener deportes únicos
  const sports = [...new Set(courts.map(c => c.sport))];

  // Migrar datos al cargar
  useEffect(() => {
    // Asegurar que cada regla tenga la estructura correcta y el campo scope
    const migratedRules = pricing.map(rule => {
      const migrated = migratePricingRule(rule);
      if (!migrated.scope) {
        migrated.scope = { type: 'global', sport: '', courtIds: [] };
      }
      return migrated;
    });
    setRows(migratedRules);
  }, [pricing]);

  const handleChange = (idx, field, value) => {
    const updated = rows.map((row, i) => (i === idx ? { ...row, [field]: value } : row));
    setRows(updated);
    onChange && onChange(updated);
  };

  const handleScopeChange = (idx, field, value) => {
    const updated = rows.map((row, i) => {
      if (i === idx) {
        return { 
          ...row, 
          scope: { ...row.scope, [field]: value } 
        };
      }
      return row;
    });
    setRows(updated);
    onChange && onChange(updated);
  };

  const handleTimeBlockChange = (ruleIdx, blockIdx, updatedBlock) => {
    const updated = rows.map((row, i) => {
      if (i === ruleIdx) {
        const newTimeBlocks = [...(row.timeBlocks || [])];
        newTimeBlocks[blockIdx] = updatedBlock;
        return { ...row, timeBlocks: sortTimeBlocks(newTimeBlocks) };
      }
      return row;
    });
    setRows(updated);
    onChange && onChange(updated);
  };

  const addTimeBlock = (ruleIdx, template = null) => {
    const updated = rows.map((row, i) => {
      if (i === ruleIdx) {
        const newBlock = template || createEmptyTimeBlock();
        const timeBlocks = [...(row.timeBlocks || []), newBlock];
        return { ...row, timeBlocks: sortTimeBlocks(timeBlocks) };
      }
      return row;
    });
    setRows(updated);
    onChange && onChange(updated);
  };

  const removeTimeBlock = (ruleIdx, blockIdx) => {
    const updated = rows.map((row, i) => {
      if (i === ruleIdx) {
        const timeBlocks = (row.timeBlocks || []).filter((_, idx) => idx !== blockIdx);
        return { ...row, timeBlocks };
      }
      return row;
    });
    setRows(updated);
    onChange && onChange(updated);
  };

  const duplicateBlock = (ruleIdx, blockIdx) => {
    const updated = rows.map((row, i) => {
      if (i === ruleIdx) {
        const blockToDuplicate = row.timeBlocks[blockIdx];
        const newBlock = duplicateTimeBlock(blockToDuplicate);
        const timeBlocks = [...(row.timeBlocks || []), newBlock];
        return { ...row, timeBlocks: sortTimeBlocks(timeBlocks) };
      }
      return row;
    });
    setRows(updated);
    onChange && onChange(updated);
  };

  const addNewRule = () => {
    const newRule = {
      id: Date.now().toString(), // Simple ID temporal
      days: [],
      durations: ['1h'],
      timeBlocks: [createEmptyTimeBlock()],
      scope: { type: 'global', sport: '', courtIds: [] }
    };

    const updated = [...rows, newRule];
    setRows(updated);
    onChange && onChange(updated);
  };

  const removeRule = (idx) => {
    const updated = rows.filter((_, i) => i !== idx);
    setRows(updated);
    onChange && onChange(updated);
  };

  const duplicateRule = (idx) => {
    const ruleToDuplicate = JSON.parse(JSON.stringify(rows[idx]));
    ruleToDuplicate.id = Date.now().toString();
    // No reseteamos días ni scope para facilitar la duplicación rápida con pequeños ajustes
    
    const updated = [...rows, ruleToDuplicate];
    setRows(updated);
    onChange && onChange(updated);
  };

  // Plantillas rápidas
  const templates = getTimeBlockTemplates();

  const toggleDay = (ruleIdx, dayValue) => {
    const row = rows[ruleIdx];
    const currentDays = row.days || [];
    const newDays = currentDays.includes(dayValue)
      ? currentDays.filter(d => d !== dayValue)
      : [...currentDays, dayValue];
    
    // Ordenar días para consistencia visual (opcional, pero recomendado)
    // newDays.sort((a, b) => daysOptions.findIndex(d => d.value === a) - daysOptions.findIndex(d => d.value === b));
    
    handleChange(ruleIdx, 'days', newDays);
  };

  const toggleCourt = (ruleIdx, courtId) => {
    const row = rows[ruleIdx];
    const currentCourts = row.scope.courtIds || [];
    const newCourts = currentCourts.includes(courtId)
      ? currentCourts.filter(id => id !== courtId)
      : [...currentCourts, courtId];
    
    handleScopeChange(ruleIdx, 'courtIds', newCourts);
  };

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FiDollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-200">
                Reglas de Precios
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                {rows.length} regla{rows.length !== 1 ? 's' : ''} configurada{rows.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          <AddButton onClick={addNewRule} className="py-2 px-4">
            <span className="hidden sm:inline">{t('globalPricing.newRule')}</span>
          </AddButton>
        </div>
      </div>

      {/* Lista de reglas */}
      <div className="space-y-6">
        {rows.map((row, idx) => {
          const conflicts = detectTimeConflicts(row.timeBlocks || []);

          return (
            <div
              key={row.id || idx}
              className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm relative overflow-hidden"
            >
              {/* Indicador de tipo de regla (borde izquierdo de color) */}
              <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                row.scope?.type === 'global' ? 'bg-blue-500' :
                row.scope?.type === 'sport' ? 'bg-purple-500' : 'bg-orange-500'
              }`}></div>

              <div className="pl-2 space-y-5">
                {/* 1. Selector de Alcance (Scope) */}
                <div className="flex flex-wrap items-center gap-4 pb-4 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Aplicar a:</span>
                  
                  <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                    <button
                      onClick={() => handleScopeChange(idx, 'type', 'global')}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                        row.scope?.type === 'global' 
                          ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm' 
                          : 'text-gray-600 dark:text-gray-300 hover:text-gray-900'
                      }`}
                    >
                      <FiGlobe className="w-4 h-4" />
                      Global
                    </button>
                    <button
                      onClick={() => handleScopeChange(idx, 'type', 'sport')}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                        row.scope?.type === 'sport' 
                          ? 'bg-white dark:bg-gray-600 text-purple-600 dark:text-purple-400 shadow-sm' 
                          : 'text-gray-600 dark:text-gray-300 hover:text-gray-900'
                      }`}
                    >
                      <FiActivity className="w-4 h-4" />
                      Por Deporte
                    </button>
                    <button
                      onClick={() => handleScopeChange(idx, 'type', 'courts')}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                        row.scope?.type === 'courts' 
                          ? 'bg-white dark:bg-gray-600 text-orange-600 dark:text-orange-400 shadow-sm' 
                          : 'text-gray-600 dark:text-gray-300 hover:text-gray-900'
                      }`}
                    >
                      <FiGrid className="w-4 h-4" />
                      Canchas Específicas
                    </button>
                  </div>

                  {/* Selectores condicionales según el tipo */}
                  {row.scope?.type === 'sport' && (
                    <select
                      className="input py-1.5 px-3 text-sm"
                      value={row.scope.sport}
                      onChange={(e) => handleScopeChange(idx, 'sport', e.target.value)}
                    >
                      <option value="">Seleccionar Deporte...</option>
                      {sports.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  )}

                  {row.scope?.type === 'courts' && (
                    <div className="flex flex-wrap gap-2">
                      {courts.map(court => (
                        <button
                          key={court.id}
                          onClick={() => toggleCourt(idx, court.id)}
                          className={`px-2 py-1 text-xs rounded border transition-colors ${
                            row.scope.courtIds?.includes(court.id)
                              ? 'bg-orange-100 dark:bg-orange-900/30 border-orange-200 text-orange-700 dark:text-orange-300'
                              : 'bg-gray-50 dark:bg-gray-800 border-gray-200 text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          {court.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* 2. Días y Duraciones */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Selector de Días Mejorado */}
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">
                      Días de la semana
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {daysOptions.map((day) => {
                        const isSelected = row.days?.includes(day.value);
                        return (
                          <button
                            key={day.value}
                            onClick={() => toggleDay(idx, day.value)}
                            className={`
                              w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all
                              ${isSelected 
                                ? 'bg-blue-600 text-white shadow-md transform scale-105' 
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                              }
                            `}
                            title={day.full}
                          >
                            {day.label}
                          </button>
                        );
                      })}
                    </div>
                    {row.days?.length === 0 && (
                      <p className="text-xs text-red-500 mt-1">Seleccione al menos un día</p>
                    )}
                  </div>

                  {/* Duraciones */}
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">
                      Duraciones Permitidas
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {['1h', '1.5h', '2h', '2.5h', '3h'].map((duration) => (
                        <label 
                          key={duration} 
                          className={`
                            flex items-center gap-2 px-3 py-1.5 rounded-lg border cursor-pointer transition-all text-sm
                            ${row.durations?.includes(duration)
                              ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300'
                              : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50'
                            }
                          `}
                        >
                          <input
                            type="checkbox"
                            className="hidden"
                            checked={row.durations?.includes(duration)}
                            onChange={(e) => {
                              const durations = e.target.checked
                                ? [...(row.durations || []), duration]
                                : (row.durations || []).filter((d) => d !== duration);
                              handleChange(idx, 'durations', durations);
                            }}
                          />
                          {row.durations?.includes(duration) && <FiCheck className="w-3 h-3" />}
                          {duration}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 3. Bloques de Tiempo */}
                <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <FiClock className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Bloques de Horarios y Precios
                      </label>
                    </div>

                    {/* Plantillas rápidas */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => addTimeBlock(idx, templates.morning)}
                        className="text-xs px-2 py-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors flex items-center gap-1"
                        title="Agregar turno mañana"
                      >
                        <FiZap className="w-3 h-3 text-yellow-500" />
                        Mañana
                      </button>
                      <button
                        onClick={() => addTimeBlock(idx, templates.afternoon)}
                        className="text-xs px-2 py-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors flex items-center gap-1"
                        title="Agregar turno tarde"
                      >
                        <FiZap className="w-3 h-3 text-orange-500" />
                        Tarde
                      </button>
                      <button
                        onClick={() => addTimeBlock(idx, templates.night)}
                        className="text-xs px-2 py-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors flex items-center gap-1"
                        title="Agregar turno noche"
                      >
                        <FiZap className="w-3 h-3 text-purple-500" />
                        Noche
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {(!row.timeBlocks || row.timeBlocks.length === 0) ? (
                      <div className="text-center py-4 text-gray-500 text-sm">
                        No hay bloques de horarios definidos.
                        <button onClick={() => addTimeBlock(idx)} className="text-blue-600 hover:underline ml-1">
                          Agregar uno
                        </button>
                      </div>
                    ) : (
                      row.timeBlocks.map((block, blockIdx) => {
                        const blockConflicts = conflicts.filter(
                          (c) => c.block1Index === blockIdx || c.block2Index === blockIdx
                        );
                        const hasConflict = blockConflicts.length > 0;
                        const conflictMessage = blockConflicts.map((c) => c.message).join(', ');

                        return (
                          <TimeBlock
                            key={block.id || blockIdx}
                            block={block}
                            index={blockIdx}
                            onChange={(updatedBlock) =>
                              handleTimeBlockChange(idx, blockIdx, updatedBlock)
                            }
                            onDelete={() => removeTimeBlock(idx, blockIdx)}
                            onDuplicate={() => duplicateBlock(idx, blockIdx)}
                            hasConflict={hasConflict}
                            conflictMessage={conflictMessage}
                          />
                        );
                      })
                    )}
                  </div>

                  {row.timeBlocks && row.timeBlocks.length > 0 && (
                    <div className="mt-3">
                      <AddButton
                        onClick={() => addTimeBlock(idx)}
                        className="w-full py-1.5 text-sm border-dashed bg-white dark:bg-gray-800"
                      >
                        + Agregar otro bloque horario
                      </AddButton>
                    </div>
                  )}
                </div>

                {/* Footer de la regla */}
                <div className="flex justify-end items-center gap-2 pt-2">
                  <button
                    onClick={() => duplicateRule(idx)}
                    className="text-gray-500 hover:text-blue-600 p-2 rounded hover:bg-blue-50 transition-colors"
                    title="Duplicar regla completa"
                  >
                    <FiCopy className="w-4 h-4" />
                  </button>
                  <DeleteButton
                    onClick={() => removeRule(idx)}
                    className="py-1.5 px-3 text-sm"
                  >
                    Eliminar Regla
                  </DeleteButton>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Estado vacío */}
      {rows.length === 0 && (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
          <FiDollarSign className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No hay reglas de precios configuradas
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4 max-w-md mx-auto">
            Cree reglas para definir cuánto cuesta reservar las canchas en diferentes días y horarios.
          </p>
          <AddButton onClick={addNewRule} className="py-2 px-6">
            Crear Primera Regla
          </AddButton>
        </div>
      )}
    </div>
  );
}

// Icono auxiliar
function FiCopy({ className }) {
  return (
    <svg 
      stroke="currentColor" 
      fill="none" 
      strokeWidth="2" 
      viewBox="0 0 24 24" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className} 
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
    </svg>
  );
}
