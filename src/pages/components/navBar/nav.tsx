import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Logo from "../../../../public/assests/logolaksCRM.jpg"
import Image from 'next/image';
import Swal from 'sweetalert2';


const NavBar = () => {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profile, setProfile] = useState<{
    fullName?: string;
    emailAddress?: string;
    contactNumber?: string;
    address?: string;
    gdcNumber?: string;
    employeeType?: string;
    dateOfBirth?: string;
    referenceNumber?: string;
    status?: string;
  } | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
    if (token) {
      const profileStr = localStorage.getItem('profile');
      if (profileStr) {
        try {
          setProfile(JSON.parse(profileStr));
        } catch {
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
    } else {
      setProfile(null);
    }
  }, []);

  const isActivePage = (path: string) => {
    return router.pathname === path;
  };

  const handleLogout = () => {
    Swal.fire({
      title: 'Are you sure you want to logout?',
      text: 'You will be logged out of your account.',
      icon: 'warning',
      confirmButtonText: 'OK',
      showCancelButton: true,
      cancelButtonText: 'Cancel',
      cancelButtonColor: '#3085d6',
      confirmButtonColor: '#d33',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem('token');
        localStorage.removeItem('user_id');
        localStorage.removeItem('profile');
        setIsLoggedIn(false);

        Swal.fire({
          title: 'Logged out',
          text: 'You have been successfully logged out.',
          icon: 'success',
          confirmButtonText: 'OK',
        }).then(() => {
          router.push('/');
        });
      }
    });
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="w-full border-b border-gray-300 bg-white">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3 lg:py-4">
        <div className="flex flex-col items-start ml-4">
          <div className="flex items-center space-x-1 sm:space-x-2">
            <Image src={Logo} alt="Logo" width={160} height={100} />
          </div>
        </div>

        <div className="hidden md:flex items-center space-x-2 lg:space-x-4">
          {!isLoggedIn ? (
            <>
              <button className="bg-[#C3EAE7] text-black px-4 lg:px-6 py-2 rounded-full font-medium hover:bg-[#A9DBD9] transition text-sm lg:text-base" onClick={() => router.push('/login')}>
                Login
              </button>
              <button className="bg-[#C3EAE7] text-black px-4 lg:px-6 py-2 rounded-full font-medium hover:bg-[#A9DBD9] transition text-sm lg:text-base" onClick={() => router.push('/register')}>
                Register
              </button>
            </>
          ) : (
            <>
              <button
                className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 transition mr-2"
                title="View Profile"
                onClick={() => setIsProfileModalOpen(true)}
              >
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
                </svg>
              </button>
            </>
          )}
        </div>

        <div className="md:hidden">
          <button
            onClick={toggleMobileMenu}
            className="text-gray-600 hover:text-gray-900 focus:outline-none focus:text-gray-900"
            aria-label="Toggle mobile menu"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      <div className="hidden md:block border-t border-gray-300">
        <ul className="flex justify-center space-x-6 lg:space-x-12 py-3 text-base lg:text-lg font-medium text-gray-800">
          <li
            className={`hover:text-blue-600 cursor-pointer transition-colors px-3 py-1 rounded-full ${isActivePage('/') ? 'bg-[#C3EAE7] text-black' : ''
              }`}
            onClick={() => router.push('/')}
          >
            Home
          </li>
          <li
            className={`hover:text-blue-600 cursor-pointer transition-colors px-3 py-1 rounded-full ${isActivePage('/components/aboutus') ? 'bg-[#C3EAE7] text-black' : ''
              }`}
            onClick={() => router.push('/components/aboutus')}
          >
            About Us
          </li>
          <li
            className={`hover:text-blue-600 cursor-pointer transition-colors px-3 py-1 rounded-full ${isActivePage('/components/dentalpractices') ? 'bg-[#C3EAE7] text-black' : ''
              }`}
            onClick={() => router.push('/components/dentalpractices')}
          >
            Dental Practices
          </li>
          <li
            className={`hover:text-blue-600 cursor-pointer transition-colors px-3 py-1 rounded-full ${isActivePage('/components/dentalnurses') ? 'bg-[#C3EAE7] text-black' : ''
              }`}
            onClick={() => router.push('/components/dentalnurses')}
          >
            Dental Nurses
          </li>
          <li
            className={`hover:text-blue-600 cursor-pointer transition-colors px-3 py-1 rounded-full ${isActivePage('/components/hygienist') ? 'bg-[#C3EAE7] text-black' : ''
              }`}
            onClick={() => router.push('/components/hygienist')}
          >
            Hygienist
          </li>
          <li
            className={`hover:text-blue-600 cursor-pointer transition-colors px-3 py-1 rounded-full ${isActivePage('/components/accounting') ? 'bg-[#C3EAE7] text-black' : ''
              }`}
            onClick={() => router.push('/components/accounting')}
          >
            Accounting
          </li>
          <li
            className={`hover:text-blue-600 cursor-pointer transition-colors px-3 py-1 rounded-full ${isActivePage('/components/contactus') ? 'bg-[#C3EAE7] text-black' : ''
              }`}
            onClick={() => router.push('/components/contactus')}
          >
            Contact Us
          </li>
          {isLoggedIn && (
            <>
              <li
                className={`hover:text-blue-600 cursor-pointer transition-colors px-3 py-1 rounded-full ${isActivePage('/components/myDocumnet') ? 'bg-[#C3EAE7] text-black' : ''
                  }`}
                onClick={() => router.push('/components/myDocumnet')}
              >
                Document Upload
              </li>
            </>
          )}
        </ul>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black bg-opacity-50" onClick={closeMobileMenu}>
          <div className="fixed inset-y-0 right-0 max-w-xs w-full bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <span className="text-lg font-semibold">Menu</span>
              <button
                onClick={closeMobileMenu}
                className="text-gray-600 hover:text-gray-900"
                aria-label="Close mobile menu"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-4 py-6">
              <ul className="space-y-4 text-lg font-medium text-gray-800">
                <li
                  className={`hover:text-blue-600 cursor-pointer transition-colors px-3 py-2 rounded-full ${isActivePage('/') ? 'bg-[#C3EAE7] text-black' : ''
                    }`}
                  onClick={() => { router.push('/'); closeMobileMenu(); }}
                >
                  Home
                </li>
                <li
                  className={`hover:text-blue-600 cursor-pointer transition-colors px-3 py-2 rounded-full ${isActivePage('/components/aboutus') ? 'bg-[#C3EAE7] text-black' : ''
                    }`}
                  onClick={() => { router.push('/components/aboutus'); closeMobileMenu(); }}
                >
                  About Us
                </li>
                <li
                  className={`hover:text-blue-600 cursor-pointer transition-colors px-3 py-2 rounded-full ${isActivePage('/components/dentalpractices') ? 'bg-[#C3EAE7] text-black' : ''
                    }`}
                  onClick={() => { router.push('/components/dentalpractices'); closeMobileMenu(); }}
                >
                  Dental Practices
                </li>
                <li
                  className={`hover:text-blue-600 cursor-pointer transition-colors px-3 py-2 rounded-full ${isActivePage('/components/dentalnurses') ? 'bg-[#C3EAE7] text-black' : ''
                    }`}
                  onClick={() => { router.push('/components/dentalnurses'); closeMobileMenu(); }}
                >
                  Dental Nurses
                </li>
                <li
                  className={`hover:text-blue-600 cursor-pointer transition-colors px-3 py-2 rounded-full ${isActivePage('/components/hygienist') ? 'bg-[#C3EAE7] text-black' : ''
                    }`}
                  onClick={() => { router.push('/components/hygienist'); closeMobileMenu(); }}
                >
                  Hygienist
                </li>
                <li
                  className={`hover:text-blue-600 cursor-pointer transition-colors px-3 py-2 rounded-full ${isActivePage('/components/accounting') ? 'bg-[#C3EAE7] text-black' : ''
                    }`}
                  onClick={() => { router.push('/components/accounting'); closeMobileMenu(); }}
                >
                  Accounting
                </li>
                <li
                  className={`hover:text-blue-600 cursor-pointer transition-colors px-3 py-2 rounded-full ${isActivePage('/components/contactus') ? 'bg-[#C3EAE7] text-black' : ''
                    }`}
                  onClick={() => { router.push('/components/contactus'); closeMobileMenu(); }}
                >
                  Contact Us
                </li>
                {isLoggedIn && (
                  <>
                    <li
                      className={`hover:text-blue-600 cursor-pointer transition-colors px-3 py-2 rounded-full ${isActivePage('/components/myDocumnet') ? 'bg-[#C3EAE7] text-black' : ''
                        }`}
                      onClick={() => { router.push('/components/myDocumnet'); closeMobileMenu(); }}
                    >
                      Document Upload
                    </li>
                    <li className="flex items-center space-x-2">
                      <button
                        className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 transition"
                        title="View Profile"
                        onClick={() => { setIsProfileModalOpen(true); closeMobileMenu(); }}
                      >
                        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                          <circle cx="12" cy="8" r="4" />
                          <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
                        </svg>
                      </button>
                    </li>
                  </>
                )}
              </ul>

              <div className="mt-8 space-y-3">
                {!isLoggedIn ? (
                  <>
                    <button className="w-full bg-[#C3EAE7] text-black px-6 py-3 rounded-full font-medium hover:bg-[#A9DBD9] transition" onClick={() => { router.push('/login'); closeMobileMenu(); }}>
                      Login
                    </button>
                    <button className="w-full bg-[#C3EAE7] text-black px-6 py-3 rounded-full font-medium hover:bg-[#A9DBD9] transition" onClick={() => { router.push('/register'); closeMobileMenu(); }}>
                      Register
                    </button>
                  </>
                ) : (
                  <button className="w-full bg-red-500 text-white px-6 py-3 rounded-full font-medium hover:bg-red-600 transition" onClick={() => { handleLogout(); closeMobileMenu(); }}>
                    Logout
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {isProfileModalOpen && (
        <>
          <div className="fixed inset-0 z-40 backdrop-blur-md transition-all duration-300"></div>
          <div className="fixed inset-0 z-50 flex items-center justify-center px-2 py-4 overflow-y-auto">
            <div className="relative w-full max-w-xl flex flex-col" style={{ maxHeight: '90vh' }}>
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-[#C3EAE7] p-0 flex flex-col animate-fadeIn">
                <div className="rounded-t-3xl w-full bg-[#C3EAE7] flex flex-col items-center justify-center py-8 px-4 shadow-md relative">
                  <div className="absolute top-3 right-3 flex space-x-2 z-10">
                    <button
                      className="flex items-center justify-center w-10 h-10 rounded-full bg-red-100 hover:bg-red-500 transition text-red-600 hover:text-white shadow-md border border-red-200"
                      title="Logout"
                      onClick={() => {
                        setIsProfileModalOpen(false);
                        setTimeout(() => { handleLogout(); }, 200);
                      }}
                    >
                      <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                        <path d="M16 17l1.5 1.5a2 2 0 0 1-2.83 2.83l-1.5-1.5" />
                        <path d="M7.5 16.5l-1.5 1.5a2 2 0 0 0 2.83 2.83l1.5-1.5" />
                        <path d="M12 2v10" />
                        <path d="M5 12a7 7 0 0 1 14 0" />
                      </svg>
                    </button>
                    <button
                      className="flex items-center justify-center w-10 h-10 rounded-full bg-white hover:bg-[#C3EAE7] transition text-black text-2xl font-bold focus:outline-none shadow-md border border-[#C3EAE7]"
                      onClick={() => setIsProfileModalOpen(false)}
                      aria-label="Close"
                    >
                      &times;
                    </button>
                  </div>
                  <div className="relative mb-2 mt-2">
                    <div className="w-24 h-24 rounded-full bg-white p-1 flex items-center justify-center shadow-xl border-4 border-[#C3EAE7]">
                      <div className="w-22 h-22 rounded-full bg-[#C3EAE7] flex items-center justify-center">
                        <svg width="60" height="60" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                          <circle cx="12" cy="8" r="4" />
                          <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <h2 className="text-3xl font-extrabold text-black mb-1 mt-2 drop-shadow-lg tracking-tight font-sans">{profile?.fullName || 'User'}</h2>
                  <p className="text-black font-medium mb-2 text-base">Welcome to your profile!</p>
                </div>
                <div className="flex-1 overflow-y-auto px-8 py-8 bg-white rounded-b-3xl">
                  <div className="max-w-xl mx-auto w-full">
                    <div className="relative bg-gradient-to-b from-white to-[#C3EAE7]/40 rounded-2xl shadow-md border-l-4 border-[#C3EAE7] px-8 py-10">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
                        <div className="space-y-5">
                          <div className="flex items-center space-x-2">
                            <span className="text-black"><svg width='20' height='20' fill='none' stroke='#C3EAE7' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' viewBox='0 0 24 24'><circle cx='12' cy='8' r='4'/><path d='M4 20c0-4 4-6 8-6s8 2 8 6'/></svg></span>
                            <span className="font-bold text-black">Full Name:</span>
                          </div>
                          <div className="text-black text-lg ml-7">{profile?.fullName || '-'}</div>
                          <div className="flex items-center space-x-2 mt-4">
                            <span className="text-black"><svg width='20' height='20' fill='none' stroke='#C3EAE7' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' viewBox='0 0 24 24'><path d='M4 4h16v16H4z'/><path d='M22 6l-10 7L2 6'/></svg></span>
                            <span className="font-bold text-black">Email:</span>
                          </div>
                          <div className="text-black text-lg ml-7">{profile?.emailAddress || '-'}</div>
                          <div className="flex items-center space-x-2 mt-4">
                            <span className="text-black"><svg width='20' height='20' fill='none' stroke='#C3EAE7' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' viewBox='0 0 24 24'><path d='M22 16.92V19a2 2 0 0 1-2.18 2A19.72 19.72 0 0 1 3 5.18 2 2 0 0 1 5 3h2.09a2 2 0 0 1 2 1.72c.13.81.37 1.6.7 2.34a2 2 0 0 1-.45 2.11l-.27.27a16 16 0 0 0 6.29 6.29l.27-.27a2 2 0 0 1 2.11-.45c.74.33 1.53.57 2.34.7A2 2 0 0 1 21 16.91z'/></svg></span>
                            <span className="font-bold text-black">Contact Number:</span>
                          </div>
                          <div className="text-black text-lg ml-7">{profile?.contactNumber || '-'}</div>
                          <div className="flex items-center space-x-2 mt-4">
                            <span className="text-black"><svg width='20' height='20' fill='none' stroke='#C3EAE7' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' viewBox='0 0 24 24'><path d='M21 10.5a8.38 8.38 0 0 1-1.9.5 4.48 4.48 0 0 0-7.6 0 8.38 8.38 0 0 1-1.9-.5'/></svg></span>
                            <span className="font-bold text-black">Address:</span>
                          </div>
                          <div className="text-black text-lg ml-7">{profile?.address || '-'}</div>
                        </div>
                        <div className="hidden md:block border-l border-[#C3EAE7] h-full absolute left-1/2 top-0"></div>
                        <div className="space-y-5 md:pl-10">
                          <div className="flex items-center space-x-2">
                            <span className="text-black"><svg width='20' height='20' fill='none' stroke='#C3EAE7' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' viewBox='0 0 24 24'><rect x='3' y='3' width='18' height='18' rx='2'/><path d='M16 3v4a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V3'/></svg></span>
                            <span className="font-bold text-black">GDC Number:</span>
                          </div>
                          <div className="text-black text-lg ml-7">{profile?.gdcNumber || '-'}</div>
                          <div className="flex items-center space-x-2 mt-4">
                            <span className="text-black"><svg width='20' height='20' fill='none' stroke='#C3EAE7' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' viewBox='0 0 24 24'><path d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z'/><path d='M6.5 20h11'/></svg></span>
                            <span className="font-bold text-black">Employee Type:</span>
                          </div>
                          <div className="text-black text-lg ml-7">{profile?.employeeType || '-'}</div>
                          <div className="flex items-center space-x-2 mt-4">
                            <span className="text-black"><svg width='20' height='20' fill='none' stroke='#C3EAE7' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' viewBox='0 0 24 24'><rect x='3' y='4' width='18' height='18' rx='2'/><path d='M16 2v4'/><path d='M8 2v4'/></svg></span>
                            <span className="font-bold text-black">Date of Birth:</span>
                          </div>
                          <div className="text-black text-lg ml-7">{profile?.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : '-'}</div>
                          <div className="flex items-center space-x-2 mt-4">
                            <span className="text-black"><svg width='20' height='20' fill='none' stroke='#C3EAE7' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' viewBox='0 0 24 24'><rect x='2' y='7' width='20' height='14' rx='2'/><path d='M16 3v4'/></svg></span>
                            <span className="font-bold text-black">Reference Number:</span>
                          </div>
                          <div className="text-black text-lg ml-7">{profile?.referenceNumber || '-'}</div>
                        </div>
                      </div>
                    </div>
                    <div className="my-6 border-t border-[#C3EAE7] w-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </nav>
  );
};

export default NavBar;
