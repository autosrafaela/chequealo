export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'rejected';

export interface BookingProfessional {
  id: string;
  name: string;
  title: string;
  avatar: string;
  phone?: string;
}

export interface BookingService {
  id: string;
  name: string;
  duration: number;
  price: number;
}

export interface BookingUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
}

export interface Booking {
  id: string;
  userId: string;
  professionalId: string;
  serviceId: string;
  professional: BookingProfessional;
  service: BookingService;
  user?: BookingUser;
  date: Date | string;
  time: string;
  status: BookingStatus;
  notes?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface BookingCardProps {
  booking: Booking;
  isPast?: boolean;
  isProfessionalView?: boolean;
  onConfirm?: (id: string) => void;
  onReject?: (id: string) => void;
  onCancel?: (id: string) => void;
}
