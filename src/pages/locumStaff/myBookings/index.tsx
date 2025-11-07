import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import NavBar from '../../components/navBar/nav';
import Footer from '../../components/footer';
import BookingsTable from '../../components/bookingsTable';

interface Profile {
  id: string;
  fullName: string;
  emailAddress: string;
  [key: string]: any;
}

const MyBookingsPage = () => {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/locumStaff/login');
      return;
    }

    const profileStr = localStorage.getItem('profile');
    if (profileStr) {
      try {
        const parsedProfile = JSON.parse(profileStr);
        setProfile(parsedProfile);
      } catch (error) {
        console.error('Error parsing profile:', error);
        router.push('/locumStaff/login');
        return;
      }
    } else {
      router.push('/locumStaff/login');
      return;
    }

    setLoading(false);
  }, [router]);

  const handleBookingCancelled = () => {
    console.log('Booking cancelled successfully');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-32"></div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Authentication Required</h2>
          <p className="text-gray-600">Please log in to view your bookings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <NavBar />
      
      <div className="flex-1 flex flex-col py-8 pt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-12">
          <div className="mb-8">
             <div className="text-center mb-8 pt-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-black rounded-full mb-4 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-black mb-2 bg-gradient-to-r from-black to-gray-700 bg-clip-text">
         My Bookings
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              View and manage your confirmed bookings. You can cancel bookings at any time (penalties may apply within 48 hours).
          </p>
          <div className="flex justify-center gap-2 mt-4">
            <div className="w-2 h-2 bg-[#C3EAE7] rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-[#C3EAE7] rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-[#C3EAE7] rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
          </div>

          <div className="mb-8">
            <BookingsTable
              userType="locum"
              userId={profile.id}
              onBookingCancelled={handleBookingCancelled}
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Booking Information</h3>
            <div className="text-blue-800 space-y-2">
              <p>• <strong>Confirmed bookings</strong> can be cancelled at any time.</p>
              <p>• <strong>Cancellation penalties:</strong> Within 24 hours = 6 hours pay, Within 48 hours = 3 hours pay, Over 48 hours = No penalty.</p>
              <p>• <strong>Cancelled bookings</strong> will be made available for other locums to apply.</p>
              <p>• <strong>Contact details</strong> for practices are shown for confirmed bookings.</p>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default MyBookingsPage;
