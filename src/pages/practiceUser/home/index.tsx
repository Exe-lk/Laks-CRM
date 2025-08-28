import Image from 'next/image';
import { useEffect,useState } from 'react';
import NavBarPracticeUser from "../../components/navBarPracticeUser";
import Footer from "../../components/footer";
import { useRouter } from 'next/navigation';
import { useGetPracticeRequestsQuery} from '../../../redux/slices/appointmentPracticeSlice';
import Swal from 'sweetalert2';
import { useGetBookingsQuery } from '../../../redux/slices/bookingPracticeSlice';

const Home = () => {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const profileStr = localStorage.getItem('profile');
    console.log("profile", profileStr)
    const practiceIdStr = localStorage.getItem('practiceId');

    if (profileStr) {
        const parsedProfile = JSON.parse(profileStr);
        // console.log("DEBUG: Profile data:", parsedProfile);
        // console.log("DEBUG: Separate locumId:", locumIdStr ? JSON.parse(locumIdStr) : null);
        setProfile(parsedProfile);
    }
}, []);


  const { data: practiceRequestsData, isLoading: isLoadingRequests, refetch: refetchRequests } = useGetPracticeRequestsQuery(
    { practice_id: profile?.id || '', page: 1, limit: 20 },
    { skip: !profile?.id }
  );
  console.log(practiceRequestsData)

  // Calculate appointment statistics
  const appointmentsData = practiceRequestsData?.data?.requests || [];
  const totalAppointments = appointmentsData.length;
  const pendingAppointments = appointmentsData.filter((appointment: any) => appointment.status === 'PENDING').length;
  const cancelledAppointments = appointmentsData.filter((appointment: any) => appointment.status === 'CANCELLED').length;
  const confirmedAppointments = appointmentsData.filter((appointment: any) => appointment.status === 'CONFIRMED').length;

  const { data: bookings, isLoading: loadingBookings, error: errorBookings } = useGetBookingsQuery(
    { userId: profile?.id, userType: 'practice' }
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

  // const totalPendingConfirmations = pendingConfirmations?.data?.pending_confirmations?.length || 0;
  // const totalApplicationHistory = applicationHistory?.data?.length || 0;
  // const totalAvailableRequests = availableRequests?.data?.length || 0;

  const isLoggedIn = !!profile?.id;

  return (
    <>
      <NavBarPracticeUser />

      <main className="min-h-screen bg-white">

        <section className="py-16 lg:py-20 bg-gradient-to-br from-gray-50 to-[#C3EAE7]/20">
          <div className="max-w-7xl mx-auto px-4">

            <div className="mb-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-10 text-white">
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-4">Booking Overview</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold">{loadingBookings ? '...' : totalBookings}</div>
                    <div className="text-blue-100 text-sm">Total</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-300">{loadingBookings ? '...' : acceptedBookings}</div>
                    <div className="text-blue-100 text-sm">Confirmed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-300">{loadingBookings ? '...' : cancelledBookings}</div>
                    <div className="text-blue-100 text-sm">Cancelled</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-300">{loadingBookings ? '...' : pastBookings}</div>
                    <div className="text-blue-100 text-sm">Past</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-12">
              <h3 className="text-xl font-semibold text-gray-800 mb-8 text-center">📊 Booking Statistics</h3>
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
                      <div className="flex items-baseline">
                        {loadingBookings || !isLoggedIn ? (
                          <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                        ) : errorBookings ? (
                          <span className="text-3xl font-bold text-red-500">--</span>
                        ) : (
                          <span className="text-3xl font-bold text-gray-900">{totalBookings}</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 font-medium">Total Bookings</p>
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
                      <div className="flex items-baseline">
                        {loadingBookings || !isLoggedIn ? (
                          <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                        ) : errorBookings ? (
                          <span className="text-3xl font-bold text-red-500">--</span>
                        ) : (
                          <span className="text-3xl font-bold text-gray-900">{acceptedBookings-pastBookings}</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 font-medium">Future & Ongoing Bookings</p>
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
                      <div className="flex items-baseline">
                        {loadingBookings || !isLoggedIn ? (
                          <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                        ) : errorBookings ? (
                          <span className="text-3xl font-bold text-red-500">--</span>
                        ) : (
                          <span className="text-3xl font-bold text-gray-900">{cancelledBookings}</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 font-medium">Cancelled Bookings</p>
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
              <h3 className="text-xl font-semibold text-gray-800 mb-8 text-center">📋 Activity</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 xl:gap-16">
                
                {/* Pending Appointments */}
                <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 to-yellow-600"></div>
                  <div className="p-8">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-yellow-100 rounded-xl">
                        <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <span className="text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full font-medium">Pending</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-baseline">
                        {isLoadingRequests || !isLoggedIn ? (
                          <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                        ) : (
                          <span className="text-3xl font-bold text-gray-900">{pendingAppointments}</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 font-medium">Pending Appointments</p>
                      <button
                        onClick={() => router.push('/practiceUser/SelectNurses')}
                        className="w-full mt-3 text-xs text-yellow-600 hover:text-yellow-700 font-medium transition-colors"
                      >
                        View Details →
                      </button>
                    </div>
                  </div>
                </div>

                {/* Cancelled Appointments */}
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
                      <div className="flex items-baseline">
                        {isLoadingRequests || !isLoggedIn ? (
                          <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                        ) : (
                          <span className="text-3xl font-bold text-gray-900">{cancelledAppointments}</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 font-medium">Cancelled Appointments</p>
                      <button
                        onClick={() => router.push('/practiceUser/SelectNurses')}
                        className="w-full mt-3 text-xs text-red-600 hover:text-red-700 font-medium transition-colors"
                      >
                        View Details →
                      </button>
                    </div>
                  </div>
                </div>

                {/* Confirmed Appointments */}
                <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-green-600"></div>
                  <div className="p-8">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-green-100 rounded-xl">
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full font-medium">Confirmed</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-baseline">
                        {isLoadingRequests || !isLoggedIn ? (
                          <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                        ) : (
                          <span className="text-3xl font-bold text-gray-900">{confirmedAppointments}</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 font-medium">Confirmed Appointments</p>
                      <button
                        onClick={() => router.push('/practiceUser/SelectNurses')}
                        className="w-full mt-3 text-xs text-green-600 hover:text-green-700 font-medium transition-colors"
                      >
                        View Details →
                      </button>
                    </div>
                  </div>
                </div>

                {/* All Appointments */}
                <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-blue-600"></div>
                  <div className="p-8">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-blue-100 rounded-xl">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full font-medium">All</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-baseline">
                        {isLoadingRequests || !isLoggedIn ? (
                          <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                        ) : (
                          <span className="text-3xl font-bold text-gray-900">{totalAppointments}</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 font-medium">All Appointments</p>
                      <button
                        onClick={() => router.push('/practiceUser/SelectNurses')}
                        className="w-full mt-3 text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
                      >
                        View All →
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </section>

        <section className="py-16 lg:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                Quick Actions
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Access frequently used features with just one click
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              <button
                onClick={() => router.push('/locumStaff/waitingList')}
                className="group p-6 bg-gradient-to-br from-[#C3EAE7] to-[#A8D8D4] rounded-2xl hover:from-[#A8D8D4] hover:to-[#8CCCC7] transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="p-4 bg-white rounded-2xl shadow-lg group-hover:shadow-xl transition-shadow">
                    <svg className="w-8 h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white">View Appointments</h3>
                  <p className="text-white/80">Check your appointment requests and confirmations</p>
                </div>
              </button>

              <button
                onClick={() => router.push('/locumStaff/myBookings')}
                className="group p-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="p-4 bg-white rounded-2xl shadow-lg group-hover:shadow-xl transition-shadow">
                    <svg className="w-8 h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white">My Bookings</h3>
                  <p className="text-white/80">Manage your current and upcoming bookings</p>
                </div>
              </button>

              <button
                onClick={() => router.push('/locumStaff/pastAppointments')}
                className="group p-6 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl hover:from-purple-600 hover:to-purple-700 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="p-4 bg-white rounded-2xl shadow-lg group-hover:shadow-xl transition-shadow">
                    <svg className="w-8 h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white">Past Bookings</h3>
                  <p className="text-white/80">Browse your past bookings</p>
                </div>
              </button>
            </div>
          </div>
        </section>
        <Footer />

      </main>
    </>
  );
}

export default Home;
