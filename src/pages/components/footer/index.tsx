import { useEffect, useState } from "react";
import { FaFacebookF, FaTwitter, FaLinkedinIn, FaInstagram } from "react-icons/fa";
import { MdEmail, MdPhoneAndroid, MdLocationOn } from "react-icons/md";
import imageLogo from "../../../../public/assests/logo background remove.png"

type UserRole = "locum" | "practice" | "branch";

type QuickLink = {
  label: string;
  href: string;
  description?: string;
};

const resolveUserRole = (profile: any): UserRole | null => {
  if (!profile || typeof profile !== "object") return null;

  const normalizedRole = String(profile.role || profile.userType || "").toLowerCase();

  if (normalizedRole.includes("practice")) return "practice";
  if (normalizedRole.includes("branch")) return "branch";
  if (normalizedRole.includes("locum")) return "locum";

  if (profile.practiceType || profile.practiceName) return "practice";
  if (profile.branchId || profile.branchName) return "branch";
  if (profile.employeeType || profile.GDCnumber || profile.locumId) return "locum";

  return null;
};

const quickLinksByRole: Record<UserRole, QuickLink[]> = {
  locum: [
    { label: "Dashboard", href: "/locumStaff/dashboard", description: "Overview of requests and availability." },
    { label: "My Bookings", href: "/locumStaff/myBookings", description: "Review and manage confirmed shifts." },
    { label: "Timesheets", href: "/locumStaff/timesheet", description: "Submit and track your timesheets." },
    { label: "Payments", href: "/locumStaff/payment", description: "Add and manage your payment methods." },
  ],
  practice: [
    { label: "Home", href: "/practiceUser/home", description: "Monitor practice performance and requests." },
    { label: "My Bookings", href: "/practiceUser/myBookings", description: "Track locum bookings in one place." },
    { label: "Payments", href: "/practiceUser/payment", description: "Review invoices and transactions." },
  ],
  branch: [
    { label: "Home", href: "/branch/home", description: "View today's schedule and notices." },
    { label: "Select Nurses", href: "/branch/SelectNurses", description: "Request cover for upcoming shifts." },
    { label: "My Bookings", href: "/branch/myBookings", description: "Manage confirmed sessions easily." },
    { label: "Payments", href: "/branch/payment", description: "Check payment status and history." },
  ],
};

const roleTaglines: Record<UserRole, string> = {
  locum: "Stay organised with quick access to your shifts and paperwork.",
  practice: "Manage your teams and bookings with the shortcuts below.",
  branch: "Jump back into your day-to-day tasks in a tap.",
};

