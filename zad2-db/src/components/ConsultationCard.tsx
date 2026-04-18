import React from 'react';
import { ConsultationSlot } from '../types';
import { Calendar, Clock, MapPin, Users, Video, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { bg } from 'date-fns/locale';
import { cn } from '../lib/utils';

interface ConsultationCardProps {
  slot: ConsultationSlot;
  onBook?: (slotId: string) => void;
  onCancel?: (slotId: string) => void;
  isBooked?: boolean;
  canBook?: boolean;
}

export const ConsultationCard: React.FC<ConsultationCardProps> = ({
  slot,
  onBook,
  onCancel,
  isBooked,
  canBook,
}) => {
  const isFull = slot.currentBookings >= slot.capacity;
  const startDate = new Date(slot.startTime);
  const endDate = new Date(slot.endTime);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <div className="p-5">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-bold text-lg text-gray-900 mb-1">{slot.subject}</h3>
            <p className="text-sm text-gray-500 font-medium">{slot.teacherName}</p>
          </div>
          <span
            className={cn(
              "px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
              slot.type === 'online' ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
            )}
          >
            {slot.type === 'online' ? 'Онлайн' : 'Присъствено'}
          </span>
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3 text-gray-600">
            <Calendar className="w-4 h-4 text-blue-500" />
            <span className="text-sm">
              {format(startDate, 'EEEE, d MMMM', { locale: bg })}
            </span>
          </div>
          <div className="flex items-center gap-3 text-gray-600">
            <Clock className="w-4 h-4 text-blue-500" />
            <span className="text-sm">
              {format(startDate, 'HH:mm')} - {format(endDate, 'HH:mm')}
            </span>
          </div>
          <div className="flex items-center gap-3 text-gray-600">
            {slot.type === 'online' ? (
              <Video className="w-4 h-4 text-purple-500" />
            ) : (
              <MapPin className="w-4 h-4 text-red-500" />
            )}
            <span className="text-sm truncate max-w-[200px]">
              {slot.location}
            </span>
          </div>
          <div className="flex items-center gap-3 text-gray-600">
            <Users className="w-4 h-4 text-green-500" />
            <span className="text-sm">
              {slot.currentBookings} / {slot.capacity} записани
            </span>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100">
          {isBooked ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-green-600 font-medium text-sm">
                <CheckCircle2 className="w-4 h-4" />
                Записан
              </div>
              <button
                onClick={() => onCancel?.(slot.id)}
                className="text-sm text-red-600 hover:underline font-medium"
              >
                Отказ
              </button>
            </div>
          ) : (
            <button
              disabled={!canBook || isFull}
              onClick={() => onBook?.(slot.id)}
              className={cn(
                "w-full py-2.5 rounded-lg font-bold text-sm transition-all",
                isFull
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.98]"
              )}
            >
              {isFull ? 'Няма места' : 'Запиши се'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
