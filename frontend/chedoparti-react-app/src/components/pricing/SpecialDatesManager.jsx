import { useState } from 'react';
import {
  FiCalendar,
  FiClock,
  FiDollarSign,
  FiPlus,
  FiTrash2,
  FiAlertTriangle,
  FiGift,
} from 'react-icons/fi';
import AddButton from '../ui/AddButton';
import DeleteButton from '../ui/DeleteButton';
import Card from '../ui/Card';
import TimeSelector from '../ui/TimeSelector';

/**
 * Gestor avanzado de fechas especiales y feriados
 * Permite configurar precios especiales para fechas específicas con diferentes estrategias
 */
export default function SpecialDatesManager({ pricing = [], onChange, courts = [] }) {
  const [newSpecialDate, setNewSpecialDate] = useState({
    date: '',
    name: '',
    strategy: 'multiplier', // 'multiplier', 'fixed', 'percentage'
    value: '1.5',
    startTime: '08:00',
    endTime: '23:00',
    courtIds: [], // vacío = todas las canchas
    description: '',
    priority: 'high',
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleAddSpecialDate = () => {
    if (!newSpecialDate.date || !newSpecialDate.name || !newSpecialDate.value) return;

    const specialDate = {
      id: Date.now(),
      ...newSpecialDate,
      value: parseFloat(newSpecialDate.value),
      createdAt: new Date().toISOString(),
    };

    onChange([...pricing, specialDate]);
    setNewSpecialDate({
      date: '',
      name: '',
      strategy: 'multiplier',
      value: '1.5',
      startTime: '08:00',
      endTime: '23:00',
      courtIds: [],
      description: '',
      priority: 'high',
    });
  };

  const handleRemoveSpecialDate = (id) => {
    onChange(pricing.filter((item) => item.id !== id));
  };

  const handleDuplicateSpecialDate = (item) => {
    const duplicated = {
      ...item,
      id: Date.now(),
      date: '',
      name: `${item.name} (Copia)`,
      createdAt: new Date().toISOString(),
    };
    onChange([...pricing, duplicated]);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200';
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStrategyDescription = (strategy, value) => {
    switch (strategy) {
      case 'multiplier':
        return `Multiplicar precio base por ${value}x`;
      case 'fixed':
        return `Precio fijo de $${value.toLocaleString()}`;
      case 'percentage':
        return `Aumentar ${value}% sobre precio base`;
      default:
        return 'Estrategia no definida';
    }
  };

  const groupedByMonth = pricing.reduce((groups, item) => {
    const month = item.date.substring(0, 7); // YYYY-MM
    if (!groups[month]) groups[month] = [];
    groups[month].push(item);
    return groups;
  }, {});

  return (
    <div className="space-y-6">
      {/* Formulario para agregar fecha especial */}
      <Card className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-700">
        <div className="flex items-center gap-3 mb-4">
          <FiGift className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-200">
            Nueva Fecha Especial
          </h3>
        </div>

        <div className="space-y-4">
          {/* Información básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <FiCalendar className="w-4 h-4 inline mr-1" />
                Fecha *
              </label>
              <input
                type="date"
                className="input w-full"
                value={newSpecialDate.date}
                onChange={(e) => setNewSpecialDate((prev) => ({ ...prev, date: e.target.value }))}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nombre del Evento *
              </label>
              <input
                type="text"
                className="input w-full"
                placeholder="ej: Navidad, Año Nuevo, Torneo..."
                value={newSpecialDate.name}
                onChange={(e) => setNewSpecialDate((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Prioridad
              </label>
              <select
                className="input w-full"
                value={newSpecialDate.priority}
                onChange={(e) =>
                  setNewSpecialDate((prev) => ({ ...prev, priority: e.target.value }))
                }
              >
                <option value="low">Baja</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
              </select>
            </div>
          </div>

          {/* Estrategia de precios */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Estrategia de Precio *
              </label>
              <select
                className="input w-full"
                value={newSpecialDate.strategy}
                onChange={(e) =>
                  setNewSpecialDate((prev) => ({ ...prev, strategy: e.target.value }))
                }
              >
                <option value="multiplier">Multiplicador</option>
                <option value="fixed">Precio Fijo</option>
                <option value="percentage">Porcentaje</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Valor *
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min={newSpecialDate.strategy === 'multiplier' ? '0.1' : '1'}
                  max={newSpecialDate.strategy === 'percentage' ? '1000' : '99999'}
                  className="input w-full pr-8"
                  placeholder={
                    newSpecialDate.strategy === 'multiplier'
                      ? '1.5'
                      : newSpecialDate.strategy === 'fixed'
                        ? '3000'
                        : '50'
                  }
                  value={newSpecialDate.value}
                  onChange={(e) =>
                    setNewSpecialDate((prev) => ({ ...prev, value: e.target.value }))
                  }
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                  {newSpecialDate.strategy === 'multiplier'
                    ? 'x'
                    : newSpecialDate.strategy === 'fixed'
                      ? '$'
                      : '%'}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Vista Previa
              </label>
              <div className="input w-full bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                {getStrategyDescription(
                  newSpecialDate.strategy,
                  parseFloat(newSpecialDate.value || 0)
                )}
              </div>
            </div>
          </div>

          {/* Horarios */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TimeSelector
              label={<><FiClock className="w-4 h-4 inline mr-1" />Hora Inicio</>}
              value={newSpecialDate.startTime}
              onChange={(value) => setNewSpecialDate((prev) => ({ ...prev, startTime: value }))}
              placeholder="Hora inicio"
            />
            <TimeSelector
              label="Hora Fin"
              value={newSpecialDate.endTime}
              onChange={(value) => setNewSpecialDate((prev) => ({ ...prev, endTime: value }))}
              placeholder="Hora fin"
            />
          </div>

          {/* Opciones avanzadas */}
          <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-3"
            >
              <span>{showAdvanced ? '▼' : '▶'}</span>
              Opciones Avanzadas
            </button>

            {showAdvanced && (
              <div className="space-y-4">
                {/* Descripción */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Descripción (Opcional)
                  </label>
                  <textarea
                    className="input w-full h-20 resize-none"
                    placeholder="Descripción adicional del evento o fecha especial..."
                    value={newSpecialDate.description}
                    onChange={(e) =>
                      setNewSpecialDate((prev) => ({ ...prev, description: e.target.value }))
                    }
                  />
                </div>

                {/* Selección de canchas específicas */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Aplicar a Canchas Específicas (Opcional)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {courts.map((court) => (
                      <label key={court.id} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={newSpecialDate.courtIds.includes(court.id)}
                          onChange={(e) => {
                            const courtIds = e.target.checked
                              ? [...newSpecialDate.courtIds, court.id]
                              : newSpecialDate.courtIds.filter((id) => id !== court.id);
                            setNewSpecialDate((prev) => ({ ...prev, courtIds }));
                          }}
                          className="form-checkbox h-4 w-4 text-purple-600"
                        />
                        <span className="text-gray-700 dark:text-gray-300">
                          {court.name} ({court.sport})
                        </span>
                      </label>
                    ))}
                  </div>
                  {newSpecialDate.courtIds.length === 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      Sin selección = se aplicará a todas las canchas
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Botón agregar */}
          <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-600">
            <button
              onClick={handleAddSpecialDate}
              className="btn btn-primary py-2 px-6 flex items-center gap-2"
              disabled={!newSpecialDate.date || !newSpecialDate.name || !newSpecialDate.value}
            >
              <FiPlus className="w-4 h-4" />
              Agregar Fecha Especial
            </button>
          </div>
        </div>
      </Card>

      {/* Lista de fechas especiales agrupadas por mes */}
      <div className="space-y-6">
        {Object.keys(groupedByMonth).length === 0 ? (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
            <FiCalendar className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Sin Fechas Especiales Configuradas
            </h3>
            <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto">
              Configure fechas especiales, feriados o eventos que requieran precios diferenciados.
            </p>
          </div>
        ) : (
          Object.entries(groupedByMonth)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([month, items]) => (
              <div key={month} className="space-y-3">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <FiCalendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  {new Date(month + '-01').toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                  })}
                  <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                    ({items.length} evento{items.length !== 1 ? 's' : ''})
                  </span>
                </h4>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {items
                    .sort((a, b) => a.date.localeCompare(b.date))
                    .map((item) => (
                      <Card
                        key={item.id}
                        className="p-4 hover:shadow-lg transition-shadow border-l-4 border-l-purple-500"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h5 className="font-semibold text-gray-900 dark:text-white">
                                {item.name}
                              </h5>
                              <span
                                className={`px-2 py-1 rounded text-xs font-medium border ${getPriorityColor(item.priority)}`}
                              >
                                {item.priority === 'high'
                                  ? 'Alta'
                                  : item.priority === 'medium'
                                    ? 'Media'
                                    : 'Baja'}
                              </span>
                            </div>

                            <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                              <div className="flex items-center gap-2">
                                <FiCalendar className="w-4 h-4" />
                                {new Date(item.date).toLocaleDateString('es-ES', {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                })}
                              </div>

                              <div className="flex items-center gap-2">
                                <FiClock className="w-4 h-4" />
                                {item.startTime} - {item.endTime}
                              </div>

                              <div className="flex items-center gap-2">
                                <FiDollarSign className="w-4 h-4" />
                                {getStrategyDescription(item.strategy, item.value)}
                              </div>
                            </div>

                            {item.description && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                {item.description}
                              </p>
                            )}

                            {item.courtIds.length > 0 && (
                              <div className="mt-2">
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  Canchas específicas: {item.courtIds.length}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="flex gap-2 ml-4">
                            <button
                              onClick={() => handleDuplicateSpecialDate(item)}
                              className="btn btn-secondary py-1 px-2 text-xs"
                              title="Duplicar"
                            >
                              <FiCopy className="w-3 h-3" />
                            </button>

                            <DeleteButton
                              onClick={() => handleRemoveSpecialDate(item.id)}
                              className="py-1 px-2 text-xs"
                              title="Eliminar"
                            />
                          </div>
                        </div>

                        {/* Indicador de fecha próxima */}
                        {(() => {
                          const today = new Date();
                          const eventDate = new Date(item.date);
                          const diffDays = Math.ceil((eventDate - today) / (1000 * 60 * 60 * 24));

                          if (diffDays > 0 && diffDays <= 7) {
                            return (
                              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded text-xs text-yellow-800 dark:text-yellow-200 border border-yellow-200 dark:border-yellow-700 flex items-center gap-1">
                                <FiAlertTriangle className="w-3 h-3" />
                                Próximo: faltan {diffDays} día{diffDays !== 1 ? 's' : ''}
                              </div>
                            );
                          } else if (diffDays === 0) {
                            return (
                              <div className="bg-red-50 dark:bg-red-900/20 p-2 rounded text-xs text-red-800 dark:text-red-200 border border-red-200 dark:border-red-700 flex items-center gap-1">
                                <FiAlertTriangle className="w-3 h-3" />
                                ¡HOY!
                              </div>
                            );
                          }
                          return null;
                        })()}
                      </Card>
                    ))}
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
}
