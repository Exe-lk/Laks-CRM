import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Logo from "../../../../public/assests/Laks Dent Logo.png"
import Image from 'next/image';
import Swal from 'sweetalert2';
import ProfileModal from '../profilePracticeUser/index';
import NotificationDropdown from '../notification/NotificationDropdown';
import { FaSignOutAlt, FaCalendarAlt, FaBell } from 'react-icons/fa';
import CalendarModal from '../calendar/CalendarModal';
import { useCheckPracticeHasCardsQuery } from '../../../redux/slices/cardPracticeUserSlice';
import { useGetNotificationsQuery } from '../../../redux/slices/notificationSlice';
import { clearSessionStorage } from '@/utils/sessionManager';

const NavBar = () => {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profile, setProfile] = useState<{
    id?: string;
    fullName?: string;
    emailAddress?: string;
    contactNumber?: string;
    address?: string;
    gdcNumber?: string;
    employeeType?: string;
    dateOfBirth?: string;
    status?: string;
    practiceType?: string;
  } | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const { data: cardStatusData } = useCheckPracticeHasCardsQuery(profile?.id || '', {
    skip: !profile?.id || !isLoggedIn
  });

  const { data: notificationsData } = useGetNotificationsQuery(
    { practiceId: profile?.id || '', limit: 100 },
    { skip: !profile?.id || !isLoggedIn }
  );
  const unreadCount = notificationsData?.data?.filter((n: any) => n.status === 'UNREAD').length || 0;

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
    if (token) {
      const profileStr = localStorage.getItem('profile');
      if (profileStr) {
        try {
          const rawProfile = JSON.parse(profileStr);
          const mappedProfile = {
            id: rawProfile.id,
            fullName: rawProfile.name,
            emailAddress: rawProfile.email,
            contactNumber: rawProfile.telephone,
            address: rawProfile.address,
            gdcNumber: rawProfile.GDCnumber,
            employeeType: rawProfile.employeeType,
            dateOfBirth: rawProfile.dob,
            status: rawProfile.status,
            practiceType: rawProfile.practiceType,
          };
          setProfile(mappedProfile);
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
            const rawProfile = JSON.parse(profileStr);
            const mappedProfile = {
              id: rawProfile.id,
              fullName: rawProfile.name,
              emailAddress: rawProfile.email,
              contactNumber: rawProfile.telephone,
              address: rawProfile.address,
              gdcNumber: rawProfile.GDCnumber,
              employeeType: rawProfile.employeeType,
              dateOfBirth: rawProfile.dob,
              status: rawProfile.status,
              practiceType: rawProfile.practiceType,
            };
            setProfile(mappedProfile);
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
            🏥 Individual Practice / Corporate Practices
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
            🏥 Individual Practice / Corporate Practices
          </button>
          <button id="branchBtn" class="w-full bg-[#B8E6E3] hover:bg-[#9dd6d1] text-black py-2 px-4 rounded-md text-base font-medium">
            🏢 Multiple Practices / Corporate Company
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
        clearSessionStorage();
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
    <nav className="fixed top-0 left-0 right-0 w-full border-b border-black bg-[#C3EAE7] shadow-md z-50">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start ml-4">
          <div className="flex items-center space-x-1 sm:space-x-2">
            <Image src={Logo} alt="Logo" width={160} height={100} />
          </div>
        </div>

        <div className="hidden md:flex items-center space-x-2 lg:space-x-4">
          {!isLoggedIn ? (
            <>
              <button className="bg-white text-black px-4 lg:px-6 py-2 rounded-full font-medium hover:bg-[#A9DBD9] transition text-base" onClick={handleLoginClick}>
                Login
              </button>
              <button className="bg-white text-black px-4 lg:px-6 py-2 rounded-full font-medium hover:bg-[#A9DBD9] transition text-base" onClick={handleRegisterClick}>
                Register
              </button>
              <button className="text-black px-4 lg:px-6 py-2 rounded-full font-medium transition text-base flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6l-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2h5l2-2h7a2 2 0 002-2V8a2 2 0 00-2-2h-7z"
                  />
                </svg>
                User Guide
              </button>

            </>
          ) : (
            <>
              <div className="flex items-center space-x-2 border border-black rounded-lg p-3 shadow-sm bg-white">
                <div className="flex flex-col items-end mr-3 text-sm lg:text-base">
                  <span className="font-semibold text-gray-700 leading-tight">
                    {profile?.fullName || 'Practice User'}
                  </span>
                  {profile?.emailAddress && (
                    <span className="text-gray-500">
                      {profile.emailAddress}
                    </span>
                  )}
                </div>
              </div>

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
                className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 hover:bg-blue-100 transition text-blue-600 hover:text-blue-800 mr-2 relative"
                onClick={() => setIsNotificationOpen(true)}
                aria-label="View Notifications"
                title="View Notifications"
              >
                <FaBell className="text-xl" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
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

        <div className="md:hidden flex items-center space-x-2">
          {isLoggedIn && (
            <button
              className="flex items-center justify-center w-9 h-9 rounded-full bg-gray-200 hover:bg-blue-100 transition text-blue-600 hover:text-blue-800 relative"
              onClick={() => setIsNotificationOpen(true)}
              aria-label="View Notifications"
              title="View Notifications"
            >
              <FaBell className="text-lg" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>
          )}
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

      <div className="hidden md:block border-t border-black">
        <ul className="flex justify-center space-x-6 lg:space-x-12 py-3 text-base font-medium text-gray-800">
          <li
            className={`hover:text-blue-600 cursor-pointer transition-colors px-3 py-1 rounded-full ${isActivePage('/practiceUser/home') ? 'bg-white text-black' : ''
              }`}
            onClick={() => router.push('/practiceUser/home')}
          >
            Home
          </li>

          {isLoggedIn && (
            <>
              {profile?.practiceType === 'Corporate' ? (
                <><li
                  className={`hover:text-blue-600 cursor-pointer transition-colors px-3 py-1 rounded-full ${isActivePage('/practiceUser/branches') ? 'bg-white text-black' : ''}`}
                  onClick={() => router.push('/practiceUser/branches')}
                >
                  Branches
                </li><li
                  className={`hover:text-blue-600 cursor-pointer transition-colors px-3 py-1 rounded-full ${isActivePage('/practiceUser/myBookings') ? 'bg-white text-black' : ''}`}
                  onClick={() => router.push('/practiceUser/myBookings')}
                >
                    My Bookings
                  </li></>

              ) : (
                <>
                  <li
                    className={`hover:text-blue-600 cursor-pointer transition-colors px-3 py-1 rounded-full ${isActivePage('/practiceUser/SelectNurses') ? 'bg-white text-black' : ''
                      }`}
                    onClick={() => router.push('/practiceUser/SelectNurses')}
                  >
                    Appointments
                  </li>
                  <li
                    className={`hover:text-blue-600 cursor-pointer transition-colors px-3 py-1 rounded-full ${isActivePage('/practiceUser/myBookings') ? 'bg-white text-black' : ''
                      }`}
                    onClick={() => router.push('/practiceUser/myBookings')}
                  >
                    My Bookings
                  </li>
                  <li
                    className={`hover:text-blue-600 cursor-pointer transition-colors px-3 py-1 rounded-full ${isActivePage('/practiceUser/payment') ? 'bg-white text-black' : ''
                      }`}
                    onClick={() => router.push('/practiceUser/payment')}
                  >
                    Payment
                    {cardStatusData && !cardStatusData.hasCards && (
                      <span className="ml-1 inline-flex items-center justify-center w-2 h-2 bg-red-500 rounded-full"></span>
                    )}
                  </li>
                </>
              )}
            </>
          )}
          {
            !isLoggedIn && (
              <>
                <li
                  className={`hover:text-blue-600 cursor-pointer transition-colors px-3 py-1 rounded-full ${isActivePage('/') ? 'bg-white text-black' : ''
                    }`}
                  onClick={() => router.push('/')}
                >
                  Home
                </li>
                <li
                  className={`hover:text-blue-600 cursor-pointer transition-colors px-3 py-1 rounded-full ${isActivePage('/components/aboutus') ? 'bg-white text-black' : ''
                    }`}
                  onClick={() => router.push('/components/aboutus')}
                >
                  About Us
                </li>
                <li
                  className={`hover:text-blue-600 cursor-pointer transition-colors px-3 py-1 rounded-full ${isActivePage('/components/dentalpractices') ? 'bg-white text-black' : ''
                    }`}
                  onClick={() => router.push('/components/dentalpractices')}
                >
                  Dental Practices
                </li>
                <li
                  className={`hover:text-blue-600 cursor-pointer transition-colors px-3 py-1 rounded-full ${isActivePage('/components/dentalnurses') ? 'bg-white text-black' : ''
                    }`}
                  onClick={() => router.push('/components/dentalnurses')}
                >
                  Dental Nurses
                </li>
                <li
                  className={`hover:text-blue-600 cursor-pointer transition-colors px-3 py-1 rounded-full ${isActivePage('/components/hygienist') ? 'bg-white text-black' : ''
                    }`}
                  onClick={() => router.push('/components/hygienist')}
                >
                  Hygienist
                </li>
                <li
                  className={`hover:text-blue-600 cursor-pointer transition-colors px-3 py-1 rounded-full ${isActivePage('/components/accounting') ? 'bg-white text-black' : ''
                    }`}
                  onClick={() => router.push('/components/accounting')}
                >
                  Accounting
                </li>
                <li
                  className={`hover:text-blue-600 cursor-pointer transition-colors px-3 py-1 rounded-full ${isActivePage('/components/contactus') ? 'bg-white text-black' : ''
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
        <div className="md:hidden fixed inset-0 z-50 backdrop-blur-sm bg-opacity-50" onClick={closeMobileMenu}>
          <div className="fixed inset-y-0 right-0 max-w-xs w-full bg-[#C3EAE7] shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-black">
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
              {isLoggedIn && (
                <div className="mb-6 bg-white border border-black rounded-lg p-3 shadow-sm items-center">
                  <p className="text-base font-semibold text-black">
                    {profile?.fullName || 'Practice User'}
                  </p>
                  {profile?.emailAddress && (
                    <p className="text-base text-gray-500">
                      {profile.emailAddress}
                    </p>
                  )}
                </div>
              )}
              <ul className="space-y-4 text-base font-medium text-gray-800">
                <li
                  className={`hover:text-blue-600 cursor-pointer transition-colors px-3 py-2 rounded-full ${isActivePage('/practiceUser/home') ? 'bg-white text-black' : ''
                    }`}
                  onClick={() => { router.push('/practiceUser/home'); closeMobileMenu(); }}
                >
                  Home
                </li>
                {isLoggedIn && (
                  <>
                    {profile?.practiceType === 'Corporate' ? (
                      <li
                        className={`hover:text-blue-600 cursor-pointer transition-colors px-3 py-2 rounded-full ${isActivePage('/practiceUser/branches') ? 'bg-white text-black' : ''
                          }`}
                        onClick={() => { router.push('/practiceUser/branches'); closeMobileMenu(); }}
                      >
                        Branches
                      </li>
                    ) : (
                      <>
                        <li
                          className={`hover:text-blue-600 cursor-pointer transition-colors px-3 py-2 rounded-full ${isActivePage('/practiceUser/SelectNurses') ? 'bg-white text-black' : ''
                            }`}
                          onClick={() => { router.push('/practiceUser/SelectNurses'); closeMobileMenu(); }}
                        >
                          Appointments
                        </li>
                        <li
                          className={`hover:text-blue-600 cursor-pointer transition-colors px-3 py-2 rounded-full ${isActivePage('/practiceUser/myBookings') ? 'bg-white text-black' : ''
                            }`}
                          onClick={() => { router.push('/practiceUser/myBookings'); closeMobileMenu(); }}
                        >
                          My Bookings
                        </li>
                        <li
                          className={`hover:text-blue-600 cursor-pointer transition-colors px-3 py-2 rounded-full ${isActivePage('/practiceUser/payment') ? 'bg-white text-black' : ''
                            }`}
                          onClick={() => { router.push('/practiceUser/payment'); closeMobileMenu(); }}
                        >
                          Payment
                          {cardStatusData && !cardStatusData.hasCards && (
                            <span className="ml-1 inline-flex items-center justify-center w-2 h-2 bg-red-500 rounded-full"></span>
                          )}
                        </li>
                      </>
                    )}
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
                        className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 hover:bg-blue-100 transition text-blue-600 hover:text-blue-800 relative"
                        onClick={() => { setIsNotificationOpen(true); closeMobileMenu(); }}
                        aria-label="View Notifications"
                        title="View Notifications"
                      >
                        <FaBell className="text-xl" />
                        {unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                            {unreadCount > 99 ? '99+' : unreadCount}
                          </span>
                        )}
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
                        className={`hover:text-blue-600 cursor-pointer transition-colors px-3 py-2 rounded-full ${isActivePage('/') ? 'bg-white text-black' : ''
                          }`}
                        onClick={() => { router.push('/'); closeMobileMenu(); }}
                      >
                        Home
                      </li>
                      <li
                        className={`hover:text-blue-600 cursor-pointer transition-colors px-3 py-2 rounded-full ${isActivePage('/components/aboutus') ? 'bg-white text-black' : ''
                          }`}
                        onClick={() => { router.push('/components/aboutus'); closeMobileMenu(); }}
                      >
                        About Us
                      </li>
                      <li
                        className={`hover:text-blue-600 cursor-pointer transition-colors px-3 py-2 rounded-full ${isActivePage('/components/dentalpractices') ? 'bg-white text-black' : ''
                          }`}
                        onClick={() => { router.push('/components/dentalpractices'); closeMobileMenu(); }}
                      >
                        Dental Practices
                      </li>
                      <li
                        className={`hover:text-blue-600 cursor-pointer transition-colors px-3 py-2 rounded-full ${isActivePage('/components/dentalnurses') ? 'bg-white text-black' : ''
                          }`}
                        onClick={() => { router.push('/components/dentalnurses'); closeMobileMenu(); }}
                      >
                        Dental Nurses
                      </li>
                      <li
                        className={`hover:text-blue-600 cursor-pointer transition-colors px-3 py-2 rounded-full ${isActivePage('/components/hygienist') ? 'bg-white text-black' : ''
                          }`}
                        onClick={() => { router.push('/components/hygienist'); closeMobileMenu(); }}
                      >
                        Hygienist
                      </li>
                      <li
                        className={`hover:text-blue-600 cursor-pointer transition-colors px-3 py-2 rounded-full ${isActivePage('/components/accounting') ? 'bg-white text-black' : ''
                          }`}
                        onClick={() => { router.push('/components/accounting'); closeMobileMenu(); }}
                      >
                        Accounting
                      </li>
                      <li
                        className={`hover:text-blue-600 cursor-pointer transition-colors px-3 py-2 rounded-full ${isActivePage('/components/contactus') ? 'bg-white text-black' : ''
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
                    <button className="w-full bg-[#C3EAE7] text-black text-sm px-6 py-3 rounded-full font-medium hover:bg-[#A9DBD9] transition" onClick={handleLoginClick} >
                      Login
                    </button>
                    <button className="w-full bg-[#C3EAE7] text-black text-sm px-6 py-3 rounded-full font-medium hover:bg-[#A9DBD9] transition" onClick={handleRegisterClick} >
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
      {isLoggedIn && profile?.id && (
        <NotificationDropdown
          userId={profile.id}
          userType="practice"
          isOpen={isNotificationOpen}
          onClose={() => setIsNotificationOpen(false)}
        />
      )}
    </nav>
  );
};

export default NavBar;