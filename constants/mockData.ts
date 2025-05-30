import { Court, Booking, TimeSlot, User } from '@/types';
import { addDays, format, setHours, setMinutes } from 'date-fns';

export const FEATURES = [
  { id: 'lighting', label: 'Éclairage' },
  { id: 'benches', label: 'Bancs' },
  { id: 'newNet', label: 'Filet neuf' }
];

// Les autres données mock peuvent être supprimées car nous utilisons maintenant la base de données