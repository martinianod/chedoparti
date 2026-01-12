// Datos de prueba para la configuración de horarios flexibles
export const schedulesMockData = {
  groups: [
    {
      days: ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'],
      horarios: [
        { open: '08:00', close: '12:00' },
        { open: '16:00', close: '23:00' },
      ],
    },
    {
      days: ['sabado'],
      horarios: [
        { open: '09:00', close: '13:00' },
        { open: '17:00', close: '22:00' },
      ],
    },
    {
      days: ['domingo'],
      horarios: [{ open: '10:00', close: '20:00' }],
    },
  ],
  feriados: [
    { fecha: '2025-12-25', open: '10:00', close: '18:00' },
    { fecha: '2025-01-01', open: '12:00', close: '20:00' },
  ],
};

// Mock API para schedules
export const schedulesApi = {
  list: async () => {
    return { data: schedulesMockData };
  },
  update: async (data) => {
    // Aquí podrías guardar en localStorage si quieres persistencia local
    return { success: true };
  },
};
