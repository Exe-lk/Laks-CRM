import Image from 'next/image';
import NavBar from "../navBar/nav";
import Footer from "../footer/index";
import imageAbout from "../../../../public/assests/MacBook Air - 14.png"
import dentalPractices from "../../../../public/assests/practicesdental1.jpg"
import image1 from "../../../../public/assests/Untitled design (12).png"
import image2 from "../../../../public/assests/Untitled design (13).png"
import image3 from "../../../../public/assests/Untitled design (15).png"
import { FaHospital, FaSearch, FaUser, FaCalendarCheck, FaMapMarkerAlt, FaArrowRight } from 'react-icons/fa';

const DentalPractices = () => {
  return (
    <>
      <NavBar />

      <main className="min-h-screen bg-white pt-32">
        <section className="py-16 lg:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12 lg:mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-black mb-4">
                Dental Practices
              </h2>
              <p className="text-lg lg:text-xl text-gray-700 max-w-2xl mx-auto">
                Dental Practices - Use LocumLux Search Engine to find your appropriate Locum Nurse in the vicinity.
              </p>
              <div className="max-w-7xl mx-auto px-4 mt-12">
                <div className="flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-4">
                  <div className="flex items-center">
                    <div className="bg-[#C3EAE7] rounded-lg p-6 lg:p-8 w-full max-w-[280px] lg:max-w-[240px] text-center shadow-sm">
                      <div className="flex justify-center mb-4">
                        <div className="relative">
                          <Image src={image3} alt="register" width={1000} height={1000} className="w-full h-auto" />
                        </div>
                      </div>
                      <h3 className="text-[#FF69B4] font-bold text-lg lg:text-xl mb-3 uppercase tracking-wide">
                        REGISTER
                      </h3>
                      <p className="text-black text-xs lg:text-sm uppercase font-medium leading-tight">
                        LESS THAN A ONE MINUTE TO REGISTER
                      </p>
                    </div>
                    <div className="hidden lg:flex items-center justify-center mx-2">
                      <div className="bg-white rounded-full p-3 shadow-md border-2 border-[#C3EAE7]">
                        <FaArrowRight className="text-[#4A90E2] text-xl" />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <div className="bg-[#C3EAE7] rounded-lg p-6 lg:p-8 w-full max-w-[280px] lg:max-w-[240px] text-center shadow-sm">
                      <div className="flex justify-center mb-4">
                        <div className="relative">
                        <Image src={image3} alt="register" width={1000} height={1000} className="w-full h-auto" />
                        </div>
                      </div>
                      <h3 className="text-[#FF69B4] font-bold text-lg lg:text-xl mb-3 uppercase tracking-wide">
                        FIND A NURSE
                      </h3>
                      <p className="text-black text-xs lg:text-sm uppercase font-medium leading-tight">
                        USE OUR SEARCH ENGINE TO FIND YOUR PREFERRED NURSE.
                      </p>
                    </div>
                    <div className="hidden lg:flex items-center justify-center mx-2">
                      <div className="bg-white rounded-full p-3 shadow-md border-2 border-[#C3EAE7]">
                        <FaArrowRight className="text-[#4A90E2] text-xl" />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <div className="bg-[#C3EAE7] rounded-lg p-6 lg:p-8 w-full max-w-[280px] lg:max-w-[240px] text-center shadow-sm">
                      <div className="flex justify-center mb-4">
                        <div className="relative">
                          <Image src={image1} alt="register" width={1000} height={1000} className="w-full h-auto" />
                        </div>
                      </div>
                      <h3 className="text-[#FF69B4] font-bold text-lg lg:text-xl mb-3 uppercase tracking-wide">
                        VIEW PROFILE
                      </h3>
                      <p className="text-black text-xs lg:text-sm uppercase font-medium leading-tight">
                        LOCATION EXPERIENCE. CATEGORIES (EG. IMPLANT ,ORTHO)
                      </p>
                    </div>
                    <div className="hidden lg:flex items-center justify-center mx-2">
                      <div className="bg-white rounded-full p-3 shadow-md border-2 border-[#C3EAE7]">
                        <FaArrowRight className="text-[#4A90E2] text-xl" />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <div className="bg-[#C3EAE7] rounded-lg p-6 lg:p-8 w-full max-w-[280px] lg:max-w-[240px] text-center shadow-sm">
                      <div className="flex justify-center mb-4">
                        <div className="relative">
                          <Image src={image2} alt="register" width={1000} height={1000} className="w-full h-auto" />
                        </div>
                      </div>
                      <h3 className="text-[#FF69B4] font-bold text-lg lg:text-xl mb-3 uppercase tracking-wide">
                        BOOK A NURSE
                      </h3>
                      <p className="text-black text-xs lg:text-sm uppercase font-medium leading-tight">
                        BOOKED AND WAIT FOR THE NURSE CONFIRMATION
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <h2 className="text-2xl lg:text-3xl font-bold text-black mb-4 mt-6">
                !! Do you want to be suprised register and find out more !!
              </h2>
              <div className="max-w-7xl mx-auto px-4 mb-8">
                <Image src={dentalPractices} alt="aboutus" width={1000} height={1000} className="w-full h-auto" />
              </div>
              <div className="grid">
                <div className="bg-white p-6 rounded-lg shadow-md w-full border border-gray-200">
                  <p className="text-base lg:text-xl text-gray-700">
                    !! Let's not compare with other Locum agencies, different agencies have different facilities and advantages.
                    We are simply using the advance
                    technology to be more competitive and cost effective to ensure continuity of care at the dental premises with our locum services.                        </p>

                </div>
              </div>
            </div>
          </div>
        </section>
        <Footer />
      </main>
    </>
  );
}

export default DentalPractices;
