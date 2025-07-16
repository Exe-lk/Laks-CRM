import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

interface Profile {
  fullName?: string;
  emailAddress?: string;
  contactNumber?: string;
  address?: string;
  gdcNumber?: string;
  employeeType?: string;
  dateOfBirth?: string;
  referenceNumber?: string;
  status?: string;
}

const ProfilePage = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const router = useRouter();

  useEffect(() => {
    const profileStr = localStorage.getItem('profile');
    if (profileStr) {
      try {
        setProfile(JSON.parse(profileStr));
      } catch {
        setProfile(null);
      }
    }
  }, []);

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">No Profile Data</h2>
          <button
            className="bg-[#C3EAE7] text-black px-6 py-2 rounded-full font-medium hover:bg-[#A9DBD9] transition"
            onClick={() => router.push('/login')}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full bg-white rounded-2xl shadow-xl border-2 border-gray-200 p-8">
        <h1 className="text-3xl font-bold text-black mb-6 text-center">My Profile</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="mb-4">
              <span className="font-semibold text-gray-700">Full Name:</span>
              <div className="text-black">{profile.fullName || '-'}</div>
            </div>
            <div className="mb-4">
              <span className="font-semibold text-gray-700">Email:</span>
              <div className="text-black">{profile.emailAddress || '-'}</div>
            </div>
            <div className="mb-4">
              <span className="font-semibold text-gray-700">Contact Number:</span>
              <div className="text-black">{profile.contactNumber || '-'}</div>
            </div>
            <div className="mb-4">
              <span className="font-semibold text-gray-700">Address:</span>
              <div className="text-black">{profile.address || '-'}</div>
            </div>
          </div>
          <div>
            <div className="mb-4">
              <span className="font-semibold text-gray-700">GDC Number:</span>
              <div className="text-black">{profile.gdcNumber || '-'}</div>
            </div>
            <div className="mb-4">
              <span className="font-semibold text-gray-700">Employee Type:</span>
              <div className="text-black">{profile.employeeType || '-'}</div>
            </div>
            <div className="mb-4">
              <span className="font-semibold text-gray-700">Date of Birth:</span>
              <div className="text-black">{profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : '-'}</div>
            </div>
            <div className="mb-4">
              <span className="font-semibold text-gray-700">Reference Number:</span>
              <div className="text-black">{profile.referenceNumber || '-'}</div>
            </div>
            <div className="mb-4">
              <span className="font-semibold text-gray-700">Status:</span>
              <div className="text-black">{profile.status || '-'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 