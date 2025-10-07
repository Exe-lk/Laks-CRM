import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/redux/store';
import { useGetBookingsQuery, Booking } from '../../../redux/slices/bookingPracticeSlice';
import NavBar from "../../components/navBar/nav";

interface LocumTimesheetProps {}

const LocumTimesheet: React.FC<LocumTimesheetProps> = () => {
  const dispatch = useDispatch<AppDispatch>();
  
  const [currentWeekStart, setCurrentWeekStart] = useState(getWeekStart(new Date()));
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [locumId, setLocumId] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  
  const { data: bookingsData, refetch: refetchBookings, isLoading: bookingsLoading } = useGetBookingsQuery(
    { userId: locumId, userType: 'locum' },
    { skip: !locumId }
  );

  useEffect(() => {
    const profileStr = localStorage.getItem('profile');
    if (profileStr) {
      try {
        const profile = JSON.parse(profileStr);
        if (profile.id) {
          setLocumId(profile.id);
        }
      } catch (error) {
        console.error('Error parsing profile from localStorage:', error);
      }
    }
  }, []);

  // No need for timesheet fetching - we'll focus on bookings only

  function getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day; 
    const weekStart = new Date(d.setDate(diff));
    weekStart.setHours(0, 0, 0, 0);
    return weekStart;
  }

  function getWeekEnd(weekStart: Date): Date {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);
    return weekEnd;
  }

  function formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  }

  function formatTime(timeString?: string): string {
    if (!timeString) return '--:--';
    return new Date(timeString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  }

  function getDaysOfWeek(weekStart: Date): Date[] {
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + i);
      days.push(day);
    }
    return days;
  }

  // Helper function to format date in local timezone (YYYY-MM-DD)
  function formatLocalDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Helper function to get UTC date string from a UTC date string (for bookings stored in UTC)
  function getUTCDateString(dateString: string): string {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  }

  function getBookingsForDate(date: Date): Booking[] {
    if (!bookingsData?.data) return [];
    const localDateString = formatLocalDate(date);
    
    return bookingsData.data.filter((booking: Booking) => {
      // Get the UTC date from booking (cast to string since API returns string)
      const bookingUTCDate = getUTCDateString(booking.booking_date as any);
      
      // Show all bookings that match the date and are confirmed
      return bookingUTCDate === localDateString && booking.status === 'CONFIRMED';
    });
  }

  const handleDateClick = (date: Date) => {
    const dateString = formatLocalDate(date);
    setSelectedDate(dateString);
    setSelectedBooking(null); // Reset selected booking
    setShowEntryModal(true);
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newWeekStart = new Date(currentWeekStart);
    newWeekStart.setDate(currentWeekStart.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeekStart(newWeekStart);
  };

  const daysOfWeek = getDaysOfWeek(currentWeekStart);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <NavBar />
      <div className="max-w-7xl mx-auto pt-12">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
              <p className="text-gray-600 mt-1">
                Week of {formatDate(currentWeekStart)} - {formatDate(getWeekEnd(currentWeekStart))}
              </p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => navigateWeek('prev')}
                className="px-4 py-2 bg-[#C3EAE7] text-black rounded-lg hover:bg-[#A9DBD9] transition-colors"
              >
                ← Previous Week
              </button>
              <button
                onClick={() => navigateWeek('next')}
                className="px-4 py-2 bg-[#C3EAE7] text-black rounded-lg hover:bg-[#A9DBD9] transition-colors"
              >
                Next Week →
              </button>
            </div>
          </div>


          {bookingsData?.data && (
            <div className="bg-[#C3EAE7]/20 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-blue-900">
                    Weekly Bookings Summary
                  </h3>
                  <div className="mt-2 grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Total Bookings</p>
                      <p className="text-xl font-bold text-black">
                        {bookingsData.data.length}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Confirmed Bookings</p>
                      <p className="text-xl font-bold text-black">
                        {bookingsData.data.filter((booking: Booking) => booking.status === 'CONFIRMED').length}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">This Week</p>
                      <p className="text-xl font-bold text-black">
                        {getDaysOfWeek(currentWeekStart).reduce((count, day) => {
                          return count + getBookingsForDate(day).length;
                        }, 0)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="bg-[#C3EAE7]/10 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold mb-4">Weekly Calendar</h3>
            <div className="grid grid-cols-7 gap-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-center font-medium text-gray-700 py-2">
                  {day}
                </div>
              ))}
              {daysOfWeek.map((date, index) => {
                const bookings = getBookingsForDate(date);
                const isToday = date.toDateString() === new Date().toDateString();
                const hasBookings = bookings.length > 0;
                
                return (
                  <div
                    key={index}
                    onClick={() => handleDateClick(date)}
                    className={`
                      p-3 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md
                      ${isToday ? 'border-[#C3EAE7] bg-[#C3EAE7]/20' : 'border-gray-200 bg-white'}
                      ${hasBookings ? 'bg-blue-50 border-blue-200' : ''}
                    `}
                  >
                    <div className="text-center">
                      <div className={`text-sm font-medium ${isToday ? 'text-black' : 'text-gray-900'}`}>
                        {date.getDate()}
                      </div>
                      
                      {/* Show booking information */}
                      {hasBookings && (
                        <div className="mt-1 text-xs space-y-1">
                          <div className="text-blue-600 font-medium">
                            {bookings.length} Booking{bookings.length > 1 ? 's' : ''}
                          </div>
                          <div className="text-blue-500">
                            Click to view details
                          </div>
                          {bookings.map((booking, idx) => (
                            <div key={idx} className="text-xs text-gray-600 truncate">
                              {booking.booking_start_time} - {booking.location}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {bookingsLoading && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <div className="animate-spin inline-block w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full mr-2"></div>
                <p className="text-blue-700">Loading bookings...</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {showEntryModal && (
        <BookingsModal
          selectedDate={selectedDate}
          bookings={selectedDate ? getBookingsForDate(new Date(selectedDate)) : []}
          selectedBooking={selectedBooking}
          onBookingSelect={setSelectedBooking}
          onClose={() => {
            setShowEntryModal(false);
            setSelectedBooking(null);
          }}
          onUpdate={() => {
            refetchBookings(); // Refresh bookings data
          }}
        />
      )}
    </div>
  );
};

interface BookingsModalProps {
  selectedDate?: string;
  bookings: Booking[];
  selectedBooking: Booking | null;
  onBookingSelect: (booking: Booking | null) => void;
  onClose: () => void;
  onUpdate: () => void;
}

const BookingsModal: React.FC<BookingsModalProps> = ({
  selectedDate,
  bookings,
  selectedBooking,
  onBookingSelect,
  onClose,
  onUpdate
}) => {
  // Helper function to check if booking is in the past
  const isBookingPast = (booking: Booking): boolean => {
    const now = new Date();
    const today = now.toISOString().split('T')[0].split('-').join('-');
    const bookingDate = new Date(booking.booking_date as any).toISOString().split('T')[0];
    
    if (bookingDate < today) return true;
    
    if (bookingDate === today) {
      const currentTime = now.getHours() * 60 + now.getMinutes();
      const [endHour, endMinute] = booking.booking_end_time.split(':').map(Number);
      const bookingEndTime = endHour * 60 + endMinute;
      return currentTime >= bookingEndTime;
    }
    
    return false;
  };

  return (
    <div className="fixed inset-0 bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            Bookings for {selectedDate ? new Date(selectedDate).toLocaleDateString() : ''}
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ×
          </button>
        </div>

        <div className="space-y-4">
          {bookings.length > 0 ? (
            <div className="space-y-3">
              {bookings.map((booking) => {
                const isPast = isBookingPast(booking);
                return (
                <div
                  key={booking.id}
                  className={`p-4 border rounded-lg transition-colors ${
                    selectedBooking?.id === booking.id 
                      ? 'border-[#C3EAE7] bg-[#C3EAE7]/10' 
                      : isPast 
                        ? 'border-green-200 bg-green-50 hover:bg-green-100'
                        : 'border-blue-200 bg-blue-50 hover:bg-blue-100'
                  }`}
                  onClick={() => onBookingSelect(booking)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{booking.location}</h4>
                      <div className="mt-1 text-sm text-gray-600">
                        <p>Time: {booking.booking_start_time} - {booking.booking_end_time}</p>
                        {booking.description && (
                          <p className="mt-1">{booking.description}</p>
                        )}
                      </div>
                      <div className="mt-2 flex items-center space-x-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          booking.status === 'CONFIRMED' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {booking.status}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          isPast 
                            ? 'bg-gray-100 text-gray-700' 
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {isPast ? '✓ Completed' : '⏰ Upcoming'}
                        </span>
                        <span className="text-xs text-gray-500">
                          Created: {booking.createdAt ? new Date(booking.createdAt).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-medium text-gray-900">
                        Rate TBD
                      </span>
                    </div>
                  </div>
                </div>
              );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No bookings found for this date.</p>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocumTimesheet;
