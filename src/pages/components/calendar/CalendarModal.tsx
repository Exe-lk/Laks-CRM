import React, { useState, useEffect } from 'react';
import { FaTimes, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useGetBookingsQuery } from '../../../redux/slices/bookingPracticeSlice';

interface CalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface BookingData {
  booking_id: string;
  booking_date: string;
  booking_start_time: string;
  booking_end_time: string;
  status: string;
  location: string;
  description?: string;
}

const CalendarModal: React.FC<CalendarModalProps> = ({ isOpen, onClose }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [userId, setUserId] = useState<string>('');
  const [userType, setUserType] = useState<'locum' | 'practice'>('locum');

  useEffect(() => {
    const profile = localStorage.getItem('profile');
    
    if (profile) {
      try {
        const parsedProfile = JSON.parse(profile);
        console.log('Parsed profile:', parsedProfile);
        
        if (parsedProfile.id) {
          setUserId(parsedProfile.id);
        }
        
        if (parsedProfile.employeeType || parsedProfile.fullName) {
          setUserType('locum');
        } else if (parsedProfile.name || parsedProfile.practiceName) {
          setUserType('practice');
        } else {
          setUserType('locum');
        }
      } catch (error) {
        console.error('Error parsing profile:', error);
      }
    }
  }, []);
  console.log('UserId:', userId);
  console.log('UserType:', userType);

  const { data: bookingsData, isLoading, error } = useGetBookingsQuery(
    { userId, userType },
    { skip: !userId }
  );
  console.log(bookingsData);

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const bookingDates = new Set<string>();
  const bookingDetails: { [key: string]: BookingData[] } = {};

  if (bookingsData?.data) {
    bookingsData.data.forEach((booking: BookingData) => {
      if (booking.status.toLowerCase() === 'confirmed') {
        const bookingDate = new Date(booking.booking_date);
        const dateKey = `${bookingDate.getFullYear()}-${bookingDate.getMonth()}-${bookingDate.getDate()}`;
        
        if (bookingDate.getMonth() === currentMonth && bookingDate.getFullYear() === currentYear) {
          bookingDates.add(dateKey);
          if (!bookingDetails[dateKey]) {
            bookingDetails[dateKey] = [];
          }
          bookingDetails[dateKey].push(booking);
        }
      }
    });
  }

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const hasBooking = (day: number) => {
    const dateKey = `${currentYear}-${currentMonth}-${day}`;
    return bookingDates.has(dateKey);
  };

  const getBookingStatusColor = (bookings: BookingData[]) => {
    return 'bg-green-500 hover:bg-green-600';
  };

  const getBookingsForDay = (day: number) => {
    const dateKey = `${currentYear}-${currentMonth}-${day}`;
    return bookingDetails[dateKey] || [];
  };

  const renderCalendarDays = () => {
    const days = [];
    
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(
        <div key={`empty-${i}`} className="h-10 w-10"></div>
      );
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const hasBookingToday = hasBooking(day);
      const bookingsToday = getBookingsForDay(day);
      
      days.push(
        <div
          key={day}
          className={`h-10 w-10 flex items-center justify-center text-sm rounded-lg cursor-pointer relative group transition-colors ${
            hasBookingToday
              ? `${getBookingStatusColor(bookingsToday)} text-white`
              : 'hover:bg-gray-100'
          }`}
          title={hasBookingToday ? `${bookingsToday.length} confirmed booking(s)` : ''}
        >
          {day}
          {hasBookingToday && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
              {bookingsToday.length}
            </div>
          )}
          
          {hasBookingToday && (
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 min-w-max max-w-xs">
              <div className="font-semibold mb-1">{bookingsToday.length} Confirmed Booking(s)</div>
              {bookingsToday.slice(0, 3).map((booking, index) => (
                <div key={index} className="text-xs mb-1">
                  <div className="font-medium">{booking.booking_start_time} - {booking.booking_end_time}</div>
                  <div>{booking.location}</div>
                </div>
              ))}
              {bookingsToday.length > 3 && (
                <div className="text-xs">...and {bookingsToday.length - 3} more</div>
              )}
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-md flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Confirmed Bookings Calendar</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={goToPreviousMonth}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <FaChevronLeft className="text-gray-600" />
            </button>
            
            <h3 className="text-lg font-semibold text-gray-800">
              {monthNames[currentMonth]} {currentYear}
            </h3>
            
            <button
              onClick={goToNextMonth}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <FaChevronRight className="text-gray-600" />
            </button>
          </div>

          {isLoading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading bookings...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <div className="text-red-500 mb-2">Failed to load bookings</div>
              <div className="text-sm text-gray-500">
                {userId ? `User ID: ${userId} | Type: ${userType}` : 'No user data found'}
              </div>
            </div>
          )}

          {!isLoading && !error && bookingsData?.data && bookingsData.data.filter((b: BookingData) => b.status.toLowerCase() === 'confirmed').length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-2">No confirmed bookings found</p>
              <p className="text-sm text-gray-400">You have no confirmed bookings to display</p>
            </div>
          )}

          {!isLoading && !error && (
            <>
              <div className="grid grid-cols-7 gap-1 mb-2">
                {dayNames.map((day) => (
                  <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {renderCalendarDays()}
              </div>

              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-center space-x-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                    <span className="text-gray-600">Confirmed Bookings</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                    <span className="text-gray-600">Number of bookings</span>
                  </div>
                </div>
                <div className="text-center text-sm text-gray-500 pt-2 border-t border-gray-200">
                  Only confirmed bookings are displayed
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarModal;
