import { FaFacebookF, FaTwitter, FaLinkedinIn, FaInstagram } from "react-icons/fa";
import { MdEmail, MdPhoneAndroid, MdLocationOn } from "react-icons/md";
import imageLogo from "../../../../public/assests/Laks Dent Logo.png"

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-[#d1eeeb] to-[#c3eae7] text-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">

          <div className="lg:col-span-2 sm:col-span-2">
            <div className="flex flex-col items-start">
              <img
                src={imageLogo.src}
                alt="Locum Lux Logo"
                className="w-28 lg:w-32 mb-6 hover:scale-105 transition-transform duration-300"
              />
              <div className="text-sm lg:text-base text-gray-700 leading-relaxed">
                <p className="mb-2">
                  <span className="font-semibold text-gray-800">Locumlux</span> is a trading name & owned by
                  <span className="font-bold text-gray-900 block mt-1">LUX DENT AGENCY LIMITED</span>
                </p>
                <div className="space-y-1 mt-4 text-sm">
                  <p><span className="font-medium">Company no.</span> 10800218</p>
                  <p>Registered in England and Wales</p>
                </div>
              </div>
            </div>
          </div>

          <div className="sm:col-span-1">
            <h3 className="font-bold text-lg mb-4 text-gray-900 border-b-2 border-teal-400 pb-2 inline-block">
              ABOUT
            </h3>
            <ul className="space-y-3 text-sm lg:text-base">
              {['About Us', 'Dental Practices', 'Dental Nurses', 'Hygienist', 'Accounting', 'Contact Us'].map((item, index) => (
                <li key={index}>
                  <a
                    href="#"
                    className="text-gray-700 hover:text-teal-600 hover:translate-x-1 transition-all duration-200 flex items-center group"
                  >
                    <span className="w-2 h-2 bg-teal-400 rounded-full mr-3 group-hover:bg-teal-600 transition-colors"></span>
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="sm:col-span-1">
            <h3 className="font-bold text-lg mb-4 text-gray-900 border-b-2 border-pink-400 pb-2 inline-block">
              USEFUL LINKS
            </h3>
            <ul className="space-y-3 text-sm lg:text-base">
              {['Login', 'Join as a Nurse', 'Join as a Doctor', 'Download App'].map((item, index) => (
                <li key={index}>
                  <a
                    href="#"
                    className="text-gray-700 hover:text-pink-600 hover:translate-x-1 transition-all duration-200 flex items-center group"
                  >
                    <span className="w-2 h-2 bg-pink-400 rounded-full mr-3 group-hover:bg-pink-600 transition-colors"></span>
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="sm:col-span-2 lg:col-span-1">
            <h3 className="font-bold text-lg mb-4 text-gray-900 border-b-2 border-blue-400 pb-2 inline-block">
              CONTACT US
            </h3>

            <div className="mb-6">
              <div className="flex items-start gap-3 text-sm lg:text-base mb-4">
                <MdLocationOn className="text-blue-500 text-xl mt-1 flex-shrink-0" />
                <div>
                  <span className="font-semibold block mb-1">Office Address:</span>
                  <p className="text-gray-700 leading-relaxed">
                    61 Griffiths Road, Wimbledon, London, England, SW19 1ST
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 mb-3 text-sm lg:text-base group cursor-pointer">
                <div className="bg-pink-100 p-2 rounded-full group-hover:bg-pink-200 transition-colors">
                  <MdPhoneAndroid className="text-pink-500 text-lg" />
                </div>
                <a href="tel:07490714868" className="text-gray-700 hover:text-pink-600 transition-colors font-medium">
                  074 9071 4868
                </a>
              </div>

              <div className="flex items-center gap-3 mb-6 text-sm lg:text-base group cursor-pointer">
                <div className="bg-blue-100 p-2 rounded-full group-hover:bg-blue-200 transition-colors">
                  <MdEmail className="text-blue-500 text-lg" />
                </div>
                <a href="mailto:info@locumlux.co.uk" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                  info@locumlux.co.uk
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-base mb-4 text-gray-900">FOLLOW US</h4>
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
                    className={`${bg} ${color} text-white p-3 rounded-full transition-all duration-300 hover:scale-110 hover:shadow-lg transform`}
                  >
                    <Icon className="text-lg" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#b8e3df] border-t border-teal-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center text-sm lg:text-base">
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-3 sm:mb-0">
              <a
                href="#"
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
