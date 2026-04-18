/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { ConsultationCard } from './components/ConsultationCard';
import { SlotForm } from './components/SlotForm';
import { BookingList } from './components/BookingList';
import { User, UserRole, ConsultationSlot, Booking, BookingStatus } from './types';
import { MOCK_USERS, MOCK_SLOTS, MOCK_BOOKINGS } from './mockData';
import { Plus, Search, Filter, Calendar as CalendarIcon, History, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  // State
  const [currentUser, setCurrentUser] = useState<User>(MOCK_USERS[0]); // Default to teacher for demo
  const [slots, setSlots] = useState<ConsultationSlot[]>(MOCK_SLOTS);
  const [bookings, setBookings] = useState<Booking[]>(MOCK_BOOKINGS);
  const [showSlotForm, setShowSlotForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'available' | 'my-bookings' | 'history'>('available');
  const [notifications, setNotifications] = useState<string[]>([]);

  // Derived State
  const filteredSlots = useMemo(() => {
    return slots.filter(slot => 
      slot.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      slot.teacherName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [slots, searchQuery]);

  const userBookings = useMemo(() => {
    if (currentUser.role === 'student') {
      return bookings.filter(b => b.studentId === currentUser.id);
    } else {
      // Teachers see bookings for their slots
      const teacherSlotIds = slots.filter(s => s.teacherId === currentUser.id).map(s => s.id);
      return bookings.filter(b => teacherSlotIds.includes(b.slotId));
    }
  }, [bookings, currentUser, slots]);

  // Actions
  const addNotification = (msg: string) => {
    setNotifications(prev => [msg, ...prev].slice(0, 5));
    setTimeout(() => {
      setNotifications(prev => prev.filter(m => m !== msg));
    }, 5000);
  };

  const handleRoleChange = (role: UserRole) => {
    const newUser = MOCK_USERS.find(u => u.role === role) || MOCK_USERS[0];
    setCurrentUser(newUser);
    addNotification(`Ролята е променена на: ${role}`);
  };

  const handleBook = (slotId: string) => {
    const slot = slots.find(s => s.id === slotId);
    if (!slot || slot.currentBookings >= slot.capacity) return;

    const newBooking: Booking = {
      id: Math.random().toString(36).substr(2, 9),
      slotId,
      studentId: currentUser.id,
      studentName: currentUser.name,
      status: 'confirmed',
      bookedAt: new Date().toISOString(),
    };

    setBookings(prev => [...prev, newBooking]);
    setSlots(prev => prev.map(s => s.id === slotId ? { ...s, currentBookings: s.currentBookings + 1 } : s));
    addNotification(`Успешно се записахте за: ${slot.subject}`);
  };

  const handleCancelBooking = (slotId: string) => {
    const booking = bookings.find(b => b.slotId === slotId && b.studentId === currentUser.id);
    if (!booking) return;

    setBookings(prev => prev.filter(b => b.id !== booking.id));
    setSlots(prev => prev.map(s => s.id === slotId ? { ...s, currentBookings: s.currentBookings - 1 } : s));
    addNotification(`Записването за ${slots.find(s => s.id === slotId)?.subject} е отменено.`);
  };

  const handleCreateSlot = (newSlotData: Omit<ConsultationSlot, 'id' | 'teacherId' | 'teacherName' | 'currentBookings'>) => {
    const newSlot: ConsultationSlot = {
      ...newSlotData,
      id: Math.random().toString(36).substr(2, 9),
      teacherId: currentUser.id,
      teacherName: currentUser.name,
      currentBookings: 0,
    };

    setSlots(prev => [newSlot, ...prev]);
    setShowSlotForm(false);
    addNotification('Новата консултация е създадена успешно.');
  };

  const handleUpdateBookingStatus = (bookingId: string, status: BookingStatus) => {
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status } : b));
    addNotification(`Статусът на записването е променен на: ${status}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <Navbar 
        currentUser={currentUser} 
        onRoleChange={handleRoleChange} 
        onLogout={() => addNotification('Изход...')} 
      />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-2">
              {currentUser.role === 'teacher' ? 'Управление на консултации' : 'Намери консултация'}
            </h1>
            <p className="text-gray-500">
              {currentUser.role === 'teacher' 
                ? 'Организирайте своя график и следете присъствието на студентите.' 
                : 'Разгледайте свободните часове и се запишете за консултация.'}
            </p>
          </div>

          {currentUser.role === 'teacher' && (
            <button
              onClick={() => setShowSlotForm(true)}
              className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95"
            >
              <Plus className="w-5 h-5" />
              Нова консултация
            </button>
          )}
        </div>

        {/* Tabs & Filters */}
        <div className="flex flex-col lg:flex-row gap-6 mb-8">
          <div className="flex bg-white p-1 rounded-xl border border-gray-200 shadow-sm self-start">
            <button
              onClick={() => setActiveTab('available')}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
                activeTab === 'available' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <CalendarIcon className="w-4 h-4" />
              {currentUser.role === 'teacher' ? 'Моят график' : 'Налични часове'}
            </button>
            <button
              onClick={() => setActiveTab('my-bookings')}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
                activeTab === 'my-bookings' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <History className="w-4 h-4" />
              {currentUser.role === 'teacher' ? 'Записвания' : 'Моите записвания'}
            </button>
          </div>

          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Търсене по предмет или преподавател..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>
        </div>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          {activeTab === 'available' ? (
            <motion.div
              key="available"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredSlots.length > 0 ? (
                filteredSlots.map(slot => (
                  <ConsultationCard
                    key={slot.id}
                    slot={slot}
                    canBook={currentUser.role === 'student'}
                    isBooked={bookings.some(b => b.slotId === slot.id && b.studentId === currentUser.id)}
                    onBook={handleBook}
                    onCancel={handleCancelBooking}
                  />
                ))
              ) : (
                <div className="col-span-full py-20 text-center">
                  <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="text-gray-400 w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Няма намерени консултации</h3>
                  <p className="text-gray-500">Опитайте с други ключови думи или филтри.</p>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="bookings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-3xl mx-auto"
            >
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                  <h2 className="font-bold text-gray-900">
                    {currentUser.role === 'teacher' ? 'Списък на записаните студенти' : 'Вашите активни записвания'}
                  </h2>
                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
                    {userBookings.length} общо
                  </span>
                </div>
                <div className="p-6">
                  <BookingList 
                    bookings={userBookings} 
                    isTeacherView={currentUser.role === 'teacher'}
                    onUpdateStatus={handleUpdateBookingStatus}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Modals & Overlays */}
      {showSlotForm && (
        <SlotForm 
          onSave={handleCreateSlot} 
          onClose={() => setShowSlotForm(false)} 
        />
      )}

      {/* Notifications Toast */}
      <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {notifications.map((note, i) => (
            <motion.div
              key={note + i}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className="bg-gray-900 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 pointer-events-auto"
            >
              <Bell className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium">{note}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
