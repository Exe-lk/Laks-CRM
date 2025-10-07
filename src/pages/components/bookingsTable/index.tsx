import React, { useState } from 'react';
import { FiCalendar, FiClock, FiMapPin, FiUser, FiX, FiAlertCircle, FiCheck, FiPhone, FiMail } from 'react-icons/fi';
import Swal from 'sweetalert2';
import { useGetBookingsQuery, useCancelBookingMutation } from '../../../redux/slices/bookingPracticeSlice';

interface LocumProfile {
  fullName: string;
  contactNumber: string;
  emailAddress: string;
  role: string;
}

interface Practice {
  name: string;
  telephone: string;
  location: string;
  address: string;
}

interface Booking {
  id: string;
  locum_id: string;
  practice_id: string;
  booking_date: string;
  booking_start_time: string;
  booking_end_time: string;
  status: string;
  location: string;
  description?: string;
  accept_time?: string;
  cancel_by?: string;
  cancel_time?: string;
  createdAt: string;
  updatedAt: string;
  locumProfile?: LocumProfile;
  practice?: Practice;
  is_past: boolean;
  is_upcoming: boolean;
  can_cancel: boolean;
  time_until_booking: number;
}

interface BookingsTableProps {
  userType: 'locum' | 'practice' | 'branch';
  userId: string;
  onBookingCancelled?: () => void;
}

