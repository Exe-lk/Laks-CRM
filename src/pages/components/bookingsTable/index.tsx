import React, { useState } from 'react';
import { FiCalendar, FiClock, FiMapPin, FiUser, FiX, FiAlertCircle, FiCheck, FiPhone, FiMail, FiSearch, FiFilter, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import Swal from 'sweetalert2';
import { useGetBookingsQuery, useCancelBookingMutation } from '../../../redux/slices/bookingPracticeSlice';

interface LocumProfile {
  fullName: string;
  contactNumber: string;
  emailAddress: string;
  role: string;
  hourlyPayRate?: number;
}

interface Practice {
  name: string;
  telephone: string;
  location: string;
  address: string;
}

interface Branch {
  id: string;
  name: string;
  address: string;
  location: string;
  telephone?: string;
}

interface CancellationPenalty {
  id: string;
  cancelledBy: string;
  cancelledPartyType: string;
  penaltyAmount: number;
  penaltyHours: number;
  hourlyRate: number;
  hoursBeforeAppointment: number;
  status: string;
  reason?: string;
  cancellationTime: string;
  chargedLocumId?: string;
  chargedPracticeId?: string;
  chargedLocum?: {
    fullName: string;
  };
  chargedPractice?: {
    name: string;
  };
}

interface Booking {
  id: string;
  locum_id: string;
  practice_id: string;
  branch_id?: string;
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
  branch?: Branch;
  cancellationPenalties?: CancellationPenalty[];
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
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [expandedBooking, setExpandedBooking] = useState<string | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [showFilters, setShowFilters] = useState<boolean>(false);
  
  const {
    data: bookingsResponse,
    error: fetchError,
    isLoading: loading,
    refetch: refetchBookings
  } = useGetBookingsQuery({ userId, userType });

  const [cancelBooking] = useCancelBookingMutation();

  const allBookings = bookingsResponse?.data || [];
  const upcomingBookings = allBookings.filter((booking: Booking) => !booking.is_past);
  
  const branchStrings = upcomingBookings
    .filter((booking: Booking) => booking.branch)
    .map((booking: Booking) => JSON.stringify({ id: booking.branch!.id, name: booking.branch!.name }));
  const uniqueBranchStrings = Array.from(new Set<string>(branchStrings));
  const branches = uniqueBranchStrings.map((item) => JSON.parse(item) as { id: string; name: string });

  let filteredBookings = upcomingBookings.filter((booking: Booking) => {
    if (selectedBranch !== 'all' && booking.branch?.id !== selectedBranch) {
      return false;
    }
    
    if (statusFilter !== 'all' && booking.status.toLowerCase() !== statusFilter.toLowerCase()) {
      return false;
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const nameMatch = userType === 'locum' 
        ? booking.practice?.name?.toLowerCase().includes(query)
        : booking.locumProfile?.fullName?.toLowerCase().includes(query);
      const locationMatch = booking.location?.toLowerCase().includes(query);
      const branchMatch = booking.branch?.name?.toLowerCase().includes(query);
      
      if (!nameMatch && !locationMatch && !branchMatch) {
        return false;
      }
    }
    
    if (startDate) {
      const bookingDate = new Date(booking.booking_date);
      const filterStartDate = new Date(startDate);
      if (bookingDate < filterStartDate) {
        return false;
      }
    }
    
    if (endDate) {
      const bookingDate = new Date(booking.booking_date);
      const filterEndDate = new Date(endDate);
      if (bookingDate > filterEndDate) {
        return false;
      }
    }
    
    return true;
  });
  
  const sortedBookings = [...filteredBookings].sort((a: Booking, b: Booking) => {
    const dateA = new Date(a.booking_date);
    const dateB = new Date(b.booking_date);
    
    const [hoursA, minutesA] = a.booking_start_time.split(':').map(Number);
    const [hoursB, minutesB] = b.booking_start_time.split(':').map(Number);
    
    dateA.setHours(hoursA, minutesA, 0, 0);
    dateB.setHours(hoursB, minutesB, 0, 0);
    
    return dateA.getTime() - dateB.getTime();
  });
  
  const totalPages = Math.ceil(sortedBookings.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const bookings = sortedBookings.slice(startIndex, endIndex);
  
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, startDate, endDate, selectedBranch, pageSize]);
  
  const hasBranches = bookings.some((booking: Booking) => booking.branch);
  
  const error = fetchError ? 'Failed to fetch bookings' : null;

  const handleCancelBooking = async (booking: Booking) => {
    if (!booking.can_cancel) {
      await Swal.fire({
        title: 'Cannot Cancel',
        text: 'This booking is not in a confirmed status and cannot be cancelled.',
        icon: 'warning',
        confirmButtonText: 'OK',
        confirmButtonColor: '#C3EAE7'
      });
      return;
    }

    const now = new Date();
    const bookingDateTime = new Date(booking.booking_date);
    const [hours, minutes] = booking.booking_start_time.split(':').map(Number);
    bookingDateTime.setHours(hours, minutes, 0, 0);
    const hoursUntilBooking = (bookingDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursUntilBooking <= 0) {
      await Swal.fire({
        title: 'Cannot Cancel',
        text: 'This booking cannot be cancelled because the job has already started.',
        icon: 'warning',
        confirmButtonText: 'OK',
        confirmButtonColor: '#C3EAE7'
      });
      return;
    }

    let penaltyHours = 0;
    let penaltyAmount = 0;
    let penaltyMessage = '';

    if (hoursUntilBooking <= 48 && booking.locumProfile?.hourlyPayRate) {
      const hourlyRate = booking.locumProfile.hourlyPayRate;
      
      if (hoursUntilBooking <= 24) {
        penaltyHours = 6;
        penaltyAmount = hourlyRate * 6;
        penaltyMessage = `\n\n⚠️ Cancellation Penalty: £${penaltyAmount.toFixed(2)}\nCancelling within 24 hours incurs a penalty of 6 hours (${penaltyHours} × £${hourlyRate}/hr).`;
      } else {
        penaltyHours = 3;
        penaltyAmount = hourlyRate * 3;
        penaltyMessage = `\n\n⚠️ Cancellation Penalty: £${penaltyAmount.toFixed(2)}\nCancelling within 48 hours incurs a penalty of 3 hours (${penaltyHours} × £${hourlyRate}/hr).`;
      }
    }

    const { value: cancellationReason } = await Swal.fire({
      title: 'Cancel Booking',
      html: `Are you sure you want to cancel this booking scheduled for ${formatDate(booking.booking_date)}?${penaltyMessage}`,
      input: 'textarea',
      inputPlaceholder: 'Please provide a reason for cancellation (required)',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Cancel Booking',
      cancelButtonText: 'No, Keep Booking',
      confirmButtonColor: '#DC2626',
      cancelButtonColor: '#6B7280',
      inputValidator: (value) => {
        if (!value || value.trim() === '') {
          return 'Please provide a reason for cancellation';
        }
      }
    });

    if (cancellationReason !== undefined) {
      try {
        setCancellingBooking(booking.id);

        const token = localStorage.getItem('token');
        console.log('Token before cancel request:', token);
        
        const cancelData = {
          booking_id: booking.id,
          user_id: userId,
          user_type: userType,
          cancellation_reason: cancellationReason,
          hours_until_booking: hoursUntilBooking,
          penalty_hours: penaltyHours,
          penalty_amount: penaltyAmount,
          hourly_rate: booking.locumProfile?.hourlyPayRate || 0
        };
        
        console.log('Cancel request data:', cancelData);

        const result = await cancelBooking(cancelData).unwrap();

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

  const calculateTimeUntil = (booking: Booking) => {
    const now = new Date();
    const bookingDateTime = new Date(booking.booking_date);
    const [hours, minutes] = booking.booking_start_time.split(':').map(Number);
    bookingDateTime.setHours(hours, minutes, 0, 0);
    
    const hoursUntil = (bookingDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursUntil;
  };

  const getTimeUntilText = (booking: Booking) => {
    const hours = calculateTimeUntil(booking);
    
    if (hours <= 0) return 'Started/Past';
    
    if (hours < 1) {
      const minutes = Math.round(hours * 60);
      return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }
    
    if (hours < 24) {
      const wholeHours = Math.floor(hours);
      const minutes = Math.round((hours - wholeHours) * 60);
      if (minutes > 0) {
        return `${wholeHours}h ${minutes}m`;
      }
      return `${wholeHours} hour${wholeHours !== 1 ? 's' : ''}`;
    }
    
    const days = Math.floor(hours / 24);
    const remainingHours = Math.floor(hours % 24);
    
    if (remainingHours > 0) {
      return `${days}d ${remainingHours}h`;
    }
    return `${days} day${days !== 1 ? 's' : ''}`;
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getPenaltyStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'CHARGED':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'DISMISSED':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getCancelledByText = (cancelledBy: string) => {
    switch (cancelledBy) {
      case 'locum':
        return 'Locum Staff';
      case 'practice':
        return 'Practice';
      case 'branch':
        return 'Branch';
      default:
        return cancelledBy;
    }
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
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <FiCalendar className="text-2xl text-gray-700" />
              <h2 className="text-2xl font-bold text-gray-800">Your Bookings</h2>
            </div>
            <p className="text-gray-600 mt-1">
              Manage your bookings • You can cancel confirmed bookings before they start (penalties may apply within 48 hours, reason required)
            </p>
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-md hover:bg-gray-50 transition-colors shadow-sm border border-gray-300"
          >
            <FiFilter />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>
      </div>
      
      {/* Filters Section */}
      {showFilters && (
        <div className="px-6 py-4 bg-gray-50 border-b">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="col-span-1 md:col-span-2 lg:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder={`Search by ${userType === 'locum' ? 'practice' : 'locum'} name, location...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#C3EAE7] focus:border-[#C3EAE7] text-sm"
                />
              </div>
            </div>
            
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#C3EAE7] focus:border-[#C3EAE7] bg-white text-sm"
              >
                <option value="all">All Statuses</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
                <option value="pending">Pending</option>
              </select>
            </div>
            
            {/* Branch Filter */}
          {branches.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Branch
              </label>
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#C3EAE7] focus:border-[#C3EAE7] bg-white text-sm"
              >
                <option value="all">All Branches</option>
                {branches.map((branch: any) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ))}
              </select>
            </div>
          )}
            
            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#C3EAE7] focus:border-[#C3EAE7] text-sm"
              />
        </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#C3EAE7] focus:border-[#C3EAE7] text-sm"
              />
      </div>
            
            {/* Clear Filters Button */}
            {(searchQuery || statusFilter !== 'all' || selectedBranch !== 'all' || startDate || endDate) && (
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                    setSelectedBranch('all');
                    setStartDate('');
                    setEndDate('');
                  }}
                  className="w-full px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors text-sm font-medium"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
          
          {/* Filter Summary */}
          <div className="mt-3 text-sm text-gray-600">
            Showing {bookings.length} of {sortedBookings.length} bookings
            {sortedBookings.length !== upcomingBookings.length && ` (${upcomingBookings.length} total)`}
          </div>
        </div>
      )}

      {bookings.length === 0 ? (
        <div className="p-12 text-center">
          <FiCalendar className="text-6xl text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-500 mb-2">No Bookings Found</h3>
          <p className="text-gray-400">
            {sortedBookings.length === 0 
              ? upcomingBookings.length === 0
                ? 'You don\'t have any upcoming bookings yet.'
                : 'No bookings match your current filters.'
              : 'No bookings on this page.'}
          </p>
          {(searchQuery || statusFilter !== 'all' || selectedBranch !== 'all' || startDate || endDate) && sortedBookings.length === 0 && (
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
                setSelectedBranch('all');
                setStartDate('');
                setEndDate('');
              }}
              className="mt-4 px-4 py-2 bg-[#C3EAE7] text-black rounded-md hover:bg-[#A9DBD9] transition-colors"
            >
              Clear All Filters
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Date & Time
                </th>
                {hasBranches && (
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Branch
                  </th>
                )}
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
                <React.Fragment key={booking.id}>
                <tr className="hover:bg-gray-50 transition-colors">
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
                  {hasBranches && (
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        {booking.branch ? (
                          <div>
                            <div className="font-medium text-blue-600">{booking.branch.name}</div>
                            {booking.branch.location && (
                              <div className="text-xs text-gray-500">{booking.branch.location}</div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">No branch assigned</span>
                        )}
                      </div>
                    </td>
                  )}
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
                      <div className={`font-medium ${calculateTimeUntil(booking) <= 0 ? 'text-gray-500' : calculateTimeUntil(booking) <= 48 ? 'text-red-600' : 'text-green-600'}`}>
                        {getTimeUntilText(booking)}
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
                        <>
                          <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-md">
                            Cancelled
                          </span>
                          {booking.cancellationPenalties && booking.cancellationPenalties.length > 0 && (
                            (() => {
                              // Filter penalties to only show those that apply to the current logged-in user
                              const userPenalties = booking.cancellationPenalties.filter((penalty: CancellationPenalty) => {
                                if (userType === 'practice' || userType === 'branch') {
                                  // Show penalty only if the current practice/branch user is the one charged
                                  return penalty.chargedPracticeId === userId;
                                } else if (userType === 'locum') {
                                  // Show penalty only if the current locum is the one charged
                                  // This ensures when a locum cancels, only they see their own penalty
                                  return penalty.chargedLocumId === userId;
                                }
                                return false;
                              });

                              console.log('User Type:', userType, 'User ID:', userId);
                              console.log('All penalties for booking:', booking.cancellationPenalties);
                              console.log('Filtered penalties for current user:', userPenalties);

                              return userPenalties.length > 0 ? (
                                <button
                                  onClick={() => setExpandedBooking(expandedBooking === booking.id ? null : booking.id)}
                                  className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-md hover:bg-orange-200 transition-colors"
                                >
                                  {expandedBooking === booking.id ? 'Hide Penalty' : 'View Penalty'}
                                </button>
                              ) : null;
                            })()
                          )}
                        </>
                      )}
                      {booking.is_past && (
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-md">
                          Completed
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
                
                {booking.status === 'CANCELLED' && booking.cancellationPenalties && booking.cancellationPenalties.length > 0 && expandedBooking === booking.id && (
                  <tr className="bg-orange-50">
                    <td colSpan={hasBranches ? 8 : 7} className="px-6 py-4">
                      <div className="border-l-4 border-orange-400 pl-4">
                        <h4 className="text-sm font-semibold text-orange-900 mb-3 flex items-center gap-2">
                          <FiAlertCircle className="text-orange-600" />
                          Cancellation Penalty Details
                        </h4>
                        {booking.cancellationPenalties
                          .filter((penalty: CancellationPenalty) => {
                            // Filter to show only penalties that apply to the current logged-in user
                            if (userType === 'practice' || userType === 'branch') {
                              // Show penalty only if the current practice/branch user is the one charged
                              return penalty.chargedPracticeId === userId;
                            } else if (userType === 'locum') {
                              // Show penalty only if the current locum is the one charged
                              // This ensures when a locum cancels, only they see their own penalty
                              return penalty.chargedLocumId === userId;
                            }
                            return false;
                          })
                          .map((penalty) => (
                          <div key={penalty.id} className="grid grid-cols-2 gap-4 text-sm">
                            <div className="space-y-2">
                              <div>
                                <span className="font-medium text-gray-700">Cancelled By:</span>
                                <span className="ml-2 text-gray-900">{getCancelledByText(penalty.cancelledBy)}</span>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">Cancellation Time:</span>
                                <span className="ml-2 text-gray-900">{formatDateTime(penalty.cancellationTime)}</span>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">Hours Before Appointment:</span>
                                <span className="ml-2 text-gray-900">{penalty.hoursBeforeAppointment.toFixed(1)} hours</span>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">Penalty Status:</span>
                                <span className={`ml-2 px-2 py-1 rounded text-xs font-medium border ${getPenaltyStatusBadge(penalty.status)}`}>
                                  {penalty.status}
                                </span>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div>
                                <span className="font-medium text-gray-700">Charged To:</span>
                                <span className="ml-2 text-gray-900">
                                  {penalty.chargedLocum?.fullName || penalty.chargedPractice?.name || 'N/A'}
                                  {' '}({penalty.cancelledPartyType === 'locum' ? 'Locum' : 'Practice'})
                                </span>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">Hourly Rate:</span>
                                <span className="ml-2 text-gray-900">£{penalty.hourlyRate.toFixed(2)}/hr</span>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">Penalty Hours:</span>
                                <span className="ml-2 text-gray-900">{penalty.penaltyHours} hours</span>
                              </div>
                              <div>
                                <span className="font-medium text-red-700 text-base">Penalty Amount:</span>
                                <span className="ml-2 text-red-900 font-bold text-base">£{penalty.penaltyAmount.toFixed(2)}</span>
                              </div>
                            </div>
                            {penalty.reason && (
                              <div className="col-span-2 mt-2">
                                <span className="font-medium text-gray-700">Cancellation Reason:</span>
                                <p className="mt-1 text-gray-900 bg-white p-2 rounded border border-orange-200">{penalty.reason}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {sortedBookings.length > 0 && (
        <div className="px-6 py-4 bg-gray-50 border-t">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Stats */}
            <div className="text-sm text-gray-600">
              Showing {startIndex + 1}-{Math.min(endIndex, sortedBookings.length)} of {sortedBookings.length} bookings
              {sortedBookings.length !== upcomingBookings.length && ` (filtered from ${upcomingBookings.length})`}
              <span className="mx-2">|</span>
              Confirmed: {sortedBookings.filter((b: Booking) => b.status === 'CONFIRMED').length}
              <span className="mx-2">|</span>
              Cancelled: {sortedBookings.filter((b: Booking) => b.status === 'CANCELLED').length}
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Per page:</label>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#C3EAE7] focus:border-[#C3EAE7]"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
              
              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-md border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Previous page"
                  >
                    <FiChevronLeft />
                  </button>
                  
                  <div className="flex items-center gap-1">
                    {currentPage > 3 && (
                      <>
                        <button
                          onClick={() => setCurrentPage(1)}
                          className="px-3 py-1 rounded-md border border-gray-300 hover:bg-gray-100 text-sm"
                        >
                          1
                        </button>
                        {currentPage > 4 && (
                          <span className="text-gray-500">...</span>
                        )}
                      </>
                    )}
                    
                    {currentPage > 1 && (
                      <button
                        onClick={() => setCurrentPage(currentPage - 1)}
                        className="px-3 py-1 rounded-md border border-gray-300 hover:bg-gray-100 text-sm"
                      >
                        {currentPage - 1}
                      </button>
                    )}
                    
                    <button
                      className="px-3 py-1 rounded-md bg-[#C3EAE7] text-gray-800 font-semibold text-sm border-2 border-[#C3EAE7]"
                    >
                      {currentPage}
                    </button>
                    
                    {currentPage < totalPages && (
                      <button
                        onClick={() => setCurrentPage(currentPage + 1)}
                        className="px-3 py-1 rounded-md border border-gray-300 hover:bg-gray-100 text-sm"
                      >
                        {currentPage + 1}
                      </button>
                    )}
                    
                    {currentPage < totalPages - 2 && (
                      <>
                        {currentPage < totalPages - 3 && (
                          <span className="text-gray-500">...</span>
                        )}
                        <button
                          onClick={() => setCurrentPage(totalPages)}
                          className="px-3 py-1 rounded-md border border-gray-300 hover:bg-gray-100 text-sm"
                        >
                          {totalPages}
                        </button>
                </>
              )}
            </div>
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-md border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Next page"
                  >
                    <FiChevronRight />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingsTable;
