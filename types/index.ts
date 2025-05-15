export interface Court {
  id: string;
  name: string;
  description: string;
  surface: 'Terre battue' | 'Dur' | 'Gazon' | 'Synthétique';
  imageUrl: string;
  indoor: boolean;
  isActive: boolean;
  maintenanceReason: string | null;
  maintenanceUntil: Date | null;
  features: string[];
}

export interface TimeSlot {
  id: string;
  courtId: string;
  startTime: Date;
  endTime: Date;
  isAvailable: boolean;
}

export type UserRole = 'ADMIN' | 'MEMBER';
export type MembershipStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  memberSince: Date;
  role: UserRole;
  membershipStatus: MembershipStatus;
  profileImage?: string;
}

export interface Booking {
  id: string;
  userId: string;
  courtId: string;
  timeSlotId: string;
  startTime: Date;
  endTime: Date;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  bookingDate: Date;
}

export interface CourtMaintenanceHistory {
  id: string;
  courtId: string;
  startDate: Date;
  endDate: Date;
  reason: string;
  createdBy: string;
}

export interface CourtStats {
  courtId: string;
  totalBookings: number;
  occupancyRate: number;
  averageBookingDuration: number;
  popularTimeSlots: {
    hour: number;
    count: number;
  }[];
}