import React, { useEffect, useState } from 'react';
import NavBar from "../../components/branchNavBar";
import Footer from "../../components/footer/index";
import AppointmentsTable from "../../components/appointmentsTable";
import { FiPlus, FiAlertTriangle } from "react-icons/fi";
import Swal from 'sweetalert2';
import { useFormik } from 'formik';
import { useCreateAppointmentRequestMutation, useGetPracticeRequestsQuery, useGetBranchRequestsQuery } from '../../../redux/slices/appointmentPracticeSlice';
import { useCheckBranchHasPaymentMethodsQuery } from '../../../redux/slices/cardPracticerUserBranchSlice';
import { useRouter } from 'next/router';

interface Profile {
    id?: string;
    address?: string;
    location?: string;
    practiceType?: string;
    userType?: string;
    name?: string;
    practiceName?: string;
    practiceId?: string;
}

interface Branch {
    id: string;
    name: string;
    address: string;
    location: string;
    telephone?: string;
    email?: string;
    status: string;
}

interface FormValues {
    practice_id: string;
    request_date: string;
    request_start_time: string;
    request_end_time: string;
    location: string;
    required_role: string;
    address: string;
    branch_id: string;
}

const validateAppointmentForm = (values: FormValues, practiceType?: string) => {
    const errors: Partial<FormValues> = {};

    if (!values.practice_id) {
        errors.practice_id = 'Practice ID is required';
    }

    if (!values.request_date) {
        errors.request_date = 'Date is required';
    } else {
        const selectedDate = new Date(values.request_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (selectedDate <= today) {
            errors.request_date = 'Cannot select a past date';
        }

        const sixMonthsFromNow = new Date();
        sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);
        if (selectedDate > sixMonthsFromNow) {
            errors.request_date = 'Cannot schedule more than 6 months in advance';
        }
    }

    if (!values.request_start_time) {
        errors.request_start_time = 'Start time is required';
    } else {
        const time24Regex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
        const time12Regex = /^(1[0-2]|[1-9]):[0-5][0-9]\s?(AM|PM)$/i;
        if (!time24Regex.test(values.request_start_time) && !time12Regex.test(values.request_start_time)) {
            errors.request_start_time = 'Please enter a valid time';
        }
    }

    if (!values.request_end_time) {
        errors.request_end_time = 'End time is required';
    } else {
        const time24Regex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
        const time12Regex = /^(1[0-2]|[1-9]):[0-5][0-9]\s?(AM|PM)$/i;
        if (!time24Regex.test(values.request_end_time) && !time12Regex.test(values.request_end_time)) {
            errors.request_end_time = 'Please enter a valid time';
        }
    }

    if (values.request_start_time && values.request_end_time) {
        const convertTo24Hour = (timeStr: string) => {
            if (timeStr.includes('AM') || timeStr.includes('PM')) {
                const [time, period] = timeStr.split(/\s+/);
                const [hours, minutes] = time.split(':');
                let hour24 = parseInt(hours);
                if (period.toUpperCase() === 'PM' && hour24 !== 12) {
                    hour24 += 12;
                } else if (period.toUpperCase() === 'AM' && hour24 === 12) {
                    hour24 = 0;
                }
                return `${hour24.toString().padStart(2, '0')}:${minutes}`;
            }
            return timeStr;
        };

        const start24 = convertTo24Hour(values.request_start_time);
        const end24 = convertTo24Hour(values.request_end_time);

        const start = new Date(`2000-01-01T${start24}`);
        const end = new Date(`2000-01-01T${end24}`);

        if (start >= end) {
            errors.request_start_time = 'Start time must be before end time';
            errors.request_end_time = 'End time must be after start time';
        } else {
            const diffMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
            if (diffMinutes < 30) {
                errors.request_end_time = 'Appointment must be at least 30 minutes long';
            }
            if (diffMinutes > 720) {
                errors.request_end_time = 'Appointment cannot exceed 12 hours';
            }
        }
    }

    if (!values.location?.trim()) {
        errors.location = 'Location is required';
    } else {
        const trimmedLocation = values.location.trim();
        if (trimmedLocation.length < 3) {
            errors.location = 'Location must be at least 3 characters long';
        }
        if (trimmedLocation.length > 200) {
            errors.location = 'Location must be less than 200 characters';
        }
    }

    if (!values.required_role) {
        errors.required_role = 'Role selection is required';
    } else {
        const validRoles = ['Nurse', 'Receptionist', 'Hygienist', 'Dentist'];
        if (!validRoles.includes(values.required_role)) {
            errors.required_role = 'Please select a valid role';
        }
    }

    if (practiceType === 'Corporate' && !values.branch_id) {
        errors.branch_id = 'Branch selection is required';
    }

    return errors;
};

