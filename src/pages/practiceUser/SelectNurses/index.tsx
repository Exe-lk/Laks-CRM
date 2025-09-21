import React, { useEffect, useState } from 'react';
import NavBar from "../../components/navBarPracticeUser";
import Footer from "../../components/footer/index";
import AppointmentsTable from "../../components/appointmentsTable";
import { FiPlus } from "react-icons/fi";
import Swal from 'sweetalert2';
import { useFormik } from 'formik';
import { useCreateAppointmentRequestMutation, useGetPracticeRequestsQuery } from '../../../redux/slices/appointmentPracticeSlice';
import { useCheckPracticeHasCardsQuery } from '../../../redux/slices/cardPracticeUserSlice';
import { useRouter } from 'next/router';

interface Profile {
    id?: string;
    address?: string;
    location?: string;
    practiceType?: string;
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

        if (selectedDate < today) {
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
        // Accept both 24-hour (HH:MM) and 12-hour (H:MM AM/PM) formats
        const time24Regex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
        const time12Regex = /^(1[0-2]|[1-9]):[0-5][0-9]\s?(AM|PM)$/i;
        if (!time24Regex.test(values.request_start_time) && !time12Regex.test(values.request_start_time)) {
            errors.request_start_time = 'Please enter a valid time';
        }
    }

    if (!values.request_end_time) {
        errors.request_end_time = 'End time is required';
    } else {
        // Accept both 24-hour (HH:MM) and 12-hour (H:MM AM/PM) formats
        const time24Regex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
        const time12Regex = /^(1[0-2]|[1-9]):[0-5][0-9]\s?(AM|PM)$/i;
        if (!time24Regex.test(values.request_end_time) && !time12Regex.test(values.request_end_time)) {
            errors.request_end_time = 'Please enter a valid time';
        }
    }

