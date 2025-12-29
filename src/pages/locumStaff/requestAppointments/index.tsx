import React, { useEffect, useState } from 'react';
import NavBar from "../../components/navBar/nav";
import { FaCheck, FaSpinner, FaClock, FaExclamationTriangle } from "react-icons/fa";
import { useGetAvailableRequestsQuery, useAcceptAppointmentMutation } from '../../../redux/slices/appoitmentRequestsLocumSlice';
import { useCheckLocumHasCardsQuery } from '../../../redux/slices/locumCardSlice';
import { useRouter } from 'next/router';
import Swal from 'sweetalert2';

const LocumStaffRequestList = () => {
    const router = useRouter();
    const [profile, setProfile] = useState<any>(null);
    const [loadingStates, setLoadingStates] = useState<{[key: string]: boolean}>({});

    useEffect(() => {
        const profileStr = localStorage.getItem('profile');
        if (profileStr) {
            const parsedProfile = JSON.parse(profileStr);
            console.log('Profile loaded:', parsedProfile);
            setProfile(parsedProfile);
        }
    }, []);

    const {
        data: availableRequestsData,
        isLoading,
        error,
        refetch
    } = useGetAvailableRequestsQuery(
        { locum_id: profile?.id },
        { skip: !profile?.id }
    );

    const {
        data: cardStatusData,
        isLoading: isLoadingCardStatus
    } = useCheckLocumHasCardsQuery(profile?.id || '', {
        skip: !profile?.id
    });
    
    console.log('Query params:', { locum_id: profile?.id });
    console.log('Available requests data:', availableRequestsData);
    console.log('Query error:', error);
    console.log('Is loading:', isLoading);

    const [acceptAppointment] = useAcceptAppointmentMutation();

    const handleAccept = async (requestId: string) => {
        if (!profile?.id) return;

        // Check if locum has payment cards
        if (cardStatusData && !cardStatusData.hasCards) {
            const result = await Swal.fire({
                title: 'Payment Card Required',
                text: 'You need to add a payment card before applying for appointments. Would you like to add one now?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, Add Payment Card',
                cancelButtonText: 'Cancel',
                confirmButtonColor: '#C3EAE7',
                cancelButtonColor: '#6B7280',
            });

            if (result.isConfirmed) {
                router.push('/locumStaff/payment');
                return;
            } else {
                return;
            }
        }
        
        const result = await Swal.fire({
            title: 'Confirm Application',
            text: 'Are you sure you want to apply for this appointment?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes, Apply',
            cancelButtonText: 'Cancel',
            confirmButtonColor: '#10B981',
            cancelButtonColor: '#6B7280'
        });

        if (!result.isConfirmed) return;
        
        setLoadingStates(prev => ({ ...prev, [requestId]: true }));
        
        try {
            await acceptAppointment({
                request_id: requestId,
                locum_id: profile.id,
            }).unwrap();
            
            await Swal.fire({
                title: 'Success!',
                text: 'Successfully applied for the appointment! The practice will be notified.',
                icon: 'success',
                confirmButtonText: 'OK',
                confirmButtonColor: '#10B981'
            });
            
            refetch();
        } catch (error: any) {
            await Swal.fire({
                title: 'Error!',
                text: error.message || 'Failed to accept appointment. Please try again.',
                icon: 'error',
                confirmButtonText: 'OK',
                confirmButtonColor: '#EF4444'
            });
        } finally {
            setLoadingStates(prev => ({ ...prev, [requestId]: false }));
        }
    };

    const formatDate = (dateString: string | Date) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatTime = (timeString: string) => {
        const time = new Date(`2000-01-01T${timeString}`);
        return time.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const requests = availableRequestsData?.data || [];

    if (isLoading) {
        return (
            <div className="min-h-screen bg-white flex flex-col">
                <NavBar />
                <div className="flex-1 flex items-center justify-center pt-32">
                    <div className="text-center">
                        <FaSpinner className="animate-spin text-4xl text-gray-500 mb-4 mx-auto" />
                        <p className="text-gray-600">Loading available appointments...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-white flex flex-col">
                <NavBar />
                <div className="flex-1 flex items-center justify-center pt-32">
                    <div className="text-center">
                        <FaExclamationTriangle className="text-4xl text-red-500 mb-4 mx-auto" />
                        <p className="text-red-600">Failed to load appointments</p>
                        <button 
                            onClick={() => refetch()} 
                            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white flex flex-col">
            <NavBar />

            <div className="text-center mb-8 pt-32 px-4">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-black rounded-full mb-4 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                </div>
                <h1 className="text-2xl sm:text-4xl font-bold text-black mb-2 bg-gradient-to-r from-black to-gray-700 bg-clip-text">
                    Available Appointment Requests
                </h1>
            </div>

            <div className="w-full px-2 sm:px-6 md:px-12 mb-12">
                <div className="bg-[#C3EAE7] px-2 sm:px-4 py-6 w-full rounded-none mb-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-bold text-black">Available Requests</h2>
                            <p className="text-gray-700 mt-1">
                                {requests.length} appointment{requests.length !== 1 ? 's' : ''} available for your role
                            </p>
                        </div>
                        <button 
                            onClick={() => refetch()} 
                            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-all"
                        >
                            Refresh
                        </button>
                    </div>
                </div>
                <div className="bg-white shadow-xl rounded-xl border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 text-sm sm:text-base">
                            <thead className="bg-[#C3EAE7]/20">
                                <tr>
                                    <th className="px-4 sm:px-6 py-3 text-left font-bold text-black uppercase tracking-wider">Practice</th>
                                    <th className="px-4 sm:px-6 py-3 text-left font-bold text-black uppercase tracking-wider">Request Date</th>
                                    <th className="px-4 sm:px-6 py-3 text-left font-bold text-black uppercase tracking-wider">Start Time</th>
                                    <th className="px-4 sm:px-6 py-3 text-left font-bold text-black uppercase tracking-wider">End Time</th>
                                    <th className="px-4 sm:px-6 py-3 text-left font-bold text-black uppercase tracking-wider">Location</th>
                                    <th className="px-4 sm:px-6 py-3 text-center font-bold text-black uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {requests.length > 0 ? (
                                    requests.map((req) => (
                                        <tr key={req.request_id} className="hover:bg-[#C3EAE7]/10 transition-all">
                                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-gray-900 font-medium">{req.practice.name}</div>
                                                    <div className="text-gray-500 text-sm">{req.practice.telephone}</div>
                                                </div>
                                            </td>
                                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-gray-700">
                                                <div className="flex items-center">
                                                    {req.is_urgent && <FaExclamationTriangle className="text-red-500 mr-2" />}
                                                    {formatDate(req.request_date)}
                                                </div>
                                            </td>
                                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-gray-700">
                                                {formatTime(req.request_start_time)}
                                            </td>
                                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-gray-700">
                                                {formatTime(req.request_end_time)}
                                            </td>
                                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-gray-700">
                                                {req.location}
                                            </td>
                                            <td className="px-4 sm:px-6 py-4 text-center">
                                                <button 
                                                    onClick={() => handleAccept(req.request_id)}
                                                    disabled={loadingStates[req.request_id]}
                                                    className="flex items-center justify-center bg-green-500 hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg shadow-md transition-all text-sm sm:text-base mx-auto min-w-[100px]"
                                                >
                                                    {loadingStates[req.request_id] ? (
                                                        <>
                                                            <FaSpinner className="animate-spin mr-2" />
                                                            Processing...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <FaCheck className="mr-2" />
                                                            Accept
                                                        </>
                                                    )}
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="text-center text-gray-500 py-8">
                                            <div className="flex flex-col items-center">
                                                <FaClock className="text-4xl mb-4 text-gray-300" />
                                                <p className="text-lg font-medium">No available appointments</p>
                                                <p className="text-sm">Check back later for new opportunities</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LocumStaffRequestList;