const CreateAppointmentPage = () => {
    const router = useRouter();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [loadingBranches, setLoadingBranches] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [isBranchUser, setIsBranchUser] = useState(false);
    const [showAccessDenied, setShowAccessDenied] = useState(false);
    console.log(profile)

    const [createAppointmentRequest, { isLoading: isCreatingAppointment }] = useCreateAppointmentRequestMutation();

    const {
        data: cardStatusData,
        isLoading: isLoadingCardStatus
    } = useCheckBranchHasPaymentMethodsQuery(profile?.id || '', {
        skip: !profile?.id
    });
    console.log(cardStatusData)

    const {
        data: practiceRequestsData,
        isLoading: isLoadingRequests,
        refetch: refetchRequests
    } = isBranchUser
            ? useGetBranchRequestsQuery(
                {
                    branch_id: profile?.id || '',
                    page: currentPage,
                    limit: 20
                },
                {
                    skip: !profile?.id || !isBranchUser
                }
            )
            : useGetPracticeRequestsQuery(
                {
                    practice_id: profile?.id || '',
                    page: currentPage,
                    limit: 20
                },
                {
                    skip: !profile?.id || isBranchUser
                }
            );
    console.log(practiceRequestsData)
    const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);

    const formik = useFormik<FormValues>({
        initialValues: {
            practice_id: '',
            request_date: '',
            request_start_time: '',
            request_end_time: '',
            location: '',
            required_role: '',
            address: '',
            branch_id: ''
        },
        validate: (values) => validateAppointmentForm(values, profile?.practiceType),
        enableReinitialize: true,
        onSubmit: async (values) => {
            await handleFormSubmit(values);
        }
    });

    useEffect(() => {
        if (profile && isBranchUser) {
            const hasLocation = profile.location && profile.location.trim();
            const hasAddress = profile.address && profile.address.trim();

            const formValues = {
                practice_id: profile.practiceId || '',
                request_date: '',
                request_start_time: '',
                request_end_time: '',
                location: hasAddress ? profile.address! : '',
                required_role: '',
                address: hasLocation ? profile.location! : '',
                branch_id: profile.id || ''
            };

            console.log('Setting form values in useEffect:', formValues);
            formik.setValues(formValues);
        }
    }, [profile, isBranchUser]);


    const isFormValid = () => {
        const values = formik.values;
        const errors = validateAppointmentForm(values, profile?.practiceType);
        return Object.keys(errors).length === 0 && values.practice_id;
    };

    useEffect(() => {
        const profileStr = localStorage.getItem('profile');
        if (profileStr) {
            try {
                const parsedProfile = JSON.parse(profileStr);
                setProfile(parsedProfile);

                if (parsedProfile.userType === 'branch') {
                    setIsBranchUser(true);
                    setShowAccessDenied(false);
                } else {
                    setIsBranchUser(false);
                    setShowAccessDenied(true);
                }
            } catch {
                setProfile(null);
                setShowAccessDenied(true);
            }
        } else {
            setShowAccessDenied(true);
        }
    }, []);

    useEffect(() => {
        if (profile?.id) {
            fetchBranches(profile.id);
        }
    }, [profile?.id]);

    const fetchBranches = async (practiceId: string) => {
        setLoadingBranches(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/branch/practice-branches?practiceId=${practiceId}`);
            if (response.ok) {
                const data = await response.json();
                setBranches(data.branches || []);
            } else {
                console.error('Failed to fetch branches');
                setBranches([]);
            }
        } catch (error) {
            console.error('Error fetching branches:', error);
            setBranches([]);
        } finally {
            setLoadingBranches(false);
        }
    };

    useEffect(() => {
        console.log('Form validation state:', {
            isValid: formik.isValid,
            errors: formik.errors,
            values: formik.values,
            touched: formik.touched,
            practice_id: formik.values.practice_id,
            hasErrors: Object.keys(formik.errors).length > 0,
            errorKeys: Object.keys(formik.errors)
        });
    }, [formik.isValid, formik.errors, formik.values, formik.touched]);

    const openAppointmentModal = async () => {
        // Check if branch has payment methods before allowing appointment creation
        if (cardStatusData && !cardStatusData.hasCards) {
            const result = await Swal.fire({
                title: 'Payment Method Required',
                text: 'You need to add a payment method before creating appointments. Would you like to add one now?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, Add Payment Method',
                cancelButtonText: 'Cancel',
                confirmButtonColor: '#C3EAE7',
                cancelButtonColor: '#6B7280',
            });

            if (result.isConfirmed) {
                router.push('/branch/payment');
            }
            return;
        }

        if (profile?.id) {
            const hasLocation = profile.location && profile.location.trim();
            const hasAddress = profile.address && profile.address.trim();

            const initialLocation = hasAddress ? profile.address : '';
            const initialAddress = hasLocation ? profile.location : '';

            const formValues = {
                practice_id: profile.practiceId || '',
                request_date: '',
                request_start_time: '',
                request_end_time: '',
                location: initialLocation || '',
                required_role: '',
                address: initialAddress || '',
                branch_id: profile.id || ''
            };

            console.log('Setting form values in openAppointmentModal:', formValues);
            formik.setValues(formValues);
            setTimeout(() => {
                formik.validateForm();
            }, 100);
        }
        setIsAppointmentModalOpen(true);
    };

    const closeAppointmentModal = () => {
        setIsAppointmentModalOpen(false);
        formik.resetForm();
    };

    const handleBranchSelection = (branchId: string) => {
        const selectedBranch = branches.find(branch => branch.id === branchId);
        if (selectedBranch) {
            formik.setValues({
                ...formik.values,
                branch_id: branchId,
                location: selectedBranch.location,
                address: selectedBranch.address
            });
        }
    };

    const handleFormSubmit = async (values: typeof formik.values) => {
        if (!isBranchUser) {
            Swal.fire({
                icon: 'error',
                title: 'Access Denied',
                text: 'Only branch users can create appointments.',
                confirmButtonColor: '#C3EAE7',
            });
            return;
        }

        // Check for payment methods before submitting
        if (cardStatusData && !cardStatusData.hasCards) {
            const result = await Swal.fire({
                title: 'Payment Method Required',
                text: 'You need to add a payment method before creating appointments. Would you like to add one now?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, Add Payment Method',
                cancelButtonText: 'Cancel',
                confirmButtonColor: '#C3EAE7',
                cancelButtonColor: '#6B7280',
            });

            if (result.isConfirmed) {
                router.push('/branch/payment');
                return;
            } else {
                return;
            }
        }

        try {
            console.log('Submitting appointment request with values:', values);

            const result = await createAppointmentRequest(values).unwrap();

            Swal.fire({
                icon: 'success',
                title: 'Appointment Created!',
                text: result.message || 'Appointment request has been created successfully.',
                confirmButtonColor: '#C3EAE7',
            });
            closeAppointmentModal();
            refetchRequests();
        } catch (error: any) {
            console.error("Error creating appointment:", error);
            Swal.fire({
                icon: 'error',
                title: 'Failed',
                text: error.data?.error || error.message || 'Failed to create appointment. Please try again.',
                confirmButtonColor: '#C3EAE7',
            });
        }
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    console.log("branches", branches)

    if (showAccessDenied && !isBranchUser) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                        <FiAlertTriangle className="w-8 h-8 text-red-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
                    <p className="text-gray-600 mb-6">
                        Practice users cannot create appointments directly. Only branch users can create appointments for their specific locations.
                    </p>
                    <div className="space-y-3">
                        <button
                            onClick={() => router.push('/practiceUser/dashboard')}
                            className="w-full px-4 py-2 bg-[#C3EAE7] text-gray-800 rounded-lg hover:bg-[#A9DBD9] transition-colors"
                        >
                            Go to Dashboard
                        </button>
                        <button
                            onClick={() => router.push('/practiceUser/branches')}
                            className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                            Manage Branches
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-32">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C3EAE7] mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white flex flex-col">
            <NavBar />

            <div className="flex-1 w-full pt-32">
                <div className="text-center mb-8 pt-24">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-black rounded-full mb-4 shadow-lg">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3M3 11h18M5 19h14" />
                        </svg>
                    </div>
                    <h1 className="text-4xl font-bold text-black mb-2">Create Appointment Request</h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        {isBranchUser
                            ? `Schedule appointments for ${profile.name} branch.`
                            : 'Schedule your appointment by filling out the form below with all required details.'
                        }
                    </p>
                    <div className="flex justify-center gap-2 mt-4">
                        <div className="w-2 h-2 bg-[#C3EAE7] rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-[#C3EAE7] rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 bg-[#C3EAE7] rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                    </div>

                    {isBranchUser && (
                        <div className="flex justify-center mt-8">
                            <div className="flex flex-col items-center">
                                <button
                                    onClick={openAppointmentModal}
                                    disabled={isLoadingCardStatus || !cardStatusData?.hasCards}
                                    className={`flex items-center gap-2 px-8 py-4 font-bold rounded-xl 
                                         transition-all duration-200 shadow-lg
                                         ${isLoadingCardStatus || !cardStatusData?.hasCards
                                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                            : 'bg-[#C3EAE7] text-black hover:bg-[#A9DBD9] hover:shadow-xl transform hover:scale-105'
                                        }`}
                                >
                                    <FiPlus className="text-xl" />
                                    {isLoadingCardStatus ? 'Loading...' : 'Create New Appointment'}
                                </button>
                                {!isLoadingCardStatus && cardStatusData && !cardStatusData.hasCards && (
                                    <div className="mt-4 flex items-center gap-2 px-4 py-3 bg-red-50 border-2 border-red-200 rounded-lg shadow-md">
                                        <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-1.964-1.333-2.732 0L3.918 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                        <div className="flex flex-col">
                                            <p className="text-sm font-semibold text-red-700">
                                                Please add payment details first
                                            </p>
                                            <button
                                                onClick={() => router.push('/branch/payment')}
                                                className="text-xs text-red-600 underline hover:text-red-800 text-left mt-1"
                                            >
                                                Click here to add payment method
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="w-full mx-auto px-2 sm:px-4 md:px-8 py-8">
                    <AppointmentsTable
                        requests={practiceRequestsData?.data?.requests || []}
                        loading={isLoadingRequests}
                        pagination={practiceRequestsData?.data?.pagination}
                        onPageChange={handlePageChange}
                        onRequestUpdated={refetchRequests}
                    />
                </div>
            </div>

            {isAppointmentModalOpen && (
                <div className="fixed inset-0 bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-2xl shadow-2xl w-96 border border-gray-100">
                        <h2 className="text-2xl font-bold mb-6 text-black text-center">Create Appointment Request</h2>

                        <form onSubmit={formik.handleSubmit} className="space-y-4">

                            <div className="space-y-2 group">
                                <label className="block text-sm font-semibold text-black flex items-center gap-2">
                                    <svg className="w-4 h-4 text-[#C3EAE7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3M3 11h18M5 19h14" />
                                    </svg>
                                    Request Date *
                                </label>
                                <input
                                    type="date"
                                    name="request_date"
                                    value={formik.values.request_date}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    className={`w-full px-4 py-3 border-2 rounded-xl 
                           focus:ring-2 focus:ring-[#C3EAE7]/30 
                           transition-all duration-200 outline-none 
                           hover:border-[#C3EAE7]/50 group-hover:shadow-md
                           ${formik.touched.request_date && formik.errors.request_date
                                            ? 'border-red-300 focus:border-red-400 bg-red-50'
                                            : 'border-gray-200 focus:border-[#C3EAE7]'
                                        }`}
                                    required
                                />
                                {formik.touched.request_date && formik.errors.request_date && (
                                    <div className="flex items-start gap-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                                        <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <p className="text-sm text-red-700">{formik.errors.request_date}</p>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2 group">
                                <label className="block text-sm font-semibold text-black flex items-center gap-2">
                                    <svg className="w-4 h-4 text-[#C3EAE7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Start Time *
                                </label>
                                <input
                                    type="time"
                                    name="request_start_time"
                                    value={formik.values.request_start_time}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    className={`w-full px-4 py-3 border-2 rounded-xl 
                           focus:ring-2 focus:ring-[#C3EAE7]/30 
                           transition-all duration-200 outline-none 
                           hover:border-[#C3EAE7]/50 group-hover:shadow-md
                           ${formik.touched.request_start_time && formik.errors.request_start_time
                                            ? 'border-red-300 focus:border-red-400 bg-red-50'
                                            : 'border-gray-200 focus:border-[#C3EAE7]'
                                        }`}
                                    required
                                />
                                {formik.touched.request_start_time && formik.errors.request_start_time && (
                                    <div className="flex items-start gap-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                                        <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <p className="text-sm text-red-700">{formik.errors.request_start_time}</p>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2 group">
                                <label className="block text-sm font-semibold text-black flex items-center gap-2">
                                    <svg className="w-4 h-4 text-[#C3EAE7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    End Time *
                                </label>
                                <input
                                    type="time"
                                    name="request_end_time"
                                    value={formik.values.request_end_time}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    className={`w-full px-4 py-3 border-2 rounded-xl 
                           focus:ring-2 focus:ring-[#C3EAE7]/30 
                           transition-all duration-200 outline-none 
                           hover:border-[#C3EAE7]/50 group-hover:shadow-md
                           ${formik.touched.request_end_time && formik.errors.request_end_time
                                            ? 'border-red-300 focus:border-red-400 bg-red-50'
                                            : 'border-gray-200 focus:border-[#C3EAE7]'
                                        }`}
                                    required
                                />
                                {formik.touched.request_end_time && formik.errors.request_end_time && (
                                    <div className="flex items-start gap-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                                        <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <p className="text-sm text-red-700">{formik.errors.request_end_time}</p>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2 group">
                                <label className="block text-sm font-semibold text-black flex items-center gap-2">
                                    <svg className="w-4 h-4 text-[#C3EAE7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    Location *
                                </label>
                                <input
                                    type="text"
                                    name="location"
                                    value={formik.values.location}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-600"
                                    readOnly
                                />
                                <p className="text-sm text-gray-600">
                                    {isBranchUser
                                        ? 'Location is automatically set to your branch location and cannot be edited.'
                                        : 'Location is automatically set to your practice address and cannot be edited.'
                                    }
                                </p>
                            </div>

                            {!formik.values.location && (
                                <div className="space-y-2 group">
                                    <label className="block text-sm font-semibold text-black flex items-center gap-2">
                                        <svg className="w-4 h-4 text-[#C3EAE7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        Address *
                                    </label>
                                    <input
                                        type="text"
                                        name="address"
                                        value={formik.values.address}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-600"
                                        readOnly
                                    />
                                    <p className="text-sm text-gray-600">
                                        {isBranchUser
                                            ? 'Address is automatically set to your branch address and cannot be edited.'
                                            : 'Address is automatically set to your practice address and cannot be edited.'
                                        }
                                    </p>
                                </div>
                            )}

                            <div className="space-y-2 group">
                                <label className="block text-sm font-semibold text-black flex items-center gap-2">
                                    <svg
                                        className="w-4 h-4 text-[#C3EAE7]"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M8 7V3m8 4V3M3 11h18M5 19h14"
                                        />
                                    </svg>
                                    Role *
                                </label>
                                <select
                                    name="required_role"
                                    value={formik.values.required_role}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    className={`w-full px-4 py-3 border-2 rounded-xl 
               focus:ring-2 focus:ring-[#C3EAE7]/30 
               transition-all duration-200 outline-none 
               hover:border-[#C3EAE7]/50 group-hover:shadow-md
               ${formik.touched.required_role && formik.errors.required_role
                                            ? 'border-red-300 focus:border-red-400 bg-red-50'
                                            : 'border-gray-200 focus:border-[#C3EAE7]'
                                        }`}
                                    required
                                >
                                    <option value="">Select Role</option>
                                    <option value="Nurse">Nurse</option>
                                    <option value="Receptionist">Receptionist</option>
                                    <option value="Hygienist">Hygienist</option>
                                    <option value="Dentist">Dentist</option>
                                </select>
                                {formik.touched.required_role && formik.errors.required_role && (
                                    <div className="flex items-start gap-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                                        <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <p className="text-sm text-red-700">{formik.errors.required_role}</p>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={closeAppointmentModal}
                                    className="px-5 py-2 bg-gray-300 text-black rounded-xl 
                             hover:bg-gray-400 transition-all duration-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isCreatingAppointment || !formik.isValid || !formik.values.practice_id}
                                    className={`px-5 py-2 font-bold rounded-xl transition-all duration-200 
                                        ${isCreatingAppointment || !formik.isValid || !formik.values.practice_id
                                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                            : 'bg-[#C3EAE7] text-black hover:bg-[#A9DBD9]'
                                        }`}
                                >
                                    {isCreatingAppointment ? 'Creating...' : 'Create Request'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {!isBranchUser && <Footer />}
        </div>
    );
};

export default CreateAppointmentPage;
