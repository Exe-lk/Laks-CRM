import { useState, useRef } from "react";
import { useFormik } from 'formik';
import Swal from 'sweetalert2';
import { GoogleMapModal } from '../../../components/GoogleMapModal';
import { FaMapMarkerAlt } from 'react-icons/fa';
import { useAddPracticeProfileMutation, type RegistrationResponse, type ErrorResponse } from '../../../redux/slices/practiceProfileSlice';
import { useRouter } from "next/router";
import ReCaptcha, { ReCaptchaRef } from '../../../components/ReCaptcha';


export interface PracticeProfile {
    name: string;
    telephone: string;
    GDCnumber: string;
    dob: string;
    email: string;
    password: string;
    address: string;
    location: string;
    practiceType: string;
}

const initialValues = {
    name: '',
    telephone: '',
    GDCnumber: '',
    dob: '',
    email: '',
    password: '',
    confirmPassword: '',
    address: '',
    location: '',
    gdcRegistration: '',
    practiceType: 'Select your practice type'
};

const PracticeRegisterForm = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showMap, setShowMap] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState<{ lat: number, lng: number } | null>(null);
    const [location, setLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);
    const [open, setOpen] = useState(false);
    const [addLocumProfile, { isLoading: isAdding }] = useAddPracticeProfileMutation();
    const router = useRouter();
    const recaptchaRef = useRef<ReCaptchaRef>(null);
    const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    const formatTelephone = (value: string) => {
        return value.replace(/\D/g, '').slice(0, 10);
    };

    const today = new Date();
    const minAgeDate = new Date(
        today.getFullYear() - 18,
        today.getMonth(),
        today.getDate()
    );

    const formik = useFormik({
        initialValues,
        validate: (values) => {
            const errors: any = {};
            if (!values.name) errors.name = 'Name is required';
            if (!values.telephone) {
                errors.telephone = 'Contact number is required';
            } else if (!/^\d{10}$/.test(values.telephone)) {
                errors.telephone = 'Contact number must be exactly 10 digits (after +44)';
            }

            if (values.gdcRegistration === 'yes') {
                if (!values.GDCnumber) {
                    errors.GDCnumber = 'GDC registration number is required';
                } else if (!/^\d{4,7}$/.test(values.GDCnumber)) {
                    errors.GDCnumber = 'GDC number must be 4 to 7 digits long and contain only numbers';
                }
            }

            if (!values.dob) {
                errors.dob = 'Date of Birth is required';
            } else {
                const dobDate = new Date(values.dob);

                if (dobDate >= today) {
                    errors.dob = 'Date of Birth cannot be today or in the future';
                } else if (dobDate > minAgeDate) {
                    errors.dob = 'You must be at least 18 years old';
                }
            }
            if (!values.email) {
                errors.email = 'Email is required';
            } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)) {
                errors.email = 'Invalid email address';
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
            if (!values.address) errors.address = 'Address is required';
            if (!values.confirmPassword) errors.confirmPassword = 'Please confirm your password';
            else if (values.password !== values.confirmPassword) errors.confirmPassword = 'Passwords do not match';
            if (!values.practiceType) errors.practiceType = 'Practice type is required';
            if (!values.location) errors.location = 'Location is required';
            return errors;
        },
        onSubmit: async (values) => {
            setIsSubmitting(true);
            try {
                if (!recaptchaToken) {
                    await Swal.fire({
                        title: 'Verification Required',
                        text: 'Please complete the reCAPTCHA verification',
                        icon: 'warning',
                        confirmButtonText: 'OK',
                        confirmButtonColor: '#C3EAE7'
                    });
                    setIsSubmitting(false);
                    return;
                }
                console.log('Registration form values:', values);
                const [yyyy, mm, dd] = values.dob.split("-");
                const dob = `${dd}-${mm}-${yyyy}`;
                const submitValues = {
                    name: values.name,
                    telephone: values.telephone,
                    GDCnumber: values.GDCnumber,
                    dob,
                    email: values.email,
                    password: values.password,
                    address: values.address,
                    location: values.location,
                    practiceType: values.practiceType,
                };
                const response = await addLocumProfile(submitValues);
                console.log('Registration response:', response);

                if (response.data && response.data.status === 200) {
                    Swal.fire({
                        title: 'Registration completed successfully! Please check your email to verify your account before logging in.',
                        icon: 'success',
                        confirmButtonText: 'OK',
                        confirmButtonColor: '#C3EAE7'
                    });
                    formik.resetForm();
                    recaptchaRef.current?.reset();
                    setRecaptchaToken(null);
                    router.push('/');
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
                recaptchaRef.current?.reset();
                setRecaptchaToken(null);
            } finally {
                setIsSubmitting(false);
            }
        },
    });

    const handleRecaptchaChange = (token: string | null) => {
        setRecaptchaToken(token);
    };

    const handleRecaptchaExpired = () => {
        setRecaptchaToken(null);
        Swal.fire({
            title: 'Verification Expired',
            text: 'Please complete the reCAPTCHA verification again',
            icon: 'warning',
            confirmButtonText: 'OK',
            confirmButtonColor: '#C3EAE7',
            toast: true,
            position: 'top-end',
            timer: 3000,
            showConfirmButton: false
        });
    };

    const handleMapClick = (lat: number, lng: number) => {
        setSelectedLocation({ lat, lng });
        const simulatedAddress = `${lat.toFixed(4)}, ${lng.toFixed(4)} - Sample Street, Sample City, Sample Country`;
        formik.setFieldValue('address', simulatedAddress);
        console.log('Selected Address:', simulatedAddress);
        console.log('Latitude:', lat);
        console.log('Longitude:', lng);
        formik.setFieldValue('location', `${lat},${lng}`);
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
                    <h1 className="text-4xl font-bold text-black mb-2 bg-gradient-to-r from-black to-gray-700 bg-clip-text">Practice Registration</h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">Register your practice and join our dental community</p>
                    <div className="flex justify-center gap-2 mt-4">
                        <div className="w-2 h-2 bg-[#C3EAE7] rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-[#C3EAE7] rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 bg-[#C3EAE7] rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                </div>
                <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 overflow-hidden">
                    <div className="bg-[#C3EAE7] px-8 py-6">
                        <h2 className="text-2xl font-bold text-black">Practice Registration Form</h2>
                        <p className="text-gray-700 mt-1">Please fill in all required information</p>
                    </div>
                    <form onSubmit={formik.handleSubmit} className="px-8 py-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2 group">
                                <label className="block text-sm font-semibold text-black flex items-center gap-2">
                                    <svg className="w-4 h-4 text-[#C3EAE7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    Name *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formik.values.name}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    className={`w-full px-4 py-3 border-2 ${formik.errors.name && formik.touched.name ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:border-[#C3EAE7] focus:ring-2 focus:ring-[#C3EAE7]/30 transition-all duration-200 outline-none hover:border-[#C3EAE7]/50 group-hover:shadow-md`}
                                    placeholder="Enter your name"
                                    required
                                />
                                {formik.errors.name && formik.touched.name && (
                                    <div className="text-red-500 text-sm mt-1">{formik.errors.name}</div>
                                )}
                            </div>
                            <div className="space-y-2 group">
                                <label className="block text-sm font-semibold text-black flex items-center gap-2">
                                    <svg className="w-4 h-4 text-[#C3EAE7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    Telephone *
                                </label>
                                <div className="flex items-center">
                                    <span className="px-2 py-3 bg-gray-100 border-2 border-gray-200 rounded-l-xl text-gray-700 font-semibold select-none">+44</span>
                                    <input
                                        type="text"
                                        name="telephone"
                                        value={formik.values.telephone}
                                        onChange={e => {
                                            const formatted = formatTelephone(e.target.value);
                                            formik.setFieldValue('telephone', formatted);
                                        }}
                                        onBlur={formik.handleBlur}
                                        className={`w-full px-4 py-3 border-2 ${formik.errors.telephone && formik.touched.telephone ? 'border-red-500' : 'border-gray-200'} rounded-r-xl focus:border-[#C3EAE7] focus:ring-2 focus:ring-[#C3EAE7]/30 transition-all duration-200 outline-none hover:border-[#C3EAE7]/50 group-hover:shadow-md`}
                                        placeholder="Enter 10 digits"
                                        required
                                        maxLength={10}
                                        inputMode="numeric"
                                    />
                                </div>
                                {formik.errors.telephone && formik.touched.telephone && (
                                    <div className="text-red-500 text-sm mt-1">{formik.errors.telephone}</div>
                                )}
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2 group">
                                <label className="block text-sm font-semibold text-black flex items-center gap-2">
                                    <svg className="w-4 h-4 text-[#C3EAE7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    Email *
                                </label>
                                <input
                                    type="text"
                                    name="email"
                                    value={formik.values.email}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    className={`w-full px-4 py-3 border-2 ${formik.errors.email && formik.touched.email ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:border-[#C3EAE7] focus:ring-2 focus:ring-[#C3EAE7]/30 transition-all duration-200 outline-none hover:border-[#C3EAE7]/50 group-hover:shadow-md`}
                                    placeholder="Enter your email"
                                    required
                                />
                                {formik.errors.email && formik.touched.email && (
                                    <div className="text-red-500 text-sm mt-1">{formik.errors.email}</div>
                                )}

                            </div>
                            <div className="space-y-2 group">
                                <label className="block text-sm font-semibold text-black flex items-center gap-2">
                                    <svg className="w-4 h-4 text-[#C3EAE7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    Date of Birth *
                                </label>
                                <input
                                    type="date"
                                    name="dob"
                                    value={formik.values.dob}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    className={`w-full px-4 py-3 border-2 ${formik.errors.dob && formik.touched.dob ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:border-[#C3EAE7] focus:ring-2 focus:ring-[#C3EAE7]/30 transition-all duration-200 outline-none hover:border-[#C3EAE7]/50 group-hover:shadow-md`}
                                    required
                                />
                                {formik.errors.dob && formik.touched.dob && (
                                    <div className="text-red-500 text-sm mt-1">{formik.errors.dob}</div>
                                )}
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
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={formik.values.password}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        className={`w-full px-4 py-3 pr-12 border-2 ${formik.errors.password && formik.touched.password ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:border-[#C3EAE7] focus:ring-2 focus:ring-[#C3EAE7]/30 transition-all duration-200 outline-none hover:border-[#C3EAE7]/50 group-hover:shadow-md`}
                                        placeholder="Create a strong password"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-black transition-colors"
                                    >
                                        {showPassword ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none"
                                                viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274
              4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none"
                                                viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477
               0-8.268-2.943-9.542-7a9.97 9.97 0 012.563-4.263M9.88
               9.88a3 3 0 104.243 4.243" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                    d="M3 3l18 18" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
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
                                    className={`w-full px-4 py-3 border-2 ${formik.errors.confirmPassword && formik.touched.confirmPassword ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:border-[#C3EAE7] focus:ring-2 focus:ring-[#C3EAE7]/30 transition-all duration-200 outline-none hover:border-[#C3EAE7]/50 group-hover:shadow-md`}
                                    placeholder="Confirm your password"
                                    required
                                />
                                {formik.errors.confirmPassword && formik.touched.confirmPassword && (
                                    <div className="text-red-500 text-sm mt-1">{formik.errors.confirmPassword}</div>
                                )}
                            </div>
                        </div>
                        <div className="space-y-2 group">
                            <label className="block text-sm font-semibold text-black flex items-center gap-2">
                                <svg className="w-4 h-4 text-[#C3EAE7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                Select your location from map *
                            </label>
                            <div className="relative">
                                <textarea
                                    name="address"
                                    value={formik.values.address}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    className={`w-full px-4 py-3 pr-12 border-2 ${formik.errors.address && formik.touched.address ? 'border-red-500' : 'border-gray-200'
                                        } rounded-xl focus:border-[#C3EAE7] focus:ring-2 focus:ring-[#C3EAE7]/30 transition-all duration-200 outline-none resize-none h-20 hover:border-[#C3EAE7]/50 group-hover:shadow-md`}
                                    placeholder="Click the map icon to select location"
                                    required
                                    readOnly
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
                                        formik.setFieldValue('GDCnumber', '');
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
                                        name="GDCnumber"
                                        placeholder="Enter your GDC Registration Number"
                                        value={formik.values.GDCnumber}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        className={`w-full px-4 py-3 border-2 ${formik.errors.GDCnumber && formik.touched.GDCnumber ? 'border-red-500' : 'border-gray-200'
                                            } rounded-xl focus:border-[#C3EAE7] focus:ring-2 focus:ring-[#C3EAE7]/30 transition-all duration-200 outline-none`}
                                        required
                                    />
                                    {formik.errors.GDCnumber && formik.touched.GDCnumber && (
                                        <div className="text-red-500 text-sm mt-1">{formik.errors.GDCnumber}</div>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="bg-[#C3EAE7]/20 rounded-xl p-6 space-y-4">
                            <label className="block text-sm font-semibold text-black">
                                Practice Type *
                            </label>
                            <div className="relative">
                                <select
                                    name="practiceType"
                                    value={formik.values.practiceType}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    className={`w-full px-4 py-3 border-2 ${formik.errors.practiceType && formik.touched.practiceType ? 'border-red-500' : 'border-gray-200'
                                        } rounded-xl focus:border-[#C3EAE7] focus:ring-2 focus:ring-[#C3EAE7]/30 transition-all duration-200 outline-none appearance-none bg-white`}
                                    required
                                >
                                    <option value="">Select your practice type</option>
                                    <option value="Private">Individual Practice</option>
                                    <option value="Corporate">Corporate Practice</option>
                                </select>
                                <svg
                                    className="w-5 h-5 text-gray-500 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M19 9l-7 7-7-7"
                                    />
                                </svg>
                            </div>
                            {formik.errors.practiceType && formik.touched.practiceType && (
                                <div className="text-red-500 text-sm mt-1">{formik.errors.practiceType}</div>
                            )}
                            <p className="text-sm text-gray-600">
                                Corporate practices can create multiple branches, while private practices operate as a single location.
                            </p>
                        </div>
                        <div className="pt-6">
                            <ReCaptcha
                                ref={recaptchaRef}
                                onChange={handleRecaptchaChange}
                                onExpired={handleRecaptchaExpired}
                                theme="light"
                                size="normal"
                            />
                        </div>
                        <div className="pt-6">
                            <div className="relative group">
                                <div className="absolute -inset-1 bg-gradient-to-r from-[#C3EAE7] to-[#A9DBD9] rounded-xl blur opacity-25 group-hover:opacity-75 transition duration-200"></div>
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !recaptchaToken}
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
                            <a href="/components/termsandconditions" target="_blank" rel="noopener noreferrer" className="text-black hover:text-gray-700 font-semibold">Terms of Service</a>{" "}
                            and{" "}
                            <a href="/components/privacy" target="_blank" rel="noopener noreferrer" className="text-black hover:text-gray-700 font-semibold">Privacy Policy</a>
                        </div>
                    </form>
                </div>
                <div className="mt-6 text-center">
                    <span className="text-gray-700 text-base">Already registered?{' '}
                        <a href="/practiceUser/practiceLogin" className="text-black font-semibold hover:underline">Login here</a>
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
                        formik.setFieldValue('address', loc.address);
                        console.log('Selected Address:', loc.address);
                        console.log('Latitude:', loc.lat);
                        console.log('Longitude:', loc.lng);
                        formik.setFieldValue('location', `${loc.lat},${loc.lng}`);
                    }}
                />
            </div>
        </div>
    );
};

export default PracticeRegisterForm;
