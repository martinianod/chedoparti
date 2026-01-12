// Modelo y utilidades para precios flexibles de canchas

export const defaultPricing = [
  {
    dias: ['lunes', 'martes', 'miercoles', 'jueves'],
    desde: '08:00',
    hasta: '18:00',
    tipo: 'normal',
    precio: 2000,
  },
  {
    dias: ['lunes', 'martes', 'miercoles', 'jueves'],
    desde: '18:00',
    hasta: '23:00',
    tipo: 'noche',
    precio: 2500,
  },
  {
    dias: ['viernes', 'sabado'],
    desde: '08:00',
    hasta: '01:00',
    tipo: 'fin_de_semana',
    precio: 3000,
  },
  { dias: ['domingo'], desde: '09:00', hasta: '22:00', tipo: 'domingo', precio: 2800 },
  // Ejemplo feriado
  // { feriado: "2025-12-25", desde: "10:00", hasta: "20:00", tipo: "feriado", precio: 3500 }
];

export function getPriceForDateTime(pricing, dateStr, timeStr) {
  // dateStr: "YYYY-MM-DD", timeStr: "HH:mm"
  const date = new Date(dateStr);
  const dayNames = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
  const day = dayNames[date.getDay()];
  // Buscar si es feriado
  const feriado = pricing.find(
    (p) => p.feriado === dateStr && timeInRange(timeStr, p.desde, p.hasta)
  );
  if (feriado) return feriado.precio;
  // Buscar por día y rango horario
  const match = pricing.find(
    (p) => p.dias?.includes(day) && timeInRange(timeStr, p.desde, p.hasta)
  );
  return match ? match.precio : null;
}

function timeInRange(time, desde, hasta) {
  // time, desde, hasta: "HH:mm"
  return desde <= time && time < hasta;
}

// Ejemplo de uso:
// getPriceForDateTime(court.precios, "2025-12-25", "19:00")
