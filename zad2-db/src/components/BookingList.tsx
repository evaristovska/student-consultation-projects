import React from 'react';
import { Booking, BookingStatus } from '../types';
import { User, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';

interface BookingListProps {
  bookings: Booking[];
  onUpdateStatus?: (bookingId: string, status: BookingStatus) => void;
  isTeacherView?: boolean;
}

export const BookingList: React.FC<BookingListProps> = ({
  bookings,
  onUpdateStatus,
  isTeacherView,
}) => {
  const getStatusInfo = (status: BookingStatus) => {
    switch (status) {
      case 'pending':
        return { icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-50', label: 'Чакащо' };
      case 'confirmed':
        return { icon: CheckCircle, color: 'text-blue-500', bg: 'bg-blue-50', label: 'Потвърдено' };
      case 'attended':
        return { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50', label: 'Посетено' };
      case 'no-show':
        return { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50', label: 'Неявил се' };
      case 'cancelled':
        return { icon: AlertCircle, color: 'text-gray-500', bg: 'bg-gray-50', label: 'Отказано' };
      default:
        return { icon: Clock, color: 'text-gray-500', bg: 'bg-gray-50', label: status };
    }
  };

  if (bookings.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
        <p className="text-gray-500 font-medium">Няма намерени записвания.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {bookings.map((booking) => {
        const statusInfo = getStatusInfo(booking.status);
        const StatusIcon = statusInfo.icon;

        return (
          <div
            key={booking.id}
            className="bg-white p-4 rounded-xl border border-gray-200 flex items-center justify-between group hover:border-blue-200 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                <User className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-gray-900">{booking.studentName}</p>
                <p className="text-xs text-gray-500">Записан на: {new Date(booking.bookedAt).toLocaleDateString('bg-BG')}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className={cn(
                "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold",
                statusInfo.bg,
                statusInfo.color
              )}>
                <StatusIcon className="w-3.5 h-3.5" />
                {statusInfo.label}
              </div>

              {isTeacherView && booking.status === 'confirmed' && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onUpdateStatus?.(booking.id, 'attended')}
                    className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="Маркирай като присъствал"
                  >
                    <CheckCircle className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => onUpdateStatus?.(booking.id, 'no-show')}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Маркирай като неявил се"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
