import React, { createContext, useContext, useState, ReactNode } from 'react';
import { MOCK_RESERVATIONS, MOCK_OPEN_MATCHES, MOCK_USER_PROFILE } from '../constants/Mocks';

// Types
export interface Reservation {
  id: string;
  clubName: string;
  clubImage: string;
  date: string; // ISO Date String or formatted string
  time: string;
  duration: number; // in minutes
  sport: string;
  courtName: string;
  price: number;
  status: 'confirmed' | 'cancelled' | 'completed';
}

export interface SearchFilters {
  date: Date | null;
  timeRange: { start: string; end: string } | null; // e.g., "18:00", "22:00"
  duration: number; // 60, 90, 120
  courtCount: number;
  zone: string | null;
  courtType: string | null; // 'Indoor', 'Outdoor', etc.
  amenities: string[]; // List of selected amenities
}

interface BookingContextType {
  reservations: Reservation[];
  openMatches: typeof MOCK_OPEN_MATCHES;
  addReservation: (reservation: Reservation) => void;
  cancelReservation: (id: string) => void;
  joinMatch: (matchId: string, user: { id: string, name: string, avatar: string }) => void;
  publishMatch: (reservationId: string, missingPlayers: number) => void;
  filters: SearchFilters;
  setFilters: (filters: SearchFilters) => void;
  updateFilter: (key: keyof SearchFilters, value: any) => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export function BookingProvider({ children }: { children: ReactNode }) {
  // Initialize with some mock data derived from constants, but mapped to our new type if needed
  const [reservations, setReservations] = useState<Reservation[]>(
    MOCK_RESERVATIONS.map(r => ({
      id: r.id,
      clubName: r.clubName,
      clubImage: r.image,
      date: r.date.split(',')[0], 
      time: r.date.split(',')[1]?.trim() || '12:00',
      duration: 60,
      sport: r.sport,
      courtName: 'Cancha 1',
      price: r.price,
      status: r.status as any,
    }))
  );

  // Initialize with MOCK_OPEN_MATCHES but allow state mutations
  const [openMatches, setOpenMatches] = useState(MOCK_OPEN_MATCHES);

  const [filters, setFilters] = useState<SearchFilters>({
    date: new Date(),
    timeRange: null,
    duration: 60,
    courtCount: 1,
    zone: null,
    courtType: null,
    amenities: [],
  });

  const addReservation = (reservation: Reservation) => {
    setReservations(prev => [reservation, ...prev]);
  };

  const cancelReservation = (id: string) => {
    setReservations(prev => prev.map(r => 
      r.id === id ? { ...r, status: 'cancelled' } : r
    ));
  };

  const joinMatch = (matchId: string, user: { id: string, name: string, avatar: string }) => {
     setOpenMatches(prev => prev.map(match => {
         if (match.id !== matchId) return match;
         
         const roster = [...(match.roster || [])];
         const emptyIndex = roster.findIndex(slot => slot === null);
         if (emptyIndex !== -1) {
             roster[emptyIndex] = { ...user, role: 'player' };
             return { ...match, roster, missingPlayers: Math.max(0, match.missingPlayers - 1) };
         }
         return match;
     }));
  };

  const publishMatch = (reservationId: string, missingPlayers: number) => {
    const reservation = reservations.find(r => r.id === reservationId);
    if (!reservation) return;

    const newMatch = {
        id: `pub_${Math.random().toString().substr(2, 9)}`,
        clubName: reservation.clubName,
        time: `${reservation.date}, ${reservation.time}`,
        sport: reservation.sport,
        level: 'Nivel ' + (MOCK_USER_PROFILE.sports.find(s => s.sport === reservation.sport)?.category || 'General'),
        missingPlayers: missingPlayers,
        image: reservation.clubImage,
        organizer: MOCK_USER_PROFILE.name,
        pricePerPerson: Math.round(reservation.price / 4), // Assuming 4 players
        roster: [
            { id: MOCK_USER_PROFILE.id, name: MOCK_USER_PROFILE.name, avatar: MOCK_USER_PROFILE.avatar, role: 'organizer' },
            ...Array(3 - missingPlayers).fill({ id: 'f_mock', name: 'Amigo', avatar: 'https://i.pravatar.cc/150?u=f', role: 'player' }),
            ...Array(missingPlayers).fill(null)
        ]
    };

    setOpenMatches(prev => [newMatch, ...prev]);
  };

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <BookingContext.Provider value={{ 
      reservations, 
      openMatches,
      addReservation, 
      cancelReservation,
      joinMatch,
      publishMatch,
      filters,
      setFilters,
      updateFilter
    }}>
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
}
