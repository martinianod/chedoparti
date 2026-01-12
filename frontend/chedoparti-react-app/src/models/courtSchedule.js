// Modelo y utilidades para horarios flexibles de canchas

export const defaultSchedule = {
  lunes: { open: '08:00', close: '23:00' },
  martes: { open: '08:00', close: '23:00' },
  miercoles: { open: '08:00', close: '23:00' },
  jueves: { open: '08:00', close: '23:00' },
  viernes: { open: '08:00', close: '01:00' },
  sabado: { open: '09:00', close: '01:00' },
  domingo: { open: '09:00', close: '22:00' },
  feriados: [], // [{ fecha: "2025-12-25", open: "10:00", close: "20:00" }]
};

export function getScheduleForDate(schedule, dateStr) {
  // dateStr: "YYYY-MM-DD"
  const date = new Date(dateStr);
  const dayNames = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
  const day = dayNames[date.getDay()];
  // Buscar si es feriado
  const feriado = (schedule.feriados || []).find((f) => f.fecha === dateStr);
  if (feriado) return feriado;
  return schedule[day] || { open: '08:00', close: '23:00' };
}

// Ejemplo de uso:
// getScheduleForDate(court.horarios, "2025-12-25")
