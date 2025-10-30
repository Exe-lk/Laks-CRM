import { SetStateAction, useState } from "react";
import { useFormik } from 'formik';
import { useRouter } from "next/router";
import Swal from 'sweetalert2';
import { useAddLocumProfileMutation, type RegistrationResponse, type ErrorResponse } from '../../../redux/slices/locumProfileSlice';
import { GoogleMapModal } from '../../../components/GoogleMapModal';
import { FaMapMarkerAlt } from 'react-icons/fa';
import { MdOutlineMyLocation } from "react-icons/md";

export interface Specialty {
    speciality: string;
    numberOfYears: number;
}

export interface LocumProfile {
    fullName: string;
    emailAddress: string;
    contactNumber: string;
    address: string;
    location: string;
    password: string;
    gdcNumber: string;
    employeeType: string;
    software?: string;
    specialties?: Specialty[];
}

const jobTypes = ["Nurse", "Hygienist", "Receptionist","Dentist"];

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

const initialValues = {
    fullName: '',
    email: '',
    contactNumberDigits: '',
    address: '',
    location: '',
    password: '',
    confirmPassword: '',
    gdcRegistration: '',
    gdcNumber: '',
    jobType: '',
    selectedDentistFields: [] as string[],
    dentistExperience: {} as Record<string, string>,
    selectedNurseFields: [] as string[],
    nurseExperience: {} as Record<string, string>,
    therapistExperience: {} as Record<string, string>,
    receptionistYearsExperience: '',
    receptionistSoftwareExperience: '',
    hygienistYearsExperience: '',
};

const transformFormDataToAPI = (values: typeof initialValues, addressLat: number | null, addressLng: number | null): LocumProfile => {
    const specialties: Specialty[] = [];

    switch (values.jobType) {
        case 'Receptionist':
            if (values.receptionistYearsExperience) {
                const years = parseInt(values.receptionistYearsExperience.replace(/\D/g, '')) || 0;
                specialties.push({
                    speciality: "Receptionist",
                    numberOfYears: years
                });
            }
            break;

        case 'Hygienist':
            if (values.hygienistYearsExperience) {
                const years = parseInt(values.hygienistYearsExperience.replace(/\D/g, '')) || 0;
                specialties.push({
                    speciality: "Hygienist",
                    numberOfYears: years
                });
            }
            break;

        case 'Nurse':
            values.selectedNurseFields.forEach(field => {
                const experienceStr = values.nurseExperience[field];
                if (experienceStr) {
                    const years = parseInt(experienceStr.replace(/\D/g, '')) || 0;
                    specialties.push({
                        speciality: field,
                        numberOfYears: years
                    });
                }
            });
            break;

         case 'Dentist':
            values.selectedDentistFields.forEach(field => {
                const experienceStr = values.dentistExperience[field];
                if (experienceStr) {
                    const years = parseInt(experienceStr.replace(/\D/g, '')) || 0;
                    specialties.push({
                        speciality: field,
                        numberOfYears: years
                    });
                }
            });
            break;
    }

    return {
        fullName: values.fullName,
        emailAddress: values.email,
        contactNumber: '+44' + values.contactNumberDigits,
        address: addressLat && addressLng ? `${addressLat},${addressLng}` : '',
        location: values.location,
        password: values.password,
        gdcNumber: values.gdcNumber,
        employeeType: values.jobType,
        software: values.jobType === 'Receptionist' ? values.receptionistSoftwareExperience : '',
        specialties: specialties.length > 0 ? specialties : undefined
    };
};

