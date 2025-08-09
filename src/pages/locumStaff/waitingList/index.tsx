import React, { useEffect, useState } from 'react';
import NavBar from "../../components/navBar/nav";
import { FaCheck, FaTimes, FaClock, FaPhoneAlt, FaMapMarkerAlt, FaCalendarAlt, FaSpinner, FaHistory, FaExclamationTriangle } from "react-icons/fa";
import { useGetPendingConfirmationsQuery, useConfirmAppointmentMutation, useGetApplicationHistoryQuery } from '../../../redux/slices/appoitmentRequestsLocumSlice';
import Swal from 'sweetalert2';

const WaitingList = () => {
    const [profile, setProfile] = useState<any>(null);
    const [loadingStates, setLoadingStates] = useState<{[key: string]: boolean}>({});
    const [currentTime, setCurrentTime] = useState(new Date());
    const [activeTab, setActiveTab] = useState<'pending-requests' | 'pending-confirmations'>('pending-confirmations');

    useEffect(() => {
        const profileStr = localStorage.getItem('profile');
        const locumIdStr = localStorage.getItem('locumId');
        
        if (profileStr) {
            const parsedProfile = JSON.parse(profileStr);
            console.log("DEBUG: Profile data:", parsedProfile);
            console.log("DEBUG: Separate locumId:", locumIdStr ? JSON.parse(locumIdStr) : null);
            setProfile(parsedProfile);
        }
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const {
        data: pendingConfirmationsData,
        isLoading: isLoadingConfirmations,
        error: confirmationsError,
        refetch: refetchConfirmations
    } = useGetPendingConfirmationsQuery(
        { locum_id: profile?.id },
        { 
            skip: !profile?.id,
            refetchOnMountOrArgChange: true,
        }
    );

    const {
        data: applicationHistoryData,
        isLoading: isLoadingHistory,
        error: historyError,
        refetch: refetchHistory
    } = useGetApplicationHistoryQuery(
        { locum_id: profile?.id },
        { 
            skip: !profile?.id,
            refetchOnMountOrArgChange: true,
        }
    );

    console.log("DEBUG: Query parameters:", { locum_id: profile?.id });
    console.log("DEBUG: Pending confirmations response:", pendingConfirmationsData);
    console.log("DEBUG: Application history response:", applicationHistoryData);
    console.log("DEBUG: Confirmations error:", confirmationsError);
    console.log("DEBUG: History error:", historyError);

    const [confirmAppointment] = useConfirmAppointmentMutation();

    const handleConfirmation = async (confirmationId: string, action: 'CONFIRM' | 'REJECT') => {
        if (!profile?.id) return;

        let rejectionReason = '';
        
        if (action === 'REJECT') {
            const result = await Swal.fire({
                title: 'Reject Appointment',
                text: 'Please provide a reason for rejecting this appointment:',
                input: 'textarea',
                inputPlaceholder: 'Enter rejection reason...',
                showCancelButton: true,
                confirmButtonText: 'Reject',
                cancelButtonText: 'Cancel',
                confirmButtonColor: '#DC2626',
                cancelButtonColor: '#6B7280',
                inputValidator: (value) => {
                    if (!value.trim()) {
                        return 'Please provide a reason for rejection';
                    }
                }
            });

            if (!result.isConfirmed) return;
            rejectionReason = result.value;
        } else {
            const result = await Swal.fire({
                title: 'Confirm Appointment',
                text: 'Are you sure you want to accept this appointment?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Yes, Accept',
                cancelButtonText: 'Cancel',
                confirmButtonColor: '#10B981',
                cancelButtonColor: '#6B7280'
            });

            if (!result.isConfirmed) return;
        }

        setLoadingStates(prev => ({ ...prev, [confirmationId]: true }));

        try {
            const response = await confirmAppointment({
                confirmation_id: confirmationId,
                locum_id: profile.id,
                action,
                rejection_reason: rejectionReason
            }).unwrap();

            await Swal.fire({
                title: 'Success!',
                text: response.message,
                icon: 'success',
                confirmButtonText: 'OK',
                confirmButtonColor: '#10B981'
            });

            refetchConfirmations();
        } catch (error: any) {
            await Swal.fire({
                title: 'Error',
                text: error.message || 'Failed to process confirmation',
                icon: 'error',
                confirmButtonText: 'OK',
                confirmButtonColor: '#DC2626'
            });
        } finally {
            setLoadingStates(prev => ({ ...prev, [confirmationId]: false }));
        }
    };

    const formatTimeLeft = (expiresAt: string | Date) => {
        const expiry = new Date(expiresAt);
        const now = currentTime;
        const timeLeft = expiry.getTime() - now.getTime();

        if (timeLeft <= 0) {
            return { expired: true, display: 'Expired' };
        }

        const hours = Math.floor(timeLeft / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

        return {
            expired: false,
            display: `${hours}h ${minutes}m ${seconds}s`,
            isUrgent: timeLeft < 3600000
        };
    };

    const formatDateTime = (date: string | Date) => {
        return new Date(date).toLocaleString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const isLoading = activeTab === 'pending-confirmations' ? isLoadingConfirmations : isLoadingHistory;
    const error = activeTab === 'pending-confirmations' ? confirmationsError : historyError;

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <NavBar />
                <div className="container mx-auto px-4 py-8">
                    <div className="flex justify-center items-center h-64">
                        <FaSpinner className="animate-spin text-blue-600 text-4xl" />
                        <span className="ml-3 text-lg text-gray-600">
                            {activeTab === 'pending-confirmations' ? 'Loading pending confirmations...' : 'Loading application history...'}
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    const pendingConfirmations = pendingConfirmationsData?.data?.pending_confirmations || [];
    const applicationHistory = applicationHistoryData?.data || [];

    return (
        <div className="min-h-screen bg-gray-50">
            <NavBar />
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Waiting List</h1>
                    <p className="text-gray-600">
                        {activeTab === 'pending-confirmations' 
                            ? 'Appointments confirmed by practices waiting for your response'
                            : 'Your application history for dental appointments'
                        }
                    </p>
                    
                    <div className="mt-6 flex space-x-1 bg-gray-100 p-1 rounded-lg max-w-lg">
                        <button
                            onClick={() => setActiveTab('pending-confirmations')}
                            className={`flex-1 flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                                activeTab === 'pending-confirmations'
                                    ? 'bg-white text-blue-600 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            <FaExclamationTriangle className="mr-2" />
                            Pending Confirmations
                        </button>
                        <button
                            onClick={() => setActiveTab('pending-requests')}
                            className={`flex-1 flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                                activeTab === 'pending-requests'
                                    ? 'bg-white text-blue-600 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            <FaHistory className="mr-2" />
                            Pending Requests
                        </button>
                    </div>

                    <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center">
                            {activeTab === 'pending-confirmations' ? (
                                <>
                                    <FaClock className="text-blue-600 mr-2" />
                                    <span className="text-blue-800 font-medium">
                                        You have {pendingConfirmations.length} pending confirmation{pendingConfirmations.length !== 1 ? 's' : ''}
                                    </span>
                                </>
                            ) : (
                                <>
                                    <FaHistory className="text-blue-600 mr-2" />
                                    <span className="text-blue-800 font-medium">
                                        {applicationHistory.length} application{applicationHistory.length !== 1 ? 's' : ''} in your history
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center">
                            <FaTimes className="text-red-600 mr-2" />
                            <span className="text-red-800">
                                Error loading {activeTab === 'pending-confirmations' ? 'confirmations' : 'application history'}. Please try again later.
                            </span>
                        </div>
                    </div>
                )}

                {activeTab === 'pending-confirmations' ? (
                    pendingConfirmations.length === 0 ? (
                        <div className="bg-white rounded-lg shadow-md p-8 text-center">
                            <FaClock className="mx-auto text-gray-400 text-6xl mb-4" />
                            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Pending Confirmations</h3>
                            <p className="text-gray-500">
                                You don't have any appointments waiting for confirmation at the moment.
                            </p>
                        </div>
                    ) : (
                    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Practice Details
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Appointment
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Time Left
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {pendingConfirmations.map((confirmation) => {
                                        const timeLeft = formatTimeLeft(confirmation.expires_at);
                                        const isLoading = loadingStates[confirmation.confirmation_id];

                                        return (
                                            <tr 
                                                key={confirmation.confirmation_id}
                                                className={`hover:bg-gray-50 ${
                                                    timeLeft.expired ? 'bg-red-50' : ''
                                                }`}
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex flex-col">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {confirmation.practice.name}
                                                        </div>
                                                        <div className="text-sm text-gray-500 flex items-center mt-1">
                                                            <FaMapMarkerAlt className="mr-1 text-gray-400" />
                                                            {confirmation.practice.location}
                                                        </div>
                                                        <div className="text-sm text-gray-500 flex items-center mt-1">
                                                            <FaPhoneAlt className="mr-1 text-gray-400" />
                                                            {confirmation.practice.telephone}
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex flex-col">
                                                        <div className="text-sm font-medium text-gray-900 flex items-center">
                                                            <FaCalendarAlt className="mr-2 text-gray-400" />
                                                            {formatDateTime(confirmation.appointment.date)}
                                                        </div>
                                                        <div className="text-sm text-gray-500 mt-1">
                                                            {confirmation.appointment.start_time} - {confirmation.appointment.end_time}
                                                        </div>
                                                        <div className="text-sm text-gray-500 mt-1">
                                                            📍 {confirmation.appointment.location}
                                                        </div>
                                                        <div className="text-xs text-gray-400 mt-1">
                                                            Confirmation #{confirmation.confirmation_number}
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                                        timeLeft.expired 
                                                            ? 'bg-red-100 text-red-800' 
                                                            : timeLeft.isUrgent 
                                                                ? 'bg-orange-100 text-orange-800' 
                                                                : 'bg-green-100 text-green-800'
                                                    }`}>
                                                        <FaClock className="mr-1" />
                                                        {timeLeft.display}
                                                    </div>
                                                    <div className="text-xs text-gray-500 mt-1">
                                                        Expires: {formatDateTime(confirmation.expires_at)}
                                                    </div>
                                                </td>

                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {timeLeft.expired ? (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                            <FaTimes className="mr-1" />
                                                            Expired
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                            <FaClock className="mr-1" />
                                                            Pending Response
                                                        </span>
                                                    )}
                                                </td>

                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    {!timeLeft.expired ? (
                                                        <div className="flex space-x-2">
                                                            <button
                                                                onClick={() => handleConfirmation(confirmation.confirmation_id, 'CONFIRM')}
                                                                disabled={isLoading}
                                                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
                                                            >
                                                                {isLoading ? (
                                                                    <FaSpinner className="animate-spin mr-1" />
                                                                ) : (
                                                                    <FaCheck className="mr-1" />
                                                                )}
                                                                Accept
                                                            </button>
                                                            
                                                            <button
                                                                onClick={() => handleConfirmation(confirmation.confirmation_id, 'REJECT')}
                                                                disabled={isLoading}
                                                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
                                                            >
                                                                {isLoading ? (
                                                                    <FaSpinner className="animate-spin mr-1" />
                                                                ) : (
                                                                    <FaTimes className="mr-1" />
                                                                )}
                                                                Reject
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="text-red-600 text-sm">
                                                            <FaTimes className="inline mr-1" />
                                                            Auto-rejected
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    )
                ) : (
                    applicationHistory.length === 0 ? (
                        <div className="bg-white rounded-lg shadow-md p-8 text-center">
                            <FaHistory className="mx-auto text-gray-400 text-6xl mb-4" />
                            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Application History</h3>
                            <p className="text-gray-500">
                                You haven't applied for any appointments yet.
                            </p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Practice Details
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Appointment
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Applied Date
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                            {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Message
                                            </th> */}
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {applicationHistory.map((application) => (
                                            <tr 
                                                key={application.response_id}
                                                className={`hover:bg-gray-50 ${
                                                    application.request.is_past ? 'bg-gray-50' : ''
                                                }`}
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex flex-col">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {application.request.practice.name}
                                                        </div>
                                                        <div className="text-sm text-gray-500 flex items-center mt-1">
                                                            <FaMapMarkerAlt className="mr-1 text-gray-400" />
                                                            {application.request.practice.location}
                                                        </div>
                                                        <div className="text-sm text-gray-500 flex items-center mt-1">
                                                            <FaPhoneAlt className="mr-1 text-gray-400" />
                                                            {application.request.practice.telephone}
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex flex-col">
                                                        <div className="text-sm font-medium text-gray-900 flex items-center">
                                                            <FaCalendarAlt className="mr-2 text-gray-400" />
                                                            {formatDateTime(application.request.request_date)}
                                                        </div>
                                                        <div className="text-sm text-gray-500 mt-1">
                                                            {application.request.request_start_time} - {application.request.request_end_time}
                                                        </div>
                                                        <div className="text-sm text-gray-500 mt-1">
                                                            📍 {application.request.location}
                                                        </div>
                                                        <div className="text-xs text-gray-400 mt-1">
                                                            Role: {application.request.required_role}
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        {formatDateTime(application.responded_at)}
                                                    </div>
                                                </td>

                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex flex-col">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                            application.status === 'ACCEPTED' 
                                                                ? 'bg-green-100 text-green-800' 
                                                                : 'bg-red-100 text-red-800'
                                                        }`}>
                                                            {application.request.status_label}
                                                        </span>
                                                        {application.request.is_past && (
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 mt-1">
                                                                Past Event
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-600 max-w-xs truncate">
                                                        {application.message || 'No message provided'}
                                                    </div>
                                                </td> */}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )
                )}
            </div>
        </div>
    );
};

export default WaitingList;
