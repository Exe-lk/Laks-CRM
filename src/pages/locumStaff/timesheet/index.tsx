import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/redux/store';
import { useGetBookingsQuery, Booking } from '../../../redux/slices/bookingPracticeSlice';
import NavBar from "../../components/navBar/nav";
import SignatureCanvas from 'react-signature-canvas';

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

  useEffect(() => {
    const fetchTimesheetJob = async () => {
      if (!selectedBooking || !selectedDate) return;

      setIsLoading(true);
      setError(null);

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
          `/api/timesheet/get-locum-timesheet?locumId=${locumId}&month=${month}&year=${year}`,
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
            }

            if (existingJob.endTime) {
              const endDate = new Date(existingJob.endTime);
              setEndTime(endDate.toTimeString().substring(0, 5));
            }

            if (existingJob.lunchStartTime) {
              const lunchStart = new Date(existingJob.lunchStartTime);
              setLunchStartTime(lunchStart.toTimeString().substring(0, 5));
            }

            if (existingJob.lunchEndTime) {
              const lunchEnd = new Date(existingJob.lunchEndTime);
              setLunchEndTime(lunchEnd.toTimeString().substring(0, 5));
            }

            setSuccess('Previous time entries loaded successfully!');
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
          }
        } else {
          setStartTime('');
          setEndTime('');
          setLunchStartTime('');
          setLunchEndTime('');
          setTimesheetJobId(null);
          setTimesheetId(null);
        }
      } catch (err) {
        console.error('Error fetching timesheet job:', err);
        setStartTime('');
        setEndTime('');
        setLunchStartTime('');
        setLunchEndTime('');
        setTimesheetJobId(null);
        setTimesheetId(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTimesheetJob();
  }, [selectedBooking?.id, selectedDate]);

  const hasBookingStarted = (booking: Booking): boolean => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const bookingDate = new Date(booking.booking_date as any).toISOString().split('T')[0];

    if (bookingDate < today) return true;

    if (bookingDate === today) {
      const currentTime = now.getHours() * 60 + now.getMinutes();
      const [startHour, startMinute] = booking.booking_start_time.split(':').map(Number);
      const bookingStartTime = startHour * 60 + startMinute;
      return currentTime >= bookingStartTime;
    }

    return false;
  };

  const isBookingCompleted = (booking: Booking): boolean => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
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

  const getAuthToken = () => {
    return localStorage.getItem('token') || '';
  };

  const handleStartClick = async () => {
    if (!selectedBooking) return;

    setIsLoading(true);
    setError(null);

    try {
      const token = getAuthToken();
      const now = new Date();
      const timeString = now.toTimeString().substring(0, 5);

      const bookingDate = new Date(selectedBooking.booking_date as any);
      const combinedDateTime = new Date(
        bookingDate.getFullYear(),
        bookingDate.getMonth(),
        bookingDate.getDate(),
        now.getHours(),
        now.getMinutes(),
        now.getSeconds()
      );

      let jobId = timesheetJobId;
      let tsId = timesheetId;

      if (!jobId) {
        const addJobResponse = await fetch('/api/timesheet/add-job-to-timesheet', {
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
          throw new Error(errorData.error || 'Failed to add job to timesheet');
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

      const updateResponse = await fetch('/api/timesheet/update-job-times', {
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

      setStartTime(timeString);
      setSuccess('Start time recorded successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to record start time');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndClick = async () => {
    if (!timesheetJobId || !selectedBooking) return;

    setIsLoading(true);
    setError(null);

    try {
      const token = getAuthToken();
      const now = new Date();
      const timeString = now.toTimeString().substring(0, 5);

      const bookingDate = new Date(selectedBooking.booking_date as any);
      const combinedDateTime = new Date(
        bookingDate.getFullYear(),
        bookingDate.getMonth(),
        bookingDate.getDate(),
        now.getHours(),
        now.getMinutes(),
        now.getSeconds()
      );

      const updateResponse = await fetch('/api/timesheet/update-job-times', {
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

      setEndTime(timeString);

      const hoursText = updateData.data?.job?.totalHours
        ? ` Total Hours: ${updateData.data.job.totalHours.toFixed(2)}h`
        : '';
      const payText = updateData.data?.job?.totalPay
        ? `, Total Pay: £${updateData.data.job.totalPay.toFixed(2)}`
        : '';

      setSuccess(`End time recorded successfully!${hoursText}${payText} Please add your signature.`);

      setTimeout(() => setShowSignatureModal(true), 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to record end time');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLunchStartClick = async () => {
    if (!timesheetJobId || !selectedBooking) return;

    setIsLoading(true);
    setError(null);

    try {
      const token = getAuthToken();
      const now = new Date();
      const timeString = now.toTimeString().substring(0, 5);

      const bookingDate = new Date(selectedBooking.booking_date as any);
      const combinedDateTime = new Date(
        bookingDate.getFullYear(),
        bookingDate.getMonth(),
        bookingDate.getDate(),
        now.getHours(),
        now.getMinutes(),
        now.getSeconds()
      );

      const updateResponse = await fetch('/api/timesheet/update-job-times', {
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

      setLunchStartTime(timeString);
      setSuccess('Lunch start time recorded successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to record lunch start time');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLunchEndClick = async () => {
    if (!timesheetJobId || !selectedBooking) return;

    setIsLoading(true);
    setError(null);

    try {
      const token = getAuthToken();
      const now = new Date();
      const timeString = now.toTimeString().substring(0, 5);

      const bookingDate = new Date(selectedBooking.booking_date as any);
      const combinedDateTime = new Date(
        bookingDate.getFullYear(),
        bookingDate.getMonth(),
        bookingDate.getDate(),
        now.getHours(),
        now.getMinutes(),
        now.getSeconds()
      );

      const updateResponse = await fetch('/api/timesheet/update-job-times', {
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

      setLunchEndTime(timeString);
      setSuccess('Lunch end time recorded successfully! Totals updated.');
    } catch (err: any) {
      setError(err.message || 'Failed to record lunch end time');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4 sticky top-0 bg-white pb-2 border-b">
          <h3 className="text-lg font-semibold">
            Bookings for {selectedDate ? new Date(selectedDate).toLocaleDateString() : ''}
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
            ×
          </button>
        </div>

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
                    className={`p-4 border rounded-lg transition-colors ${selectedBooking?.id === booking.id
                        ? 'border-[#C3EAE7] bg-[#C3EAE7]/10'
                        : hasStarted
                          ? 'border-green-200 bg-green-50 hover:bg-green-100 cursor-pointer'
                          : 'border-gray-300 bg-gray-100 cursor-not-allowed opacity-60'
                      }`}
                    onClick={() => {
                      if (canSelect) {
                        onBookingSelect(booking);
                      }
                    }}
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
                          <span className={`px-2 py-1 rounded-full text-xs ${booking.status === 'CONFIRMED'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                            }`}>
                            {booking.status}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs ${isCompleted
                              ? 'bg-gray-100 text-gray-700'
                              : hasStarted
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-orange-100 text-orange-700'
                            }`}>
                            {isCompleted ? '✓ Completed' : hasStarted ? '⏰ In Progress' : '🔒 Not Started'}
                          </span>
                          <span className="text-xs text-gray-500">
                            Created: {booking.createdAt ? new Date(booking.createdAt).toLocaleDateString() : 'N/A'}
                          </span>
                        </div>
                        {!hasStarted && (
                          <div className="mt-2 text-xs text-orange-600 font-medium">
                            ℹ️ Can only select after job start time
                          </div>
                        )}
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

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">❌ {error}</p>
          </div>
        )}

        {success && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-700">✅ {success}</p>
          </div>
        )}

        {selectedBooking && (
          <div className="mt-6 p-4 bg-[#C3EAE7]/10 rounded-lg border border-[#C3EAE7]">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Time Tracking</h4>

            {isLoading && (
              <div className="mb-3 flex items-center text-blue-600">
                <div className="animate-spin inline-block w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full mr-2"></div>
                <span className="text-sm">Processing...</span>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Start Time</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={startTime}
                    readOnly
                    placeholder="--:--"
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white"
                  />
                  <button
                    onClick={handleStartClick}
                    disabled={!!startTime}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${startTime
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-[#C3EAE7] text-black hover:bg-[#A9DBD9]'
                      }`}
                  >
                    {startTime ? '✓ Set' : 'Start'}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">End Time</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={endTime}
                    readOnly
                    placeholder="--:--"
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white"
                  />
                  <button
                    onClick={handleEndClick}
                    disabled={!startTime || !!endTime}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${!startTime || endTime
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-[#C3EAE7] text-black hover:bg-[#A9DBD9]'
                      }`}
                  >
                    {endTime ? '✓ Set' : 'End'}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Break Start</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={lunchStartTime}
                    readOnly
                    placeholder="--:--"
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white"
                  />
                  <button
                    onClick={handleLunchStartClick}
                    disabled={!startTime || !!lunchStartTime}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${!startTime || lunchStartTime
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-[#C3EAE7] text-black hover:bg-[#A9DBD9]'
                      }`}
                  >
                    {lunchStartTime ? '✓ Set' : 'Start'}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Break End</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={lunchEndTime}
                    readOnly
                    placeholder="--:--"
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white"
                  />
                  <button
                    onClick={handleLunchEndClick}
                    disabled={!lunchStartTime || !!lunchEndTime}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${!lunchStartTime || lunchEndTime
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-[#C3EAE7] text-black hover:bg-[#A9DBD9]'
                      }`}
                  >
                    {lunchEndTime ? '✓ Set' : 'End'}
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-600">
                Selected Booking: <span className="font-medium text-gray-900">{selectedBooking.location}</span>
              </p>
              <p className="text-xs text-gray-600">
                Scheduled: {selectedBooking.booking_start_time} - {selectedBooking.booking_end_time}
              </p>
              {timesheetJobId && (
                <p className="text-xs text-green-600 mt-1">
                  ✓ Timesheet job created - ID: {timesheetJobId.substring(0, 8)}...
                </p>
              )}
            </div>

            {hourlyRate !== null && (
              <div className="mt-4 pt-4 border-t border-gray-200 bg-blue-50 p-3 rounded">
                <h5 className="text-xs font-semibold text-blue-900 mb-2">Payment Details</h5>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-blue-700">Hourly Rate:</span>
                    <span className="font-medium text-blue-900">£{hourlyRate.toFixed(2)}/hour</span>
                  </div>
                  {totalHours !== null && (
                    <div className="flex justify-between text-xs">
                      <span className="text-blue-700">Total Hours:</span>
                      <span className="font-medium text-blue-900">{totalHours.toFixed(2)} hours</span>
                    </div>
                  )}
                  {totalPay !== null && (
                    <div className="flex justify-between text-xs pt-2 border-t border-blue-200">
                      <span className="text-blue-700 font-semibold">Total Pay:</span>
                      <span className="font-bold text-green-700 text-sm">£{totalPay.toFixed(2)}</span>
                    </div>
                  )}
                  {totalHours === null && (
                    <p className="text-xs text-blue-600 italic mt-1">
                      ⏳ Total hours and pay will be calculated when end time is recorded
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {!selectedBooking && bookings.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-700">
              ℹ️ Select a booking that has started to track your time
            </p>
          </div>
        )}

      </div>

      {showSignatureModal && timesheetId && (
        <SignatureModal
          timesheetId={timesheetId}
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
}

const SignatureModal: React.FC<SignatureModalProps> = ({ timesheetId, onClose, onSubmit }) => {
  const staffSignatureRef = useRef<SignatureCanvas>(null);
  const managerSignatureRef = useRef<SignatureCanvas>(null);
  const [managerId, setManagerId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    const token = getAuthToken();
    
    // Convert data URL to blob
    const blob = await fetch(signatureDataUrl).then(r => r.blob());
    
    // Create form data
    const formData = new FormData();
    formData.append('signature', blob, `${signatureType}_signature.png`);
    formData.append('timesheetId', timesheetId);
    formData.append('signatureType', signatureType);

    // Upload to server
    const uploadResponse = await fetch('/api/timesheet/upload-signature', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData
    });

    if (!uploadResponse.ok) {
      const errorData = await uploadResponse.json();
      throw new Error(errorData.error || 'Failed to upload signature');
    }

    const uploadData = await uploadResponse.json();
    return uploadData.data.signatureUrl;
  };

  const handleSubmit = async () => {
    if (!staffSignatureRef.current || staffSignatureRef.current.isEmpty()) {
      setError('Staff signature is required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const token = getAuthToken();

      // Get staff signature as data URL
      const staffSignatureDataUrl = staffSignatureRef.current.toDataURL();
      
      // Upload staff signature
      const staffSignatureUrl = await uploadSignatureImage(staffSignatureDataUrl, 'staff');

      // Submit timesheet with staff signature
      const submitResponse = await fetch('/api/timesheet/submit-timesheet', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          timesheetId: timesheetId,
          staffSignatureUrl: staffSignatureUrl
        })
      });

      if (!submitResponse.ok) {
        const errorData = await submitResponse.json();
        throw new Error(errorData.error || 'Failed to submit timesheet');
      }

      // If manager signature is provided, upload and approve
      if (managerSignatureRef.current && !managerSignatureRef.current.isEmpty() && managerId.trim()) {
        const managerSignatureDataUrl = managerSignatureRef.current.toDataURL();
        const managerSignatureUrl = await uploadSignatureImage(managerSignatureDataUrl, 'manager');

        const approveResponse = await fetch('/api/timesheet/approve-timesheet', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            timesheetId: timesheetId,
            managerSignatureUrl: managerSignatureUrl,
            managerId: managerId,
            action: 'approve'
          })
        });

        if (!approveResponse.ok) {
          console.error('Failed to add manager signature and approve');
        }
      }

      onSubmit();
    } catch (err: any) {
      setError(err.message || 'Failed to submit timesheet');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">Submit Timesheet</h3>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">❌ {error}</p>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Staff Signature <span className="text-red-500">*</span>
              </label>
              <button
                onClick={clearStaffSignature}
                className="text-xs text-blue-600 hover:text-blue-800"
                disabled={isLoading}
              >
                Clear
              </button>
            </div>
            <div className="border-2 border-gray-300 rounded-lg bg-white">
              <SignatureCanvas
                ref={staffSignatureRef}
                canvasProps={{
                  className: 'w-full h-40 cursor-crosshair',
                }}
                backgroundColor="rgb(255, 255, 255)"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Draw your signature above</p>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Manager Signature <span className="text-gray-400">(Optional)</span>
              </label>
              <button
                onClick={clearManagerSignature}
                className="text-xs text-blue-600 hover:text-blue-800"
                disabled={isLoading}
              >
                Clear
              </button>
            </div>
            <div className="border-2 border-gray-300 rounded-lg bg-white">
              <SignatureCanvas
                ref={managerSignatureRef}
                canvasProps={{
                  className: 'w-full h-40 cursor-crosshair',
                }}
                backgroundColor="rgb(255, 255, 255)"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Manager can draw signature above</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Manager ID <span className="text-gray-400">(Optional)</span>
            </label>
            <input
              type="text"
              value={managerId}
              onChange={(e) => setManagerId(e.target.value)}
              placeholder="Manager's ID"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C3EAE7] focus:border-transparent"
              disabled={isLoading}
            />
          </div>

          <div className="text-xs bg-blue-50 p-3 rounded border border-blue-200 mt-2">
            <p className="text-blue-800 font-medium">ℹ️ Important Information:</p>
            <ul className="mt-2 space-y-1 text-blue-700">
              <li>• By signing, you confirm that all time entries are accurate</li>
              <li>• Manager signature and ID are optional at this stage</li>
              <li>• <span className="font-medium">If both manager signature and ID are provided</span>, the timesheet will be automatically approved and locked</li>
              <li>• If manager fields are left empty, the timesheet will be submitted for approval</li>
              <li>• Signatures will be saved as images</li>
            </ul>
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-[#C3EAE7] text-black font-medium rounded-lg hover:bg-[#A9DBD9] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? 'Submitting...' : 'Submit Timesheet'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocumTimesheet;