const BookingsTable: React.FC<BookingsTableProps> = ({
  userType,
  userId,
  onBookingCancelled
}) => {
  const [cancellingBooking, setCancellingBooking] = useState<string | null>(null);
  
  const {
    data: bookingsResponse,
    error: fetchError,
    isLoading: loading,
    refetch: refetchBookings
  } = useGetBookingsQuery({ userId, userType });

  const [cancelBooking] = useCancelBookingMutation();

  const bookings = bookingsResponse?.data || [];
  const error = fetchError ? 'Failed to fetch bookings' : null;

  const handleCancelBooking = async (booking: Booking) => {
    if (!booking.can_cancel) {
      await Swal.fire({
        title: 'Cannot Cancel',
        text: 'This booking can only be cancelled more than 48 hours before the appointment start time or is not in a confirmed status.',
        icon: 'warning',
        confirmButtonText: 'OK',
        confirmButtonColor: '#C3EAE7'
      });
      return;
    }

    const { value: cancellationReason } = await Swal.fire({
      title: 'Cancel Booking',
      text: `Are you sure you want to cancel this booking scheduled for ${formatDate(booking.booking_date)}?`,
      input: 'textarea',
      inputPlaceholder: 'Please provide a reason for cancellation (optional)',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Cancel Booking',
      cancelButtonText: 'No, Keep Booking',
      confirmButtonColor: '#DC2626',
      cancelButtonColor: '#6B7280',
      inputValidator: (value) => {
        if (!value && userType === 'practice') {
          return 'Please provide a reason for cancellation';
        }
      }
    });

    if (cancellationReason !== undefined) {
      try {
        setCancellingBooking(booking.id);

        const token = localStorage.getItem('token');
        console.log('Token before cancel request:', token);
        console.log('Cancel request data:', {
          booking_id: booking.id,
          user_id: userId,
          user_type: userType,
          cancellation_reason: cancellationReason
        });

        const result = await cancelBooking({
          booking_id: booking.id,
          user_id: userId,
          user_type: userType,
          cancellation_reason: cancellationReason
        }).unwrap();

        await Swal.fire({
          title: 'Booking Cancelled',
          text: result.message,
          icon: 'success',
          confirmButtonText: 'OK',
          confirmButtonColor: '#10B981'
        });

        refetchBookings();
        onBookingCancelled?.();

      } catch (err: any) {
        console.error('Error cancelling booking:', err);
        await Swal.fire({
          title: 'Cancellation Failed',
          text: err.data?.error || err.message || 'Failed to cancel booking',
          icon: 'error',
          confirmButtonText: 'OK',
          confirmButtonColor: '#DC2626'
        });
      } finally {
        setCancellingBooking(null);
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`1970-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return <FiCheck className="text-green-500" />;
      case 'cancelled':
        return <FiX className="text-red-500" />;
      case 'pending':
        return <FiAlertCircle className="text-yellow-500" />;
      default:
        return <FiAlertCircle className="text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTimeUntilText = (hours: number) => {
    if (hours <= 0) return 'Started/Past';
    if (hours < 24) return `${hours} hours`;
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days} days`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-100 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6 text-center">
          <FiAlertCircle className="text-6xl text-red-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-red-600 mb-2">Error Loading Bookings</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => refetchBookings()}
            className="px-4 py-2 bg-[#C3EAE7] text-black rounded-md hover:bg-[#A9DBD9] transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="px-6 py-4 bg-gradient-to-r from-[#C3EAE7] to-[#A9DBD9] border-b">
        <div className="flex items-center gap-3">
          <FiCalendar className="text-2xl text-gray-700" />
          <h2 className="text-2xl font-bold text-gray-800">Your Bookings</h2>
        </div>
        <p className="text-gray-600 mt-1">
          Manage your bookings • You can cancel confirmed bookings more than 48 hours before the appointment start time
        </p>
      </div>

      {bookings.length === 0 ? (
        <div className="p-12 text-center">
          <FiCalendar className="text-6xl text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-500 mb-2">No Bookings Found</h3>
          <p className="text-gray-400">You don't have any bookings yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  {userType === 'locum' ? 'Practice' : 'Locum'}
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Time Until
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {bookings.map((booking: Booking) => (
                <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                        <FiCalendar className="text-[#C3EAE7]" />
                        {formatDate(booking.booking_date)}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                        <FiClock className="text-[#C3EAE7]" />
                        {formatTime(booking.booking_start_time)} - {formatTime(booking.booking_end_time)}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-gray-900">
                      <FiMapPin className="text-[#C3EAE7]" />
                      <div>
                        <div className="font-medium">{booking.location}</div>
                        {userType === 'locum' && booking.practice?.address && (
                          <div className="text-xs text-gray-500">{booking.practice.address}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <FiUser className="text-[#C3EAE7]" />
                      <div className="text-sm">
                        {userType === 'locum' ? (
                          <div>
                            <div className="font-medium text-gray-900">{booking.practice?.name}</div>
                            {booking.practice?.location && (
                              <div className="text-xs text-gray-500">{booking.practice.location}</div>
                            )}
                          </div>
                        ) : (
                          <div>
                            <div className="font-medium text-gray-900">{booking.locumProfile?.fullName}</div>
                            {booking.locumProfile?.role && (
                              <div className="text-xs text-gray-500">{booking.locumProfile.role}</div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm space-y-1">
                      {userType === 'locum' ? (
                        <>
                          {booking.practice?.telephone && (
                            <div className="flex items-center gap-1 text-gray-600">
                              <FiPhone className="text-xs" />
                              <span className="text-xs">{booking.practice.telephone}</span>
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                          {booking.locumProfile?.contactNumber && (
                            <div className="flex items-center gap-1 text-gray-600">
                              <FiPhone className="text-xs" />
                              <span className="text-xs">{booking.locumProfile.contactNumber}</span>
                            </div>
                          )}
                          {booking.locumProfile?.emailAddress && (
                            <div className="flex items-center gap-1 text-gray-600">
                              <FiMail className="text-xs" />
                              <span className="text-xs">{booking.locumProfile.emailAddress}</span>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(booking.status)}`}>
                      {getStatusIcon(booking.status)}
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <div className={`font-medium ${booking.is_past ? 'text-gray-500' : booking.time_until_booking <= 48 ? 'text-red-600' : 'text-green-600'}`}>
                        {getTimeUntilText(booking.time_until_booking)}
                      </div>
                      {booking.is_upcoming && !booking.can_cancel && booking.status === 'CONFIRMED' && (
                        <div className="text-xs text-red-500 mt-1">Cannot cancel</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      {booking.can_cancel && booking.status === 'CONFIRMED' && (
                        <button
                          onClick={() => handleCancelBooking(booking)}
                          disabled={cancellingBooking === booking.id}
                          className="px-3 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-md hover:bg-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {cancellingBooking === booking.id ? 'Cancelling...' : 'Cancel'}
                        </button>
                      )}
                      {booking.status === 'CANCELLED' && (
                        <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-md">
                          Cancelled
                        </span>
                      )}
                      {booking.is_past && (
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-md">
                          Completed
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {bookings.length > 0 && (
        <div className="px-6 py-4 bg-gray-50 border-t">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <div>
              Total: {bookings.length} bookings | 
              Upcoming: {bookings.filter((b: Booking) => b.is_upcoming && b.status !== 'CANCELLED').length} | 
              Past: {bookings.filter((b: Booking) => b.is_past).length} | 
              Cancelled: {bookings.filter((b: Booking) => b.status === 'CANCELLED').length}
            </div>
            <button
              onClick={() => refetchBookings()}
              className="text-[#C3EAE7] hover:text-[#A9DBD9] font-medium"
            >
              Refresh
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingsTable;
