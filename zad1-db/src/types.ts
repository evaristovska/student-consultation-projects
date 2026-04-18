export type UserRole = 'student' | 'teacher';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
}

export interface ConsultationSlot {
  id: string;
  teacherId: string;
  teacherName: string;
  startTime: string; // ISO string
  endTime: string;   // ISO string
  status: 'available' | 'booked' | 'full';
  type: 'online' | 'in-person';
  capacity: number;
  currentBookings: number;
}

export interface Booking {
  id: string;
  slotId: string;
  studentId: string;
  studentName: string;
  teacherId: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  message?: string;
  rating?: number;
  review?: string;
  createdAt: string;
}
