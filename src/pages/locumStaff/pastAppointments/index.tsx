import React, { useEffect, useState } from "react";
import NavBar from "../../components/navBar/nav";
import Footer from "../../components/footer/index";
import { useGetBookingsQuery } from "../../../redux/slices/bookingPracticeSlice";

interface Booking {
  id: string;
  bookingUniqueid: string;
  booking_date: string;
  booking_start_time: string;
  booking_end_time: string;
  location: string;
  status: string;
  is_past: boolean;
  is_upcoming: boolean;
  practice?: {
    name: string;
    location: string;
    address: string;
    telephone: string;
  };
  branch?: {
    id: string;
    name: string;
    address: string;
    location: string;
    telephone: string;
  };
  locumProfile?: {
    fullName: string;
    contactNumber: string;
    emailAddress: string;
    role: string;
  };
}

const PastAppointmentsPage = () => {
  const [locumId, setLocumId] = useState<string | null>(null);

  useEffect(() => {
    const storedLocumId = localStorage.getItem('locumId');
    if (storedLocumId) {
      setLocumId(JSON.parse(storedLocumId));
    }
  }, []);

  const { data: bookingsData, isLoading, error } = useGetBookingsQuery(
    { userId: locumId || '', userType: 'locum' },
    { skip: !locumId }
  );

  const pastBookings = bookingsData?.data?.filter((booking: Booking) => booking.is_past) || [];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'CONFIRMED':
        return 'bg-[#C3EAE7] text-black';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <NavBar />
      <div className="flex-1 w-full pt-32">
        <div className="text-center mb-8 pt-24">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-black rounded-full mb-4 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-black mb-2 bg-gradient-to-r from-black to-gray-700 bg-clip-text">
            Past Appointments
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            View your previous dental appointments and their details
          </p>
          <div className="flex justify-center gap-2 mt-4">
            <div className="w-2 h-2 bg-[#C3EAE7] rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-[#C3EAE7] rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-[#C3EAE7] rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>

        <div className="bg-white rounded-none shadow-xl  border-b-2 border-gray-200 w-full mx-auto px-2 sm:px-4 md:px-8">
          <div className="bg-[#C3EAE7] px-2 sm:px-4 py-6 w-full rounded-none">
            <h2 className="text-2xl font-bold text-black">Appointment History</h2>
            <p className="text-gray-700 mt-1">All your past appointments in one place</p>
          </div>

          <div className="py-8 w-full overflow-x-auto">
            {isLoading ? (
              <div className="text-center text-gray-500 py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
                <p className="mt-2">Loading past bookings...</p>
              </div>
            ) : error ? (
              <div className="text-center text-red-500 py-8">
                <p>Error loading bookings. Please try again later.</p>
              </div>
            ) : (
              <>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-[#C3EAE7]/20">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Booking ID</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Practice/Branch</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Location</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Time Range</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {pastBookings.length > 0 ? (
                      pastBookings.map((booking: Booking) => (
                        <tr key={booking.id} className="hover:bg-[#C3EAE7]/10 transition-all">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-black">
                            {booking.bookingUniqueid}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {formatDate(booking.booking_date)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {booking.branch ? booking.branch.name : booking.practice?.name || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {booking.branch ? booking.branch.location : booking.practice?.location || booking.location}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {booking.booking_start_time} - {booking.booking_end_time}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(booking.status)}`}>
                              {booking.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                          No past bookings found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PastAppointmentsPage;
