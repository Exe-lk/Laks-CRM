import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Logo from "../../../public/assests/Laks Dent Logo.png";
import NavBar from '../components/navBar/nav';

const UserGuideSelection = () => {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState<'locum' | 'practice' | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);

    if (token) {
      const profileStr = localStorage.getItem('profile');
      if (profileStr) {
        try {
          const profile = JSON.parse(profileStr);
          // Check if it's a locum (has emailAddress field)
          if (profile.emailAddress) {
            setUserType('locum');
            // Redirect to nurse guide if logged in as locum
            router.push('/user-guide/nurse');
            return;
          }
          // Check if it's a practice (has email field and practiceType)
          if (profile.email || profile.practiceType) {
            setUserType('practice');
            // Redirect to practice guide if logged in as practice
            router.push('/user-guide/practice');
            return;
          }
        } catch (error) {
          console.error('Error parsing profile:', error);
        }
      }
    }
  }, [router]);

  // If logged in, show loading while redirecting
  if (isLoggedIn) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <NavBar />
        <div className="flex-1 flex items-center justify-center pt-32">
          <div className="text-center">
            <p className="text-gray-600">Loading user guide...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <NavBar />
      
      <div className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        {/* Top Section - Logo and Tagline */}
        <div className="max-w-7xl mx-auto">
          <div className="p-8 sm:p-12 mb-12">
            <div className="flex flex-col items-center text-center">
              <div className="mb-6">
                <Image 
                  src={Logo} 
                  alt="Laks Dent Logo" 
                  width={200} 
                  height={120}
                  className="object-contain"
                />
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-black mb-4">
                User Guide
              </h1>
              <p className="text-lg sm:text-xl text-gray-700 max-w-3xl">
                Select your user guide to get step-by-step instructions for using the platform
              </p>
            </div>
          </div>

          {/* Selection Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Nurse User Guide Card */}
            <div 
              onClick={() => router.push('/user-guide/nurse')}
              className="bg-white border-2 border-[#C3EAE7] rounded-xl p-8 shadow-lg hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300 cursor-pointer group"
            >
              <div className="text-center">
                <div className="mb-6 flex justify-center">
                  <div className="w-20 h-20 bg-[#C3EAE7] rounded-full flex items-center justify-center group-hover:bg-[#A9DBD9] transition-colors">
                    <svg 
                      className="w-10 h-10 text-black" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
                      />
                    </svg>
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-black mb-4">
                  Nurse User Guide
                </h2>
                <p className="text-gray-600 mb-6">
                  Step-by-step instructions for dental nurses, hygienists, and locum staff to register and use the platform
                </p>
                <button className="w-full bg-[#C3EAE7] hover:bg-[#A9DBD9] text-black font-semibold py-3 px-6 rounded-lg transition-colors">
                  View Guide
                </button>
              </div>
            </div>

            {/* Practice User Guide Card */}
            <div 
              onClick={() => router.push('/user-guide/practice')}
              className="bg-white border-2 border-[#C3EAE7] rounded-xl p-8 shadow-lg hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300 cursor-pointer group"
            >
              <div className="text-center">
                <div className="mb-6 flex justify-center">
                  <div className="w-20 h-20 bg-[#C3EAE7] rounded-full flex items-center justify-center group-hover:bg-[#A9DBD9] transition-colors">
                    <svg 
                      className="w-10 h-10 text-black" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" 
                      />
                    </svg>
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-black mb-4">
                  Practice User Guide
                </h2>
                <p className="text-gray-600 mb-6">
                  Step-by-step instructions for dental practices to register and manage appointments with locum staff
                </p>
                <button className="w-full bg-[#C3EAE7] hover:bg-[#A9DBD9] text-black font-semibold py-3 px-6 rounded-lg transition-colors">
                  View Guide
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserGuideSelection;

