import React, { useEffect, useState } from 'react';
import NavBar from "../../components/navBar/nav";
import { FaCheck, FaTimes, FaClock, FaPhoneAlt, FaMapMarkerAlt, FaCalendarAlt, FaSpinner, FaHistory, FaExclamationTriangle } from "react-icons/fa";
import { useGetPendingConfirmationsQuery, useConfirmAppointmentMutation, useGetApplicationHistoryQuery } from '../../../redux/slices/appoitmentRequestsLocumSlice';
import Swal from 'sweetalert2';
import { useGetAvailableRequestsQuery, useAcceptAppointmentMutation } from '../../../redux/slices/appoitmentRequestsLocumSlice';

type RequestWithDistance = any & {
    distance: number | null;
};

const WaitingList = () => {
    const [profile, setProfile] = useState<any>(null);
    const [loadingStates, setLoadingStates] = useState<{ [key: string]: boolean }>({});
    const [currentTime, setCurrentTime] = useState(new Date());
    const [activeTab, setActiveTab] = useState<'pending-requests' | 'request-appoitment' | 'pending-confirmations'>('request-appoitment');
    const [distanceFilter, setDistanceFilter] = useState<number>(80);

    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    const parseCoordinates = (coordString: string): { lat: number, lon: number } | null => {
        if (!coordString) return null;
        const parts = coordString.split(',');
        if (parts.length !== 2) return null;
        const lat = parseFloat(parts[0]);
        const lon = parseFloat(parts[1]);
        if (isNaN(lat) || isNaN(lon)) return null;
        return { lat, lon };
    };

    useEffect(() => {
        const profileStr = localStorage.getItem('profile');
        console.log("profile", profileStr)
        const locumIdStr = localStorage.getItem('locumId');

        if (profileStr) {
            const parsedProfile = JSON.parse(profileStr);
            // console.log("DEBUG: Profile data:", parsedProfile);
            // console.log("DEBUG: Separate locumId:", locumIdStr ? JSON.parse(locumIdStr) : null);
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
        data: availableRequestsData,
        isLoading: isLoadingRequests,
        error: requestsError,
        refetch
    } = useGetAvailableRequestsQuery(
        { locum_id: profile?.id },
        { skip: !profile?.id }
    );
    console.log(availableRequestsData)

    const [acceptAppointment] = useAcceptAppointmentMutation();

    const handleAccept = async (requestId: string) => {
        if (!profile?.id) return;

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

    const processedRequests = React.useMemo(() => {
        const requestsData = availableRequestsData?.data || [];

        if (!profile?.address) return requestsData;

        const locumCoords = parseCoordinates(profile.address);
        if (!locumCoords) return requestsData;

        return requestsData
            .map(req => {
                const practiceCoords = parseCoordinates(req.practice.location);
                if (!practiceCoords) {
                    return { ...req, distance: null };
                }

                const distance = calculateDistance(
                    locumCoords.lat,
                    locumCoords.lon,
                    practiceCoords.lat,
                    practiceCoords.lon
                );

                return { ...req, distance: Math.round(distance * 10) / 10 };
            })
            .filter(req => {
                if (req.distance === null) return true;
                return distanceFilter === 999999 || req.distance <= distanceFilter;
            });
    }, [availableRequestsData?.data, profile?.address, distanceFilter]);

    const requests: RequestWithDistance[] = processedRequests;

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

    // console.log("DEBUG: Query parameters:", { locum_id: profile?.id });
    // console.log("DEBUG: Pending confirmations response:", pendingConfirmationsData);
    // console.log("DEBUG: Application history response:", applicationHistoryData);
    // console.log("DEBUG: Confirmations error:", confirmationsError);
    // console.log("DEBUG: History error:", historyError);

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

    console.log(pendingConfirmationsData)

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
                            {activeTab === 'request-appoitment' ? 'Loading request appoitments...' : 'Loading application history...'}
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    const pendingConfirmations = pendingConfirmationsData?.data?.pending_confirmations || [];
    const applicationHistory = applicationHistoryData?.data || [];

    const filteredApplicationHistory = applicationHistory.filter(application =>
        application.status === 'ACCEPTED'
    );

    return (
        <div className="min-h-screen bg-gray-50">
            <NavBar />
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Appointment Requests</h1>
                    <p className="text-gray-600">
                        {activeTab === 'request-appoitment'
                            ? 'Appointments confirmed by practices waiting for your response'
                            : activeTab === 'pending-requests'
                                ? 'Your application history for dental appointments'
                                : 'Appointments confirmed by practices waiting for your response'
                        }
                    </p>

                    <div className="mt-6 flex space-x-1 bg-gray-100 p-1 rounded-lg max-w-lg">
                        <button
                            onClick={() => setActiveTab('request-appoitment')}
                            className={`flex-1 flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${activeTab === 'request-appoitment'
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            <FaHistory className="mr-2" />
                            Request Appoitment
                        </button>
                        <button
                            onClick={() => setActiveTab('pending-requests')}
                            className={`flex-1 flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${activeTab === 'pending-requests'
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            <FaHistory className="mr-2" />
                            Pending Requests
                        </button>
                        <button
                            onClick={() => setActiveTab('pending-confirmations')}
                            className={`flex-1 flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${activeTab === 'pending-confirmations'
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            <FaExclamationTriangle className="mr-2" />
                            Pending Confirmations
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
                            ) : activeTab === 'request-appoitment' ? (
                                <>
                                    <FaHistory className="text-blue-600 mr-2" />
                                    <span className="text-blue-800 font-medium">
                                        {requests.length} appointment{requests.length !== 1 ? 's' : ''} available for your role
                                    </span>
                                </>
                            ) : (
                                <>
                                    <FaHistory className="text-blue-600 mr-2" />
                                    <span className="text-blue-800 font-medium">
                                        {filteredApplicationHistory.length} pending application{filteredApplicationHistory.length !== 1 ? 's' : ''} with applied status
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
                                                    className={`hover:bg-gray-50 ${timeLeft.expired ? 'bg-red-50' : ''
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
                                                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${timeLeft.expired
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
                ) : activeTab === 'pending-requests' ? (
                    filteredApplicationHistory.length === 0 ? (
                        <div className="bg-white rounded-lg shadow-md p-8 text-center">
                            <FaHistory className="mx-auto text-gray-400 text-6xl mb-4" />
                            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Pending Applications</h3>
                            <p className="text-gray-500">
                                You don't have any pending applications with "applied" status.
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
                                        {filteredApplicationHistory.map((application) => (
                                            <tr
                                                key={application.response_id}
                                                className={`hover:bg-gray-50 ${application.request.is_past ? 'bg-gray-50' : ''
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
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${application.status === 'ACCEPTED'
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
                ) : (
                    <><div className="text-center mb-8 pt-12 px-4">
                        {/* <div className="inline-flex items-center justify-center w-16 h-16 bg-black rounded-full mb-4 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <h1 className="text-2xl sm:text-4xl font-bold text-black mb-2 bg-gradient-to-r from-black to-gray-700 bg-clip-text">
                                    Available Appointment Requests
                                </h1> */}
                    </div><div className="w-full px-2 sm:px-6 md:px-12 mb-12">
                            <div className="bg-[#C3EAE7] px-2 sm:px-4 py-6 w-full rounded-none mb-4">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h2 className="text-2xl font-bold text-black">Available Requests</h2>
                                        <p className="text-gray-700 mt-1">
                                            {requests.length} appointment{requests.length !== 1 ? 's' : ''} available for your role
                                            {distanceFilter !== 999999 && (
                                                <span className="text-sm text-gray-500 ml-1">
                                                    (within {distanceFilter} km)
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <div className="flex items-center space-x-2">
                                            <label htmlFor="distance-filter" className="text-sm font-medium text-gray-700">
                                                Distance:
                                            </label>
                                            <select
                                                id="distance-filter"
                                                value={distanceFilter}
                                                onChange={(e) => setDistanceFilter(Number(e.target.value))}
                                                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value={15}>Within 15 km</option>
                                                <option value={40}>Within 40 km</option>
                                                <option value={80}>Within 80 km</option>
                                                <option value={160}>Within 160 km</option>
                                                <option value={999999}>All distances</option>
                                            </select>
                                        </div>
                                        <button
                                            onClick={() => refetch()}
                                            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-all"
                                        >
                                            Refresh
                                        </button>
                                    </div>
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
                                                <th className="px-4 sm:px-6 py-3 text-left font-bold text-black uppercase tracking-wider">Distance</th>
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
                                                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-gray-700">
                                                            {req.distance !== null ? (
                                                                <span className="flex items-center">
                                                                    <FaMapMarkerAlt className="mr-1 text-gray-400" />
                                                                    {req.distance} km
                                                                </span>
                                                            ) : (
                                                                <span className="text-gray-400 text-sm">N/A</span>
                                                            )}
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
                                                    <td colSpan={7} className="text-center text-gray-500 py-8">
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
                        </div></>
                )
                }
            </div>
        </div>
    );
};

export default WaitingList;
