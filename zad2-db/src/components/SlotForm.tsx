import React, { useState } from 'react';
import { ConsultationSlot } from '../types';
import { X, Plus, Calendar, Clock, MapPin, Users, Video } from 'lucide-react';

interface SlotFormProps {
  onSave: (slot: Omit<ConsultationSlot, 'id' | 'teacherId' | 'teacherName' | 'currentBookings'>) => void;
  onClose: () => void;
}

export const SlotForm: React.FC<SlotFormProps> = ({ onSave, onClose }) => {
  const [formData, setFormData] = useState({
    subject: '',
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    type: 'in-person' as 'in-person' | 'online',
    capacity: 5,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Combine date and time
    const start = new Date(`${formData.date}T${formData.startTime}`);
    const end = new Date(`${formData.date}T${formData.endTime}`);

    onSave({
      subject: formData.subject,
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      location: formData.location,
      type: formData.type,
      capacity: Number(formData.capacity),
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-bold text-gray-900">Нова консултация</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Предмет / Тема</label>
            <input
              required
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              placeholder="напр. Програмиране на C++"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Дата</label>
              <input
                required
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Начало</label>
              <input
                required
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Край</label>
              <input
                required
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Тип</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={formData.type === 'in-person'}
                  onChange={() => setFormData({ ...formData, type: 'in-person' })}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm text-gray-700">Присъствено</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={formData.type === 'online'}
                  onChange={() => setFormData({ ...formData, type: 'online' })}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm text-gray-700">Онлайн</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              {formData.type === 'online' ? 'Линк за среща' : 'Кабинет / Място'}
            </label>
            <input
              required
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder={formData.type === 'online' ? 'https://meet.google.com/...' : 'напр. Кабинет 302'}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Капацитет (студенти)</label>
            <input
              required
              type="number"
              min="1"
              max="50"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-[0.98] mt-4"
          >
            Създай консултация
          </button>
        </form>
      </div>
    </div>
  );
};