const SignUpForm = () => {
    const [showMap, setShowMap] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState<{ lat: number, lng: number } | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [addLocumProfile, { isLoading: isAdding }] = useAddLocumProfileMutation();
    const [open, setOpen] = useState(false);
    const [location, setLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);
    const [addressLat, setAddressLat] = useState<number | null>(null);
    const [addressLng, setAddressLng] = useState<number | null>(null);

    const formik = useFormik({
        initialValues,
        validate: (values) => {
            const errors: any = {};

            if (!values.fullName) {
                errors.fullName = 'Full name is required';
            }
            if (!values.email) {
                errors.email = 'Email is required';
            } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)) {
                errors.email = 'Invalid email address';
            }
            if (!values.contactNumberDigits) {
                errors.contactNumberDigits = 'Contact number is required';
            } else if (!/^\d{10}$/.test(values.contactNumberDigits)) {
                errors.contactNumberDigits = 'Contact number must be exactly 10 digits';
            }
            if (!values.address) {
                errors.address = 'Address is required';
            }
            if (!values.location) {
                errors.location = 'Location is required';
            }
            if (!values.password) {
                errors.password = 'Password is required';
            } else if (values.password.length < 6) {
                errors.password = 'Password must be at least 6 characters';
            } else if (!/[A-Z]/.test(values.password)) {
                errors.password = 'Password must contain at least one uppercase letter';
            } else if (!/[a-z]/.test(values.password)) {
                errors.password = 'Password must contain at least one lowercase letter';
            } else if (!/[0-9]/.test(values.password)) {
                errors.password = 'Password must contain at least one number';
            } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(values.password)) {
                errors.password = 'Password must contain at least one special character';
            }
            if (!values.confirmPassword) {
                errors.confirmPassword = 'Please confirm your password';
            } else if (values.password !== values.confirmPassword) {
                errors.confirmPassword = 'Passwords do not match';
            }
            if (!values.gdcRegistration) {
                errors.gdcRegistration = 'Please select GDC registration status';
            }
            if (values.gdcRegistration === 'yes') {
                if (!values.gdcNumber) {
                    errors.gdcNumber = 'GDC registration number is required';
                } else if (!/^\d{4,7}$/.test(values.gdcNumber)) {
                    errors.gdcNumber = 'GDC number must be 4 to 7 digits long and contain only numbers';
                }
            }
            if (!values.jobType) {
                errors.jobType = 'Please select a job type';
            }

            return errors;
        },
        onSubmit: async (values) => {
            setIsSubmitting(true);
            try {
                console.log('Registration form values:', values);
                const apiData = transformFormDataToAPI(values, addressLat, addressLng);
                console.log('API payload:', apiData);
                const response = await addLocumProfile(apiData);
                console.log('Registration response:', response);

                if (response.data && response.data.status === 200) {
                    Swal.fire({
                        title: 'Registration completed successfully! Please check your email to verify your account before logging in.',
                        icon: 'success',
                        confirmButtonText: 'OK',
                        confirmButtonColor: '#C3EAE7'
                    });
                    formik.resetForm();
                } else if (response.error) {
                    const errorMessage = 'data' in response.error
                        ? (response.error.data as ErrorResponse).error
                        : 'An unexpected error occurred';

                    Swal.fire({
                        title: 'Registration failed!',
                        text: `Registration failed: ${errorMessage}`,
                        icon: 'error',
                        confirmButtonText: 'OK',
                        confirmButtonColor: '#C3EAE7'
                    });
                } else {
                    Swal.fire({
                        title: 'Registration failed!',
                        text: 'An unexpected error occurred',
                        icon: 'error',
                        confirmButtonText: 'OK',
                        confirmButtonColor: '#C3EAE7'
                    });
                }

            } catch (error: any) {
                console.error('Registration failed:', error);
                Swal.fire({
                    title: 'Registration failed!',
                    text: `Registration failed: ${error.message}`,
                    icon: 'error',
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#C3EAE7'
                });
            } finally {
                setIsSubmitting(false);
            }
        },
    });

    const handleDentistFieldChange = (field: string) => {
        const currentSelected = formik.values.selectedDentistFields;
        let newSelected;

        if (currentSelected.includes(field)) {
            newSelected = currentSelected.filter((item) => item !== field);
            const newExperience = { ...formik.values.dentistExperience };
            delete newExperience[field];
            formik.setFieldValue('dentistExperience', newExperience);
        } else {
            newSelected = [...currentSelected, field];
        }

        formik.setFieldValue('selectedDentistFields', newSelected);
    };

     const handleNursesFieldChange = (field: string) => {
        const currentSelected = formik.values.selectedNurseFields;
        let newSelected;

        if (currentSelected.includes(field)) {
            newSelected = currentSelected.filter((item) => item !== field);
            const newExperience = { ...formik.values.nurseExperience };
            delete newExperience[field];
            formik.setFieldValue('nurseExperience', newExperience);
        } else {
            newSelected = [...currentSelected, field];
        }

        formik.setFieldValue('selectedNurseFields', newSelected);
    };

    const handleMapClick = (lat: number, lng: number) => {
        setSelectedLocation({ lat, lng });
        const simulatedAddress = `${lat.toFixed(4)}, ${lng.toFixed(4)} - Sample Street, Sample City, Sample Country`;
        formik.setFieldValue('address', simulatedAddress);
    };

    const confirmLocation = () => {
        setShowMap(false);
    };

    const handleDentistExperienceChange = (field: string, value: string) => {
        formik.setFieldValue('dentistExperience', {
            ...formik.values.dentistExperience,
            [field]: value
        });
    };

    const handleNurseExperienceChange = (field: string, value: string) => {
        formik.setFieldValue('nurseExperience', {
            ...formik.values.nurseExperience,
            [field]: value
        });
    };

    const handleTherapistFieldChange = (field: string, checked: boolean) => {
        const newExperience = { ...formik.values.therapistExperience };
        if (checked) {
            newExperience[field] = '';
        } else {
            delete newExperience[field];
        }
        formik.setFieldValue('therapistExperience', newExperience);
    };

    const handleTherapistExperienceChange = (field: string, value: string) => {
        formik.setFieldValue('therapistExperience', {
            ...formik.values.therapistExperience,
            [field]: value
        });
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
                        <div className="w-2 h-2 bg-[#C3EAE7] rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 bg-[#C3EAE7] rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 overflow-hidden">
                    <div className="bg-[#C3EAE7] px-8 py-6">
                        <h2 className="text-2xl font-bold text-black">Registration Form</h2>
                        <p className="text-gray-700 mt-1">Please fill in all required information</p>
                    </div>

                    <form onSubmit={formik.handleSubmit} className="px-8 py-8 space-y-6">
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
                                    name="fullName"
                                    value={formik.values.fullName}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    className={`w-full px-4 py-3 border-2 ${formik.errors.fullName && formik.touched.fullName ? 'border-red-500' : 'border-gray-200'
                                        } rounded-xl focus:border-[#C3EAE7] focus:ring-2 focus:ring-[#C3EAE7]/30 transition-all duration-200 outline-none hover:border-[#C3EAE7]/50 group-hover:shadow-md`}
                                    placeholder="Enter your full name"
                                    required
                                />
                                {formik.errors.fullName && formik.touched.fullName && (
                                    <div className="text-red-500 text-sm mt-1">{formik.errors.fullName}</div>
                                )}
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
                                    name="email"
                                    value={formik.values.email}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    className={`w-full px-4 py-3 border-2 ${formik.errors.email && formik.touched.email ? 'border-red-500' : 'border-gray-200'
                                        } rounded-xl focus:border-[#C3EAE7] focus:ring-2 focus:ring-[#C3EAE7]/30 transition-all duration-200 outline-none hover:border-[#C3EAE7]/50 group-hover:shadow-md`}
                                    placeholder="Enter your email"
                                    required
                                />
                                {formik.errors.email && formik.touched.email && (
                                    <div className="text-red-500 text-sm mt-1">{formik.errors.email}</div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2 group">
                            <label className="block text-sm font-semibold text-black flex items-center gap-2">
                                <svg className="w-4 h-4 text-[#C3EAE7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                Contact Number *
                            </label>
                            <div className="flex items-center">
                                <span className="px-3 py-3 border-2 border-r-0 border-gray-200 bg-gray-100 rounded-l-xl text-black font-semibold select-none">+44</span>
                                <input
                                    type="text"
                                    name="contactNumberDigits"
                                    value={formik.values.contactNumberDigits}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                                        formik.setFieldValue('contactNumberDigits', val);
                                    }}
                                    onBlur={formik.handleBlur}
                                    className={`w-full px-4 py-3 border-2 ${formik.errors.contactNumberDigits && formik.touched.contactNumberDigits ? 'border-red-500' : 'border-gray-200'} rounded-r-xl focus:border-[#C3EAE7] focus:ring-2 focus:ring-[#C3EAE7]/30 transition-all duration-200 outline-none hover:border-[#C3EAE7]/50 group-hover:shadow-md`}
                                    placeholder="Enter 10 digit number"
                                    required
                                    maxLength={10}
                                    inputMode="numeric"
                                />
                            </div>
                            {formik.errors.contactNumberDigits && formik.touched.contactNumberDigits && (
                                <div className="text-red-500 text-sm mt-1">{formik.errors.contactNumberDigits}</div>
                            )}
                        </div>

                        <div className="space-y-2 group">
                            <label className="block text-sm font-semibold text-black flex items-center gap-2">
                                <MdOutlineMyLocation color="#C3EAE7" size={16} />
                                Select your location *
                            </label>
                            <div className="relative">
                                <textarea
                                    name="address"
                                    value={formik.values.address}
                                    disabled
                                    className={`w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:border-[#C3EAE7] focus:ring-2 focus:ring-[#C3EAE7]/30 transition-all duration-200 outline-none resize-none h-20 hover:border-[#C3EAE7]/50 group-hover:shadow-md`}
                                    placeholder="Select address from map"
                                />
                                <button
                                    type="button"
                                    onClick={() => setOpen(true)}
                                    className="absolute right-3 top-3 p-2 bg-[#C3EAE7] hover:bg-[#A9DBD9] rounded-lg transition-all duration-200 transform hover:scale-110 shadow-lg hover:shadow-xl"
                                    title="Select location on map"
                                >
                                    <FaMapMarkerAlt style={{ color: 'black' }} />
                                </button>
                            </div>
                            {formik.errors.address && formik.touched.address && (
                                <div className="text-red-500 text-sm mt-1">{formik.errors.address}</div>
                            )}
                        </div>

                        <div className="space-y-2 group">
                            <label className="block text-sm font-semibold text-black flex items-center gap-2">
                                <svg className="w-4 h-4 text-[#C3EAE7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M12 11.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z"
                                    />
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M19.5 9c0 7.5-7.5 13.5-7.5 13.5S4.5 16.5 4.5 9a7.5 7.5 0 1115 0z"
                                    />
                                </svg>


                                Address *
                            </label>
                            <div className="relative">
                                <textarea
                                    name="location"
                                    value={formik.values.location}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    className={`w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:border-[#C3EAE7] focus:ring-2 focus:ring-[#C3EAE7]/30 transition-all duration-200 outline-none resize-none h-20 hover:border-[#C3EAE7]/50 group-hover:shadow-md`}
                                    placeholder="Enter your location"
                                    required
                                />
                            </div>
                            {formik.errors.location && formik.touched.location && (
                                <div className="text-red-500 text-sm mt-1">{formik.errors.location}</div>
                            )}
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
                                    name="password"
                                    value={formik.values.password}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    className={`w-full px-4 py-3 border-2 ${formik.errors.password && formik.touched.password ? 'border-red-500' : 'border-gray-200'
                                        } rounded-xl focus:border-[#C3EAE7] focus:ring-2 focus:ring-[#C3EAE7]/30 transition-all duration-200 outline-none hover:border-[#C3EAE7]/50 group-hover:shadow-md`}
                                    placeholder="Create a strong password"
                                    required
                                />
                                {formik.errors.password && formik.touched.password && (
                                    <div className="text-red-500 text-sm mt-1">{formik.errors.password}</div>
                                )}
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
                                    name="confirmPassword"
                                    value={formik.values.confirmPassword}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    className={`w-full px-4 py-3 border-2 ${formik.errors.confirmPassword && formik.touched.confirmPassword ? 'border-red-500' : 'border-gray-200'
                                        } rounded-xl focus:border-[#C3EAE7] focus:ring-2 focus:ring-[#C3EAE7]/30 transition-all duration-200 outline-none hover:border-[#C3EAE7]/50 group-hover:shadow-md`}
                                    placeholder="Confirm your password"
                                    required
                                />
                                {formik.errors.confirmPassword && formik.touched.confirmPassword && (
                                    <div className="text-red-500 text-sm mt-1">{formik.errors.confirmPassword}</div>
                                )}
                            </div>
                        </div>

                        <div className="bg-[#C3EAE7]/20 rounded-xl p-6 space-y-4">
                            <label className="block text-sm font-semibold text-black">
                                GDC Registration *
                            </label>
                            <select
                                name="gdcRegistration"
                                value={formik.values.gdcRegistration}
                                onChange={(e) => {
                                    formik.handleChange(e);
                                    if (e.target.value !== "yes") {
                                        formik.setFieldValue('gdcNumber', '');
                                    }
                                }}
                                onBlur={formik.handleBlur}
                                className={`w-full px-4 py-3 border-2 ${formik.errors.gdcRegistration && formik.touched.gdcRegistration ? 'border-red-500' : 'border-gray-200'
                                    } rounded-xl focus:border-[#C3EAE7] focus:ring-2 focus:ring-[#C3EAE7]/30 transition-all duration-200 outline-none appearance-none bg-white`}
                                required
                            >
                                <option value="">Select an option</option>
                                <option value="yes">Yes</option>
                                <option value="no">No</option>
                            </select>
                            {formik.errors.gdcRegistration && formik.touched.gdcRegistration && (
                                <div className="text-red-500 text-sm mt-1">{formik.errors.gdcRegistration}</div>
                            )}

                            {formik.values.gdcRegistration === "yes" && (
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-black">GDC Registration Number *</label>
                                    <input
                                        type="text"
                                        name="gdcNumber"
                                        placeholder="Enter your GDC Registration Number"
                                        value={formik.values.gdcNumber}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        className={`w-full px-4 py-3 border-2 bg-white ${formik.errors.gdcNumber && formik.touched.gdcNumber ? 'border-red-500' : 'border-gray-200'
                                            } rounded-xl focus:border-[#C3EAE7] focus:ring-2 focus:ring-[#C3EAE7]/30 transition-all duration-200 outline-none`}
                                        required
                                    />
                                    {formik.errors.gdcNumber && formik.touched.gdcNumber && (
                                        <div className="text-red-500 text-sm mt-1">{formik.errors.gdcNumber}</div>
                                    )}
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
                                    name="jobType"
                                    value={formik.values.jobType}
                                    onChange={(e) => {
                                        formik.handleChange(e);
                                        formik.setFieldValue('selectedDentistFields', []);
                                        formik.setFieldValue('dentistExperience', {});
                                        formik.setFieldValue('therapistExperience', {});
                                    }}
                                    onBlur={formik.handleBlur}
                                    className={`w-full px-4 py-3 border-2 ${formik.errors.jobType && formik.touched.jobType ? 'border-red-500' : 'border-gray-200'
                                        } rounded-xl focus:border-[#C3EAE7] focus:ring-2 focus:ring-[#C3EAE7]/30 transition-all duration-200 outline-none appearance-none bg-white`}
                                    required
                                >
                                    <option value="">Select your job type</option>
                                    {jobTypes.map((type) => (
                                        <option key={type} value={type}>
                                            {type}
                                        </option>
                                    ))}
                                </select>
                                {formik.errors.jobType && formik.touched.jobType && (
                                    <div className="text-red-500 text-sm mt-1">{formik.errors.jobType}</div>
                                )}
                            </div>
                        </div>

                        {formik.values.jobType === "Dentist" && (
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
                                                    checked={formik.values.selectedDentistFields.includes(field)}
                                                    onChange={() => handleDentistFieldChange(field)}
                                                    className="w-5 h-5 text-black border-2 border-gray-300 rounded focus:ring-[#C3EAE7]"
                                                />
                                                <span className="font-medium text-black">{field}</span>
                                            </label>
                                            {formik.values.selectedDentistFields.includes(field) && (
                                                <input
                                                    type="text"
                                                    placeholder="Enter experience (e.g., 2 years, 6 months)"
                                                    className="w-full px-3 py-2 mt-3 border border-gray-300 rounded-lg focus:border-[#C3EAE7] focus:ring-1 focus:ring-[#C3EAE7]/30 transition-all duration-200 outline-none"
                                                    onChange={(e) => handleDentistExperienceChange(field, e.target.value)}
                                                    value={formik.values.dentistExperience[field] || ""}
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {formik.values.jobType === "Nurse" && (
                            <div className="bg-[#C3EAE7]/20 rounded-xl p-6 space-y-4">
                                <h4 className="font-bold text-lg text-black flex items-center">
                                    <div className="w-2 h-2 bg-[#C3EAE7] rounded-full mr-2"></div>
                                    Nurse Experience in UK
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {dentistFields.map((field) => (
                                        <div key={field} className="bg-white rounded-lg p-4 border border-gray-200">
                                            <label className="flex items-center gap-3 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={formik.values.selectedNurseFields.includes(field)}
                                                    onChange={() => handleNursesFieldChange(field)}
                                                    className="w-5 h-5 text-black border-2 border-gray-300 rounded focus:ring-[#C3EAE7]"
                                                />
                                                <span className="font-medium text-black">{field}</span>
                                            </label>
                                            {formik.values.selectedNurseFields.includes(field) && (
                                                <input
                                                    type="text"
                                                    placeholder="Enter experience (e.g., 2 years, 6 months)"
                                                    className="w-full px-3 py-2 mt-3 border border-gray-300 rounded-lg focus:border-[#C3EAE7] focus:ring-1 focus:ring-[#C3EAE7]/30 transition-all duration-200 outline-none"
                                                    onChange={(e) => handleNurseExperienceChange(field, e.target.value)}
                                                    value={formik.values.nurseExperience[field] || ""}
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}


                        {formik.values.jobType === "Receptionist" && (
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
                                            name="receptionistYearsExperience"
                                            placeholder="e.g., 3 years"
                                            value={formik.values.receptionistYearsExperience}
                                            onChange={formik.handleChange}
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#C3EAE7] focus:ring-2 focus:ring-[#C3EAE7]/30 transition-all duration-200 outline-none"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-black">Software Experience</label>
                                        <input
                                            type="text"
                                            name="receptionistSoftwareExperience"
                                            placeholder="e.g., SOE, R4, Dentally"
                                            value={formik.values.receptionistSoftwareExperience}
                                            onChange={formik.handleChange}
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#C3EAE7] focus:ring-2 focus:ring-[#C3EAE7]/30 transition-all duration-200 outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {(formik.values.jobType === "Hygienist" || formik.values.jobType === "Therapist") && (
                            <div className="bg-[#C3EAE7]/20 rounded-xl p-6 space-y-4">
                                <h4 className="font-bold text-lg text-black flex items-center">
                                    <div className="w-2 h-2 bg-[#C3EAE7] rounded-full mr-2"></div>
                                    {formik.values.jobType} Experience
                                </h4>
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-black">Years of Experience</label>
                                    <input
                                        type="text"
                                        name="hygienistYearsExperience"
                                        placeholder="Enter years of experience"
                                        value={formik.values.hygienistYearsExperience}
                                        onChange={formik.handleChange}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#C3EAE7] focus:ring-2 focus:ring-[#C3EAE7]/30 transition-all duration-200 outline-none"
                                    />
                                </div>

                                {formik.values.jobType === "Therapist" && (
                                    <div className="space-y-4">
                                        <h5 className="font-semibold text-black">Therapist Experience Areas in UK:</h5>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {therapistFields.map((field) => (
                                                <div key={field} className="bg-white rounded-lg p-4 border border-gray-200">
                                                    <label className="flex items-center gap-3 cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={formik.values.therapistExperience[field] !== undefined}
                                                            onChange={(e) => handleTherapistFieldChange(field, e.target.checked)}
                                                            className="w-5 h-5 text-black border-2 border-gray-300 rounded focus:ring-[#C3EAE7]"
                                                        />
                                                        <span className="font-medium text-black">{field}</span>
                                                    </label>
                                                    {formik.values.therapistExperience[field] !== undefined && (
                                                        <input
                                                            type="text"
                                                            placeholder={`Experience in ${field}`}
                                                            className="w-full px-3 py-2 mt-3 border border-gray-300 rounded-lg focus:border-[#C3EAE7] focus:ring-1 focus:ring-[#C3EAE7]/30 transition-all duration-200 outline-none"
                                                            value={formik.values.therapistExperience[field]}
                                                            onChange={(e) => handleTherapistExperienceChange(field, e.target.value)}
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
                                    disabled={isSubmitting}
                                    className="relative w-full bg-[#C3EAE7] hover:bg-[#A9DBD9] text-black font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-[#C3EAE7]/30 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    <span className="flex items-center justify-center gap-2">
                                        {isSubmitting ? (
                                            <>
                                                <svg className="animate-spin h-5 w-5 text-black" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                <span>Registering...</span>
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-5 h-5 group-hover:animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                Complete Registration
                                            </>
                                        )}
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

                <div className="mt-6 text-center">
                    <span className="text-gray-700 text-base">Already registered?{' '}
                        <a href="/locumStaff/login" className="text-black font-semibold hover:underline">Login here</a>
                    </span>
                    <span className="mx-2">|</span>
                    <a href="/" className="text-sm text-black font-bold">Back to Home</a>
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
                                                <p className="text-sm text-gray-600 bg-white p-2 rounded border">{formik.values.address}</p>
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

                <GoogleMapModal
                    open={open}
                    onClose={() => setOpen(false)}
                    onSelect={(loc) => {
                        setLocation(loc);
                        setOpen(false);
                        setAddressLat(loc.lat);
                        setAddressLng(loc.lng);
                        formik.setFieldValue('address', loc.address);
                    }}
                />
            </div>
        </div>
    );
};

export default SignUpForm;
