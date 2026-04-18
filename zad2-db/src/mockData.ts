import { User, ConsultationSlot, Booking } from './types';

export const MOCK_USERS: User[] = [
  { id: 't1', name: 'проф. Иван Иванов', email: 'ivanov@uni.bg', role: 'teacher', department: 'Информатика' },
  { id: 't2', name: 'доц. Мария Петрова', email: 'petrova@uni.bg', role: 'teacher', department: 'Математика' },
  { id: 's1', name: 'Георги Георгиев', email: 'georgi@stud.bg', role: 'student' },
];

export const MOCK_SLOTS: ConsultationSlot[] = [
  {
    id: 'slot1',
    teacherId: 't1',
    teacherName: 'проф. Иван Иванов',
    startTime: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
    endTime: new Date(Date.now() + 86400000 + 3600000).toISOString(),
    location: 'Кабинет 302',
    type: 'in-person',
    capacity: 5,
    currentBookings: 1,
    subject: 'Програмиране на C++',
  },
  {
    id: 'slot2',
    teacherId: 't2',
    teacherName: 'доц. Мария Петрова',
    startTime: new Date(Date.now() + 172800000).toISOString(), // Day after tomorrow
    endTime: new Date(Date.now() + 172800000 + 3600000).toISOString(),
    location: 'https://meet.google.com/abc-defg-hij',
    type: 'online',
    capacity: 10,
    currentBookings: 0,
    subject: 'Линейна алгебра',
  },
];

export const MOCK_BOOKINGS: Booking[] = [
  {
    id: 'b1',
    slotId: 'slot1',
    studentId: 's1',
    studentName: 'Георги Георгиев',
    status: 'confirmed',
    bookedAt: new Date().toISOString(),
  },
];