    if (values.request_start_time && values.request_end_time) {
        // Convert times to 24-hour format for comparison
        const convertTo24Hour = (timeStr: string) => {
            if (timeStr.includes('AM') || timeStr.includes('PM')) {
                // 12-hour format
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
            return timeStr; // Already in 24-hour format
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
        if (trimmedLocation.length > 200) { // Increased limit for longer addresses
            errors.location = 'Location must be less than 200 characters';
        }
        // Removed invalid characters check as addresses can contain various characters
    }

    if (!values.required_role) {
        errors.required_role = 'Role selection is required';
    } else {
        const validRoles = ['Nurse', 'Receptionist', 'Hygienist', 'Dentist'];
        if (!validRoles.includes(values.required_role)) {
            errors.required_role = 'Please select a valid role';
        }
    }

    // Only require branch_id for Corporate practices
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
    console.log(profile)

    const [createAppointmentRequest, { isLoading: isCreatingAppointment }] = useCreateAppointmentRequestMutation();
    
    // Check if practice has payment cards
    const { 
        data: cardStatusData, 
        isLoading: isLoadingCardStatus 
    } = useCheckPracticeHasCardsQuery(profile?.id || '', {
        skip: !profile?.id
    });

    const {
        data: practiceRequestsData,
        isLoading: isLoadingRequests,
        refetch: refetchRequests
    } = useGetPracticeRequestsQuery(
        {
            practice_id: profile?.id || '',
            page: currentPage,
            limit: 20
        },
        {
            skip: !profile?.id
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
            address: profile?.location || '',
            branch_id: ''
        },
        validate: (values) => validateAppointmentForm(values, profile?.practiceType),
        enableReinitialize: true,
        onSubmit: async (values) => {
            await handleFormSubmit(values);
        }
    });

    const isUrgentAppointment = (dateStr: string): boolean => {
        if (!dateStr) return false;
        const appointmentDate = new Date(dateStr);
        const now = new Date();
        const twentyFourHoursFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        return appointmentDate <= twentyFourHoursFromNow;
    };

    const isUrgent = isUrgentAppointment(formik.values.request_date);

    // Custom validation check for button state
    const isFormValid = () => {
        const values = formik.values;
        const errors = validateAppointmentForm(values, profile?.practiceType);
        return Object.keys(errors).length === 0 && values.practice_id;
    };

    useEffect(() => {
        const profileStr = localStorage.getItem('profile');
        if (profileStr) {
            try {
                setProfile(JSON.parse(profileStr));
            } catch {
                setProfile(null);
            }
        }
    }, []);

    // Fetch branches when profile is loaded
    useEffect(() => {
        if (profile?.id) {
            fetchBranches(profile.id);
        }
    }, [profile?.id]);

    const fetchBranches = async (practiceId: string) => {
        setLoadingBranches(true);
        try {
            const response = await fetch(`/api/branch/practice-branches?practiceId=${practiceId}`);
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

    // Debug: Log form validation state
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

    const openAppointmentModal = () => {
        if (profile?.id && profile?.address) {
            // For Private practices, use practice location; for Corporate, leave empty for branch selection
            const initialLocation = profile.practiceType === 'Private' ? (profile.address || '') : '';
            const initialAddress = profile.practiceType === 'Private' ? (profile.location || '') : '';
            
            formik.setValues({
                practice_id: profile.id || '',
                request_date: '',
                request_start_time: '',
                request_end_time: '',
                location: initialLocation,
                required_role: '',
                address: initialAddress,
                branch_id: ''
            });
            // Force validation to re-run after setting values
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
                location: selectedBranch.location,  // Branch's location
                address: selectedBranch.address     // Branch's address
            });
        }
    };

    const handleFormSubmit = async (values: typeof formik.values) => {
        // Check if practice has payment cards before proceeding
        if (cardStatusData && !cardStatusData.hasCards) {
            const result = await Swal.fire({
                title: 'Payment Card Required',
                text: 'You need to add a payment card before creating appointments. Would you like to add one now?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, Add Payment Card',
                cancelButtonText: 'Cancel',
                confirmButtonColor: '#C3EAE7',
                cancelButtonColor: '#6B7280',
            });

            if (result.isConfirmed) {
                router.push('/practiceUser/payment');
                return;
            } else {
                return;
            }
        }

        if (isUrgent) {
            const confirmResult = await Swal.fire({
                icon: 'warning',
                title: 'Urgent Appointment Request',
                html: `
                    <div class="text-left">
                        <p class="mb-3">This appointment is within 24 hours. Please note:</p>
                        <ul class="list-disc pl-5 space-y-2">
                            <li>If no locum applies within <strong>15 minutes</strong>, this request will be automatically cancelled</li>
                            <li>You may need to contact locums directly for urgent placements</li>
                            <li>Consider extending the time frame if possible</li>
                        </ul>
                    </div>
                `,
                showCancelButton: true,
                confirmButtonText: 'Create Urgent Request',
                cancelButtonText: 'Cancel',
                confirmButtonColor: '#EF4444',
                cancelButtonColor: '#6B7280',
            });

            if (!confirmResult.isConfirmed) {
                return;
            }
        }

        try {
            // For Private practices, ensure location and address are set to practice details
            const submissionValues = { ...values };
            if (profile?.practiceType === 'Private') {
                submissionValues.location = profile.address || '';
                submissionValues.address = profile.location || '';
                submissionValues.branch_id = ''; // No branch for Private practices
            }
            
            // Log the values being sent for debugging
            console.log('Submitting appointment request with values:', {
                practice_id: submissionValues.practice_id,
                request_date: submissionValues.request_date,
                request_start_time: submissionValues.request_start_time,
                request_end_time: submissionValues.request_end_time,
                location: submissionValues.location,
                address: submissionValues.address,
                required_role: submissionValues.required_role,
                branch_id: submissionValues.branch_id
            });
            
            const result = await createAppointmentRequest(submissionValues).unwrap();

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

    console.log("branches",branches)

    return (
        <div className="min-h-screen bg-white flex flex-col">
            <NavBar />
            <div className="flex-1 w-full">
                <div className="text-center mb-8 pt-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-black rounded-full mb-4 shadow-lg">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3M3 11h18M5 19h14" />
                        </svg>
                    </div>
                    <h1 className="text-4xl font-bold text-black mb-2">Create Appointment Request</h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Schedule your appointment by filling out the form below with all required details.
                    </p>
                    <div className="flex justify-center gap-2 mt-4">
                        <div className="w-2 h-2 bg-[#C3EAE7] rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-[#C3EAE7] rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 bg-[#C3EAE7] rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                    </div>

                    <div className="flex justify-center mt-8">
                        <button
                            onClick={openAppointmentModal}
                            className="flex items-center gap-2 px-8 py-4 bg-[#C3EAE7] text-black font-bold rounded-xl 
                                     hover:bg-[#A9DBD9] transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                            <FiPlus className="text-xl" />
                            Create New Appointment
                        </button>
                    </div>
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
                                            : isUrgent
                                                ? 'border-orange-300 focus:border-orange-400 bg-orange-50'
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
                                {isUrgent && !(formik.touched.request_date && formik.errors.request_date) && (
                                    <div className="flex items-start gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                                        <svg className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                        </svg>
                                        <div className="text-sm">
                                            <p className="font-semibold text-orange-800">Urgent Request</p>
                                            <p className="text-orange-700">This appointment is within 24 hours. It will auto-cancel in 15 minutes if no one confirms.</p>
                                        </div>
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

                            {profile?.practiceType === 'Corporate' && (
                                <div className="space-y-2 group">
                                    <label className="block text-sm font-semibold text-black flex items-center gap-2">
                                        <svg className="w-4 h-4 text-[#C3EAE7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                        Select Branch *
                                    </label>
                                    <select
                                        name="branch_id"
                                        value={formik.values.branch_id}
                                        onChange={(e) => {
                                            formik.handleChange(e);
                                            handleBranchSelection(e.target.value);
                                        }}
                                        onBlur={formik.handleBlur}
                                        className={`w-full px-4 py-3 border-2 rounded-xl 
                               focus:ring-2 focus:ring-[#C3EAE7]/30 
                               transition-all duration-200 outline-none 
                               hover:border-[#C3EAE7]/50 group-hover:shadow-md
                               ${formik.touched.branch_id && formik.errors.branch_id
                                                ? 'border-red-300 focus:border-red-400 bg-red-50'
                                                : 'border-gray-200 focus:border-[#C3EAE7]'
                                            }`}
                                        required
                                        disabled={loadingBranches}
                                    >
                                        <option value="">
                                            {loadingBranches ? 'Loading branches...' : 'Select a branch'}
                                        </option>
                                        {branches.map((branch) => (
                                            <option key={branch.id} value={branch.id}>
                                                {branch.name}
                                            </option>
                                        ))}
                                    </select>
                                    {formik.touched.branch_id && formik.errors.branch_id && (
                                        <div className="flex items-start gap-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                                            <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <p className="text-sm text-red-700">{formik.errors.branch_id}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                            
                            {profile?.practiceType === 'Private' && (
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
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        className={`w-full px-4 py-3 border-2 rounded-xl 
                               focus:ring-2 focus:ring-[#C3EAE7]/30 
                               transition-all duration-200 outline-none 
                               hover:border-[#C3EAE7]/50 group-hover:shadow-md
                               ${formik.touched.location && formik.errors.location
                                                ? 'border-red-300 focus:border-red-400 bg-red-50'
                                                : 'border-gray-200 focus:border-[#C3EAE7]'
                                            }`}
                                        placeholder="Practice location"
                                        required
                                        readOnly
                                    />
                                    <p className="text-sm text-gray-600">
                                        Location is automatically set to your practice address for Private practices.
                                    </p>
                                    {formik.touched.location && formik.errors.location && (
                                        <div className="flex items-start gap-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                                            <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <p className="text-sm text-red-700">{formik.errors.location}</p>
                                        </div>
                                    )}
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
                                            : isUrgent
                                                ? 'bg-orange-500 text-white hover:bg-orange-600'
                                                : 'bg-[#C3EAE7] text-black hover:bg-[#A9DBD9]'
                                        }`}
                                >
                                    {isCreatingAppointment ? 'Creating...' : isUrgent ? 'Create Urgent Request' : 'Create Request'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
};

export default CreateAppointmentPage;
