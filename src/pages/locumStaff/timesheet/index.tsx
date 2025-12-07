import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/redux/store';
import { useGetBookingsQuery, Booking } from '../../../redux/slices/bookingPracticeSlice';
import NavBar from "../../components/navBar/nav";
import SignatureCanvas from 'react-signature-canvas';
import { uploadService, UploadProgress as UploadProgressType } from '@/services/uploadService';
import UploadProgress from '@/components/UploadProgress';
import Swal from 'sweetalert2';

const TIMESHEET_UNLOCK_BUFFER_MINUTES = 30;

interface LocumTimesheetProps { }

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

  function formatLocalDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function getUTCDateString(dateString: string): string {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  }

  function getBookingsForDate(date: Date): Booking[] {
    if (!bookingsData?.data) return [];
    const localDateString = formatLocalDate(date);

    return bookingsData.data.filter((booking: Booking) => {
      const bookingUTCDate = getUTCDateString(booking.booking_date as any);

      return bookingUTCDate === localDateString && booking.status === 'CONFIRMED';
    });
  }

  const handleDateClick = (date: Date) => {
    const dateString = formatLocalDate(date);
    setSelectedDate(dateString);
    setSelectedBooking(null);
    setShowEntryModal(true);
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newWeekStart = new Date(currentWeekStart);
    newWeekStart.setDate(currentWeekStart.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeekStart(newWeekStart);
  };

  const daysOfWeek = getDaysOfWeek(currentWeekStart);

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-6 pt-20 sm:pt-24">
      <NavBar />
      <div className="max-w-7xl mx-auto pt-20 sm:pt-32 pb-6 sm:pb-12">
        <div className="text-center mb-2">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-black rounded-full mb-3 sm:mb-4 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
            <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-black mb-2 bg-gradient-to-r from-black to-gray-700 bg-clip-text px-4">
            Timesheets
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-2xl mx-auto px-4">
            View your dental appointments, access your timesheet, and mark your attendance.
          </p>
          <div className="flex justify-center gap-2 mt-3 sm:mt-4">
            <div className="w-2 h-2 bg-[#C3EAE7] rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-[#C3EAE7] rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-[#C3EAE7] rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-3 sm:p-4 md:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 pt-4 sm:pt-8 md:pt-12">My Bookings</h1>
              <p className="text-xs sm:text-sm md:text-base text-gray-600 mt-1">
                Week of {formatDate(currentWeekStart)} - {formatDate(getWeekEnd(currentWeekStart))}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
              <button
                onClick={() => navigateWeek('prev')}
                className="px-3 sm:px-4 py-2 bg-[#C3EAE7] text-black rounded-lg hover:bg-[#A9DBD9] transition-colors text-sm sm:text-base whitespace-nowrap"
              >
                ← Previous Week
              </button>
              <button
                onClick={() => navigateWeek('next')}
                className="px-3 sm:px-4 py-2 bg-[#C3EAE7] text-black rounded-lg hover:bg-[#A9DBD9] transition-colors text-sm sm:text-base whitespace-nowrap"
              >
                Next Week →
              </button>
            </div>
          </div>


          {bookingsData?.data && (
            <div className="bg-[#C3EAE7]/20 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
              <div className="flex justify-between items-center">
                <div className="w-full">
                  <h3 className="text-base sm:text-lg font-semibold text-blue-900 mb-3">
                    Weekly Bookings Summary
                  </h3>
                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                    <div className="bg-white p-3 rounded-lg">
                      <p className="text-xs sm:text-sm text-gray-600">Total Bookings</p>
                      <p className="text-lg sm:text-xl font-bold text-black">
                        {bookingsData.data.length}
                      </p>
                    </div>
                    <div className="bg-white p-3 rounded-lg">
                      <p className="text-xs sm:text-sm text-gray-600">Confirmed Bookings</p>
                      <p className="text-lg sm:text-xl font-bold text-black">
                        {bookingsData.data.filter((booking: Booking) => booking.status === 'CONFIRMED').length}
                      </p>
                    </div>
                    <div className="bg-white p-3 rounded-lg">
                      <p className="text-xs sm:text-sm text-gray-600">This Week</p>
                      <p className="text-lg sm:text-xl font-bold text-black">
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

          <div className="bg-[#C3EAE7]/10 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 sm:mb-4 gap-3">
              <h3 className="text-base sm:text-lg font-semibold">Weekly Calendar</h3>
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-blue-50 border-2 border-blue-200 rounded"></div>
                  <span className="text-gray-600">Unlocked</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-red-50 border-2 border-red-200 rounded"></div>
                  <span className="text-gray-600">Locked</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-[#C3EAE7]/20 border-2 border-[#C3EAE7] rounded"></div>
                  <span className="text-gray-600">Today</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, idx) => (
                <div key={day} className="text-center font-medium text-gray-700 py-1 sm:py-2 text-xs sm:text-sm">
                  <span className="hidden sm:inline">{day}</span>
                  <span className="sm:hidden">{day.substring(0, 1)}</span>
                </div>
              ))}
              {daysOfWeek.map((date, index) => {
                const bookings = getBookingsForDate(date);
                const isToday = date.toDateString() === new Date().toDateString();
                const hasBookings = bookings.length > 0;
                const hasLockedBookings = bookings.some(booking => {
                  const bookingDateObj = new Date(booking.booking_date as any);
                  const [startHour, startMinute] = booking.booking_start_time.split(':').map(Number);
                  const bookingStartDateTime = new Date(
                    bookingDateObj.getFullYear(),
                    bookingDateObj.getMonth(),
                    bookingDateObj.getDate(),
                    startHour,
                    startMinute,
                    0,
                    0
                  );
                  const unlockDateTime = new Date(
                    bookingStartDateTime.getTime() - TIMESHEET_UNLOCK_BUFFER_MINUTES * 60 * 1000
                  );
                  return new Date() < unlockDateTime;
                });

                return (
                  <div
                    key={index}
                    onClick={() => handleDateClick(date)}
                    className={`
                      p-1 sm:p-2 md:p-3 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md min-h-[60px] sm:min-h-[80px]
                      ${isToday ? 'border-[#C3EAE7] bg-[#C3EAE7]/20' : 'border-gray-200 bg-white'}
                      ${hasBookings ? 'bg-blue-50 border-blue-200' : ''}
                      ${hasLockedBookings ? 'border-red-200 bg-red-50' : ''}
                    `}
                  >
                    <div className="text-center">
                      <div className={`text-xs sm:text-sm font-medium ${isToday ? 'text-black' : 'text-gray-900'}`}>
                        {date.getDate()}
                      </div>

                      {hasBookings && (
                        <div className="mt-1 text-xs space-y-0.5 sm:space-y-1">
                          <div className="text-blue-600 font-medium text-[10px] sm:text-xs">
                            {bookings.length} <span className="hidden sm:inline">Booking{bookings.length > 1 ? 's' : ''}</span>
                          </div>
                          {hasLockedBookings && (
                            <div className="text-red-600 font-medium text-[10px] sm:text-xs">
                              🔒 <span className="hidden sm:inline">Locked</span>
                            </div>
                          )}
                          <div className="text-blue-500 text-[9px] sm:text-xs hidden sm:block">
                            Click to view
                          </div>
                          {bookings.slice(0, 1).map((booking, idx) => (
                            <div key={idx} className="text-[9px] sm:text-xs text-gray-600 truncate hidden md:block">
                              {booking.booking_start_time}
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
            refetchBookings();
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
  const [startTime, setStartTime] = useState<string>('');
  const [endTime, setEndTime] = useState<string>('');
  const [lunchStartTime, setLunchStartTime] = useState<string>('');
  const [lunchEndTime, setLunchEndTime] = useState<string>('');
  const [timesheetJobId, setTimesheetJobId] = useState<string | null>(null);
  const [timesheetId, setTimesheetId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [hourlyRate, setHourlyRate] = useState<number | null>(null);
  const [totalHours, setTotalHours] = useState<number | null>(null);
  const [totalPay, setTotalPay] = useState<number | null>(null);
  const [timeValidationError, setTimeValidationError] = useState<string | null>(null);
  const [isStartTimeSet, setIsStartTimeSet] = useState(false);
  const [isBreakStartSet, setIsBreakStartSet] = useState(false);
  const [isBreakEndSet, setIsBreakEndSet] = useState(false);
  const [isEndTimeSet, setIsEndTimeSet] = useState(false);
  const [isTimesheetLocked, setIsTimesheetLocked] = useState(false);
  const [lockedClickAttempt, setLockedClickAttempt] = useState(false);

  useEffect(() => {
    const fetchTimesheetJob = async () => {
      if (!selectedBooking || !selectedDate) {
        setStartTime('');
        setEndTime('');
        setLunchStartTime('');
        setLunchEndTime('');
        setTimesheetJobId(null);
        setTimesheetId(null);
        setHourlyRate(null);
        setTotalHours(null);
        setTotalPay(null);
        setError(null);
        setSuccess(null);
        setIsStartTimeSet(false);
        setIsBreakStartSet(false);
        setIsBreakEndSet(false);
        setIsEndTimeSet(false);
        setIsTimesheetLocked(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      setSuccess(null);

      try {
        const token = getAuthToken();
        const profileStr = localStorage.getItem('profile');
        if (!profileStr) return;

        const profile = JSON.parse(profileStr);
        const locumId = profile.id;

        const bookingDate = new Date(selectedBooking.booking_date as any);
        const month = bookingDate.getMonth() + 1;
        const year = bookingDate.getFullYear();

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_SITE_URL}/api/timesheet/get-locum-timesheet?locumId=${locumId}&month=${month}&year=${year}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            }
          }
        );

        if (response.ok) {
          const data = await response.json();

          const existingJob = data.data.allJobs?.find(
            (job: any) => job.bookingId === selectedBooking.id
          );

          if (existingJob) {
            setTimesheetJobId(existingJob.id);
            setTimesheetId(existingJob.timesheetId);

            setHourlyRate(existingJob.hourlyRate || null);
            setTotalHours(existingJob.totalHours || null);
            setTotalPay(existingJob.totalPay || null);

            if (existingJob.startTime) {
              const startDate = new Date(existingJob.startTime);
              setStartTime(startDate.toTimeString().substring(0, 5));
              setIsStartTimeSet(true);
            } else {
              setStartTime('');
              setIsStartTimeSet(false);
            }

            if (existingJob.endTime) {
              const endDate = new Date(existingJob.endTime);
              setEndTime(endDate.toTimeString().substring(0, 5));
              setIsEndTimeSet(true);
            } else {
              setEndTime('');
              setIsEndTimeSet(false);
            }

            if (existingJob.lunchStartTime) {
              const lunchStart = new Date(existingJob.lunchStartTime);
              setLunchStartTime(lunchStart.toTimeString().substring(0, 5));
              setIsBreakStartSet(true);
            } else {
              setLunchStartTime('');
              setIsBreakStartSet(false);
            }

            if (existingJob.lunchEndTime) {
              const lunchEnd = new Date(existingJob.lunchEndTime);
              setLunchEndTime(lunchEnd.toTimeString().substring(0, 5));
              setIsBreakEndSet(true);
            } else {
              setLunchEndTime('');
              setIsBreakEndSet(false);
            }

            setIsTimesheetLocked(false);
            setSuccess('Previous time entries loaded for this booking!');
          } else {
            setStartTime('');
            setEndTime('');
            setLunchStartTime('');
            setLunchEndTime('');
            setTimesheetJobId(null);
            setTimesheetId(null);
            setHourlyRate(null);
            setTotalHours(null);
            setTotalPay(null);
            setIsStartTimeSet(false);
            setIsBreakStartSet(false);
            setIsBreakEndSet(false);
            setIsEndTimeSet(false);
            setIsTimesheetLocked(false);
            setSuccess('Ready to track time for this booking');
          }
        } else {
          setStartTime('');
          setEndTime('');
          setLunchStartTime('');
          setLunchEndTime('');
          setTimesheetJobId(null);
          setTimesheetId(null);
          setHourlyRate(null);
          setTotalHours(null);
          setTotalPay(null);
          setIsStartTimeSet(false);
          setIsBreakStartSet(false);
          setIsBreakEndSet(false);
          setIsEndTimeSet(false);
          setIsTimesheetLocked(false);
        }
      } catch (err) {
        console.error('Error fetching timesheet job:', err);
        setStartTime('');
        setEndTime('');
        setLunchStartTime('');
        setLunchEndTime('');
        setTimesheetJobId(null);
        setTimesheetId(null);
        setHourlyRate(null);
        setTotalHours(null);
        setTotalPay(null);
        setIsStartTimeSet(false);
        setIsBreakStartSet(false);
        setIsBreakEndSet(false);
        setIsEndTimeSet(false);
        setIsTimesheetLocked(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTimesheetJob();
  }, [selectedBooking?.id, selectedDate]);

  const hasBookingStarted = (booking: Booking): boolean => {
    const now = new Date();

    const bookingDateObj = new Date(booking.booking_date as any);
    const [startHour, startMinute] = booking.booking_start_time.split(':').map(Number);
    const bookingStartDateTime = new Date(
      bookingDateObj.getFullYear(),
      bookingDateObj.getMonth(),
      bookingDateObj.getDate(),
      startHour,
      startMinute,
      0,
      0
    );

    const unlockDateTime = new Date(
      bookingStartDateTime.getTime() - TIMESHEET_UNLOCK_BUFFER_MINUTES * 60 * 1000
    );

    return now >= unlockDateTime;
  };

  const isBookingCompleted = (booking: Booking): boolean => {
    const now = new Date();

    const bookingDateObj = new Date(booking.booking_date as any);
    const [endHour, endMinute] = booking.booking_end_time.split(':').map(Number);
    const bookingEndDateTime = new Date(
      bookingDateObj.getFullYear(),
      bookingDateObj.getMonth(),
      bookingDateObj.getDate(),
      endHour,
      endMinute,
      0,
      0
    );

    return now >= bookingEndDateTime;
  };

  const getAuthToken = () => {
    return localStorage.getItem('token') || '';
  };

  const timeToMinutes = (time: string): number => {
    if (!time) return -1;
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const validateTimeOrder = (
    start: string,
    lunchStart: string,
    lunchEnd: string,
    end: string
  ): string | null => {
    const startMinutes = timeToMinutes(start);
    const lunchStartMinutes = timeToMinutes(lunchStart);
    const lunchEndMinutes = timeToMinutes(lunchEnd);
    const endMinutes = timeToMinutes(end);

    if (start && lunchStart && startMinutes >= lunchStartMinutes) {
      return 'Lunch start time must be after start time';
    }

    if (lunchStart && lunchEnd && lunchStartMinutes >= lunchEndMinutes) {
      return 'Lunch end time must be after lunch start time';
    }

    if (lunchEnd && end && lunchEndMinutes >= endMinutes) {
      return 'End time must be after lunch end time';
    }

    if (start && end && !lunchStart && !lunchEnd && startMinutes >= endMinutes) {
      return 'End time must be after start time';
    }

    return null;
  };

  const calculateTotalHours = (
    start: string,
    end: string,
    lunchStart: string,
    lunchEnd: string
  ): number | null => {
    if (!start || !end) return null;

    const startMinutes = timeToMinutes(start);
    const endMinutes = timeToMinutes(end);

    if (startMinutes < 0 || endMinutes < 0) return null;

    let totalMinutes = endMinutes - startMinutes;

    if (lunchStart && lunchEnd) {
      const lunchStartMinutes = timeToMinutes(lunchStart);
      const lunchEndMinutes = timeToMinutes(lunchEnd);

      if (lunchStartMinutes >= 0 && lunchEndMinutes >= 0) {
        const lunchDuration = lunchEndMinutes - lunchStartMinutes;
        totalMinutes -= lunchDuration;
      }
    }

    return totalMinutes / 60;
  };

  const handleSetStartTimeNow = () => {
    if (isTimesheetLocked) return;

    const now = new Date();
    const timeString = now.toTimeString().substring(0, 5);
    setStartTime(timeString);
    setIsStartTimeSet(false);

    const validationError = validateTimeOrder(timeString, lunchStartTime, lunchEndTime, endTime);
    setTimeValidationError(validationError);
  };

  const handleStartClick = async () => {
    // If already set, reset it
    if (isStartTimeSet) {
      setIsStartTimeSet(false);
      return;
    }

    if (!selectedBooking || !startTime || isTimesheetLocked) return;

    setIsLoading(true);
    setError(null);

    try {
      const token = getAuthToken();
      const [hours, minutes] = startTime.split(':').map(Number);

      const bookingDate = new Date(selectedBooking.booking_date as any);
      const combinedDateTime = new Date(
        bookingDate.getFullYear(),
        bookingDate.getMonth(),
        bookingDate.getDate(),
        hours,
        minutes,
        0
      );

      let jobId = timesheetJobId;
      let tsId = timesheetId;

      if (!jobId) {
        const addJobResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/timesheet/add-job-to-timesheet`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            bookingId: selectedBooking.id
          })
        });

        if (!addJobResponse.ok) {
          const errorData = await addJobResponse.json();
          throw new Error(errorData.error || 'Failed to create timesheet for job');
        }

        const addJobData = await addJobResponse.json();
        jobId = addJobData.data.timesheetJobId;
        tsId = addJobData.data.timesheetId;

        setTimesheetJobId(jobId);
        setTimesheetId(tsId);

        if (addJobData.data.hourlyRate !== undefined) {
          setHourlyRate(addJobData.data.hourlyRate);
        }
      }

      const updateResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/timesheet/update-job-times`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          timesheetJobId: jobId,
          startTime: combinedDateTime.toISOString()
        })
      });

      if (!updateResponse.ok) {
        const errorData = await updateResponse.json();
        throw new Error(errorData.error || 'Failed to set start time');
      }

      const updateData = await updateResponse.json();

      setSuccess('Start time recorded successfully!');
      setIsStartTimeSet(true);
    } catch (err: any) {
      setError(err.message || 'Failed to record start time');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetEndTimeNow = () => {
    if (isTimesheetLocked) return;

    const now = new Date();
    const timeString = now.toTimeString().substring(0, 5);

    setEndTime(timeString);
    setIsEndTimeSet(false);

    const validationError = validateTimeOrder(startTime, lunchStartTime, lunchEndTime, timeString);
    setTimeValidationError(validationError);
  };

  const handleEndClick = async () => {
    // If already set, reset it
    if (isEndTimeSet) {
      setIsEndTimeSet(false);
      return;
    }

    if (!timesheetJobId || !selectedBooking || !endTime || isTimesheetLocked) return;

    setIsLoading(true);
    setError(null);

    try {
      const token = getAuthToken();
      const [hours, minutes] = endTime.split(':').map(Number);

      const bookingDate = new Date(selectedBooking.booking_date as any);
      const combinedDateTime = new Date(
        bookingDate.getFullYear(),
        bookingDate.getMonth(),
        bookingDate.getDate(),
        hours,
        minutes,
        0
      );

      const updateResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/timesheet/update-job-times`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          timesheetJobId: timesheetJobId,
          endTime: combinedDateTime.toISOString()
        })
      });

      if (!updateResponse.ok) {
        const errorData = await updateResponse.json();
        throw new Error(errorData.error || 'Failed to set end time');
      }

      const updateData = await updateResponse.json();

      if (updateData.data && updateData.data.job) {
        setTotalHours(updateData.data.job.totalHours || null);
        setTotalPay(updateData.data.job.totalPay || null);
        setHourlyRate(updateData.data.job.hourlyRate || null);
      }

      const hoursText = updateData.data?.job?.totalHours
        ? ` Total Hours: ${updateData.data.job.totalHours.toFixed(2)}h`
        : '';
      const payText = updateData.data?.job?.totalPay
        ? `, Total Pay: £${updateData.data.job.totalPay.toFixed(2)}`
        : '';

      setSuccess(`End time recorded successfully!${hoursText}${payText} Click "Submit" to continue.`);
      setIsEndTimeSet(true);
      setTimeValidationError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to record end time');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetLunchStartTimeNow = () => {
    if (isTimesheetLocked) return;

    const now = new Date();
    const timeString = now.toTimeString().substring(0, 5);
    setLunchStartTime(timeString);
    setIsBreakStartSet(false);

    // Validate time order
    const validationError = validateTimeOrder(startTime, timeString, lunchEndTime, endTime);
    setTimeValidationError(validationError);
  };

  const handleLunchStartClick = async () => {
    // If already set, reset it
    if (isBreakStartSet) {
      setIsBreakStartSet(false);
      return;
    }

    if (!timesheetJobId || !selectedBooking || !lunchStartTime || isTimesheetLocked) return;

    setIsLoading(true);
    setError(null);

    try {
      const token = getAuthToken();
      const [hours, minutes] = lunchStartTime.split(':').map(Number);

      const bookingDate = new Date(selectedBooking.booking_date as any);
      const combinedDateTime = new Date(
        bookingDate.getFullYear(),
        bookingDate.getMonth(),
        bookingDate.getDate(),
        hours,
        minutes,
        0
      );

      const updateResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/timesheet/update-job-times`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          timesheetJobId: timesheetJobId,
          lunchStartTime: combinedDateTime.toISOString()
        })
      });

      if (!updateResponse.ok) {
        const errorData = await updateResponse.json();
        throw new Error(errorData.error || 'Failed to set lunch start time');
      }

      setSuccess('Lunch start time recorded successfully!');
      setIsBreakStartSet(true);
    } catch (err: any) {
      setError(err.message || 'Failed to record lunch start time');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetLunchEndTimeNow = () => {
    if (isTimesheetLocked) return;

    const now = new Date();
    const timeString = now.toTimeString().substring(0, 5);
    setLunchEndTime(timeString);
    setIsBreakEndSet(false);

    const validationError = validateTimeOrder(startTime, lunchStartTime, timeString, endTime);
    setTimeValidationError(validationError);
  };

  const handleLunchEndClick = async () => {
    // If already set, reset it
    if (isBreakEndSet) {
      setIsBreakEndSet(false);
      return;
    }

    if (!timesheetJobId || !selectedBooking || !lunchEndTime || isTimesheetLocked) return;

    setIsLoading(true);
    setError(null);

    try {
      const token = getAuthToken();
      const [hours, minutes] = lunchEndTime.split(':').map(Number);

      const bookingDate = new Date(selectedBooking.booking_date as any);
      const combinedDateTime = new Date(
        bookingDate.getFullYear(),
        bookingDate.getMonth(),
        bookingDate.getDate(),
        hours,
        minutes,
        0
      );

      const updateResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/timesheet/update-job-times`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          timesheetJobId: timesheetJobId,
          lunchEndTime: combinedDateTime.toISOString()
        })
      });

      if (!updateResponse.ok) {
        const errorData = await updateResponse.json();
        throw new Error(errorData.error || 'Failed to set lunch end time');
      }

      const updateData = await updateResponse.json();

      if (updateData.data && updateData.data.job) {
        if (updateData.data.job.totalHours !== null) {
          setTotalHours(updateData.data.job.totalHours);
        }
        if (updateData.data.job.totalPay !== null) {
          setTotalPay(updateData.data.job.totalPay);
        }
      }

      setSuccess('Lunch end time recorded successfully! Totals updated.');
      setIsBreakEndSet(true);
    } catch (err: any) {
      setError(err.message || 'Failed to record lunch end time');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinalizeClick = () => {
    if (!timesheetId || isTimesheetLocked) return;

    setIsTimesheetLocked(true);
    setSuccess('Timesheet locked. Complete your signature to finish.');
    setShowSignatureModal(true);
  };

  return (
    <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg p-3 sm:p-4 md:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-3 sm:mb-4 sticky top-0 bg-white pb-2 border-b">
          <h3 className="text-base sm:text-lg font-semibold">
            Bookings for {selectedDate ? new Date(selectedDate).toLocaleDateString() : ''}
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl ml-2">
            ×
          </button>
        </div>

        {lockedClickAttempt && (
          <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-red-50 border border-red-200 rounded-lg animate-pulse">
            <p className="text-xs sm:text-sm text-red-700 flex items-start gap-2">
              <span className="flex-shrink-0">🔒</span>
              <span><strong>This booking is locked.</strong> Bookings unlock 30 minutes before the scheduled start time.</span>
            </p>
          </div>
        )}

        {bookings.length > 0 && bookings.every(b => !hasBookingStarted(b)) && (
          <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <p className="text-xs sm:text-sm text-orange-700 flex items-start gap-2">
              <span className="flex-shrink-0">⚠️</span>
              <span><strong>All bookings for this date are locked.</strong> Timesheets unlock 30 minutes before the job start time.</span>
            </p>
          </div>
        )}

        <div className="space-y-4">
          {bookings.length > 0 ? (
            <div className="space-y-3">
              {bookings.map((booking) => {
                const hasStarted = hasBookingStarted(booking);
                const isCompleted = isBookingCompleted(booking);
                const canSelect = hasStarted;

                return (
                  <div
                    key={booking.id}
                    className={`p-2 sm:p-3 md:p-4 border-2 rounded-lg transition-all duration-200 ${!canSelect
                        ? 'border-gray-300 bg-gray-100 opacity-60 cursor-not-allowed'
                        : selectedBooking?.id === booking.id
                          ? 'border-[#C3EAE7] bg-[#C3EAE7]/20 shadow-md ring-2 ring-[#C3EAE7]/30'
                          : 'border-blue-200 bg-blue-50 hover:bg-blue-100 hover:border-blue-300 cursor-pointer'
                      }`}
                    onClick={() => {
                      if (canSelect) {
                        onBookingSelect(booking);
                        setLockedClickAttempt(false);
                      } else {
                        setLockedClickAttempt(true);
                        setTimeout(() => setLockedClickAttempt(false), 3000);
                      }
                    }}
                  >
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm sm:text-base font-medium text-gray-900">{booking.location}</h4>
                        </div>
                        <div className="mt-1 text-xs sm:text-sm text-gray-600">
                          <p>Time: {booking.booking_start_time} - {booking.booking_end_time}</p>
                          {booking.description && (
                            <p className="mt-1 line-clamp-2">{booking.description}</p>
                          )}
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-[10px] sm:text-xs ${booking.status === 'CONFIRMED'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                            }`}>
                            {booking.status}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-[10px] sm:text-xs ${isCompleted
                            ? 'bg-gray-100 text-gray-700'
                            : hasStarted
                              ? 'bg-green-100 text-green-700'
                              : 'bg-orange-100 text-orange-700'
                            }`}>
                            {isCompleted ? '✓ Completed' : hasStarted ? '✅ Can Fill' : '⏳ Upcoming'}
                          </span>
                          {!canSelect && (
                            <span className="px-2 py-1 rounded-full text-[10px] sm:text-xs bg-red-100 text-red-800 flex items-center gap-1">
                              🔒 <span className="hidden sm:inline">Locked (Not Started)</span><span className="sm:hidden">Locked</span>
                            </span>
                          )}
                          <span className="text-[10px] sm:text-xs text-gray-500 hidden md:inline">
                            Created: {booking.createdAt ? new Date(booking.createdAt).toLocaleDateString() : 'N/A'}
                          </span>
                        </div>
                      </div>
                      <div className="text-left sm:text-right">
                        <span className="text-xs sm:text-sm font-medium text-gray-900">
                          Rate TBD
                        </span>
                      </div>
                    </div>

                    {selectedBooking?.id === booking.id && (
                      <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-[#C3EAE7] bg-white rounded-lg p-2 sm:p-3">
                        <div className="flex items-center justify-between mb-2 sm:mb-3">
                          <h5 className="text-xs sm:text-sm font-semibold text-gray-900">Time Tracking</h5>
                          <div className="text-[10px] sm:text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                            Active
                          </div>
                        </div>

                        {isLoading && (
                          <div className="mb-2 sm:mb-3 flex items-center text-blue-600">
                            <div className="animate-spin inline-block w-3 h-3 sm:w-4 sm:h-4 border-2 border-blue-600 border-t-transparent rounded-full mr-2"></div>
                            <span className="text-xs sm:text-sm">Loading timesheet data...</span>
                          </div>
                        )}

                        <div className="mb-2 sm:mb-3 p-2 bg-cyan-50 border border-cyan-200 rounded-lg">
                          <p className="text-[10px] sm:text-xs text-cyan-800">
                            <strong>💡 Hours Calculation:</strong> Total hours = End time - Start time.
                            If <strong>both</strong> lunch break times are entered, the lunch duration will be deducted.
                            If only one lunch time is entered, it will be ignored.
                          </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                          <div>
                            <label className="block text-[10px] sm:text-xs font-medium text-gray-700 mb-1">Start Time</label>
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1">
                              <input
                                type="time"
                                value={startTime}
                                onChange={(e) => {
                                  setStartTime(e.target.value);
                                  setIsStartTimeSet(false);
                                  const validationError = validateTimeOrder(e.target.value, lunchStartTime, lunchEndTime, endTime);
                                  setTimeValidationError(validationError);
                                }}
                                placeholder="--:--"
                                disabled={isTimesheetLocked || isStartTimeSet}
                                className="flex-1 px-2 py-1.5 sm:py-1 text-xs sm:text-sm border border-gray-300 rounded bg-white disabled:bg-gray-100"
                              />
                              <div className="flex gap-1">
                                <button
                                  onClick={handleSetStartTimeNow}
                                  disabled={isTimesheetLocked || isLoading || isStartTimeSet}
                                  className={`flex-1 sm:flex-none px-2 py-1.5 sm:py-1 text-[10px] sm:text-xs font-medium rounded transition-colors ${isTimesheetLocked || isLoading || isStartTimeSet
                                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                    }`}
                                  title="Set to current time"
                                >
                                  Now
                                </button>
                                <button
                                  onClick={handleStartClick}
                                  disabled={(!startTime && !isStartTimeSet) || (!!timeValidationError && !isStartTimeSet) || isTimesheetLocked || isLoading}
                                  className={`flex-1 sm:flex-none px-3 py-1.5 sm:py-1 text-[10px] sm:text-xs font-medium rounded transition-colors ${(!startTime && !isStartTimeSet) || (!!timeValidationError && !isStartTimeSet) || isTimesheetLocked || isLoading
                                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                      : isStartTimeSet
                                        ? 'bg-orange-500 text-white hover:bg-orange-600'
                                        : 'bg-[#C3EAE7] text-black hover:bg-[#A9DBD9]'
                                    }`}
                                >
                                  {isStartTimeSet ? 'Reset' : 'Set'}
                                </button>
                              </div>
                            </div>
                          </div>

                          <div>
                            <label className="block text-[10px] sm:text-xs font-medium text-gray-700 mb-1">End Time</label>
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1">
                              <input
                                type="time"
                                value={endTime}
                                onChange={(e) => {
                                  const newEndTime = e.target.value;
                                  setEndTime(newEndTime);
                                  setIsEndTimeSet(false);
                                  const validationError = validateTimeOrder(startTime, lunchStartTime, lunchEndTime, newEndTime);
                                  setTimeValidationError(validationError);
                                }}
                                placeholder="--:--"
                                disabled={!timesheetJobId || isTimesheetLocked || isEndTimeSet}
                                className="flex-1 px-2 py-1.5 sm:py-1 text-xs sm:text-sm border border-gray-300 rounded bg-white disabled:bg-gray-100"
                              />
                              <div className="flex gap-1">
                                <button
                                  onClick={handleSetEndTimeNow}
                                  disabled={!isStartTimeSet || isTimesheetLocked || isLoading || isEndTimeSet}
                                  className={`flex-1 sm:flex-none px-2 py-1.5 sm:py-1 text-[10px] sm:text-xs font-medium rounded transition-colors ${!isStartTimeSet || isTimesheetLocked || isLoading || isEndTimeSet
                                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                    }`}
                                  title="Set to current time"
                                >
                                  Now
                                </button>
                                <button
                                  onClick={handleEndClick}
                                  disabled={
                                    (!isStartTimeSet && !isEndTimeSet) ||
                                    (!endTime && !isEndTimeSet) ||
                                    (!!timeValidationError && !isEndTimeSet) ||
                                    isTimesheetLocked ||
                                    isLoading
                                  }
                                  className={`flex-1 sm:flex-none px-3 py-1.5 sm:py-1 text-[10px] sm:text-xs font-medium rounded transition-colors ${(!isStartTimeSet && !isEndTimeSet) ||
                                      (!endTime && !isEndTimeSet) ||
                                      (!!timeValidationError && !isEndTimeSet) ||
                                      isTimesheetLocked ||
                                      isLoading
                                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                      : isEndTimeSet
                                        ? 'bg-orange-500 text-white hover:bg-orange-600'
                                        : 'bg-[#C3EAE7] text-black hover:bg-[#A9DBD9]'
                                    }`}
                                >
                                  {isEndTimeSet ? 'Reset' : 'Set'}
                                </button>
                              </div>
                            </div>
                          </div>

                          <div>
                            <label className="block text-[10px] sm:text-xs font-medium text-gray-700 mb-1">Break Start</label>
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1">
                              <input
                                type="time"
                                value={lunchStartTime}
                                onChange={(e) => {
                                  setLunchStartTime(e.target.value);
                                  setIsBreakStartSet(false);
                                  const validationError = validateTimeOrder(startTime, e.target.value, lunchEndTime, endTime);
                                  setTimeValidationError(validationError);
                                }}
                                placeholder="--:--"
                                disabled={!timesheetJobId || isTimesheetLocked || isBreakStartSet}
                                className="flex-1 px-2 py-1.5 sm:py-1 text-xs sm:text-sm border border-gray-300 rounded bg-white disabled:bg-gray-100"
                              />
                              <div className="flex gap-1">
                                <button
                                  onClick={handleSetLunchStartTimeNow}
                                  disabled={
                                    !isStartTimeSet ||
                                    !timesheetJobId ||
                                    isTimesheetLocked ||
                                    isLoading ||
                                    isBreakStartSet
                                  }
                                  className={`flex-1 sm:flex-none px-2 py-1.5 sm:py-1 text-[10px] sm:text-xs font-medium rounded transition-colors ${!isStartTimeSet ||
                                      !timesheetJobId ||
                                      isTimesheetLocked ||
                                      isLoading ||
                                      isBreakStartSet
                                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                    }`}
                                  title="Set to current time"
                                >
                                  Now
                                </button>
                                <button
                                  onClick={handleLunchStartClick}
                                  disabled={
                                    (!isStartTimeSet && !isBreakStartSet) ||
                                    (!timesheetJobId && !isBreakStartSet) ||
                                    (!lunchStartTime && !isBreakStartSet) ||
                                    (!!timeValidationError && !isBreakStartSet) ||
                                    isTimesheetLocked ||
                                    isLoading
                                  }
                                  className={`flex-1 sm:flex-none px-3 py-1.5 sm:py-1 text-[10px] sm:text-xs font-medium rounded transition-colors ${(!isStartTimeSet && !isBreakStartSet) ||
                                      (!timesheetJobId && !isBreakStartSet) ||
                                      (!lunchStartTime && !isBreakStartSet) ||
                                      (!!timeValidationError && !isBreakStartSet) ||
                                      isTimesheetLocked ||
                                      isLoading
                                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                      : isBreakStartSet
                                        ? 'bg-orange-500 text-white hover:bg-orange-600'
                                        : 'bg-[#C3EAE7] text-black hover:bg-[#A9DBD9]'
                                    }`}
                                >
                                  {isBreakStartSet ? 'Reset' : 'Set'}
                                </button>
                              </div>
                            </div>
                          </div>

                          <div>
                            <label className="block text-[10px] sm:text-xs font-medium text-gray-700 mb-1">Break End</label>
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1">
                              <input
                                type="time"
                                value={lunchEndTime}
                                onChange={(e) => {
                                  setLunchEndTime(e.target.value);
                                  setIsBreakEndSet(false);
                                  const validationError = validateTimeOrder(startTime, lunchStartTime, e.target.value, endTime);
                                  setTimeValidationError(validationError);
                                }}
                                placeholder="--:--"
                                disabled={!timesheetJobId || isTimesheetLocked || isBreakEndSet}
                                className="flex-1 px-2 py-1.5 sm:py-1 text-xs sm:text-sm border border-gray-300 rounded bg-white disabled:bg-gray-100"
                              />
                              <div className="flex gap-1">
                                <button
                                  onClick={handleSetLunchEndTimeNow}
                                  disabled={
                                    !isStartTimeSet ||
                                    !timesheetJobId ||
                                    isTimesheetLocked ||
                                    isLoading ||
                                    isBreakEndSet
                                  }
                                  className={`flex-1 sm:flex-none px-2 py-1.5 sm:py-1 text-[10px] sm:text-xs font-medium rounded transition-colors ${!isStartTimeSet ||
                                      !timesheetJobId ||
                                      isTimesheetLocked ||
                                      isLoading ||
                                      isBreakEndSet
                                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                    }`}
                                  title="Set to current time"
                                >
                                  Now
                                </button>
                                <button
                                  onClick={handleLunchEndClick}
                                  disabled={
                                    (!isStartTimeSet && !isBreakEndSet) ||
                                    (!timesheetJobId && !isBreakEndSet) ||
                                    (!lunchEndTime && !isBreakEndSet) ||
                                    (!!timeValidationError && !isBreakEndSet) ||
                                    isTimesheetLocked ||
                                    isLoading
                                  }
                                  className={`flex-1 sm:flex-none px-3 py-1.5 sm:py-1 text-[10px] sm:text-xs font-medium rounded transition-colors ${(!isStartTimeSet && !isBreakEndSet) ||
                                      (!timesheetJobId && !isBreakEndSet) ||
                                      (!lunchEndTime && !isBreakEndSet) ||
                                      (!!timeValidationError && !isBreakEndSet) ||
                                      isTimesheetLocked ||
                                      isLoading
                                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                      : isBreakEndSet
                                        ? 'bg-orange-500 text-white hover:bg-orange-600'
                                        : 'bg-[#C3EAE7] text-black hover:bg-[#A9DBD9]'
                                    }`}
                                >
                                  {isBreakEndSet ? 'Reset' : 'Set'}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {timeValidationError && (
                          <div className="mt-2 sm:mt-3 p-2 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-[10px] sm:text-xs text-red-700 flex items-start gap-1">
                              <span className="flex-shrink-0">⚠️</span>
                              <span>{timeValidationError}</span>
                            </p>
                          </div>
                        )}

                        {(() => {
                          const calculatedHours = calculateTotalHours(startTime, endTime, lunchStartTime, lunchEndTime);
                          const hasIncompleteLunchBreak = (lunchStartTime && !lunchEndTime) || (!lunchStartTime && lunchEndTime);

                          if (calculatedHours !== null && !timeValidationError) {
                            return (
                              <div className="mt-2 sm:mt-3 p-2 bg-purple-50 border border-purple-200 rounded-lg">
                                <h6 className="text-[10px] sm:text-xs font-semibold text-purple-900 mb-1">Hours Preview</h6>
                                <div className="space-y-1">
                                  <div className="flex justify-between text-[10px] sm:text-xs">
                                    <span className="text-purple-700">Estimated Total Hours:</span>
                                    <span className="font-medium text-purple-900">{calculatedHours.toFixed(2)} hours</span>
                                  </div>
                                  {lunchStartTime && lunchEndTime && (
                                    <div className="flex justify-between text-[10px] sm:text-xs">
                                      <span className="text-purple-700">Lunch Break:</span>
                                      <span className="font-medium text-purple-900">
                                        {((timeToMinutes(lunchEndTime) - timeToMinutes(lunchStartTime)) / 60).toFixed(2)} hours deducted
                                      </span>
                                    </div>
                                  )}
                                  {hasIncompleteLunchBreak && (
                                    <p className="text-[9px] sm:text-xs text-orange-600 italic mt-1 flex items-start gap-1">
                                      <span className="flex-shrink-0">ℹ️</span>
                                      <span>Only one lunch time entered - lunch break ignored in calculation</span>
                                    </p>
                                  )}
                                  {hourlyRate && (
                                    <div className="flex justify-between text-[10px] sm:text-xs pt-1 border-t border-purple-200">
                                      <span className="text-purple-700 font-semibold">Estimated Pay:</span>
                                      <span className="font-bold text-green-700">£{(calculatedHours * hourlyRate).toFixed(2)}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          }
                          return null;
                        })()}

                        {timesheetJobId && isEndTimeSet && (
                          <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row sm:items-center gap-2">
                            {!isTimesheetLocked ? (
                              <button
                                onClick={handleFinalizeClick}
                                disabled={isLoading || !!timeValidationError}
                                className={`w-full sm:w-auto px-4 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors ${isLoading || !!timeValidationError
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-emerald-500 text-white hover:bg-emerald-600'
                                  }`}
                              >
                                Submit
                              </button>
                            ) : (
                              <button
                                onClick={() => setShowSignatureModal(true)}
                                className="w-full sm:w-auto px-4 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors bg-[#C3EAE7] text-black hover:bg-[#A9DBD9]"
                              >
                                Open Signature
                              </button>
                            )}
                          </div>
                        )}

                        <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-200">
                          <div className="flex items-center gap-2 mb-1 sm:mb-2">
                            <div className="w-2 h-2 bg-[#C3EAE7] rounded-full"></div>
                            <p className="text-[10px] sm:text-xs font-medium text-gray-900">Current Booking</p>
                          </div>
                          <p className="text-[10px] sm:text-xs text-gray-700 mb-1">
                            <span className="font-medium">Scheduled:</span> {booking.booking_start_time} - {booking.booking_end_time}
                          </p>
                          <p className="text-[10px] sm:text-xs text-gray-700">
                            <span className="font-medium">Date:</span> {new Date(booking.booking_date as any).toLocaleDateString()}
                          </p>
                          {timesheetJobId && (
                            <div className="mt-2 pt-2 border-t border-gray-200">
                              <p className="text-[10px] sm:text-xs text-green-600 flex items-start gap-1">
                                <span className="flex-shrink-0">✓</span>
                                <span>Timesheet job created - ID: {timesheetJobId.substring(0, 8)}...</span>
                              </p>
                            </div>
                          )}
                        </div>

                        {hourlyRate !== null && (
                          <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-200 bg-blue-50 p-2 rounded">
                            <h6 className="text-[10px] sm:text-xs font-semibold text-blue-900 mb-1">Payment Details</h6>
                            <div className="space-y-1">
                              <div className="flex justify-between text-[10px] sm:text-xs">
                                <span className="text-blue-700">Hourly Rate:</span>
                                <span className="font-medium text-blue-900">£{hourlyRate.toFixed(2)}/hour</span>
                              </div>
                              {totalHours !== null && (
                                <div className="flex justify-between text-[10px] sm:text-xs">
                                  <span className="text-blue-700">Total Hours:</span>
                                  <span className="font-medium text-blue-900">{totalHours.toFixed(2)} hours</span>
                                </div>
                              )}
                              {totalPay !== null && (
                                <div className="flex justify-between text-[10px] sm:text-xs pt-1 border-t border-blue-200">
                                  <span className="text-blue-700 font-semibold">Total Pay:</span>
                                  <span className="font-bold text-green-700">£{totalPay.toFixed(2)}</span>
                                </div>
                              )}
                              {totalHours === null && (
                                <p className="text-[9px] sm:text-xs text-blue-600 italic mt-1">
                                  ⏳ Total hours and pay will be calculated when end time is recorded
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
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

        {error && (
          <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-xs sm:text-sm text-red-700"> {error}</p>
          </div>
        )}

        {success && (
          <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-xs sm:text-sm text-green-700"> {success}</p>
          </div>
        )}


        {!selectedBooking && bookings.length > 0 && (
          <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start gap-2 mb-2">
              <div className="text-blue-600 flex-shrink-0">ℹ️</div>
              <h4 className="text-xs sm:text-sm font-medium text-blue-900">No Booking Selected</h4>
            </div>
            <p className="text-xs sm:text-sm text-blue-700 mb-2">
              Click on any unlocked booking to begin time tracking.
            </p>
            <div className="text-[10px] sm:text-xs text-blue-600 bg-blue-100 p-2 rounded">
              <strong>Important:</strong> Bookings remain locked until 30 minutes before their scheduled start time. Once you are within that window you can select the booking and fill in your timesheet with your actual work hours.
            </div>
          </div>
        )}

      </div>

      {showSignatureModal && timesheetId && (
        <SignatureModal
          timesheetId={timesheetId}
          bookingDate={selectedDate}
          startTime={startTime}
          endTime={endTime}
          lunchStartTime={lunchStartTime}
          lunchEndTime={lunchEndTime}
          onClose={() => setShowSignatureModal(false)}
          onSubmit={() => {
            setShowSignatureModal(false);
            setSuccess('Timesheet submitted successfully!');
            onUpdate();
          }}
        />
      )}
    </div>
  );
};

interface SignatureModalProps {
  timesheetId: string;
  onClose: () => void;
  onSubmit: () => void;
  bookingDate?: string;
  startTime?: string;
  endTime?: string;
  lunchStartTime?: string;
  lunchEndTime?: string;
}

const SignatureModal: React.FC<SignatureModalProps> = ({
  timesheetId,
  onClose,
  onSubmit,
  bookingDate,
  startTime,
  endTime,
  lunchStartTime,
  lunchEndTime
}) => {
  const staffSignatureRef = useRef<SignatureCanvas>(null);
  const managerSignatureRef = useRef<SignatureCanvas>(null);
  const [managerId, setManagerId] = useState('');
  const [rating, setRating] = useState(0);
  const [remark, setRemark] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [uploadProgress, setUploadProgress] = useState<Map<string, UploadProgressType>>(new Map());
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const getAuthToken = () => {
    return localStorage.getItem('token') || '';
  };

  const clearStaffSignature = () => {
    staffSignatureRef.current?.clear();
  };

  const clearManagerSignature = () => {
    managerSignatureRef.current?.clear();
  };

  const uploadSignatureImage = async (signatureDataUrl: string, signatureType: 'staff' | 'manager'): Promise<string> => {
    const blob = await fetch(signatureDataUrl).then(r => r.blob());
    const file = new File([blob], `${signatureType}_signature.png`, { type: 'image/png' });

    const fileId = `${signatureType}_signature_${Date.now()}`;
    const filePath = `${timesheetId}/signature_${signatureType}`;

    try {
      const result = await uploadService.uploadFile(file, fileId, timesheetId, `signature_${signatureType}`, {
        maxRetries: 3,
        retryDelay: 2000,
        timeout: 30000,
        onProgress: (progress) => {
          setUploadProgress(prev => new Map(prev.set(progress.fileId, progress)));
        }
      });

      return result.url;
    } catch (error) {
      throw new Error(`Failed to upload ${signatureType} signature: ${(error as Error).message}`);
    }
  };

  const handleSubmit = async () => {
    if (!staffSignatureRef.current || staffSignatureRef.current.isEmpty()) {
      setError('Staff signature is required');
      return;
    }

    if (isUploading) return;

    setIsLoading(true);
    setIsUploading(true);
    setError(null);
    setUploadProgress(new Map());

    try {
      const token = getAuthToken();

      const staffSignatureDataUrl = staffSignatureRef.current.toDataURL();

      const staffSignatureUrl = await uploadSignatureImage(staffSignatureDataUrl, 'staff');

      const submitResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/timesheet/submit-timesheet`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          timesheetId: timesheetId,
          staffSignature: staffSignatureUrl,
          rating: rating,
          remark: remark
        })
      });

      if (!submitResponse.ok) {
        const errorData = await submitResponse.json();
        throw new Error(errorData.error || 'Failed to submit timesheet');
      }

      // Get the submitted job IDs from the response
      const submitData = await submitResponse.json();
      const newlySubmittedJobIds = submitData.data?.newlySubmittedJobIds || [];

      // If manager signature is provided, approve each newly submitted job
      if (managerSignatureRef.current && !managerSignatureRef.current.isEmpty() && managerId.trim() && newlySubmittedJobIds.length > 0) {
        const managerSignatureDataUrl = managerSignatureRef.current.toDataURL();
        const managerSignatureUrl = await uploadSignatureImage(managerSignatureDataUrl, 'manager');

        // Approve each newly submitted job individually
        console.log('Approving jobs with manager signature:', {
          jobIds: newlySubmittedJobIds,
          managerId: managerId,
          managerSignatureUrl: managerSignatureUrl
        });

        for (const jobId of newlySubmittedJobIds) {
          console.log(`Approving job ${jobId}...`);
          const approveResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/timesheet/approve-timesheet`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              timesheetJobId: jobId,
              managerSignature: managerSignatureUrl,
              managerId: managerId,
              action: 'approve'
            })
          });

          if (!approveResponse.ok) {
            const errorData = await approveResponse.json();
            console.error(`Failed to add manager signature for job ${jobId}:`, errorData);
            console.warn(`Manager approval failed but timesheet was submitted. Error: ${errorData.error || 'Unknown error'}`);
          } else {
            const approveData = await approveResponse.json();
            console.log(`Successfully approved job ${jobId}:`, approveData);
          }
        }
      }

      await Swal.fire({
        title: 'Success!',
        text: 'Timesheet submitted successfully!',
        icon: 'success',
        confirmButtonText: 'OK',
        confirmButtonColor: '#10B981'
      });

      onClose();
      onSubmit();
    } catch (err: any) {
      setError(err.message || 'Failed to submit timesheet');
    } finally {
      setIsLoading(false);
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-[60] p-2 sm:p-4">
      <div className="bg-white rounded-lg p-3 sm:p-4 md:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Submit Timesheet</h3>

        {bookingDate && (
          <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg">
            <h4 className="text-xs sm:text-sm font-semibold text-blue-900 mb-2 sm:mb-3 flex items-center gap-2">
              <span>📅</span>
              <span>Timesheet Summary</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              <div className="bg-white p-2 rounded border border-blue-100">
                <p className="text-[10px] sm:text-xs text-gray-600 mb-1">Date</p>
                <p className="text-xs sm:text-sm font-semibold text-gray-900">
                  {new Date(bookingDate).toLocaleDateString('en-US', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </p>
              </div>
              {startTime && (
                <div className="bg-white p-2 rounded border border-blue-100">
                  <p className="text-[10px] sm:text-xs text-gray-600 mb-1">Start Time</p>
                  <p className="text-xs sm:text-sm font-semibold text-gray-900">{startTime}</p>
                </div>
              )}
              {endTime && (
                <div className="bg-white p-2 rounded border border-blue-100">
                  <p className="text-[10px] sm:text-xs text-gray-600 mb-1">End Time</p>
                  <p className="text-xs sm:text-sm font-semibold text-gray-900">{endTime}</p>
                </div>
              )}
              {lunchStartTime && lunchEndTime && (
                <div className="bg-white p-2 rounded border border-blue-100">
                  <p className="text-[10px] sm:text-xs text-gray-600 mb-1">Lunch Break</p>
                  <p className="text-xs sm:text-sm font-semibold text-gray-900">
                    {lunchStartTime} - {lunchEndTime}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {error && (
          <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-xs sm:text-sm text-red-700">❌ {error}</p>
          </div>
        )}

        <div className="space-y-3 sm:space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs sm:text-sm font-medium text-gray-700">
                Staff Signature <span className="text-red-500">*</span>
              </label>
              <button
                onClick={clearStaffSignature}
                className="text-[10px] sm:text-xs text-blue-600 hover:text-blue-800"
                disabled={isLoading}
              >
                Clear
              </button>
            </div>
            <div className="border-2 border-gray-300 rounded-lg bg-white">
              <SignatureCanvas
                ref={staffSignatureRef}
                canvasProps={{
                  className: 'w-full h-32 sm:h-40 cursor-crosshair',
                }}
                backgroundColor="rgb(255, 255, 255)"
              />
            </div>
            <p className="text-[10px] sm:text-xs text-gray-500 mt-1">Draw your signature above</p>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs sm:text-sm font-medium text-gray-700">
                Manager Signature <span className="text-gray-400 text-[10px] sm:text-xs"></span>
              </label>
              <button
                onClick={clearManagerSignature}
                className="text-[10px] sm:text-xs text-blue-600 hover:text-blue-800"
                disabled={isLoading}
              >
                Clear
              </button>
            </div>
            <div className="border-2 border-gray-300 rounded-lg bg-white">
              <SignatureCanvas
                ref={managerSignatureRef}
                canvasProps={{
                  className: 'w-full h-32 sm:h-40 cursor-crosshair',
                }}
                backgroundColor="rgb(255, 255, 255)"
              />
            </div>
            <p className="text-[10px] sm:text-xs text-gray-500 mt-1">Manager can draw signature above</p>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
              Manager ID <span className="text-gray-400 text-[10px] sm:text-xs"></span>
            </label>
            <input
              type="text"
              value={managerId}
              onChange={(e) => setManagerId(e.target.value)}
              placeholder="Manager's ID"
              className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C3EAE7] focus:border-transparent"
              disabled={isLoading}
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
              Rating (1-5)
            </label>

            <div className="flex gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  onClick={() => setRating(star)}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill={rating >= star ? "#FBBF24" : "none"}
                  stroke="#FBBF24"
                  className="w-6 h-6 cursor-pointer transition"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l2.062 6.319a1 1 0 00.95.69h6.63c.969 0 1.371 1.24.588 1.81l-5.37 3.897a1 1 0 00-.364 1.118l2.06 6.318c.3.922-.755 1.688-1.54 1.118L12 18.347l-5.367 3.85c-.784.57-1.838-.196-1.539-1.118l2.06-6.318a1 1 0 00-.364-1.118L1.42 11.747c-.783-.57-.38-1.81.588-1.81h6.63a1 1 0 00.95-.69l2.06-6.319z"
                  />
                </svg>
              ))}
            </div>
          </div>


          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
              Remark <span className="text-gray-400 text-[10px] sm:text-xs"></span>
            </label>
            <input
              type="text"
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              placeholder="Remark"
              className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C3EAE7] focus:border-transparent"
            />
          </div>

          <div className="text-[10px] sm:text-xs bg-blue-50 p-2 sm:p-3 rounded border border-blue-200 mt-2">
            <p className="text-blue-800 font-medium">ℹ️ Important Information:</p>
            <ul className="mt-2 space-y-1 text-blue-700">
              <li>• <span className="font-medium">Each job has its own separate timesheet</span></li>
              <li>• By signing, you confirm that the time entries for this job are accurate</li>
              <li>• <span className="font-medium">If both manager signature and ID are provided</span>, the timesheet will be automatically approved and locked</li>
              <li>• Signatures will be saved as images</li>
            </ul>
          </div>
        </div>

        {isUploading && (
          <div className="bg-white p-3 sm:p-4 rounded-lg shadow-md border border-gray-200 mt-3 sm:mt-4">
            <h4 className="text-sm sm:text-base md:text-lg font-bold text-black mb-2 sm:mb-3">Uploading Signatures...</h4>
            <div className="space-y-2 sm:space-y-3">
              {Array.from(uploadProgress.values()).map((progress) => (
                <UploadProgress
                  key={progress.fileId}
                  progress={progress}
                  onCancel={() => {
                    uploadService.cancelUpload(progress.fileId);
                    setUploadProgress(prev => {
                      const newMap = new Map(prev);
                      newMap.delete(progress.fileId);
                      return newMap;
                    });
                  }}
                />
              ))}
            </div>

            {uploadProgress.size === 0 && (
              <div className="text-center py-3 sm:py-4">
                <div className="inline-block animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-blue-500"></div>
                <p className="text-gray-600 mt-2 text-xs sm:text-sm">Preparing signature uploads...</p>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 mt-4 sm:mt-6">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 text-xs sm:text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className={`w-full sm:w-auto px-4 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors ${isUploading
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                : 'bg-[#C3EAE7] text-black hover:bg-[#A9DBD9]'
              }`}
            disabled={isLoading || isUploading}
          >
            {isUploading ? 'Uploading...' : isLoading ? 'Submitting...' : 'Submit Timesheet'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocumTimesheet;
