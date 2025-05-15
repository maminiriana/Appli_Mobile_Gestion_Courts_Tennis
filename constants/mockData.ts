import { Court, Booking, TimeSlot, User } from '@/types';
import { addDays, format, setHours, setMinutes } from 'date-fns';

// Generate time slots for a given day
const generateTimeSlots = (date: Date, courtId: string): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  
  // Generate slots from 8:00 to 20:00
  for (let hour = 8; hour < 20; hour++) {
    const startTime = setHours(setMinutes(date, 0), hour);
    const endTime = setHours(setMinutes(date, 0), hour + 1);
    
    slots.push({
      id: `${courtId}-${format(startTime, 'yyyyMMdd-HHmm')}`,
      courtId,
      startTime,
      endTime,
      isAvailable: Math.random() > 0.3,
    });
  }
  
  return slots;
};

// Generate courts
export const courts: Court[] = [
  {
    id: '1',
    name: 'Court N°1',
    description: 'Court principal avec surface en terre battue.',
    surface: 'Terre battue',
    imageUrl: 'https://images.pexels.com/photos/1432039/pexels-photo-1432039.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    indoor: false,
    isActive: true,
    maintenanceReason: null,
    maintenanceUntil: null,
    features: ['Éclairage', 'Bancs', 'Filet neuf'],
  },
  {
    id: '2',
    name: 'Court N°2',
    description: 'Court intérieur avec une surface synthétique.',
    surface: 'Synthétique',
    imageUrl: 'https://images.pexels.com/photos/2352270/pexels-photo-2352270.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    indoor: true,
    isActive: true,
    maintenanceReason: null,
    maintenanceUntil: null,
    features: ['Éclairage', 'Climatisation', 'Bancs'],
  },
  {
    id: '3',
    name: 'Court N°3',
    description: 'Court extérieur en terre battue.',
    surface: 'Terre battue',
    imageUrl: 'https://images.pexels.com/photos/209977/pexels-photo-209977.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    indoor: false,
    isActive: true,
    maintenanceReason: null,
    maintenanceUntil: null,
    features: ['Éclairage', 'Bancs'],
  },
  {
    id: '4',
    name: 'Court N°4',
    description: 'Court couvert en surface dure.',
    surface: 'Dur',
    imageUrl: 'https://images.pexels.com/photos/342361/pexels-photo-342361.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    indoor: true,
    isActive: true,
    maintenanceReason: null,
    maintenanceUntil: null,
    features: ['Éclairage', 'Bancs', 'Climatisation'],
  },
  {
    id: '5',
    name: 'Court N°5',
    description: 'Court extérieur en terre battue.',
    surface: 'Terre battue',
    imageUrl: 'https://images.pexels.com/photos/6252556/pexels-photo-6252556.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    indoor: false,
    isActive: true,
    maintenanceReason: null,
    maintenanceUntil: null,
    features: ['Éclairage', 'Bancs'],
  },
  {
    id: '6',
    name: 'Court N°6',
    description: 'Court couvert en surface synthétique.',
    surface: 'Synthétique',
    imageUrl: 'https://images.pexels.com/photos/209977/pexels-photo-209977.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    indoor: true,
    isActive: true,
    maintenanceReason: null,
    maintenanceUntil: null,
    features: ['Éclairage', 'Bancs', 'Climatisation'],
  }
];

// Generate time slots for each court for the next 7 days
export const timeSlots: TimeSlot[] = courts.flatMap(court => 
  Array.from({ length: 7 }, (_, i) => 
    generateTimeSlots(addDays(new Date(), i), court.id)
  ).flat()
);

// Sample user
export const currentUser: User = {
  id: '1',
  email: 'user@example.com',
  firstName: 'Jean',
  lastName: 'Dupont',
  phoneNumber: '06 12 34 56 78',
  memberSince: new Date(2023, 0, 15),
  role: 'MEMBER',
  membershipStatus: 'ACTIVE',
  profileImage: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
};

// Generate sample bookings
export const bookings: Booking[] = [
  {
    id: '1',
    userId: currentUser.id,
    courtId: '1',
    timeSlotId: timeSlots[0].id,
    startTime: timeSlots[0].startTime,
    endTime: timeSlots[0].endTime,
    status: 'confirmed',
    bookingDate: new Date(),
  },
  {
    id: '2',
    userId: currentUser.id,
    courtId: '2',
    timeSlotId: timeSlots[20].id,
    startTime: timeSlots[20].startTime,
    endTime: timeSlots[20].endTime,
    status: 'pending',
    bookingDate: new Date(),
  },
  {
    id: '3',
    userId: currentUser.id,
    courtId: '3',
    timeSlotId: timeSlots[40].id,
    startTime: timeSlots[40].startTime,
    endTime: timeSlots[40].endTime,
    status: 'completed',
    bookingDate: new Date(2023, 11, 25),
  },
];