export default function Footer() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  useEffect(() => {
    const syncAuthState = () => {
      if (typeof window === "undefined") return;

      const token = localStorage.getItem("token");
      setIsLoggedIn(!!token);

      if (!token) {
        setUserRole(null);
        return;
      }

      const profileStr = localStorage.getItem("profile");
      if (!profileStr) {
        setUserRole(null);
        return;
      }

      try {
        const parsedProfile = JSON.parse(profileStr);
        setUserRole(resolveUserRole(parsedProfile));
      } catch {
        setUserRole(null);
      }
    };

    syncAuthState();
    window.addEventListener("storage", syncAuthState);

    return () => {
      window.removeEventListener("storage", syncAuthState);
    };
  }, []);

  const quickLinks = userRole ? quickLinksByRole[userRole] : [];
  const showQuickAccess = isLoggedIn && quickLinks.length > 0;
  const gridClasses = showQuickAccess
    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6"
    : isLoggedIn
      ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6"
      : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6";

  const quickAccessTagline = userRole ? roleTaglines[userRole] : "Stay organised with quick access to your key tools.";

  return (
    <footer className="bg-gradient-to-br from-[#d1eeeb] to-[#c3eae7] text-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-5">
        <div className={gridClasses}>

          <div className="lg:col-span-2 sm:col-span-2">
            <div className="flex flex-col items-start">
              <img
                src={imageLogo.src}
                alt="Locum Lux Logo"
                className="w-28 lg:w-32 mb-3 hover:scale-105 transition-transform duration-300"
              />
              <div className="text-sm lg:text-base text-gray-700 leading-relaxed">
                <p className="mb-1">
                  <span className="font-semibold text-gray-800">Locumlux</span> is a trading name & owned by
                  <span className="font-bold text-gray-900 block mt-1">LUX DENT AGENCY LIMITED</span>
                </p>
                <div className="space-y-1 mt-2 text-sm">
                  <p><span className="font-medium">Company no.</span> 10800218</p>
                  <p>Registered in England and Wales</p>
                </div>
              </div>
            </div>
          </div>

          {showQuickAccess && (
            <div className="sm:col-span-1">
              <h3 className="font-bold text-lg mb-2 text-gray-900 border-b-2 border-emerald-400 pb-1 inline-block">
                QUICK ACCESS
              </h3>
              <p className="text-sm text-gray-600 mb-2 leading-relaxed">
                {quickAccessTagline}
              </p>
              <ul className="space-y-2 text-sm lg:text-base">
                {quickLinks.map(({ label, href, description }) => (
                  <li key={label}>
                    <a
                      href={href}
                      className="group block rounded-xl border border-transparent bg-white/40 px-3 py-2 text-gray-800 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-emerald-200 hover:bg-white"
                    >
                      <span className="flex items-center justify-between font-semibold">
                        {label}
                        <span className="ml-3 inline-flex h-2 w-2 items-center justify-center rounded-full bg-emerald-400 group-hover:bg-emerald-500 transition-colors" />
                      </span>
                      {description && (
                        <span className="mt-1 block text-xs text-gray-600">
                          {description}
                        </span>
                      )}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {!isLoggedIn && (
            <div className="sm:col-span-1">
              <h3 className="font-bold text-lg mb-2 text-gray-900 border-b-2 border-teal-400 pb-1 inline-block">
                ABOUT
              </h3>
              <ul className="space-y-2 text-sm lg:text-base">
                {[
                  { label: 'About Us', href: '/components/aboutus' },
                  { label: 'Dental Practices', href: '/components/dentalpractices' },
                  { label: 'Dental Nurses', href: '/components/dentalnurses' },
                  { label: 'Hygienist', href: '/components/hygienist' },
                  { label: 'Accounting', href: '/components/accounting' },
                  { label: 'Contact Us', href: '/components/contactus' }
                ].map((item, index) => (
                  <li key={index}>
                    <a
                      href={item.href}
                      className="text-gray-700 hover:text-teal-600 hover:translate-x-1 transition-all duration-200 flex items-center group"
                    >
                      <span className="w-2 h-2 bg-teal-400 rounded-full mr-3 group-hover:bg-teal-600 transition-colors"></span>
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {!isLoggedIn && (
            <div className="sm:col-span-1">
              <h3 className="font-bold text-lg mb-2 text-gray-900 border-b-2 border-pink-400 pb-1 inline-block">
                USEFUL LINKS
              </h3>
              <ul className="space-y-2 text-sm lg:text-base">
                {[
                  { label: 'Join as a Practice', href: '/practiceUser/practiceRegister' },
                  { label: 'Join as a Nurse', href: '/locumStaff/register' },
                ].map((item, index) => (
                  <li key={index}>
                    <a
                      href={item.href}
                      className="text-gray-700 hover:text-pink-600 hover:translate-x-1 transition-all duration-200 flex items-center group"
                    >
                      <span className="w-2 h-2 bg-pink-400 rounded-full mr-3 group-hover:bg-pink-600 transition-colors"></span>
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="sm:col-span-2 lg:col-span-1">
            <h3 className="font-bold text-lg mb-2 text-gray-900 border-b-2 border-blue-400 pb-1 inline-block">
              CONTACT US
            </h3>

            <div className="mb-3">
              <div className="flex items-start gap-3 text-sm lg:text-base mb-2">
                <MdLocationOn className="text-blue-500 text-xl mt-1 flex-shrink-0" />
                <div>
                  <span className="font-semibold block mb-1">Office Address:</span>
                  <p className="text-gray-700 leading-relaxed">
                  61 Griffiths Road, Wimbledon, London, England, SW19 1ST
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 mb-2 text-sm lg:text-base group cursor-pointer">
                <div className="bg-pink-100 p-2 rounded-full group-hover:bg-pink-200 transition-colors">
                  <MdPhoneAndroid className="text-pink-500 text-lg" />
                </div>
                <a href="tel:07490714868" className="text-gray-700 hover:text-pink-600 transition-colors font-medium">
                074 9071 4868
                </a>
              </div>

              <div className="flex items-center gap-3 mb-3 text-sm lg:text-base group cursor-pointer">
                <div className="bg-blue-100 p-2 rounded-full group-hover:bg-blue-200 transition-colors">
                  <MdEmail className="text-blue-500 text-lg" />
                </div>
                <a href="mailto:info@locumlux.co.uk" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                info@locumlux.co.uk
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-base mb-2 text-gray-900">FOLLOW US</h4>
              <div className="flex space-x-4">
                {[
                  { Icon: FaFacebookF, color: 'hover:bg-blue-600', bg: 'bg-blue-500' },
                  { Icon: FaTwitter, color: 'hover:bg-sky-500', bg: 'bg-sky-400' },
                  { Icon: FaLinkedinIn, color: 'hover:bg-blue-700', bg: 'bg-blue-600' },
                  { Icon: FaInstagram, color: 'hover:bg-pink-600', bg: 'bg-pink-500' }
                ].map(({ Icon, color, bg }, index) => (
                  <a
                    key={index}
                    href="#"
                    className={`${bg} ${color} text-white p-2 rounded-full transition-all duration-300 hover:scale-110 hover:shadow-lg transform`}
                  >
                    <Icon className="text-base" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#b8e3df] border-t border-teal-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-col sm:flex-row justify-between items-center text-sm lg:text-base">
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-3 sm:mb-0">
              <a
                href="/components/termsandconditions"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-700 hover:text-teal-700 transition-colors duration-200 hover:underline font-medium"
              >
                Terms and Conditions
              </a>
              <span className="text-gray-500 hidden sm:inline">|</span>
              <a
                href="#"
                className="text-gray-700 hover:text-teal-700 transition-colors duration-200 hover:underline font-medium"
              >
                Privacy Policy
              </a>
              <span className="text-gray-500 hidden sm:inline">|</span>
              <a
                href="#"
                className="text-gray-700 hover:text-teal-700 transition-colors duration-200 hover:underline font-medium"
              >
                Cookie Policy
              </a>
            </div>
            <p className="text-gray-600 font-medium">
              © {new Date().getFullYear()} <span className="text-gray-800">Locum Lux</span>. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
