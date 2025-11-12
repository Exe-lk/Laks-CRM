import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Logo from "../../../../public/assests/logolaksCRM.jpg"
import Image from 'next/image';
import Swal from 'sweetalert2';
import ProfileModal from '../profilePracticeUser/index';
import CalendarModal from '../calendar/CalendarModal';
import NotificationDropdown from '../notification/NotificationDropdown';
import { FaSignOutAlt, FaCalendarAlt, FaBell } from 'react-icons/fa';
import { useGetNotificationsQuery } from '../../../redux/slices/notificationSlice';
import { clearSessionStorage } from '@/utils/sessionManager';

const BranchNavBar = () => {
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
    name?: string;
    practiceName?: string;
  } | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const { data: notificationsData } = useGetNotificationsQuery(
    { branchId: profile?.id || '', limit: 100 },
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
            fullName: rawProfile.name || rawProfile.fullName,
            emailAddress: rawProfile.email,
            contactNumber: rawProfile.telephone || rawProfile.contactNumber,
            address: rawProfile.address,
            gdcNumber: rawProfile.GDCnumber || rawProfile.gdcNumber,
            employeeType: rawProfile.employeeType,
            dateOfBirth: rawProfile.dob || rawProfile.dateOfBirth,
            status: rawProfile.status,
            practiceType: rawProfile.practiceType,
            name: rawProfile.name,
            practiceName: rawProfile.practiceName,
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
              fullName: rawProfile.name || rawProfile.fullName,
              emailAddress: rawProfile.email,
              contactNumber: rawProfile.telephone || rawProfile.contactNumber,
              address: rawProfile.address,
              gdcNumber: rawProfile.GDCnumber || rawProfile.gdcNumber,
              employeeType: rawProfile.employeeType,
              dateOfBirth: rawProfile.dob || rawProfile.dateOfBirth,
              status: rawProfile.status,
              practiceType: rawProfile.practiceType,
              name: rawProfile.name,
              practiceName: rawProfile.practiceName,
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
          <button id="branchBtn" class="w-full bg-[#B8E6E3] hover:bg-[#9dd6d1] text-black py-2 px-4 rounded-md text-base font-medium">
            🏢 Branch
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
        const branchBtn = popup ? popup.querySelector<HTMLButtonElement>('#branchBtn') : null;

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

        if (branchBtn) {
          branchBtn.addEventListener('click', () => {
            router.push('/branch/login');
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
    <nav className="fixed top-0 left-0 right-0 w-full border-b border-gray-300 bg-white shadow-md z-50">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3 lg:py-4">
        <div className="flex flex-col items-start ml-4">
          <div className="flex items-center space-x-1 sm:space-x-2">
            <Image src={Logo} alt="Logo" width={160} height={100} />
          </div>
        </div>

        <div className="hidden md:flex items-center space-x-2 lg:space-x-4">
          {!isLoggedIn ? (
            <>
              <button className="bg-[#C3EAE7] text-black px-4 lg:px-6 py-2 rounded-full font-medium hover:bg-[#A9DBD9] transition text-sm lg:text-base" onClick={handleLoginClick}>
                Login
              </button>
              <button className="bg-[#C3EAE7] text-black px-4 lg:px-6 py-2 rounded-full font-medium hover:bg-[#A9DBD9] transition text-sm lg:text-base" onClick={handleRegisterClick}>
                Register
              </button>
            </>
          ) : (
            <>
              {profile?.name && profile?.practiceName && (
                <div className="text-center mr-3 py-2 px-4 bg-[#C3EAE7]/30 rounded-lg">
                  <p className="text-sm font-semibold text-gray-800">{profile.name}</p>
                  <p className="text-xs text-gray-600">{profile.practiceName}</p>
                </div>
              )}
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

          {isLoggedIn && (
            <>
              <li
                className={`hover:text-blue-600 cursor-pointer transition-colors px-3 py-1 rounded-full ${isActivePage('/branch/home') ? 'bg-[#C3EAE7] text-black' : ''
                  }`}
                onClick={() => router.push('/branch/home')}
              >
                Home
              </li>
              <li
                className={`hover:text-blue-600 cursor-pointer transition-colors px-3 py-1 rounded-full ${isActivePage('/branch/SelectNurses') ? 'bg-[#C3EAE7] text-black' : ''
                  }`}
                onClick={() => router.push('/branch/SelectNurses')}
              >
                Appointments
              </li>
              <li
                className={`hover:text-blue-600 cursor-pointer transition-colors px-3 py-1 rounded-full ${isActivePage('/branch/myBookings') ? 'bg-[#C3EAE7] text-black' : ''
                  }`}
                onClick={() => router.push('/branch/myBookings')}
              >
                My Bookings
              </li>
              <li
                className={`hover:text-blue-600 cursor-pointer transition-colors px-3 py-1 rounded-full ${isActivePage('/branch/payment') ? 'bg-[#C3EAE7] text-black' : ''
                  }`}
                onClick={() => router.push('/branch/payment')}
              >
                Payment
              </li>
            </>
          )}
          {
            !isLoggedIn && (
              <>
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

                {isLoggedIn && (
                  <>
                    <li
                      className={`hover:text-blue-600 cursor-pointer transition-colors px-3 py-2 rounded-full ${isActivePage('/branch/home') ? 'bg-[#C3EAE7] text-black' : ''
                        }`}
                      onClick={() => { router.push('/branch/home'); closeMobileMenu(); }}
                    >
                      Home
                    </li>
                    <li
                      className={`hover:text-blue-600 cursor-pointer transition-colors px-3 py-2 rounded-full ${isActivePage('/branch/SelectNurses') ? 'bg-[#C3EAE7] text-black' : ''
                        }`}
                      onClick={() => { router.push('/branch/SelectNurses'); closeMobileMenu(); }}
                    >
                      Appointments
                    </li>
                    <li
                      className={`hover:text-blue-600 cursor-pointer transition-colors px-3 py-2 rounded-full ${isActivePage('/branch/myBookings') ? 'bg-[#C3EAE7] text-black' : ''
                        }`}
                      onClick={() => { router.push('/branch/myBookings'); closeMobileMenu(); }}
                    >
                      My Bookings
                    </li>
                    <li
                      className={`hover:text-blue-600 cursor-pointer transition-colors px-3 py-2 rounded-full ${isActivePage('/branch/payment') ? 'bg-[#C3EAE7] text-black' : ''
                        }`}
                      onClick={() => { router.push('/branch/payment'); closeMobileMenu(); }}
                    >
                      Payment
                    </li>
                    <li className="flex flex-col items-center space-y-3">
                      {profile?.name && profile?.practiceName && (
                        <div className="text-center w-full py-2 px-3 bg-[#C3EAE7]/30 rounded-lg">
                          <p className="text-sm font-semibold text-gray-800">{profile.name}</p>
                          <p className="text-xs text-gray-600">{profile.practiceName}</p>
                        </div>
                      )}
                      <div className="flex items-center space-x-2">
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
                      </div>
                    </li>
                  </>
                )}
                {
                  !isLoggedIn && (
                    <>
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
                    </>
                  )
                }
              </ul>

              <div className="mt-8 space-y-3">
                {!isLoggedIn ? (
                  <>
                    <button className="w-full bg-[#C3EAE7] text-black px-6 py-3 rounded-full font-medium hover:bg-[#A9DBD9] transition" onClick={handleLoginClick} >
                      Login
                    </button>
                    <button className="w-full bg-[#C3EAE7] text-black px-6 py-3 rounded-full font-medium hover:bg-[#A9DBD9] transition" onClick={handleRegisterClick} >
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
          userType="branch"
          isOpen={isNotificationOpen}
          onClose={() => setIsNotificationOpen(false)}
        />
      )}
    </nav>
  );
};

export default BranchNavBar;
