/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { UserProfile, ConsultationSlot, Booking, UserRole } from './types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { Calendar as CalendarIcon, Clock, User, LogOut, Plus, Check, X, BookOpen, Filter, Star, Video, MapPin, Users } from 'lucide-react';
import { format, addHours, isAfter, parseISO, isSameDay } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [slots, setSlots] = useState<ConsultationSlot[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  
  // Filters
  const [filterTeacher, setFilterTeacher] = useState<string>('all');
  const [filterDate, setFilterDate] = useState<string>('');

  // Mock data initialization
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) setUser(JSON.parse(savedUser));

    const savedSlots = localStorage.getItem('slots');
    if (savedSlots) setSlots(JSON.parse(savedSlots));

    const savedBookings = localStorage.getItem('bookings');
    if (savedBookings) setBookings(JSON.parse(savedBookings));
  }, []);

  useEffect(() => {
    localStorage.setItem('slots', JSON.stringify(slots));
    localStorage.setItem('bookings', JSON.stringify(bookings));
  }, [slots, bookings]);

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const role = formData.get('role') as UserRole;
    const name = email.split('@')[0];

    const newUser: UserProfile = {
      uid: Math.random().toString(36).substr(2, 9),
      email,
      displayName: name.charAt(0).toUpperCase() + name.slice(1),
      role
    };

    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
    toast.success(`Добре дошли, ${newUser.displayName}!`);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    toast.info('Излязохте успешно.');
  };

  const createSlot = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user || user.role !== 'teacher') return;

    const formData = new FormData(e.currentTarget);
    const date = formData.get('date') as string;
    const time = formData.get('time') as string;
    const type = formData.get('type') as 'online' | 'in-person';
    const capacity = parseInt(formData.get('capacity') as string);
    
    const startTime = parseISO(`${date}T${time}`);
    const endTime = addHours(startTime, 1);

    if (!isAfter(startTime, new Date())) {
      toast.error('Не можете да създавате консултации в миналото.');
      return;
    }

    const newSlot: ConsultationSlot = {
      id: Math.random().toString(36).substr(2, 9),
      teacherId: user.uid,
      teacherName: user.displayName,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      status: 'available',
      type,
      capacity,
      currentBookings: 0
    };

    setSlots([...slots, newSlot]);
    toast.success('Консултацията е създадена успешно.');
  };

  const bookSlot = (slot: ConsultationSlot) => {
    if (!user || user.role !== 'student') return;

    // Validation: Check if student already booked this slot
    if (bookings.some(b => b.slotId === slot.id && b.studentId === user.uid && b.status !== 'cancelled')) {
      toast.error('Вече сте се записали за този час.');
      return;
    }

    // Validation: Check capacity
    if (slot.currentBookings >= slot.capacity) {
      toast.error('Този час вече е запълнен.');
      return;
    }

    const newBooking: Booking = {
      id: Math.random().toString(36).substr(2, 9),
      slotId: slot.id,
      studentId: user.uid,
      studentName: user.displayName,
      teacherId: slot.teacherId,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    setBookings([...bookings, newBooking]);
    
    // Update slot current bookings and status
    setSlots(slots.map(s => {
      if (s.id === slot.id) {
        const newCount = s.currentBookings + 1;
        return { 
          ...s, 
          currentBookings: newCount,
          status: newCount >= s.capacity ? 'full' : 'booked'
        };
      }
      return s;
    }));
    
    toast.success('Заявката за записване е изпратена.');
  };

  const deleteSlot = (slotId: string) => {
    // Cancel all bookings for this slot
    setBookings(bookings.map(b => b.slotId === slotId ? { ...b, status: 'cancelled' } : b));
    setSlots(slots.filter(s => s.id !== slotId));
    toast.info('Часът е изтрит.');
  };

  const updateBookingStatus = (bookingId: string, status: 'confirmed' | 'cancelled' | 'completed') => {
    setBookings(bookings.map(b => b.id === bookingId ? { ...b, status } : b));
    
    if (status === 'cancelled') {
      const booking = bookings.find(b => b.id === bookingId);
      if (booking) {
        setSlots(slots.map(s => {
          if (s.id === booking.slotId) {
            const newCount = Math.max(0, s.currentBookings - 1);
            return { 
              ...s, 
              currentBookings: newCount,
              status: newCount === 0 ? 'available' : (newCount < s.capacity ? 'booked' : 'full')
            };
          }
          return s;
        }));
      }
    }
    
    const statusLabels: Record<string, string> = {
      confirmed: 'Потвърдено',
      cancelled: 'Отказано',
      completed: 'Приключено'
    };
    
    toast.info(`Статусът на записването е актуализиран на: ${statusLabels[status]}`);
  };

  const submitRating = (bookingId: string, rating: number, review: string) => {
    setBookings(bookings.map(b => b.id === bookingId ? { ...b, rating, review } : b));
    toast.success('Благодарим ви за вашата оценка!');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed': return <Badge className="bg-emerald-500 hover:bg-emerald-600">Потвърдено</Badge>;
      case 'cancelled': return <Badge variant="destructive">Отказано</Badge>;
      case 'pending': return <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">Изчакващо</Badge>;
      case 'completed': return <Badge className="bg-blue-500 hover:bg-blue-600">Приключено</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const filteredSlots = slots.filter(slot => {
    const matchesTeacher = filterTeacher === 'all' || slot.teacherId === filterTeacher;
    const matchesDate = !filterDate || isSameDay(parseISO(slot.startTime), parseISO(filterDate));
    return matchesTeacher && matchesDate && slot.status !== 'full';
  });

  const teachers = Array.from(
    new Map(slots.map(s => [s.teacherId, s.teacherName])).entries()
  ).map(([id, name]) => ({ id, name }));

  if (!user) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4 font-sans">
        <Toaster position="top-center" />
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Card className="border-none shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center space-y-1">
              <div className="mx-auto bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-2">
                <BookOpen className="text-primary w-6 h-6" />
              </div>
              <CardTitle className="text-2xl font-bold tracking-tight">Система за консултации</CardTitle>
              <CardDescription>Влезте в профила си, за да продължите</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Имейл</Label>
                  <Input id="email" name="email" type="email" placeholder="student@uni.bg" required className="bg-white" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Роля</Label>
                  <Select name="role" defaultValue="student">
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Изберете роля" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Студент</SelectItem>
                      <SelectItem value="teacher">Преподавател</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full font-medium py-6 text-lg">Вход</Button>
              </form>
            </CardContent>
            <CardFooter className="justify-center">
              <p className="text-xs text-neutral-500">© 2026 Университетска система за консултации</p>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 font-sans text-neutral-900">
      <Toaster position="top-center" />
      
      {/* Navigation */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="text-primary w-6 h-6" />
            <span className="font-bold text-xl tracking-tight hidden sm:inline-block">УниКонсулт</span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-neutral-100 rounded-full">
              <User className="w-4 h-4 text-neutral-500" />
              <span className="text-sm font-medium">{user.displayName}</span>
              <Badge variant="secondary" className="text-[10px] uppercase tracking-wider px-1.5 py-0">
                {user.role === 'teacher' ? 'Преподавател' : 'Студент'}
              </Badge>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout} title="Изход">
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {user.role === 'teacher' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="border-none shadow-sm bg-blue-50">
              <CardHeader className="pb-2">
                <CardDescription className="text-blue-600 font-medium uppercase text-xs tracking-wider">Общо часове</CardDescription>
                <CardTitle className="text-3xl font-bold">{slots.filter(s => s.teacherId === user.uid).length}</CardTitle>
              </CardHeader>
            </Card>
            <Card className="border-none shadow-sm bg-emerald-50">
              <CardHeader className="pb-2">
                <CardDescription className="text-emerald-600 font-medium uppercase text-xs tracking-wider">Потвърдени</CardDescription>
                <CardTitle className="text-3xl font-bold">{bookings.filter(b => b.teacherId === user.uid && b.status === 'confirmed').length}</CardTitle>
              </CardHeader>
            </Card>
            <Card className="border-none shadow-sm bg-amber-50">
              <CardHeader className="pb-2">
                <CardDescription className="text-amber-600 font-medium uppercase text-xs tracking-wider">Чакащи</CardDescription>
                <CardTitle className="text-3xl font-bold">{bookings.filter(b => b.teacherId === user.uid && b.status === 'pending').length}</CardTitle>
              </CardHeader>
            </Card>
          </div>
        )}

        <Tabs defaultValue={user.role === 'teacher' ? 'my-slots' : 'available-slots'} className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <TabsList className="bg-neutral-200/50 p-1">
              {user.role === 'teacher' ? (
                <>
                  <TabsTrigger value="my-slots">Моите часове</TabsTrigger>
                  <TabsTrigger value="bookings">Заявки</TabsTrigger>
                </>
              ) : (
                <>
                  <TabsTrigger value="available-slots">Свободни часове</TabsTrigger>
                  <TabsTrigger value="my-bookings">Моите записвания</TabsTrigger>
                </>
              )}
            </TabsList>

            {user.role === 'teacher' && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="w-4 h-4" /> Добави час
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Създаване на нов час за консултация</DialogTitle>
                    <DialogDescription>
                      Изберете дата и час. Консултацията е с продължителност 1 час.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={createSlot} className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="date">Дата</Label>
                        <Input id="date" name="date" type="date" required min={format(new Date(), 'yyyy-MM-dd')} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="time">Час</Label>
                        <Input id="time" name="time" type="time" required />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="type">Тип</Label>
                        <Select name="type" defaultValue="online">
                          <SelectTrigger>
                            <SelectValue placeholder="Изберете тип" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="online">Онлайн</SelectItem>
                            <SelectItem value="in-person">Присъствено</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="capacity">Капацитет (студенти)</Label>
                        <Input id="capacity" name="capacity" type="number" min="1" defaultValue="1" required />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit">Създай</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>

          <AnimatePresence mode="wait">
            {/* Teacher: My Slots */}
            <TabsContent value="my-slots">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Card className="border-none shadow-sm overflow-hidden">
                  <Table>
                    <TableHeader className="bg-neutral-50">
                      <TableRow>
                        <TableHead>Дата</TableHead>
                        <TableHead>Време</TableHead>
                        <TableHead>Статус</TableHead>
                        <TableHead className="text-right">Действие</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {slots.filter(s => s.teacherId === user.uid).length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-12 text-neutral-500">
                            Нямате създадени часове за консултация.
                          </TableCell>
                        </TableRow>
                      ) : (
                        slots.filter(s => s.teacherId === user.uid).map(slot => (
                          <TableRow key={slot.id}>
                            <TableCell className="font-medium">{format(parseISO(slot.startTime), 'dd.MM.yyyy')}</TableCell>
                            <TableCell>{format(parseISO(slot.startTime), 'HH:mm')} - {format(parseISO(slot.endTime), 'HH:mm')}</TableCell>
                            <TableCell>
                              <Badge variant={slot.status === 'available' ? 'outline' : 'secondary'}>
                                {slot.status === 'available' ? 'Свободен' : 'Зает'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10" 
                                onClick={() => deleteSlot(slot.id)}>
                                Изтрий
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Teacher: Bookings */}
            <TabsContent value="bookings">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="grid gap-4">
                  {bookings.filter(b => b.teacherId === user.uid).length === 0 ? (
                    <Card className="p-12 text-center text-neutral-500 border-dashed border-2">
                      Все още нямате заявки за консултации.
                    </Card>
                  ) : (
                    bookings.filter(b => b.teacherId === user.uid).map(booking => {
                      const slot = slots.find(s => s.id === booking.slotId);
                      return (
                        <Card key={booking.id} className="border-none shadow-sm hover:shadow-md transition-shadow">
                          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div className="space-y-1">
                              <CardTitle className="text-lg">{booking.studentName}</CardTitle>
                              <CardDescription>Заявка за {slot ? format(parseISO(slot.startTime), 'dd.MM.yyyy HH:mm') : 'Изтрит час'}</CardDescription>
                            </div>
                            {getStatusBadge(booking.status)}
                          </CardHeader>
                          {booking.status === 'pending' && (
                            <CardFooter className="flex justify-end gap-2 pt-2">
                              <Button variant="outline" size="sm" onClick={() => updateBookingStatus(booking.id, 'cancelled')} className="gap-1">
                                <X className="w-4 h-4" /> Откажи
                              </Button>
                              <Button size="sm" onClick={() => updateBookingStatus(booking.id, 'confirmed')} className="gap-1">
                                <Check className="w-4 h-4" /> Потвърди
                              </Button>
                            </CardFooter>
                          )}
                        </Card>
                      );
                    })
                  )}
                </div>
              </motion.div>
            </TabsContent>

            {/* Student: Available Slots */}
            <TabsContent value="available-slots">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                {/* Filters */}
                <Card className="p-4 border-none shadow-sm bg-white">
                  <div className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1 space-y-2">
                      <Label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Преподавател</Label>
                      <Select value={filterTeacher} onValueChange={setFilterTeacher}>
                        <SelectTrigger className="bg-neutral-50 border-none">
                          <SelectValue placeholder="Всички преподаватели" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Всички преподаватели</SelectItem>
                          {teachers.map(t => (
                            <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex-1 space-y-2">
                      <Label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Дата</Label>
                      <Input 
                        type="date" 
                        value={filterDate} 
                        onChange={(e) => setFilterDate(e.target.value)}
                        className="bg-neutral-50 border-none"
                      />
                    </div>
                    {(filterTeacher !== 'all' || filterDate) && (
                      <Button variant="ghost" onClick={() => { setFilterTeacher('all'); setFilterDate(''); }}>
                        Изчисти
                      </Button>
                    )}
                  </div>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredSlots.length === 0 ? (
                    <div className="col-span-full py-12 text-center text-neutral-500">
                      Няма намерени свободни часове за консултация.
                    </div>
                  ) : (
                    filteredSlots.map(slot => (
                      <Card key={slot.id} className="border-none shadow-sm hover:shadow-md transition-shadow group">
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div className="bg-primary/10 p-2 rounded-lg group-hover:bg-primary group-hover:text-white transition-colors">
                              <CalendarIcon className="w-5 h-5" />
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <Badge variant="outline" className="font-mono">
                                {format(parseISO(slot.startTime), 'HH:mm')}
                              </Badge>
                              <Badge variant="secondary" className="text-[10px] uppercase">
                                {slot.type === 'online' ? <span className="flex items-center gap-1"><Video className="w-3 h-3" /> Онлайн</span> : <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> Присъствено</span>}
                              </Badge>
                            </div>
                          </div>
                          <CardTitle className="mt-4">{format(parseISO(slot.startTime), 'eeee, dd MMMM')}</CardTitle>
                          <CardDescription className="space-y-1">
                            <div className="flex items-center gap-1">
                              <User className="w-3 h-3" /> Преподавател: {slot.teacherName}
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="w-3 h-3" /> Свободни места: {slot.capacity - slot.currentBookings} от {slot.capacity}
                            </div>
                          </CardDescription>
                        </CardHeader>
                        <CardFooter>
                          <Button className="w-full" onClick={() => bookSlot(slot)}>Запиши се</Button>
                        </CardFooter>
                      </Card>
                    ))
                  )}
                </div>
              </motion.div>
            </TabsContent>

            {/* Student: My Bookings */}
            <TabsContent value="my-bookings">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Card className="border-none shadow-sm overflow-hidden">
                  <Table>
                    <TableHeader className="bg-neutral-50">
                      <TableRow>
                        <TableHead>Преподавател</TableHead>
                        <TableHead>Дата и час</TableHead>
                        <TableHead>Статус</TableHead>
                        <TableHead className="text-right">Действие</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bookings.filter(b => b.studentId === user.uid).length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-12 text-neutral-500">
                            Нямате направени записвания.
                          </TableCell>
                        </TableRow>
                      ) : (
                        bookings.filter(b => b.studentId === user.uid).map(booking => {
                          const slot = slots.find(s => s.id === booking.slotId);
                          return (
                            <TableRow key={booking.id}>
                              <TableCell className="font-medium">
                                <div>{slot?.teacherName || 'Няма информация'}</div>
                                <div className="text-[10px] text-neutral-400 uppercase">
                                  {slot?.type === 'online' ? 'Онлайн' : 'Присъствено'}
                                </div>
                              </TableCell>
                              <TableCell>
                                {slot ? format(parseISO(slot.startTime), 'dd.MM.yyyy HH:mm') : 'Изтрит час'}
                              </TableCell>
                              <TableCell>
                                {getStatusBadge(booking.status)}
                                {booking.rating && (
                                  <div className="flex items-center gap-0.5 mt-1">
                                    {[...Array(5)].map((_, i) => (
                                      <Star key={i} className={`w-3 h-3 ${i < booking.rating! ? 'fill-yellow-400 text-yellow-400' : 'text-neutral-300'}`} />
                                    ))}
                                  </div>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  {booking.status === 'pending' && (
                                    <Button variant="ghost" size="sm" className="text-destructive" 
                                      onClick={() => updateBookingStatus(booking.id, 'cancelled')}>
                                      Откажи
                                    </Button>
                                  )}
                                  {booking.status === 'confirmed' && (
                                    <Dialog>
                                      <DialogTrigger asChild>
                                        <Button variant="outline" size="sm">Оцени</Button>
                                      </DialogTrigger>
                                      <DialogContent>
                                        <DialogHeader>
                                          <DialogTitle>Оценете консултацията</DialogTitle>
                                          <DialogDescription>Как премина срещата с {slot?.teacherName}?</DialogDescription>
                                        </DialogHeader>
                                        <div className="py-6 space-y-6">
                                          <div className="flex justify-center gap-2">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                              <button 
                                                key={star} 
                                                onClick={() => {
                                                  submitRating(booking.id, star, "");
                                                  updateBookingStatus(booking.id, 'completed');
                                                }}
                                                className="hover:scale-110 transition-transform"
                                              >
                                                <Star className={`w-10 h-10 ${booking.rating && booking.rating >= star ? 'fill-yellow-400 text-yellow-400' : 'text-neutral-300'}`} />
                                              </button>
                                            ))}
                                          </div>
                                        </div>
                                      </DialogContent>
                                    </Dialog>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </Card>
              </motion.div>
            </TabsContent>
          </AnimatePresence>
        </Tabs>
      </main>
    </div>
  );
}
