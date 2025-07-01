import { useState } from "react";

const jobTypes = ["Nurse", "Hygienist", "Receptionist"];

const dentistFields = [
    "General Dentist",
    "Implant",
    "Surgical Xla",
    "Endodontics",
    "Orthodontic",
    "Periodontic",
    "Cosmetic/bonding & Invisalign"
];

const therapistFields = [
    "Exam",
    "Fillings",
    "Xla",
    "Impressions",
    "x-rays"
];

const SignUpForm = () => {
    const [jobType, setJobType] = useState("");
    const [selectedDentistFields, setSelectedDentistFields] = useState<string[]>([]);
    const [dentistExperience, setDentistExperience] = useState<Record<string, string>>({});
    const [therapistExperience, setTherapistExperience] = useState<Record<string, string>>({});
    const [gdcRegistration, setGdcRegistration] = useState("");
    const [gdcNumber, setGdcNumber] = useState("");
    const [address, setAddress] = useState("");
    const [showMap, setShowMap] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState<{lat: number, lng: number} | null>(null);

    const handleCheckbox = (field: string, setter: any, selected: string[]) => {
        if (selected.includes(field)) {
            setter(selected.filter((item) => item !== field));
        } else {
            setter([...selected, field]);
        }
    };

    const handleMapClick = (lat: number, lng: number) => {
        setSelectedLocation({ lat, lng });
        const simulatedAddress = `${lat.toFixed(4)}, ${lng.toFixed(4)} - Sample Street, Sample City, Sample Country`;
        setAddress(simulatedAddress);
    };

    const confirmLocation = () => {
        setShowMap(false);
    };

    return (
        <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-black rounded-full mb-4 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </div>
                    <h1 className="text-4xl font-bold text-black mb-2 bg-gradient-to-r from-black to-gray-700 bg-clip-text">Join Our Team</h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">Create your professional profile and become part of our dental community</p>
                    
                    <div className="flex justify-center gap-2 mt-4">
                        <div className="w-2 h-2 bg-[#C3EAE7] rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-[#C3EAE7] rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                        <div className="w-2 h-2 bg-[#C3EAE7] rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 overflow-hidden">
                    <div className="bg-[#C3EAE7] px-8 py-6">
                        <h2 className="text-2xl font-bold text-black">Registration Form</h2>
                        <p className="text-gray-700 mt-1">Please fill in all required information</p>
                    </div>

                    <form className="px-8 py-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        <div className="space-y-2 group">
                                <label className="block text-sm font-semibold text-black flex items-center gap-2">
                                    <svg className="w-4 h-4 text-[#C3EAE7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    Full Name *
                                </label>
                                <input 
                                    type="text" 
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#C3EAE7] focus:ring-2 focus:ring-[#C3EAE7]/30 transition-all duration-200 outline-none hover:border-[#C3EAE7]/50 group-hover:shadow-md" 
                                    placeholder="Enter your full name"
                                    required 
                                />
                            </div>
                            <div className="space-y-2 group">
                                <label className="block text-sm font-semibold text-black flex items-center gap-2">
                                    <svg className="w-4 h-4 text-[#C3EAE7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    Email Address *
                                </label>
                                <input 
                                    type="email" 
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#C3EAE7] focus:ring-2 focus:ring-[#C3EAE7]/30 transition-all duration-200 outline-none hover:border-[#C3EAE7]/50 group-hover:shadow-md" 
                                    placeholder="Enter your email"
                                    required 
                                />
                            </div>
                        </div>

                                                                        <div className="space-y-2 group">
                            <label className="block text-sm font-semibold text-black flex items-center gap-2">
                                <svg className="w-4 h-4 text-[#C3EAE7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                Contact Number *
                            </label>
                            <input 
                                type="text" 
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#C3EAE7] focus:ring-2 focus:ring-[#C3EAE7]/30 transition-all duration-200 outline-none hover:border-[#C3EAE7]/50 group-hover:shadow-md" 
                                placeholder="Enter your phone number"
                                required 
                            />
                        </div>

                        <div className="space-y-2 group">
                            <label className="block text-sm font-semibold text-black flex items-center gap-2">
                                <svg className="w-4 h-4 text-[#C3EAE7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                Address *
                            </label>
                            <div className="relative">
                                <textarea 
                                    className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:border-[#C3EAE7] focus:ring-2 focus:ring-[#C3EAE7]/30 transition-all duration-200 outline-none resize-none h-20 hover:border-[#C3EAE7]/50 group-hover:shadow-md" 
                                    placeholder="Enter your complete address or click the map icon to select location"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    required 
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowMap(true)}
                                    className="absolute right-3 top-3 p-2 bg-[#C3EAE7] hover:bg-[#A9DBD9] rounded-lg transition-all duration-200 transform hover:scale-110 shadow-lg hover:shadow-xl"
                                    title="Select location on map"
                                >
                                    <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2 group">
                                <label className="block text-sm font-semibold text-black flex items-center gap-2">
                                    <svg className="w-4 h-4 text-[#C3EAE7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                    Password *
                                </label>
                                <input 
                                    type="password" 
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#C3EAE7] focus:ring-2 focus:ring-[#C3EAE7]/30 transition-all duration-200 outline-none hover:border-[#C3EAE7]/50 group-hover:shadow-md" 
                                    placeholder="Create a strong password"
                                    required 
                                />
                            </div>
                            <div className="space-y-2 group">
                                <label className="block text-sm font-semibold text-black flex items-center gap-2">
                                    <svg className="w-4 h-4 text-[#C3EAE7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Confirm Password *
                                </label>
                                <input 
                                    type="password" 
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#C3EAE7] focus:ring-2 focus:ring-[#C3EAE7]/30 transition-all duration-200 outline-none hover:border-[#C3EAE7]/50 group-hover:shadow-md" 
                                    placeholder="Confirm your password"
                                    required 
                                />
                            </div>
                        </div>

                        <div className="bg-[#C3EAE7]/20 rounded-xl p-6 space-y-4">
                            <label className="block text-sm font-semibold text-black">
                                GDC Registration *
                            </label>
                            <select
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#C3EAE7] focus:ring-2 focus:ring-[#C3EAE7]/30 transition-all duration-200 outline-none appearance-none bg-white"
                                value={gdcRegistration}
                                onChange={(e) => {
                                    setGdcRegistration(e.target.value);
                                    if (e.target.value !== "yes") setGdcNumber("");
                                }}
                                required
                            >
                                <option value="">Select an option</option>
                                <option value="yes">Yes</option>
                                <option value="no">No</option>
                            </select>

                            {gdcRegistration === "yes" && (
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-black">GDC Registration Number *</label>
                                    <input
                                        type="text"
                                        placeholder="Enter your GDC Registration Number"
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#C3EAE7] focus:ring-2 focus:ring-[#C3EAE7]/30 transition-all duration-200 outline-none"
                                        value={gdcNumber}
                                        onChange={(e) => setGdcNumber(e.target.value)}
                                        required
                                    />
                                </div>
                            )}

                            {gdcRegistration === "no" && (
                                <div className="bg-white rounded-lg p-4 border border-gray-200">
                                    <p className="text-sm text-gray-600">No name required - we understand you're not yet registered.</p>
                                </div>
                            )}
                        </div>

                        <div className="border-t pt-6 mt-8">
                            <h3 className="text-xl font-bold text-black mb-4 flex items-center">
                                <div className="w-2 h-6 bg-[#C3EAE7] rounded-full mr-3"></div>
                                Professional Information
                            </h3>

                            <div className="space-y-2 mb-6">
                                <label className="block text-sm font-semibold text-black">Job Type *</label>
                                <select
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#C3EAE7] focus:ring-2 focus:ring-[#C3EAE7]/30 transition-all duration-200 outline-none appearance-none bg-white"
                                    value={jobType}
                                    onChange={(e) => {
                                        setJobType(e.target.value);
                                        setSelectedDentistFields([]);
                                        setDentistExperience({});
                                        setTherapistExperience({});
                                    }}
                                    required
                                >
                                    <option value="">Select your job type</option>
                                    {jobTypes.map((type) => (
                                        <option key={type} value={type}>
                                            {type}
                                        </option>
                                    ))}
                                </select>
                            </div>


                        </div>

                        {jobType === "Nurse" && (
                            <div className="bg-[#C3EAE7]/20 rounded-xl p-6 space-y-4">
                                <h4 className="font-bold text-lg text-black flex items-center">
                                    <div className="w-2 h-2 bg-[#C3EAE7] rounded-full mr-2"></div>
                                    Dentist Experience in UK
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {dentistFields.map((field) => (
                                        <div key={field} className="bg-white rounded-lg p-4 border border-gray-200">
                                            <label className="flex items-center gap-3 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedDentistFields.includes(field)}
                                                    onChange={() =>
                                                        handleCheckbox(field, setSelectedDentistFields, selectedDentistFields)
                                                    }
                                                    className="w-5 h-5 text-black border-2 border-gray-300 rounded focus:ring-[#C3EAE7]"
                                                />
                                                <span className="font-medium text-black">{field}</span>
                                            </label>
                                            {selectedDentistFields.includes(field) && (
                                                <input
                                                    type="text"
                                                    placeholder="Enter experience (e.g., 2 years, 6 months)"
                                                    className="w-full px-3 py-2 mt-3 border border-gray-300 rounded-lg focus:border-[#C3EAE7] focus:ring-1 focus:ring-[#C3EAE7]/30 transition-all duration-200 outline-none"
                                                    onChange={(e) =>
                                                        setDentistExperience((prev) => ({
                                                            ...prev,
                                                            [field]: e.target.value
                                                        }))
                                                    }
                                                    value={dentistExperience[field] || ""}
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {jobType === "Receptionist" && (
                            <div className="bg-[#C3EAE7]/20 rounded-xl p-6 space-y-4">
                                <h4 className="font-bold text-lg text-black flex items-center">
                                    <div className="w-2 h-2 bg-[#C3EAE7] rounded-full mr-2"></div>
                                    Receptionist Experience
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-black">Years of Experience</label>
                                        <input
                                            type="text"
                                            placeholder="e.g., 3 years"
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#C3EAE7] focus:ring-2 focus:ring-[#C3EAE7]/30 transition-all duration-200 outline-none"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-black">Software Experience</label>
                                        <input
                                            type="text"
                                            placeholder="e.g., SOE, R4, Dentally"
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#C3EAE7] focus:ring-2 focus:ring-[#C3EAE7]/30 transition-all duration-200 outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {(jobType === "Hygienist" || jobType === "Therapist") && (
                            <div className="bg-[#C3EAE7]/20 rounded-xl p-6 space-y-4">
                                <h4 className="font-bold text-lg text-black flex items-center">
                                    <div className="w-2 h-2 bg-[#C3EAE7] rounded-full mr-2"></div>
                                    {jobType} Experience
                                </h4>
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-black">Years of Experience</label>
                                    <input
                                        type="text"
                                        placeholder="Enter years of experience"
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#C3EAE7] focus:ring-2 focus:ring-[#C3EAE7]/30 transition-all duration-200 outline-none"
                                    />
                                </div>

                                {jobType === "Therapist" && (
                                    <div className="space-y-4">
                                        <h5 className="font-semibold text-black">Therapist Experience Areas in UK:</h5>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {therapistFields.map((field) => (
                                                <div key={field} className="bg-white rounded-lg p-4 border border-gray-200">
                                                    <label className="flex items-center gap-3 cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={therapistExperience[field] !== undefined}
                                                            onChange={(e) =>
                                                                setTherapistExperience((prev) => {
                                                                    const updated = { ...prev };
                                                                    if (e.target.checked) updated[field] = "";
                                                                    else delete updated[field];
                                                                    return updated;
                                                                })
                                                            }
                                                            className="w-5 h-5 text-black border-2 border-gray-300 rounded focus:ring-[#C3EAE7]"
                                                        />
                                                        <span className="font-medium text-black">{field}</span>
                                                    </label>
                                                    {therapistExperience[field] !== undefined && (
                                                        <input
                                                            type="text"
                                                            placeholder={`Experience in ${field}`}
                                                            className="w-full px-3 py-2 mt-3 border border-gray-300 rounded-lg focus:border-[#C3EAE7] focus:ring-1 focus:ring-[#C3EAE7]/30 transition-all duration-200 outline-none"
                                                            value={therapistExperience[field]}
                                                            onChange={(e) =>
                                                                setTherapistExperience((prev) => ({
                                                                    ...prev,
                                                                    [field]: e.target.value
                                                                }))
                                                            }
                                                        />
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="pt-6">
                            <div className="relative group">
                                <div className="absolute -inset-1 bg-gradient-to-r from-[#C3EAE7] to-[#A9DBD9] rounded-xl blur opacity-25 group-hover:opacity-75 transition duration-200"></div>
                                <button
                                    type="submit"
                                    className="relative w-full bg-[#C3EAE7] hover:bg-[#A9DBD9] text-black font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-[#C3EAE7]/30"
                                >
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="w-5 h-5 group-hover:animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Complete Registration
                                    </span>
                                </button>
                            </div>
                        </div>

                        <div className="text-center text-sm text-gray-600 pt-4">
                            By registering, you agree to our{" "}
                            <a href="#" className="text-black hover:text-gray-700 font-semibold">Terms of Service</a>{" "}
                            and{" "}
                            <a href="#" className="text-black hover:text-gray-700 font-semibold">Privacy Policy</a>
                        </div>
                    </form>
                </div>

                <div className="mt-8 text-center">
                    <div className="inline-flex items-center gap-2 bg-white rounded-full px-6 py-3 shadow-lg hover:shadow-xl border border-gray-200 transform hover:scale-105 transition-all duration-200">
                        <svg className="w-5 h-5 text-[#C3EAE7] animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        <span className="text-black font-medium">Secure & Confidential Registration</span>
                    </div>
                </div>

                {showMap && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                            <div className="bg-[#C3EAE7] px-6 py-4 flex justify-between items-center">
                                <h3 className="text-xl font-bold text-black">Select Your Location</h3>
                                <button
                                    onClick={() => setShowMap(false)}
                                    className="text-black hover:text-gray-700 transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            
                            <div className="p-6">
                                <div className="relative">
                                    <div 
                                        className="w-full h-96 bg-gradient-to-br from-green-100 to-blue-100 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center cursor-crosshair relative overflow-hidden"
                                        onClick={(e) => {
                                            const rect = e.currentTarget.getBoundingClientRect();
                                            const x = e.clientX - rect.left;
                                            const y = e.clientY - rect.top;
                                            const lat = 51.5074 + (y / rect.height - 0.5) * 0.1; 
                                            const lng = -0.1278 + (x / rect.width - 0.5) * 0.1;
                                            handleMapClick(lat, lng);
                                        }}
                                    >
                                        <div className="absolute inset-0 opacity-20">
                                            {Array.from({ length: 10 }).map((_, i) => (
                                                <div key={i} style={{ 
                                                    position: 'absolute',
                                                    left: `${i * 10}%`,
                                                    top: 0,
                                                    width: '1px',
                                                    height: '100%',
                                                    backgroundColor: '#888'
                                                }} />
                                            ))}
                                            {Array.from({ length: 8 }).map((_, i) => (
                                                <div key={i} style={{ 
                                                    position: 'absolute',
                                                    top: `${i * 12.5}%`,
                                                    left: 0,
                                                    height: '1px',
                                                    width: '100%',
                                                    backgroundColor: '#888'
                                                }} />
                                            ))}
                                        </div>

                                        {selectedLocation && (
                                            <div 
                                                className="absolute transform -translate-x-1/2 -translate-y-full"
                                                style={{
                                                    left: `${((selectedLocation.lng + 0.1778) / 0.1) * 100}%`,
                                                    top: `${((selectedLocation.lat - 51.4574) / 0.1) * 100}%`
                                                }}
                                            >
                                                <div className="bg-[#C3EAE7] p-2 rounded-full shadow-lg animate-bounce">
                                                    <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                </div>
                                            </div>
                                        )}

                                        {!selectedLocation && (
                                            <div className="text-center">
                                                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                <p className="text-gray-600 font-semibold">Click anywhere on the map to select your location</p>
                                                <p className="text-sm text-gray-500 mt-2">This is a demo map. In production, integrate with Google Maps or similar service.</p>
                                            </div>
                                        )}
                                    </div>

                                    {selectedLocation && (
                                        <div className="mt-4 p-4 bg-[#C3EAE7]/20 rounded-xl">
                                            <h4 className="font-semibold text-black mb-2">Selected Location:</h4>
                                            <p className="text-sm text-gray-700">
                                                Latitude: {selectedLocation.lat.toFixed(6)}<br />
                                                Longitude: {selectedLocation.lng.toFixed(6)}
                                            </p>
                                            <div className="mt-3">
                                                <label className="block text-sm font-semibold text-black mb-1">Address Preview:</label>
                                                <p className="text-sm text-gray-600 bg-white p-2 rounded border">{address}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-end gap-3 mt-6">
                                    <button
                                        onClick={() => setShowMap(false)}
                                        className="px-6 py-2 border-2 border-gray-300 text-black rounded-xl hover:border-gray-400 transition-all duration-200"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={confirmLocation}
                                        disabled={!selectedLocation}
                                        className="px-6 py-2 bg-[#C3EAE7] hover:bg-[#A9DBD9] text-black font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Confirm Location
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SignUpForm;
