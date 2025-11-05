import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import NavBarPracticeUser from '../../components/branchNavBar';
import Footer from '../../components/footer';
import BookingsTable from '../../components/bookingsTable';

interface Profile {
  id: string;
  name: string;
  email: string;
  userType?: string;
  [key: string]: any;
}

const MyBookingsPage = () => {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState<'practice' | 'branch'>('practice');

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
        
        if (parsedProfile.userType === 'branch' || parsedProfile.practiceType === 'Branch') {
          setUserType('branch');
        } else {
          setUserType('practice');
        }
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2 pt-24">
              {userType === 'branch' ? 'Branch Bookings' : 'Practice Bookings'}
            </h1>
            <p className="text-gray-600">
              View and manage your {userType === 'branch' ? 'branch' : 'practice'}'s confirmed bookings. You can cancel bookings at any time (penalties may apply within 48 hours).
            </p>
          </div>

          <div className="mb-8">
            <BookingsTable
              userType={userType}
              userId={profile.id}
              onBookingCancelled={handleBookingCancelled}
            />
          </div>

          {/* <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Booking Management</h3>
            <div className="text-blue-800 space-y-2">
              <p>• <strong>Confirmed bookings</strong> can be cancelled up to 48 hours before the appointment time.</p>
              <p>• <strong>Cancelled bookings</strong> will be made available for other locums to apply.</p>
              <p>• <strong>Contact details</strong> for locums are shown for confirmed bookings.</p>
              <p>• If you need to cancel within 48 hours due to emergency, please contact the locum directly.</p>
              <p>• When cancelling as a practice, please provide a clear reason for the cancellation.</p>
            </div>
          </div> */}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default MyBookingsPage;
