import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import NavBarPracticeUser from '../../components/navBarPracticeUser';
import Footer from '../../components/footer';
import BookingsTable from '../../components/bookingsTable';

interface Profile {
  id: string;
  name: string;
  email: string;
  [key: string]: any;
}

const MyBookingsPage = () => {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/practiceUser/practiceLogin');
      return;
    }

    const profileStr = localStorage.getItem('profile');
    if (profileStr) {
      try {
        const parsedProfile = JSON.parse(profileStr);
        setProfile(parsedProfile);
      } catch (error) {
        console.error('Error parsing profile:', error);
        router.push('/practiceUser/practiceLogin');
        return;
      }
    } else {
      router.push('/practiceUser/practiceLogin');
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
      <NavBarPracticeUser />
      
      <div className="flex-1 flex flex-col py-8 pt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 pt-24">Practice Bookings</h1>
            <p className="text-gray-600">
              View and manage your practice's confirmed bookings. You can cancel bookings before they start (penalties may apply within 48 hours).
            </p>
          </div>

          <div className="mb-8">
            <BookingsTable
              userType="practice"
              userId={profile.id}
              onBookingCancelled={handleBookingCancelled}
            />
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default MyBookingsPage;
