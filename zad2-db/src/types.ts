export type UserRole = 'student' | 'teacher' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
}

export type BookingStatus = 'pending' | 'confirmed' | 'attended' | 'no-show' | 'cancelled';

export interface ConsultationSlot {
  id: string;
  teacherId: string;
  teacherName: string;
  startTime: string; // ISO string
  endTime: string; // ISO string
  location: string;
  type: 'in-person' | 'online';
  capacity: number;
  currentBookings: number;
  subject: string;
}

export interface Booking {
  id: string;
  slotId: string;
  studentId: string;
  studentName: string;
  status: BookingStatus;
  bookedAt: string; // ISO string
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt: string;
}
