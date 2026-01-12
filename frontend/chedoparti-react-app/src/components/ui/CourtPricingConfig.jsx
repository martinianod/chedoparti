import { useState } from 'react';
import DeleteButton from './DeleteButton';
import AddButton from './AddButton';
import TimeSelector from './TimeSelector';

export default function CourtPricingConfig({ pricing = [], onChange }) {
  const [rows, setRows] = useState(pricing);
  const [selectedDayByGroup, setSelectedDayByGroup] = useState({});
  // Track which days are already assigned
  const allDays = [
    'Lunes',
    'Martes',
    'Miércoles',
    'Jueves',
    'Viernes',
    'Sábado',
    'Domingo',
    'Feriado',
  ];
  // Get all selected days in all rows
  const selectedDays = rows.flatMap((row) => row.days);
  const unselectedDays = allDays.filter((d) => !selectedDays.includes(d));

  // Devuelve los días disponibles para una fila específica
  const getAvailableDaysForRow = (idx) => {
    // Días seleccionados en otras filas
    const otherSelected = rows.filter((_, i) => i !== idx).flatMap((row) => row.days);
    return allDays.filter((d) => !otherSelected.includes(d));
  };

  const handleChange = (idx, field, value) => {
    const updated = rows.map((row, i) => (i === idx ? { ...row, [field]: value } : row));
    setRows(updated);
    onChange && onChange(updated);
  };

  // Agrupa las filas por grupo de días
  const groupRowsByDays = () => {
    const groups = [];
    rows.forEach((row) => {
      const key = row.days.sort().join(',');
      let group = groups.find((g) => g.key === key);
      if (!group) {
        group = { key, days: [...row.days], rows: [] };
        groups.push(group);
      }
      group.rows.push(row);
    });
    return groups;
  };

  // Agrega una nueva card para un grupo de días
  const addDaysGroup = (days) => {
    setRows([
      ...rows,
      {
        days,
        start: '',
        end: '',
        durations: [],
        price: '',
      },
    ]);
    onChange &&
      onChange([
        ...rows,
        {
          days,
          start: '',
          end: '',
          durations: [],
          price: '',
        },
      ]);
  };

  // Agrega una franja a un grupo de días existente
  const addRowToGroup = (days) => {
    setRows([
      ...rows,
      {
        days,
        start: '',
        end: '',
        durations: [],
        price: '',
      },
    ]);
    onChange &&
      onChange([
        ...rows,
        {
          days,
          start: '',
          end: '',
          durations: [],
          price: '',
        },
      ]);
  };

  const removeRow = (idx) => {
    const updated = rows.filter((_, i) => i !== idx);
    setRows(updated);
    onChange && onChange(updated);
  };

  return (
    <div className="border rounded p-4 bg-white dark:bg-gray-900">
      <div className="mb-2 font-semibold text-gray-800 dark:text-blue-200">
        Configurar precios por franja horaria, duración y día
      </div>
      <div className="space-y-6">
        {groupRowsByDays().map((group, gIdx) => (
          <div
            key={group.key || gIdx}
            className="border-2 border-blue-300 dark:border-blue-400 rounded-xl p-4 bg-blue-50 dark:bg-gray-800"
          >
            <div className="mb-2 flex flex-wrap gap-2 items-center">
              <span className="font-semibold text-sm text-blue-700 dark:text-blue-300">Días:</span>
              {group.days.map((day) => {
                // Día está en otro grupo
                // const isInOtherGroup = groupRowsByDays().some(
                //   (g) => g !== group && g.days.includes(day)
                // );
                return (
                  <label
                    key={day}
                    className={`flex items-center gap-1 text-xs px-2 py-1 rounded cursor-pointer bg-blue-200 dark:bg-blue-700 text-blue-900 dark:text-blue-100 border dark:border-blue-400`}
                  >
                    <input
                      type="checkbox"
                      checked={group.days.includes(day)}
                      onChange={(e) => {
                        let newDays;
                        if (e.target.checked) {
                          newDays = [...group.days, day];
                        } else {
                          newDays = group.days.filter((d) => d !== day);
                        }
                        if (newDays.length === 0) {
                          const filtered = rows.filter(
                            (row) => row.days.sort().join(',') !== group.key
                          );
                          setRows(filtered);
                          onChange && onChange(filtered);
                          return;
                        }
                        const updated = rows.map((row) => {
                          if (row.days.sort().join(',') === group.key) {
                            return { ...row, days: [...newDays] };
                          }
                          return row;
                        });
                        setRows(updated);
                        onChange && onChange(updated);
                      }}
                    />
                    <span>{day}</span>
                  </label>
                );
              })}
              {/* Selector para agregar un día no asignado (evita solapamientos) */}
              <div className="flex items-center gap-2">
                <select
                  className="input text-sm dark:bg-gray-900 dark:text-blue-100 border dark:border-blue-400"
                  value={selectedDayByGroup[group.key] || ''}
                  onChange={(e) =>
                    setSelectedDayByGroup((s) => ({ ...s, [group.key]: e.target.value }))
                  }
                >
                  <option value="">Agregar día...</option>
                  {getAvailableDaysForRow(gIdx).map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
                <AddButton
                  type="button"
                  disabled={!selectedDayByGroup[group.key]}
                  onClick={() => {
                    const day = selectedDayByGroup[group.key];
                    if (!day) return;
                    // asegúrate de que no esté en otra group
                    const isInOtherGroup = groupRowsByDays().some(
                      (g) => g !== group && g.days.includes(day)
                    );
                    if (isInOtherGroup) return;
                    const newDays = [...group.days, day];
                    const updated = rows.map((row) => {
                      if (row.days.sort().join(',') === group.key) {
                        return { ...row, days: [...newDays] };
                      }
                      return row;
                    });
                    setRows(updated);
                    onChange && onChange(updated);
                    // limpiar selección
                    setSelectedDayByGroup((s) => ({ ...s, [group.key]: '' }));
                  }}
                >
                  día
                </AddButton>
              </div>
            </div>
            {group.rows.map((row, idx) => (
              <div key={idx} className="border rounded-lg p-3 bg-white dark:bg-gray-800 mb-2">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-2">
                  <TimeSelector
                    label="Desde"
                    value={row.start}
                    onChange={(value) => handleChange(rows.indexOf(row), 'start', value)}
                    placeholder="Hora inicio"
                  />
                  <TimeSelector
                    label="Hasta"
                    value={row.end}
                    onChange={(value) => handleChange(rows.indexOf(row), 'end', value)}
                    placeholder="Hora fin"
                  />
                  <div>
                    <span className="text-xs text-gray-500 dark:text-blue-200">Duración</span>
                    <div className="flex flex-col gap-1">
                      {['1h', '1.5h', '2h'].map((dur) => (
                        <label key={dur} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={row.durations.includes(dur)}
                            onChange={(e) => {
                              const durations = e.target.checked
                                ? [...row.durations, dur]
                                : row.durations.filter((d) => d !== dur);
                              handleChange(rows.indexOf(row), 'durations', durations);
                            }}
                          />
                          <span className="text-gray-700 dark:text-blue-100">{dur}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 dark:text-blue-200">Precio</span>
                    <input
                      className="input w-full dark:bg-gray-900 dark:text-blue-100 border dark:border-blue-400"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="$"
                      value={row.price}
                      onChange={(e) => handleChange(rows.indexOf(row), 'price', e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <DeleteButton onClick={() => removeRow(rows.indexOf(row))} />
                </div>
              </div>
            ))}
            <div className="flex justify-end mt-2">
              <AddButton type="button" onClick={() => addRowToGroup(group.days)}>
                franja
              </AddButton>
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-2 mt-4">
        <AddButton
          type="button"
          disabled={unselectedDays.length === 0}
          onClick={() => addDaysGroup(unselectedDays)}
          className=""
        />
      </div>
    </div>
  );
}
