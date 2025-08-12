import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Logo from "../../../../public/assests/logolaksCRM.jpg"
import Image from 'next/image';
import Swal from 'sweetalert2';
import ProfileModal from '../profile/ProfileModal';
import CalendarModal from '../calendar/CalendarModal';
import { FaUserMd, FaEnvelope, FaIdBadge, FaPhone, FaBirthdayCake, FaUserShield, FaCheckCircle, FaTimesCircle, FaMapMarkerAlt, FaBriefcase, FaSignOutAlt, FaCalendarAlt } from 'react-icons/fa';
import { useGetBookingsQuery } from '../../../redux/slices/bookingPracticeSlice';


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
    status?: string;
  } | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);

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

    const handleStorage = () => {
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
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const isActivePage = (path: string) => {
    return router.pathname === path;
  };

  const handleRegisterClick = () => {
    Swal.fire({
      title: 'Do you want to register as a...',
      icon: 'question',
      showConfirmButton: false,
      showDenyButton: false,
      showCancelButton: false,
      showCloseButton: true,
      background: '#f0f9ff',
      html: `
        <div class="flex flex-col gap-4 mt-4">
          <button id="locumBtn" class="w-full bg-[#C3EAE7] hover:bg-[#a8d5d2] text-black py-2 px-4 rounded-md text-base font-medium">
            👩‍⚕️ Locum Staff
          </button>
          <button id="dentalBtn" class="w-full bg-[#A9DBD9] hover:bg-[#92cfc7] text-black py-2 px-4 rounded-md text-base font-medium">
            🏥 Dental Practice
          </button>
        </div>
      `,
      customClass: {
        popup: 'rounded-xl shadow-lg',
        title: 'text-lg font-semibold text-gray-800',
      },
      didOpen: () => {
        const popup = Swal.getPopup();
        const locumBtn = popup ? popup.querySelector<HTMLButtonElement>('#locumBtn') : null;
        const dentalBtn = popup ? popup.querySelector<HTMLButtonElement>('#dentalBtn') : null;

        if (locumBtn) {
          locumBtn.addEventListener('click', () => {
            router.push('/locumStaff/register');
            Swal.close();
          });
        }

        if (dentalBtn) {
          dentalBtn.addEventListener('click', () => {
            router.push('/practiceUser/practiceRegister');
            Swal.close();
          });
        }
      }
    });

    closeMobileMenu?.();
  };

  const handleLoginClick = () => {
    Swal.fire({
      title: 'Do you want to login as a...',
      icon: 'question',
      showConfirmButton: false,
      showDenyButton: false,
      showCancelButton: false,
      showCloseButton: true,
      background: '#f0f9ff',
      html: `
        <div class="flex flex-col gap-4 mt-4">
          <button id="locumBtn" class="w-full bg-[#C3EAE7] hover:bg-[#a8d5d2] text-black py-2 px-4 rounded-md text-base font-medium">
            👩‍⚕️ Locum Staff
          </button>
          <button id="dentalBtn" class="w-full bg-[#A9DBD9] hover:bg-[#92cfc7] text-black py-2 px-4 rounded-md text-base font-medium">
            🏥 Dental Practice
          </button>
        </div>
      `,
      customClass: {
        popup: 'rounded-xl shadow-lg',
        title: 'text-lg font-semibold text-gray-800',
      },
      didOpen: () => {
        const popup = Swal.getPopup();
        const locumBtn = popup ? popup.querySelector<HTMLButtonElement>('#locumBtn') : null;
        const dentalBtn = popup ? popup.querySelector<HTMLButtonElement>('#dentalBtn') : null;

        if (locumBtn) {
          locumBtn.addEventListener('click', () => {
            router.push('/locumStaff/login');
            Swal.close();
          });
        }

        if (dentalBtn) {
          dentalBtn.addEventListener('click', () => {
            router.push('/practiceUser/practiceLogin');
            Swal.close();
          });
        }
      }
    });

    closeMobileMenu?.();
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
              <button className="bg-[#C3EAE7] text-black text-xs px-4 lg:px-6 py-2 rounded-full font-medium hover:bg-[#A9DBD9] transition" onClick={handleLoginClick}>
                Login
              </button>
              <button className="bg-[#C3EAE7] text-black text-xs px-4 lg:px-6 py-2 rounded-full font-medium hover:bg-[#A9DBD9] transition" onClick={handleRegisterClick}>
                Register
              </button>
            </>
          ) : (
            <>
              <button
                className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 transition mr-2"
                title="View Profile"
                onClick={() => { if (profile) setIsProfileModalOpen(true); }}
              >
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
                </svg>
              </button>
              <button
                className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 hover:bg-blue-100 transition text-blue-600 hover:text-blue-800 mr-2"
                onClick={() => setIsCalendarModalOpen(true)}
                aria-label="View Calendar"
                title="View Calendar"
              >
                <FaCalendarAlt className="text-xl" />
              </button>
              <button
                className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 hover:bg-red-100 transition text-red-600 hover:text-red-800"
                onClick={handleLogout}
                aria-label="Logout"
                title="Logout"
              >
                <FaSignOutAlt className="text-xl" />
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
            className={`hover:text-blue-600 text-xs cursor-pointer transition-colors px-3 py-1 rounded-full ${isActivePage('/') ? 'bg-[#C3EAE7] text-black' : ''
              }`}
            onClick={() => router.push('/')}
          >
            Home
          </li>

          {isLoggedIn && (
            <>
              <li
                className={`hover:text-blue-600 text-xs cursor-pointer transition-colors px-3 py-1 rounded-full ${isActivePage('/components/myDocumnet') ? 'bg-[#C3EAE7] text-black' : ''
                  }`}
                onClick={() => router.push('/components/myDocumnet')}
              >
                Document Upload
              </li>
              {/* <li
                className={`hover:text-blue-600 text-xs cursor-pointer transition-colors px-3 py-1 rounded-full ${isActivePage('/locumStaff/requestAppointments') ? 'bg-[#C3EAE7] text-black' : ''
                  }`}
                onClick={() => router.push('/locumStaff/requestAppointments')}
              >
                Request Appointments
              </li> */}
              <li
                className={`hover:text-blue-600 text-xs cursor-pointer transition-colors px-3 py-1 rounded-full ${isActivePage('/locumStaff/waitingList') ? 'bg-[#C3EAE7] text-black' : ''
                  }`}
                onClick={() => router.push('/locumStaff/waitingList')}
              >
                Waiting List
              </li>
              <li
                className={`hover:text-blue-600 text-xs cursor-pointer transition-colors px-3 py-1 rounded-full ${isActivePage('/locumStaff/pastAppointments') ? 'bg-[#C3EAE7] text-black' : ''
                  }`}
                onClick={() => router.push('/locumStaff/pastAppointments')}
              >
                Past Appointments
              </li>
              <li
                className={`hover:text-blue-600 text-xs cursor-pointer transition-colors px-3 py-1 rounded-full ${isActivePage('/locumStaff/myBookings') ? 'bg-[#C3EAE7] text-black' : ''
                  }`}
                onClick={() => router.push('/locumStaff/myBookings')}
              >
                My Bookings
              </li>
              <li
                className={`hover:text-blue-600 text-xs cursor-pointer transition-colors px-3 py-1 rounded-full ${isActivePage('/locumStaff/pastandcurrentpayments') ? 'bg-[#C3EAE7] text-black' : ''
                  }`}
                onClick={() => router.push('/locumStaff/pastandcurrentpayments')}
              >
                Past and Current Payments
              </li>
            </>
          )}
          {
            !isLoggedIn && (
              <>
                <li
                  className={`hover:text-blue-600 text-xs cursor-pointer transition-colors px-3 py-1 rounded-full ${isActivePage('/components/aboutus') ? 'bg-[#C3EAE7] text-black' : ''
                    }`}
                  onClick={() => router.push('/components/aboutus')}
                >
                  About Us
                </li>
                <li
                  className={`hover:text-blue-600 text-xs cursor-pointer transition-colors px-3 py-1 rounded-full ${isActivePage('/components/dentalpractices') ? 'bg-[#C3EAE7] text-black' : ''
                    }`}
                  onClick={() => router.push('/components/dentalpractices')}
                >
                  Dental Practices
                </li>
                <li
                  className={`hover:text-blue-600 text-xs cursor-pointer transition-colors px-3 py-1 rounded-full ${isActivePage('/components/dentalnurses') ? 'bg-[#C3EAE7] text-black' : ''
                    }`}
                  onClick={() => router.push('/components/dentalnurses')}
                >
                  Dental Nurses
                </li>
                <li
                  className={`hover:text-blue-600 text-xs cursor-pointer transition-colors px-3 py-1 rounded-full ${isActivePage('/components/hygienist') ? 'bg-[#C3EAE7] text-black' : ''
                    }`}
                  onClick={() => router.push('/components/hygienist')}
                >
                  Hygienist
                </li>
                <li
                  className={`hover:text-blue-600 text-xs cursor-pointer transition-colors px-3 py-1 rounded-full ${isActivePage('/components/accounting') ? 'bg-[#C3EAE7] text-black' : ''
                    }`}
                  onClick={() => router.push('/components/accounting')}
                >
                  Accounting
                </li>
                <li
                  className={`hover:text-blue-600  text-xs cursor-pointer transition-colors px-3 py-1 rounded-full ${isActivePage('/components/contactus') ? 'bg-[#C3EAE7] text-black' : ''
                    }`}
                  onClick={() => router.push('/components/contactus')}
                >
                  Contact Us
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
                {isLoggedIn && (
                  <>
                    <li
                      className={`hover:text-blue-600  text-xs cursor-pointer transition-colors px-3 py-2 rounded-full ${isActivePage('/components/myDocumnet') ? 'bg-[#C3EAE7] text-black' : ''
                        }`}
                      onClick={() => { router.push('/components/myDocumnet'); closeMobileMenu(); }}
                    >
                      Document Upload
                    </li>
                    {/* <li
                      className={`hover:text-blue-600  text-xs cursor-pointer transition-colors px-3 py-2 rounded-full ${isActivePage('/locumStaff/requestAppointments') ? 'bg-[#C3EAE7] text-black' : ''
                        }`}
                      onClick={() => { router.push('/locumStaff/requestAppointments'); closeMobileMenu(); }}
                    >
                      Request Appointments
                    </li> */}
                    <li
                      className={`hover:text-blue-600  text-xs cursor-pointer transition-colors px-3 py-2 rounded-full ${isActivePage('/locumStaff/waitingList') ? 'bg-[#C3EAE7] text-black' : ''
                        }`}
                      onClick={() => { router.push('/locumStaff/waitingList'); closeMobileMenu(); }}
                    >
                      Waiting List
                    </li>
                    <li
                      className={`hover:text-blue-600  text-xs cursor-pointer transition-colors px-3 py-2 rounded-full ${isActivePage('/locumStaff/pastAppointments') ? 'bg-[#C3EAE7] text-black' : ''
                        }`}
                      onClick={() => { router.push('/locumStaff/pastAppointments'); closeMobileMenu(); }}
                    >
                      Past Appointments
                    </li>
                    <li
                      className={`hover:text-blue-600  text-xs cursor-pointer transition-colors px-3 py-2 rounded-full ${isActivePage('/locumStaff/myBookings') ? 'bg-[#C3EAE7] text-black' : ''
                        }`}
                      onClick={() => { router.push('/locumStaff/myBookings'); closeMobileMenu(); }}
                    >
                      Ongoing and Future Appointments
                    </li>
                    <li
                      className={`hover:text-blue-600  text-xs cursor-pointer transition-colors px-3 py-2 rounded-full ${isActivePage('/locumStaff/pastandcurrentpayments') ? 'bg-[#C3EAE7] text-black' : ''
                        }`}
                      onClick={() => { router.push('/locumStaff/pastandcurrentpayments'); closeMobileMenu(); }}
                    >
                      Past and Current Payments
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
                      <button
                        className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 hover:bg-blue-100 transition text-blue-600 hover:text-blue-800"
                        onClick={() => { setIsCalendarModalOpen(true); closeMobileMenu(); }}
                        aria-label="View Calendar"
                        title="View Calendar"
                      >
                        <FaCalendarAlt className="text-xl" />
                      </button>
                      <button
                        className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 hover:bg-red-100 transition text-red-600 hover:text-red-800"
                        onClick={handleLogout}
                        aria-label="Logout"
                        title="Logout"
                      >
                        <FaSignOutAlt className="text-xl" />
                      </button>
                    </li>
                  </>
                )}
                {
                  !isLoggedIn && (
                    <>
                      <li
                        className={`hover:text-blue-600  text-xs cursor-pointer transition-colors px-3 py-2 rounded-full ${isActivePage('/components/aboutus') ? 'bg-[#C3EAE7] text-black' : ''
                          }`}
                        onClick={() => { router.push('/components/aboutus'); closeMobileMenu(); }}
                      >
                        About Us
                      </li>
                      <li
                        className={`hover:text-blue-600  text-xs cursor-pointer transition-colors px-3 py-2 rounded-full ${isActivePage('/components/dentalpractices') ? 'bg-[#C3EAE7] text-black' : ''
                          }`}
                        onClick={() => { router.push('/components/dentalpractices'); closeMobileMenu(); }}
                      >
                        Dental Practices
                      </li>
                      <li
                        className={`hover:text-blue-600  text-xs cursor-pointer transition-colors px-3 py-2 rounded-full ${isActivePage('/components/dentalnurses') ? 'bg-[#C3EAE7] text-black' : ''
                          }`}
                        onClick={() => { router.push('/components/dentalnurses'); closeMobileMenu(); }}
                      >
                        Dental Nurses
                      </li>
                      <li
                        className={`hover:text-blue-600  text-xs cursor-pointer transition-colors px-3 py-2 rounded-full ${isActivePage('/components/hygienist') ? 'bg-[#C3EAE7] text-black' : ''
                          }`}
                        onClick={() => { router.push('/components/hygienist'); closeMobileMenu(); }}
                      >
                        Hygienist
                      </li>
                      <li
                        className={`hover:text-blue-600  text-xs cursor-pointer transition-colors px-3 py-2 rounded-full ${isActivePage('/components/accounting') ? 'bg-[#C3EAE7] text-black' : ''
                          }`}
                        onClick={() => { router.push('/components/accounting'); closeMobileMenu(); }}
                      >
                        Accounting
                      </li>
                      <li
                        className={`hover:text-blue-600  text-xs cursor-pointer transition-colors px-3 py-2 rounded-full ${isActivePage('/components/contactus') ? 'bg-[#C3EAE7] text-black' : ''
                          }`}
                        onClick={() => { router.push('/components/contactus'); closeMobileMenu(); }}
                      >
                        Contact Us
                      </li>
                    </>
                  )
                }
              </ul>

              <div className="mt-8 space-y-3">
                {!isLoggedIn ? (
                  <>
                    <button className="w-full bg-[#C3EAE7] text-black text-xs px-6 py-3 rounded-full font-medium hover:bg-[#A9DBD9] transition" onClick={handleLoginClick} >
                      Login
                    </button>
                    <button className="w-full bg-[#C3EAE7] text-black text-xs px-6 py-3 rounded-full font-medium hover:bg-[#A9DBD9] transition" onClick={handleRegisterClick} >
                      Register
                    </button>
                  </>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      )}
      {isProfileModalOpen && (
        <ProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />
      )}
      {isCalendarModalOpen && (
        <CalendarModal isOpen={isCalendarModalOpen} onClose={() => setIsCalendarModalOpen(false)} />
      )}
    </nav>
  );
};

export default NavBar;


