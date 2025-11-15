import Image from 'next/image';
import { useEffect,useState } from 'react';
import NavBar from "../../components/navBar/nav";
import Footer from "../../components/footer";
import { useRouter } from 'next/navigation';
import { useGetPendingConfirmationsQuery, useGetApplicationHistoryQuery } from '../../../redux/slices/appoitmentRequestsLocumSlice';
import Swal from 'sweetalert2';
import { useGetAvailableRequestsQuery } from '../../../redux/slices/appoitmentRequestsLocumSlice';
import { useGetBookingsQuery } from '../../../redux/slices/bookingPracticeSlice';
import { usePushNotifications } from '@/hooks/useNotifications';


const Home = () => {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const profileStr = localStorage.getItem('profile');
    console.log("profile", profileStr)
    const locumIdStr = localStorage.getItem('locumId');

    if (profileStr) {
        const parsedProfile = JSON.parse(profileStr);
        setProfile(parsedProfile);
    }
}, []);


  const { data: pendingConfirmations, isLoading: loadingPending, error: errorPending } = useGetPendingConfirmationsQuery(
    { locum_id: profile?.id },
        {
            skip: !profile?.id,
            refetchOnMountOrArgChange: true,
        }
  );
  console.log("pendingConfirmations", pendingConfirmations)

  const { data: applicationHistory, isLoading: loadingHistory, error: errorHistory } = useGetApplicationHistoryQuery(
    { locum_id: profile?.id },
        {
            skip: !profile?.id,
            refetchOnMountOrArgChange: true,
        }
  );
  console.log("applicationHistory", applicationHistory)

  const { data: availableRequests, isLoading: loadingRequests, error: errorRequests } = useGetAvailableRequestsQuery(
    { locum_id: profile?.id },
        { skip: !profile?.id }
  );
  console.log("availableRequests", availableRequests)

  const { data: bookings, isLoading: loadingBookings, error: errorBookings } = useGetBookingsQuery(
    { userId: profile?.id, userType: 'locum' }
  );
  console.log("bookings", bookings)

  const bookingsData = bookings?.data || [];
  const today = new Date();
  today.setHours(0, 0, 0, 0); 

  const totalBookings = bookingsData.length;
  const cancelledBookings = bookingsData.filter((booking: any) => booking.status === 'CANCELLED').length;
  const acceptedBookings = bookingsData.filter((booking: any) => booking.status === 'CONFIRMED').length;
  const pastBookings = bookingsData.filter((booking: any) => {
    const bookingDate = new Date(booking.booking_date);
    bookingDate.setHours(0, 0, 0, 0);
    return bookingDate < today;
  }).length;
  const futureBookings = bookingsData.filter((booking: any) => {
    const bookingDate = new Date(booking.booking_date);
    bookingDate.setHours(0, 0, 0, 0);
    return bookingDate >= today && booking.status === 'CONFIRMED';
  }).length;

  const totalPendingConfirmations = pendingConfirmations?.data?.pending_confirmations?.length || 0;
  const totalApplicationHistory = applicationHistory?.data?.length || 0;
  const totalAvailableRequests = availableRequests?.data?.length || 0;

  const isLoggedIn = !!profile?.id;

  usePushNotifications(profile?.id || null, 'locum');

  return (
    <>
      <NavBar />

      <main className="min-h-screen bg-white pt-32">

        <section className="py-16 lg:py-20 bg-gradient-to-br from-gray-50 to-[#C3EAE7]/20">
          <div className="max-w-7xl mx-auto px-4">

            <div className="mb-12 bg-gradient-to-r from-[#d1eeeb] to-[#c3eae7] rounded-3xl p-10 text-white">
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-4 text-black">Booking Overview</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-black">{loadingBookings ? '...' : totalBookings}</div>
                    <div className="text-black text-sm font-semibold">Total</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-300">{loadingBookings ? '...' : acceptedBookings}</div>
                    <div className="text-black text-sm font-semibold">Confirmed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-300">{loadingBookings ? '...' : cancelledBookings}</div>
                    <div className="text-black text-sm font-semibold">Cancelled</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-300">{loadingBookings ? '...' : pastBookings}</div>
                    <div className="text-black text-sm font-semibold">Past</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-12">
              <h3 className="text-xl font-semibold text-gray-800 mb-8 text-center">Booking Statistics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12 xl:gap-16">


                <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-400 to-indigo-600"></div>
                  <div className="p-8">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-indigo-100 rounded-xl">
                        <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full font-medium">Total</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-baseline justify-center items-center">
                        {loadingBookings || !isLoggedIn ? (
                          <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                        ) : errorBookings ? (
                          <span className="text-3xl font-bold text-red-500">--</span>
                        ) : (
                          <span className="text-3xl font-bold text-gray-900 text-center justify-center items-center">{totalBookings}</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 font-medium text-center justify-center items-center">Total Bookings</p>
                      <button
                        onClick={() => router.push('/locumStaff/myBookings')}
                        className="w-full mt-3 text-xs text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
                      >
                        View All →
                      </button>
                    </div>
                  </div>
                </div>

                <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-green-600"></div>
                  <div className="p-8">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-green-100 rounded-xl">
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full font-medium">Future & Ongoing Bookings</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-baseline justify-center items-center">
                        {loadingBookings || !isLoggedIn ? (
                          <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                        ) : errorBookings ? (
                          <span className="text-3xl font-bold text-red-500">--</span>
                        ) : (
                          <span className="text-3xl font-bold text-gray-900 text-center justify-center items-center">{futureBookings}</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 font-medium text-center justify-center items-center">Future & Ongoing Bookings</p>
                      <button
                        onClick={() => router.push('/locumStaff/myBookings')}
                        className="w-full mt-3 text-xs text-green-600 hover:text-green-700 font-medium transition-colors"
                      >
                        View Ongoing →
                      </button>
                    </div>
                  </div>
                </div>
                <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-400 to-red-600"></div>
                  <div className="p-8">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-red-100 rounded-xl">
                        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </div>
                      <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded-full font-medium">Cancelled</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-baseline justify-center items-center">
                        {loadingBookings || !isLoggedIn ? (
                          <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                        ) : errorBookings ? (
                          <span className="text-3xl font-bold text-red-500">--</span>
                        ) : (
                          <span className="text-3xl font-bold text-gray-900 text-center justify-center items-center">{cancelledBookings}</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 font-medium text-center justify-center items-center">Cancelled Bookings</p>
                      <button
                        onClick={() => router.push('/locumStaff/myBookings')}
                        className="w-full mt-3 text-xs text-red-600 hover:text-red-700 font-medium transition-colors"
                      >
                        View Cancelled →
                      </button>
                    </div>
                  </div>
                </div>



              </div>
            </div>

            <div className="mb-12">
              <h3 className="text-xl font-semibold text-gray-800 mb-8 text-center">Activity & History</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12 xl:gap-16">
                <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gray-400 to-gray-600"></div>
                  <div className="p-8">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-gray-100 rounded-xl">
                        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <span className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded-full font-medium">Past</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-baseline justify-center items-center">
                        {loadingBookings || !isLoggedIn ? (
                          <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                        ) : errorBookings ? (
                          <span className="text-3xl font-bold text-red-500">--</span>
                        ) : (
                          <span className="text-3xl font-bold text-gray-900 text-center justify-center items-center">{pastBookings}</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 font-medium text-center justify-center items-center">Past Bookings</p>
                      <button
                        onClick={() => router.push('/locumStaff/pastAppointments')}
                        className="w-full mt-3 text-xs text-gray-600 hover:text-gray-700 font-medium transition-colors"
                      >
                        View History →
                      </button>
                    </div>
                  </div>
                </div>

                <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-blue-600"></div>
                  <div className="p-8">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-blue-100 rounded-xl">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full font-medium">Available</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-baseline justify-center items-center">
                        {loadingRequests || !isLoggedIn ? (
                          <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                        ) : errorRequests ? (
                          <span className="text-3xl font-bold text-red-500">--</span>
                        ) : (
                          <span className="text-3xl font-bold text-gray-900 text-center justify-center items-center">{totalAvailableRequests}</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 font-medium text-center justify-center items-center">Available Requests</p>
                      <button
                        onClick={() => router.push('/locumStaff/waitingList')}
                        className="w-full mt-3 text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
                      >
                        View Details →
                      </button>
                    </div>
                  </div>
                </div>

                <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 to-orange-600"></div>
                  <div className="p-8">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-orange-100 rounded-xl">
                        <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <span className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-full font-medium">Pending</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-baseline justify-center items-center">
                        {loadingPending || !isLoggedIn ? (
                          <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                        ) : errorPending ? (
                          <span className="text-3xl font-bold text-red-500">--</span>
                        ) : (
                          <span className="text-3xl font-bold text-gray-900 text-center justify-center items-center">{totalPendingConfirmations}</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 font-medium text-center justify-center items-center text-center justify-center items-center ">Pending Requirements</p>
                      <button
                        onClick={() => router.push('/locumStaff/waitingList')}
                        className="w-full mt-3 text-xs text-orange-600 hover:text-orange-700 font-medium transition-colors text-center justify-center items-center"
                      >
                        View Details →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <Footer />
      </main>
    </>
  );
}

export default Home;