export const MOCK_CLUBS = [
  {
    id: '1',
    name: 'El Solar Padel',
    address: 'Av. Libertador 1234, Buenos Aires',
    image: 'https://images.unsplash.com/photo-1626244422598-e763836d93b3?auto=format&fit=crop&q=80&w=2670', 
    rating: 4.8,
    reviews: 124,
    minPrice: 1500,
    sports: ['Padel'],
    isPromoted: true,
    slots: ['18:00', '19:30', '21:00'],
    amenities: ['wifi', 'parking', 'bar', 'showers'],
  },
  {
    id: '2',
    name: 'Tenis Club Argentino',
    address: 'Palermo Soho, CABA',
    image: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?q=80&w=3270&auto=format&fit=crop',
    rating: 4.9,
    reviews: 89,
    minPrice: 2000,
    sports: ['Tennis', 'Squash'],
    isPromoted: false,
    slots: ['11:00', '14:00', '15:30'],
    amenities: ['parking', 'restaurant', 'showers'],
  },
  {
    id: '3',
    name: 'Futbol 5 "La Cancha"',
    address: 'San Telmo 550',
    image: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=3335&auto=format&fit=crop',
    rating: 4.5,
    reviews: 230,
    minPrice: 4500,
    sports: ['Futbol'],
    isPromoted: false,
    slots: ['18:00', '19:00', '20:00', '21:00'],
    amenities: ['bar', 'grill'],
  },
  {
    id: '4',
    name: 'Paddle Center Norte',
    address: 'Olivos, Vicente Lopez',
    image: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?q=80&w=3270&auto=format&fit=crop',
    rating: 4.2,
    reviews: 50,
    minPrice: 1200,
    sports: ['Padel'],
    isPromoted: false,
    slots: ['09:00', '10:30', '16:00'],
    amenities: ['wifi', 'parking'],
  },
];

export const MOCK_RESERVATIONS = [
  {
    id: '101',
    clubName: 'El Solar Padel',
    date: 'Hoy, 18:30',
    sport: 'Padel',
    price: 3000,
    status: 'confirmed', // confirmed, pending, cancelled
    image: 'https://images.unsplash.com/photo-1626244422598-e763836d93b3?auto=format&fit=crop&q=80&w=2670',
  },
  {
    id: '102',
    clubName: 'Futbol 5 "La Cancha"',
    date: 'Ayer, 20:00',
    sport: 'Futbol',
    price: 4500,
    status: 'completed',
    image: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=3335&auto=format&fit=crop',
  }
];

export const MOCK_OPEN_MATCHES = [
  {
    id: 'm1',
    clubName: 'El Solar Padel',
    time: 'Hoy, 20:00hs',
    sport: 'Padel',
    level: '6ta - 7ma',
    missingPlayers: 1,
    image: 'https://images.unsplash.com/photo-1626244422598-e763836d93b3?auto=format&fit=crop&q=80&w=2670',
    organizer: 'Juan P.',
    pricePerPerson: 2500,
    roster: [
      { id: 'u1', name: 'Juan P.', avatar: 'https://i.pravatar.cc/150?u=u1', role: 'organizer' },
      { id: 'u2', name: 'Martin G.', avatar: 'https://i.pravatar.cc/150?u=u2', role: 'player' },
      { id: 'u3', name: 'Lucas R.', avatar: 'https://i.pravatar.cc/150?u=u3', role: 'player' },
      null // Open slot
    ]
  },
  {
    id: 'm2',
    clubName: 'Tenis Club',
    time: 'Mañana, 10:00hs',
    sport: 'Tennis',
    level: 'Intermedio',
    missingPlayers: 1,
    image: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?q=80&w=3270&auto=format&fit=crop',
    organizer: 'Maria L.',
    pricePerPerson: 3000,
    roster: [
      { id: 'u4', name: 'Maria L.', avatar: 'https://i.pravatar.cc/150?u=u4', role: 'organizer' },
      null // Open slot
    ]
  },
  {
    id: 'm3',
    clubName: 'Futbol 5 La Cancha',
    time: 'Viernes, 21:00hs',
    sport: 'Futbol',
    level: 'Amateur',
    missingPlayers: 2,
    image: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=3335&auto=format&fit=crop',
    organizer: 'Equipo Rojo',
    pricePerPerson: 1500,
    roster: [
      { id: 'u5', name: 'Pedro', avatar: 'https://i.pravatar.cc/150?u=u5', role: 'organizer' },
      { id: 'u6', name: 'Santi', avatar: 'https://i.pravatar.cc/150?u=u6', role: 'player' },
      { id: 'u7', name: 'Tom', avatar: 'https://i.pravatar.cc/150?u=u7', role: 'player' },
      { id: 'u8', name: 'Nico', avatar: 'https://i.pravatar.cc/150?u=u8', role: 'player' },
      null,
      null,
      null, // ... more slots for 5v5
    ]
  }
];

export const MOCK_USER_PROFILE = {
  id: 'me',
  name: 'Martiniano',
  avatar: 'https://i.pravatar.cc/150?u=me',
  location: 'Palermo, CABA',
  bio: 'Fanático del padel y el asado post-partido.',
  sports: [
    {
      sport: 'Padel',
      category: '6ta',
      side: 'Drive',
      matchesPlayed: 42,
    },
    {
      sport: 'Tennis',
      category: 'Intermedio',
      matchesPlayed: 12,
    }
  ],
  reliability: 98, // Reliability score
};
