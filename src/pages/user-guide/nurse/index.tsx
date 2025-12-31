import React from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Logo from "../../../../public/assests/Laks Dent Logo.png";
import NavBar from '../../components/navBar/nav';

const NurseUserGuide = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <NavBar />
      
      <div className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Top Section - Logo and Tagline matching the image */}
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
                Nurse User Guide
              </h1>
              <p className="text-lg sm:text-xl text-gray-700 max-w-3xl mb-6">
                A PLATFORM TO CONNECT DENTAL PRACTICES WITH LOCUM STAFFS
              </p>
              <p className="text-base sm:text-lg text-gray-600 max-w-4xl">
                This manual provides step-by-step instructions for dental professionals to register as locum staff on the platform. 
                The registration process allows dental nurses, hygienists, and other professionals to connect with dental practices 
                seeking temporary or locum staff.
              </p>
            </div>
          </div>

          {/* Registration Process Section */}
          <div className="bg-white rounded-xl shadow-lg p-8 sm:p-12 mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-black mb-8">
              Registration Process
            </h2>
            
            {/* Step 1 */}
            <div className="mb-12">
              <div className="flex items-start mb-6">
                <div className="flex-shrink-0 w-12 h-12 bg-[#C3EAE7] rounded-full flex items-center justify-center mr-4">
                  <span className="text-2xl font-bold text-black">1</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl sm:text-2xl font-bold text-black mb-4">
                    Step 1: Access Registration Page
                  </h3>
                  <ol className="list-decimal list-inside space-y-3 text-gray-700 text-base sm:text-lg">
                    <li>Navigate to the platform homepage</li>
                    <li>Click on "Register" in the top navigation menu</li>
                  </ol>
                  
                  {/* Placeholder for image */}
                  <div className="mt-6 bg-gray-100 rounded-lg p-8 border-2 border-dashed border-gray-300">
                    <p className="text-center text-gray-500">
                      [Image placeholder for Step 1 - Website header showing Register button]
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Placeholder for additional steps */}
            <div className="text-center py-8">
              <p className="text-gray-500 italic">
                Additional steps will be added here with numbered steps and images
              </p>
            </div>
          </div>

          {/* Back Button */}
          <div className="flex justify-center mt-8">
            <button
              onClick={() => router.back()}
              className="bg-[#C3EAE7] hover:bg-[#A9DBD9] text-black font-semibold py-3 px-8 rounded-lg transition-colors"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NurseUserGuide;

