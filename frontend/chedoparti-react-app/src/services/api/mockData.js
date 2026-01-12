// Mock data for local frontend testing
// Importa los mocks desde el JSON y reemplaza 'TODAY' por la fecha actual
import reservationsJson from '../../mock/reservations.mock.json';
const today = new Date().toISOString().slice(0, 10);
export const mockReservations = reservationsJson.map((r) => ({
  ...r,
  date: r.date === 'TODAY' ? today : r.date,
}));
export const mockCourts = [
  { id: 1, name: 'Cancha 1', sport: 'Padel', indoor: false, surface: 'Sintético', lights: true },
  { id: 2, name: 'Cancha 2', sport: 'Padel', indoor: true, surface: 'Cemento', lights: true },
  {
    id: 3,
    name: 'Cancha 1',
    sport: 'Tenis',
    indoor: false,
    surface: 'Polvo de ladrillo',
    lights: false,
  },
  {
    id: 5,
    name: 'Cancha 2',
    sport: 'Tenis',
    indoor: false,
    surface: 'Polvo de ladrillo',
    lights: true,
  },
  {
    id: 6,
    name: 'Cancha 3',
    sport: 'Tenis',
    indoor: true,
    surface: 'Cemento',
    lights: true,
  },
  {
    id: 7,
    name: 'Cancha 4',
    sport: 'Tenis',
    indoor: true,
    surface: 'Cemento',
    lights: false,
  },
  {
    id: 8,
    name: 'Cancha 5',
    sport: 'Tenis',
    indoor: false,
    surface: 'Polvo de ladrillo',
    lights: true,
  },
  { id: 4, name: 'Fútbol 1', sport: 'Fútbol', indoor: true, surface: 'Sintético', lights: true },
];
