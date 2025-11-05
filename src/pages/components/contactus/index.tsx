import React from 'react';
import NavBar from '../navBar/nav';

const ContactUs = () => {
  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-[#C3EAE7]/20 py-6 sm:py-8 md:py-12 px-4 sm:px-6 md:px-8 lg:px-16 pt-32">
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-black mb-3 sm:mb-4">
            Get in Touch
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-2xl mx-auto px-4">
            Have questions or need assistance? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>

        <div className="flex flex-col xl:flex-row justify-center items-start max-w-7xl mx-auto gap-6 sm:gap-8">
          <div className="w-full xl:w-1/2 order-2 xl:order-1">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl overflow-hidden border border-gray-100">
              <div className="bg-gradient-to-r from-[#C3EAE7] to-[#C3EAE7]/80 p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-semibold text-black mb-1 sm:mb-2">Our Location</h3>
                <p className="text-sm sm:text-base text-gray-700">Visit us at our office</p>
              </div>
              <div className="h-[300px] sm:h-[350px] md:h-[400px] lg:h-[450px] relative">
                <iframe
                  title="Google Map"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2481.073964024052!2d-0.2106786842298377!3d51.4198579796196!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x48760a7e2e2e2e2e%3A0x1234567890abcdef!2sLux%20Dent%20Agency%20Ltd!5e0!3m2!1sen!2suk!4v1680000000000!5m2!1sen!2suk"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
            </div>
          </div>

          <div className="w-full xl:w-1/2 order-1 xl:order-2">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 border border-gray-100">
              <div className="bg-gradient-to-r from-[#C3EAE7] to-[#C3EAE7]/80 -m-4 sm:-m-6 md:-m-8 mb-6 sm:mb-8 p-4 sm:p-6 rounded-t-xl sm:rounded-t-2xl">
                <h2 className="text-xl sm:text-2xl font-bold text-black mb-1 sm:mb-2">Send us a Message</h2>
                <p className="text-sm sm:text-base text-gray-700">We'll get back to you within 24 hours</p>
              </div>

              <form className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-12">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="First Name"
                      className="w-full px-3 sm:px-4 py-3 sm:py-4 text-sm sm:text-base border-2 border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:border-[#C3EAE7] focus:ring-2 focus:ring-[#C3EAE7]/20 transition-all duration-300 bg-gray-50 focus:bg-white"
                    />
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Last Name"
                      className="w-full px-3 sm:px-4 py-3 sm:py-4 text-sm sm:text-base border-2 border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:border-[#C3EAE7] focus:ring-2 focus:ring-[#C3EAE7]/20 transition-all duration-300 bg-gray-50 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="relative">
                    <input
                      type="email"
                      placeholder="Email Address"
                      className="w-full px-3 sm:px-4 py-3 sm:py-4 text-sm sm:text-base border-2 border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:border-[#C3EAE7] focus:ring-2 focus:ring-[#C3EAE7]/20 transition-all duration-300 bg-gray-50 focus:bg-white"
                    />
                  </div>
                  <div className="relative">
                    <input
                      type="tel"
                      placeholder="Phone Number"
                      className="w-full px-3 sm:px-4 py-3 sm:py-4 text-sm sm:text-base border-2 border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:border-[#C3EAE7] focus:ring-2 focus:ring-[#C3EAE7]/20 transition-all duration-300 bg-gray-50 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="relative">
                  <select
                    className="w-full px-3 sm:px-4 py-3 sm:py-4 text-sm sm:text-base border-2 border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:border-[#C3EAE7] focus:ring-2 focus:ring-[#C3EAE7]/20 transition-all duration-300 bg-gray-50 focus:bg-white text-gray-700 appearance-none"
                    defaultValue=""
                  >
                    <option value="" disabled>Select Service</option>
                    <option value="service1">Web Development</option>
                    <option value="service2">Mobile App Development</option>
                    <option value="service3">UI/UX Design</option>
                    <option value="service4">Digital Marketing</option>
                    <option value="service5">Consulting</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 sm:pr-4 pointer-events-none">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                <div className="relative">
                  <textarea
                    placeholder="Tell us about your project or inquiry..."
                    className="w-full px-3 sm:px-4 py-3 sm:py-4 text-sm sm:text-base border-2 border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:border-[#C3EAE7] focus:ring-2 focus:ring-[#C3EAE7]/20 transition-all duration-300 bg-gray-50 focus:bg-white min-h-[100px] sm:min-h-[120px] md:min-h-[140px] resize-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 sm:py-4 text-sm sm:text-base bg-gradient-to-r from-[#C3EAE7] to-[#C3EAE7]/90 text-black font-bold rounded-lg sm:rounded-xl hover:from-[#C3EAE7]/90 hover:to-[#C3EAE7] transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl border-2 border-[#C3EAE7]"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="mt-12 sm:mt-16 max-w-4xl mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-lg border border-gray-100 text-center hover:shadow-xl transition-shadow duration-300">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#C3EAE7] rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-black mb-1 sm:mb-2">Phone</h3>
              <p className="text-sm sm:text-base text-gray-600">074 9071 4868</p>
            </div>

            <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-lg border border-gray-100 text-center hover:shadow-xl transition-shadow duration-300">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#C3EAE7] rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-black mb-1 sm:mb-2">Email</h3>
              <p className="text-sm sm:text-base text-gray-600">info@locumlux.co.uk</p>
            </div>

            <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-lg border border-gray-100 text-center hover:shadow-xl transition-shadow duration-300 sm:col-span-2 lg:col-span-1">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#C3EAE7] rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-black mb-1 sm:mb-2">Address</h3>
              <p className="text-sm sm:text-base text-gray-600">61B Griffiths Rd, London SW19 1ST, United Kingdom</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ContactUs;
