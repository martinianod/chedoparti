import { useState } from 'react';
import Card from '../../components/ui/Card';
import DeleteButton from '../../components/ui/DeleteButton';
import { defaultSchedule } from '../../models/courtSchedule';
import { useAppNotifications } from '../../hooks/useAppNotifications';
import TimeSelector from '../../components/ui/TimeSelector';

const days = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];

export default function ScheduleConfig({ initialSchedule = defaultSchedule, onSave }) {
  const { showNotification } = useAppNotifications();
  const [schedule, setSchedule] = useState(initialSchedule);
  const [feriadoFecha, setFeriadoFecha] = useState('');
  const [feriadoOpen, setFeriadoOpen] = useState('08:00');
  const [feriadoClose, setFeriadoClose] = useState('23:00');

  function handleDayChange(day, field, value) {
    setSchedule((sch) => ({
      ...sch,
      [day]: { ...sch[day], [field]: value },
    }));
  }

  function addFeriado() {
    if (!feriadoFecha) return;
    setSchedule((sch) => ({
      ...sch,
      feriados: [
        ...(sch.feriados || []),
        { fecha: feriadoFecha, open: feriadoOpen, close: feriadoClose },
      ],
    }));
    setFeriadoFecha('');
    setFeriadoOpen('08:00');
    setFeriadoClose('23:00');
  }

  function removeFeriado(idx) {
    setSchedule((sch) => ({
      ...sch,
      feriados: sch.feriados.filter((_, i) => i !== idx),
    }));
  }

  function handleSave() {
    if (onSave) onSave(schedule);
    showNotification('Horarios guardados exitosamente', 'success');
  }

  return (
    <div className="mx-auto max-w-xl">
      <Card>
        <h2 className="mb-4 text-lg font-semibold">Configurar horarios</h2>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
        >
          <div className="grid grid-cols-2 gap-4">
            {days.map((day) => (
              <div key={day} className="flex flex-col">
                <span className="font-medium mb-1">
                  {day.charAt(0).toUpperCase() + day.slice(1)}
                </span>
                <TimeSelector
                  label="Apertura"
                  value={schedule[day]?.open || ''}
                  onChange={(value) => handleDayChange(day, 'open', value)}
                  placeholder="Seleccionar"
                  className="mb-2"
                />
                <TimeSelector
                  label="Cierre"
                  value={schedule[day]?.close || ''}
                  onChange={(value) => handleDayChange(day, 'close', value)}
                  placeholder="Seleccionar"
                />
              </div>
            ))}
          </div>
          <div className="mt-6">
            <h3 className="font-semibold mb-2">Feriados</h3>
            <div className="flex gap-2 mb-2">
              <input
                type="date"
                className="input"
                value={feriadoFecha}
                onChange={(e) => setFeriadoFecha(e.target.value)}
              />
              <TimeSelector
                value={feriadoOpen}
                onChange={setFeriadoOpen}
                placeholder="Apertura"
              />
              <TimeSelector
                value={feriadoClose}
                onChange={setFeriadoClose}
                placeholder="Cierre"
              />
              <button type="button" className="btn btn-primary" onClick={addFeriado}>
                Agregar
              </button>
            </div>
            <ul>
              {(schedule.feriados || []).map((f, idx) => (
                <li key={idx} className="flex items-center gap-2 mb-1">
                  <span>
                    {f.fecha}: {f.open} - {f.close}
                  </span>
                  <DeleteButton onClick={() => removeFeriado(idx)}>Eliminar</DeleteButton>
                </li>
              ))}
            </ul>
          </div>
          <SaveButton type="submit" className="mt-4">
            Guardar horarios
          </SaveButton>
        </form>
      </Card>
    </div>
  );
}
