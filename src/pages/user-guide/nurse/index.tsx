import React from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Logo from "../../../../public/assests/Laks Dent Logo.png";
import NavBar from '../../components/navBar/nav';

const NurseUserGuide = () => {
  const router = useRouter();

  const steps = [
    {
      number: 1,
      title: "Access Registration Page",
      description: "Navigate to the platform and access the registration page",
      instructions: [
        "Navigate to the platform homepage",
        "Click on 'Register' in the top navigation menu",
        "Select 'Locum Staff' as your registration type"
      ],
      images: ["/images/1.png", "/images/2.png"]
    },
    {
      number: 2,
      title: "Complete Personal Information",
      description: "Fill in your basic personal details",
      instructions: [
        "Full Name: Enter your full legal name as it appears on official documents",
        "Email Address: Enter a valid email address that you have access to",
        "Contact Number: Enter your 10-digit UK phone number (without country code)",
        "Location: Click the map icon to select your location on the map, then confirm",
        "Address: Enter your complete address including street, city, and postal code"
      ],
      images: ["/images/3.png", "/images/4.png","/images/5.png", "/images/6.png"]
    },
    {
      number: 3,
      title: "Set Up Password",
      description: "Create a secure password for your account",
      instructions: [
        "Password: Create a strong password that contains:",
        "  • At least 6 characters",
        "  • At least one uppercase letter (A-Z)",
        "  • At least one lowercase letter (a-z)",
        "  • At least one number (0-9)",
        "  • At least one special character (!@#$%^&*(),.?\":{}|<>)",
        "Confirm Password: Re-enter your password to confirm it matches"
      ],
      images: ["/images/8.png"]
    },
    {
      number: 4,
      title: "GDC Registration",
      description: "Provide your GDC registration information",
      instructions: [
        "Select whether you have GDC registration:",
        "  • If 'Yes': Enter your GDC Registration Number (4-7 digits)",
        "  • If 'No': Leave the GDC number field empty",
        "Note: GDC registration is required for certain professional roles"
      ],
      images: ["/images/9.png"]
    },
    {
      number: 5,
      title: "Select Job Type",
      description: "Choose your professional role",
      instructions: [
        "Select your job type from the dropdown menu:",
        "  • Nurse",
        "  • Hygienist",
        "  • Receptionist",
        "  • Dentist",
        "The form will update based on your selection"
      ],
      images: ["/images/11.png"]
    },
    {
      number: 6,
      title: "Add Professional Experience",
      description: "Enter your professional experience based on your job type",
      instructions: [
        "For Nurses:",
        "  • Select the dental fields you have experience in (e.g., General Dentist, Implant, Surgical Xla, etc.)",
        "  • For each selected field, enter your years of experience",
        "For Hygienists:",
        "  • Enter your total years of experience as a hygienist",
        "For Receptionists:",
        "  • Enter your years of receptionist experience",
        "  • Enter your software experience (e.g., SOE, R4, Dentally)",
        "For Dentists:",
        "  • Select your specialty areas",
        "  • Enter years of experience for each specialty"
      ],
      images: ["/images/16.png",]
    },
    {
      number: 7,
      title: "Complete reCAPTCHA Verification",
      description: "Verify that you are not a robot",
      instructions: [
        "Complete the reCAPTCHA verification by:",
        "  • Checking the 'I'm not a robot' checkbox",
        "  • Completing any additional verification steps if prompted",
        "Note: Registration cannot be completed without reCAPTCHA verification"
      ],
      images: ["/images/17.png"]
    },
    {
      number: 8,
      title: "Submit Registration",
      description: "Review and submit your registration",
      instructions: [
        "Review all the information you have entered",
        "Ensure all required fields are completed correctly",
        "Click the 'Complete Registration' button",
        "Wait for the confirmation message"
      ],
      images: ["/images/13.png"]
    },
    {
      number: 9,
      title: "Email Verification",
      description: "Verify your email address",
      instructions: [
        "Check your email inbox for a verification email",
        "Click on the verification link in the email",
        "You will be redirected to the verification page",
        "Once verified, you can log in to your account",
        "Note: You must verify your email before you can log in"
      ],
      images: ["/images/16.jpeg", "/images/17.jpeg"]
    },
    {
      number: 10,
      title: "Login to Your Account",
      description: "Access your account after verification",
      instructions: [
        "Navigate to the login page",
        "Enter your registered email address",
        "Enter your password",
        "Click 'Login' to access your dashboard",
        "You can now start browsing and applying for appointments"
      ],
      images: ["/images/21.png"]
      
    }
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <NavBar />
      
      <div className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Top Section - Logo and Tagline */}
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
            
            {steps.map((step, index) => (
              <div key={step.number} className={`mb-16 ${index !== steps.length - 1 ? 'border-b-2 border-gray-200 pb-16' : ''}`}>
                <div className="flex flex-col lg:flex-row items-start gap-6">
                  {/* Step Number */}
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-[#C3EAE7] rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-3xl font-bold text-black">{step.number}</span>
                    </div>
                  </div>
                  
                  {/* Step Content */}
                  <div className="flex-1">
                    <h3 className="text-xl sm:text-2xl font-bold text-black mb-3">
                      Step {step.number}: {step.title}
                    </h3>
                    <p className="text-gray-600 mb-4 text-base sm:text-lg">
                      {step.description}
                    </p>
                    
                    {/* Instructions */}
                    <div className="bg-gray-50 rounded-lg p-6 mb-6">
                      <h4 className="font-semibold text-black mb-3">Instructions:</h4>
                      <ol className="list-decimal list-inside space-y-2 text-gray-700 text-sm sm:text-base">
                        {step.instructions.map((instruction, idx) => (
                          <li key={idx} className="leading-relaxed">{instruction}</li>
                        ))}
                      </ol>
                    </div>
                    
                    {/* Images */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {step.images.map((imagePath, imgIdx) => (
                        <div key={imgIdx} className="bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200 shadow-md hover:shadow-lg transition-shadow">
                          <div className="relative w-full aspect-video bg-white">
                            <Image
                              src={imagePath}
                              alt={`Step ${step.number} - Image ${imgIdx + 1}`}
                              width={800}
                              height={600}
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const parent = target.parentElement;
                                if (parent) {
                                  parent.innerHTML = '<div class="flex items-center justify-center h-full text-gray-500 text-sm">Image not found</div>';
                                }
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Additional Information Section */}
          <div className="bg-[#C3EAE7]/10 rounded-xl p-8 sm:p-12 mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-black mb-6">
              Important Notes
            </h2>
            <ul className="space-y-4 text-gray-700 text-base sm:text-lg">
              <li className="flex items-start">
                <span className="text-[#C3EAE7] font-bold mr-3">•</span>
                <span>All fields marked with * are required and must be filled before submission</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#C3EAE7] font-bold mr-3">•</span>
                <span>Make sure your email address is correct as you will need it for verification</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#C3EAE7] font-bold mr-3">•</span>
                <span>Your password must meet all security requirements for account protection</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#C3EAE7] font-bold mr-3">•</span>
                <span>After registration, check your email and verify your account before logging in</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#C3EAE7] font-bold mr-3">•</span>
                <span>If you encounter any issues during registration, contact support for assistance</span>
              </li>
            </ul>
          </div>

          {/* Back Button */}
          <div className="flex justify-center mt-8">
            <button
              onClick={() => router.back()}
              className="bg-[#C3EAE7] hover:bg-[#A9DBD9] text-black font-semibold py-3 px-8 rounded-lg transition-colors shadow-md hover:shadow-lg transform hover:-translate-y-1"
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
