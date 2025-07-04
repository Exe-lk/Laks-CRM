import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Logo from "../../../../public/assests/Laks Dent Logo.png"
import Image from 'next/image';

const NavBar = () => {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
          <button className="bg-[#C3EAE7] text-black px-4 lg:px-6 py-2 rounded-full font-medium hover:bg-[#A9DBD9] transition text-sm lg:text-base" onClick={() => router.push('/login')}>
            Login
          </button>
          <button className="bg-[#C3EAE7] text-black px-4 lg:px-6 py-2 rounded-full font-medium hover:bg-[#A9DBD9] transition text-sm lg:text-base" onClick={() => router.push('/register')}>
            Register
          </button>
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
          <li className="hover:text-blue-600 cursor-pointer transition-colors" onClick={() => router.push('/')}>
            Home
          </li>
          <li className="hover:text-blue-600 cursor-pointer transition-colors" onClick={() => router.push('/components/aboutus')}>
            About Us
          </li>
          <li className="hover:text-blue-600 cursor-pointer transition-colors" onClick={() => router.push('/components/dentalpractices')}>
            Dental Practices
          </li>
          <li className="hover:text-blue-600 cursor-pointer transition-colors" onClick={() => router.push('/components/dentalnurses')}>
            Dental Nurses
          </li>
          <li className="hover:text-blue-600 cursor-pointer transition-colors" onClick={() => router.push('/components/hygienist')}>
            Hygienist
          </li>
          <li className="hover:text-blue-600 cursor-pointer transition-colors" onClick={() => router.push('/components/accounting')}>
            Accounting
          </li>
          <li className="hover:text-blue-600 cursor-pointer transition-colors" onClick={() => router.push('/components/contactus')}>
            Contact Us
          </li>
          <li className="hover:text-blue-600 cursor-pointer transition-colors" onClick={() => router.push('/components/myDocumnet')}>
            Document Upload
          </li>
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
                <li className="hover:text-blue-600 cursor-pointer transition-colors" onClick={() => { router.push('/'); closeMobileMenu(); }}>
                  Home
                </li>
                <li className="hover:text-blue-600 cursor-pointer transition-colors" onClick={() => { router.push('/components/aboutus'); closeMobileMenu(); }}>
                  About Us
                </li>
                <li className="hover:text-blue-600 cursor-pointer transition-colors">
                  Dental Practices
                </li>
                <li className="hover:text-blue-600 cursor-pointer transition-colors">
                  Dental Nurses
                </li>
                <li className="hover:text-blue-600 cursor-pointer transition-colors">
                  Hygienist
                </li>
                <li className="hover:text-blue-600 cursor-pointer transition-colors">
                  Accounting
                </li>
                <li className="hover:text-blue-600 cursor-pointer transition-colors" onClick={() => { router.push('/components/contactus'); closeMobileMenu(); }}>
                  Contact Us
                </li>
                <li className="hover:text-blue-600 cursor-pointer transition-colors" onClick={() => { router.push('/components/myDocumnet'); closeMobileMenu(); }}>
                  Document Upload
                </li>
              </ul>

              <div className="mt-8 space-y-3">
                <button className="w-full bg-blue-500 text-white px-6 py-3 rounded-full font-medium hover:bg-blue-600 transition">
                  Login
                </button>
                <button className="w-full bg-blue-500 text-white px-6 py-3 rounded-full font-medium hover:bg-blue-600 transition">
                  Register
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default NavBar;
