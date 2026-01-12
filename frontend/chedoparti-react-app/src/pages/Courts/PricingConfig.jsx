import { useState } from 'react';
import Card from '../../components/ui/Card';
import DeleteButton from '../../components/ui/DeleteButton';
import SaveButton from '../../components/ui/SaveButton';
import { useAppNotifications } from '../../hooks/useAppNotifications';
import TimeSelector from '../../components/ui/TimeSelector';

const days = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];

export default function PricingConfig({ initialPricing, onSave }) {
  const { showNotification } = useAppNotifications();
  const [pricing, setPricing] = useState(initialPricing);
  const [newPrice, setNewPrice] = useState({
    dias: [],
    desde: '',
    hasta: '',
    tipo: '',
    precio: '',
  });
  const [feriadoFecha, setFeriadoFecha] = useState('');
  const [feriadoDesde, setFeriadoDesde] = useState('');
  const [feriadoHasta, setFeriadoHasta] = useState('');
  const [feriadoPrecio, setFeriadoPrecio] = useState('');

  function handleAddPrice() {
    if (!newPrice.dias.length || !newPrice.desde || !newPrice.hasta || !newPrice.precio) return;
    setPricing((pr) => [...pr, { ...newPrice, precio: Number(newPrice.precio) }]);
    setNewPrice({ dias: [], desde: '', hasta: '', tipo: '', precio: '' });
  }

  function handleDayToggle(day) {
    setNewPrice((np) => ({
      ...np,
      dias: np.dias.includes(day) ? np.dias.filter((d) => d !== day) : [...np.dias, day],
    }));
  }

  function handleRemove(idx) {
    setPricing((pr) => pr.filter((_, i) => i !== idx));
  }

  function handleAddFeriado() {
    if (!feriadoFecha || !feriadoDesde || !feriadoHasta || !feriadoPrecio) return;
    setPricing((pr) => [
      ...pr,
      {
        feriado: feriadoFecha,
        desde: feriadoDesde,
        hasta: feriadoHasta,
        tipo: 'feriado',
        precio: Number(feriadoPrecio),
      },
    ]);
    setFeriadoFecha('');
    setFeriadoDesde('');
    setFeriadoHasta('');
    setFeriadoPrecio('');
  }

  function handleSave() {
    if (onSave) onSave(pricing);
    showNotification('Precios guardados exitosamente', 'success');
  }

  return (
    <div className="mx-auto max-w-xl">
      <Card>
        <h2 className="mb-4 text-lg font-semibold">Configurar precios</h2>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
        >
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Precios por día y horario</h3>
            <div className="flex flex-wrap gap-2 mb-2">
              {days.map((day) => (
                <label key={day} className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={newPrice.dias.includes(day)}
                    onChange={() => handleDayToggle(day)}
                  />
                  {day.charAt(0).toUpperCase() + day.slice(1)}
                </label>
              ))}
            </div>
            <div className="flex gap-2 mb-2">
              <TimeSelector
              value={newPrice.desde}
              onChange={(value) => setNewPrice((np) => ({ ...np, desde: value }))}
              placeholder="Hora inicio"
            />
              <TimeSelector
              value={newPrice.hasta}
              onChange={(value) => setNewPrice((np) => ({ ...np, hasta: value }))}
              placeholder="Hora fin"
            />
              <input
                type="text"
                className="input"
                placeholder="Tipo (ej: noche)"
                value={newPrice.tipo}
                onChange={(e) => setNewPrice((np) => ({ ...np, tipo: e.target.value }))}
              />
              <input
                type="number"
                className="input"
                placeholder="Precio"
                value={newPrice.precio}
                onChange={(e) => setNewPrice((np) => ({ ...np, precio: e.target.value }))}
              />
              <button type="button" className="btn btn-primary" onClick={handleAddPrice}>
                Agregar
              </button>
            </div>
            <ul>
              {pricing
                .filter((p) => !p.feriado)
                .map((p, idx) => (
                  <li key={idx} className="flex items-center gap-2 mb-1">
                    <span>
                      {p.dias.join(', ')}: {p.desde} - {p.hasta} ({p.tipo}) - ${p.precio}
                    </span>
                    <DeleteButton onClick={() => handleRemove(idx)}>Eliminar</DeleteButton>
                  </li>
                ))}
            </ul>
          </div>
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Precios por feriado</h3>
            <div className="flex gap-2 mb-2">
              <input
                type="date"
                className="input"
                value={feriadoFecha}
                onChange={(e) => setFeriadoFecha(e.target.value)}
              />
              <TimeSelector
              value={newFeriado.desde}
              onChange={(value) => setNewFeriado((nf) => ({ ...nf, desde: value }))}
              placeholder="Hora inicio"
            />
              <TimeSelector
              value={newFeriado.hasta}
              onChange={(value) => setNewFeriado((nf) => ({ ...nf, hasta: value }))}
              placeholder="Hora fin"
            />
              <input
                type="number"
                className="input"
                placeholder="Precio"
                value={newFeriado.precio}
                onChange={(e) => setNewFeriado((nf) => ({ ...nf, precio: e.target.value }))}
              />
              <button type="button" className="btn btn-primary" onClick={handleAddFeriado}>
                Agregar
              </button>
            </div>
            <ul>
              {pricing
                .filter((p) => p.feriado)
                .map((p, idx) => (
                  <li key={idx} className="flex items-center gap-2 mb-1">
                    <span>
                      {p.feriado}: {p.desde} - {p.hasta} - ${p.precio}
                    </span>
                    <DeleteButton onClick={() => handleRemove(idx)}>Eliminar</DeleteButton>
                  </li>
                ))}
            </ul>
          </div>
          <SaveButton type="submit" className="mt-4">
            Guardar precios
          </SaveButton>
        </form>
      </Card>
    </div>
  );
}
