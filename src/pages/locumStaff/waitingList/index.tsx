import React, { useEffect, useState } from 'react';
import NavBar from "../../components/navBar/nav";
import { FaCheck, FaTimes, FaClock, FaPhoneAlt, FaMapMarkerAlt, FaCalendarAlt, FaSpinner, FaHistory, FaExclamationTriangle, FaEyeSlash } from "react-icons/fa";
import { useGetPendingConfirmationsQuery, useConfirmAppointmentMutation, useGetApplicationHistoryQuery, useIgnoreAppointmentMutation, useCheckIgnoredQuery } from '../../../redux/slices/appoitmentRequestsLocumSlice';
import Swal from 'sweetalert2';
import { useGetAvailableRequestsQuery, useAcceptAppointmentMutation } from '../../../redux/slices/appoitmentRequestsLocumSlice';
import { useCreateNotificationMutation } from '../../../redux/slices/notificationSlice';
import { useCheckLocumHasCardsQuery } from '../../../redux/slices/locumCardSlice';
import { useRouter } from 'next/router';

type RequestWithDistance = any & {
    distance: number | null;
};

type TabKey = 'pending-requests' | 'request-appoitment' | 'pending-confirmations';

const WaitingList = () => {
    const router = useRouter();
    const [profile, setProfile] = useState<any>(null);
    const [loadingStates, setLoadingStates] = useState<{ [key: string]: boolean }>({});
    const [activeTab, setActiveTab] = useState<TabKey>('request-appoitment');
    const [tabLoading, setTabLoading] = useState<Record<TabKey, boolean>>({
        'request-appoitment': false,
        'pending-requests': false,
        'pending-confirmations': false,
    });
    const [tabRefreshCounters, setTabRefreshCounters] = useState<Record<TabKey, number>>({
        'request-appoitment': 0,
        'pending-requests': 0,
        'pending-confirmations': 0,
    });
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
        const locumIdStr = localStorage.getItem('locumId');

        if (profileStr) {
            const parsedProfile = JSON.parse(profileStr);
            setProfile(parsedProfile);
        }
    }, []);

    const handleTabClick = (tab: TabKey) => {
        setActiveTab(tab);
        setTabRefreshCounters(prev => ({
            ...prev,
            [tab]: prev[tab] + 1,
        }));
    };

    const {
        data: pendingConfirmationsData,
        isLoading: isLoadingConfirmations,
        isFetching: isFetchingConfirmations,
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
        isFetching: isFetchingRequests,
        error: requestsError,
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

    const [acceptAppointment] = useAcceptAppointmentMutation();
    const [ignoreAppointment] = useIgnoreAppointmentMutation();

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

        const acceptKey = `accept-${requestId}`;
        setLoadingStates(prev => ({ ...prev, [acceptKey]: true }));

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
            // Check if error is related to payment card
            const errorMessage = error?.data?.error || error?.error || error?.message || '';
            const isCardError = errorMessage.toLowerCase().includes('payment card') || 
                               errorMessage.toLowerCase().includes('payment method') ||
                               error?.status === 400 && errorMessage.toLowerCase().includes('card');

            if (isCardError) {
                const cardResult = await Swal.fire({
                    title: 'Payment Card Required',
                    text: 'You need to add a payment card before applying for appointments. Would you like to add one now?',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonText: 'Yes, Add Payment Card',
                    cancelButtonText: 'Cancel',
                    confirmButtonColor: '#C3EAE7',
                    cancelButtonColor: '#6B7280',
                });

                if (cardResult.isConfirmed) {
                    router.push('/locumStaff/payment');
                }
            } else {
                await Swal.fire({
                    title: 'Error!',
                    text: errorMessage || 'Failed to apply for appointment. Please try again.',
                    icon: 'error',
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#EF4444'
                });
            }
        } finally {
            setLoadingStates(prev => ({ ...prev, [acceptKey]: false }));
        }
    };

    const handleIgnore = async (requestId: string) => {
        if (!profile?.id) return;

        const result = await Swal.fire({
            title: 'Ignore Appointment',
            text: 'Are you sure you want to ignore this appointment? You won\'t see it in your available requests anymore.',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes, Ignore',
            cancelButtonText: 'Cancel',
            confirmButtonColor: '#DC2626',
            cancelButtonColor: '#6B7280'
        });

        if (!result.isConfirmed) return;

        const ignoreKey = `ignore-${requestId}`;
        setLoadingStates(prev => ({ ...prev, [ignoreKey]: true }));

        try {
            await ignoreAppointment({
                request_id: requestId,
                locum_id: profile.id,
            }).unwrap();

            await Swal.fire({
                title: 'Success!',
                text: 'Appointment ignored successfully. It will no longer appear in your available requests.',
                icon: 'success',
                confirmButtonText: 'OK',
                confirmButtonColor: '#10B981'
            });

            refetch();
        } catch (error: any) {
            await Swal.fire({
                title: 'Error!',
                text: error.message || 'Failed to ignore appointment. Please try again.',
                icon: 'error',
                confirmButtonText: 'OK',
                confirmButtonColor: '#EF4444'
            });
        } finally {
            setLoadingStates(prev => ({ ...prev, [ignoreKey]: false }));
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
        isFetching: isFetchingHistory,
        error: historyError,
        refetch: refetchHistory
    } = useGetApplicationHistoryQuery(
        { locum_id: profile?.id },
        {
            skip: !profile?.id,
            refetchOnMountOrArgChange: true,
        }
    );

    useEffect(() => {
        if (!profile?.id) return;

        let isMounted = true;
        const tabAtInvocation = activeTab;

        const runRefetch = async () => {
            setTabLoading(prev => ({ ...prev, [tabAtInvocation]: true }));

            try {
                if (tabAtInvocation === 'pending-confirmations') {
                    await refetchConfirmations();
                } else if (tabAtInvocation === 'pending-requests') {
                    await refetchHistory();
                } else {
                    await refetch();
                }
            } catch (error) {
                console.error('Failed to refresh data for tab:', tabAtInvocation, error);
            } finally {
                if (isMounted) {
                    setTabLoading(prev => ({ ...prev, [tabAtInvocation]: false }));
                }
            }
        };

        runRefetch();

        return () => {
            isMounted = false;
        };
    }, [activeTab, profile?.id, tabRefreshCounters, refetchConfirmations, refetchHistory, refetch]);

    const [confirmAppointment] = useConfirmAppointmentMutation();
    const [createNotification] = useCreateNotificationMutation();

    const handleConfirmation = async (confirmationId: string, action: 'CONFIRM' | 'REJECT', confirmation?: any) => {
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

            if (action === 'CONFIRM' && confirmation) {
                const message = `Good news! ${profile.fullName || 'A locum staff'} has accepted your appointment request from ${confirmation.practice.name} on ${formatDate(confirmation.appointment.date)} at ${formatTime(confirmation.appointment.start_time)} - ${formatTime(confirmation.appointment.end_time)} at ${confirmation.appointment.location}.`;
                
                const notificationData: {
                    practiceId: string;
                    branchId?: string;
                    message: string;
                    status: 'UNREAD';
                } = {
                    practiceId: confirmation.practice.id,
                    message,
                    status: 'UNREAD',
                };

                if (confirmation.branch?.id) {
                    notificationData.branchId = confirmation.branch.id;
                    console.log('✅ Branch ID found and included:', confirmation.branch.id);
                } else {
                    console.log('ℹ️ No branch ID - notification will be for practice only');
                }
                
                try {
                    const notificationResult = await createNotification(notificationData).unwrap();
                    console.log('Notification created successfully:', notificationResult);
                } catch (notificationError: any) {
                    console.error('Failed to create notification:', notificationError);
                }
            }

            refetchConfirmations();
        } catch (error: any) {
            await Swal.fire({
                title: 'Error',
                text: error.message || 'You already have booking for this appointment time.',
                icon: 'error',
                confirmButtonText: 'OK',
                confirmButtonColor: '#DC2626'
            });
        } finally {
            setLoadingStates(prev => ({ ...prev, [confirmationId]: false }));
        }
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

    const tabLoadingStatus: Record<TabKey, boolean> = {
        'request-appoitment': tabLoading['request-appoitment'] || isLoadingRequests || isFetchingRequests,
        'pending-requests': tabLoading['pending-requests'] || isLoadingHistory || isFetchingHistory,
        'pending-confirmations': tabLoading['pending-confirmations'] || isLoadingConfirmations || isFetchingConfirmations,
    };

    const tabErrors: Record<TabKey, typeof requestsError> = {
        'request-appoitment': requestsError,
        'pending-requests': historyError,
        'pending-confirmations': confirmationsError,
    };

    const loadingMessages: Record<TabKey, string> = {
        'request-appoitment': 'Refreshing available appointment requests...',
        'pending-requests': 'Refreshing your pending applications...',
        'pending-confirmations': 'Refreshing your pending confirmations...',
    };

    const isContentLoading = tabLoadingStatus[activeTab];
    const error = tabErrors[activeTab];

    if (isContentLoading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <NavBar />
                <div className="container mx-auto px-4 py-8 pt-32">
                    <div className="flex justify-center items-center h-64 pt-32">
                        <FaSpinner className="animate-spin text-blue-600 text-4xl" />
                        <span className="ml-3 text-lg text-gray-600">
                            {loadingMessages[activeTab]}
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

    const tabButtonLoading: Record<TabKey, boolean> = {
        'request-appoitment': tabLoadingStatus['request-appoitment'],
        'pending-requests': tabLoadingStatus['pending-requests'],
        'pending-confirmations': tabLoadingStatus['pending-confirmations'],
    };

    const tabButtonLabels: Record<TabKey, string> = {
        'request-appoitment': 'Request Appoitment',
        'pending-requests': 'Pending Requests',
        'pending-confirmations': 'Pending Confirmations',
    };

    const tabButtonLoadingLabels: Record<TabKey, string> = {
        'request-appoitment': 'Refreshing requests...',
        'pending-requests': 'Refreshing applications...',
        'pending-confirmations': 'Refreshing confirmations...',
    };

    const errorEntityLabels: Record<TabKey, string> = {
        'request-appoitment': 'appointment requests',
        'pending-requests': 'application history',
        'pending-confirmations': 'confirmations',
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-[#C3EAE7]/10 pt-32">
            <NavBar />
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                <div className="mb-8">
                    {/* Modern Header Section */}
                    <div className="text-center mb-10 pt-8">
                        <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
                            {activeTab === 'request-appoitment'
                                ? 'Browse and apply for available dental appointments in your area'
                                : activeTab === 'pending-requests'
                                    ? 'Track your submitted applications and their status'
                                    : 'Review and respond to appointment confirmations from practices'
                            }
                        </p>
                        <div className="flex justify-center gap-2 mt-6">
                            <div className="w-3 h-3 bg-gradient-to-r from-[#C3EAE7] to-[#9DD4D0] rounded-full animate-pulse shadow-lg"></div>
                            <div className="w-3 h-3 bg-gradient-to-r from-[#C3EAE7] to-[#9DD4D0] rounded-full animate-pulse shadow-lg" style={{ animationDelay: '0.2s' }}></div>
                            <div className="w-3 h-3 bg-gradient-to-r from-[#C3EAE7] to-[#9DD4D0] rounded-full animate-pulse shadow-lg" style={{ animationDelay: '0.4s' }}></div>
                        </div>
                    </div>

                    {/* Modern Tab Navigation */}
                    <div className="mt-8 mb-8">
                        <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 max-w-4xl mx-auto">
                            <button
                                type="button"
                                onClick={() => handleTabClick('request-appoitment')}
                                disabled={tabButtonLoading['request-appoitment']}
                                aria-busy={tabButtonLoading['request-appoitment']}
                                className={`group relative flex items-center justify-center px-6 py-4 text-sm font-bold rounded-2xl transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-60 overflow-hidden ${
                                    activeTab === 'request-appoitment'
                                        ? 'bg-gradient-to-r from-[#C3EAE7] to-[#9DD4D0] text-black shadow-xl scale-105'
                                        : 'bg-white text-gray-600 hover:text-black hover:shadow-lg border-2 border-gray-200 hover:border-[#C3EAE7]'
                                } ${tabButtonLoading['request-appoitment'] ? 'cursor-wait' : ''}`}
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-[#C3EAE7] to-[#9DD4D0] opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                                {tabButtonLoading['request-appoitment'] ? (
                                    <FaSpinner className="animate-spin mr-2 text-lg" />
                                ) : (
                                    <FaHistory className="mr-2 text-lg" />
                                )}
                                <span className="relative z-10 whitespace-nowrap">
                                    {tabButtonLoading['request-appoitment']
                                        ? 'Loading...'
                                        : 'Available Requests'}
                                </span>
                                {activeTab === 'request-appoitment' && requests.length > 0 && (
                                    <span className="ml-2 px-2.5 py-0.5 bg-black text-white text-xs font-bold rounded-full">
                                        {requests.length}
                                    </span>
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={() => handleTabClick('pending-requests')}
                                disabled={tabButtonLoading['pending-requests']}
                                aria-busy={tabButtonLoading['pending-requests']}
                                className={`group relative flex items-center justify-center px-6 py-4 text-sm font-bold rounded-2xl transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-60 overflow-hidden ${
                                    activeTab === 'pending-requests'
                                        ? 'bg-gradient-to-r from-[#C3EAE7] to-[#9DD4D0] text-black shadow-xl scale-105'
                                        : 'bg-white text-gray-600 hover:text-black hover:shadow-lg border-2 border-gray-200 hover:border-[#C3EAE7]'
                                } ${tabButtonLoading['pending-requests'] ? 'cursor-wait' : ''}`}
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-[#C3EAE7] to-[#9DD4D0] opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                                {tabButtonLoading['pending-requests'] ? (
                                    <FaSpinner className="animate-spin mr-2 text-lg" />
                                ) : (
                                    <FaClock className="mr-2 text-lg" />
                                )}
                                <span className="relative z-10 whitespace-nowrap">
                                    {tabButtonLoading['pending-requests']
                                        ? 'Loading...'
                                        : 'My Applications'}
                                </span>
                                {activeTab === 'pending-requests' && filteredApplicationHistory.length > 0 && (
                                    <span className="ml-2 px-2.5 py-0.5 bg-black text-white text-xs font-bold rounded-full">
                                        {filteredApplicationHistory.length}
                                    </span>
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={() => handleTabClick('pending-confirmations')}
                                disabled={tabButtonLoading['pending-confirmations']}
                                aria-busy={tabButtonLoading['pending-confirmations']}
                                className={`group relative flex items-center justify-center px-6 py-4 text-sm font-bold rounded-2xl transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-60 overflow-hidden ${
                                    activeTab === 'pending-confirmations'
                                        ? 'bg-gradient-to-r from-[#C3EAE7] to-[#9DD4D0] text-black shadow-xl scale-105'
                                        : 'bg-white text-gray-600 hover:text-black hover:shadow-lg border-2 border-gray-200 hover:border-[#C3EAE7]'
                                } ${tabButtonLoading['pending-confirmations'] ? 'cursor-wait' : ''}`}
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-[#C3EAE7] to-[#9DD4D0] opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                                {tabButtonLoading['pending-confirmations'] ? (
                                    <FaSpinner className="animate-spin mr-2 text-lg" />
                                ) : (
                                    <FaExclamationTriangle className="mr-2 text-lg" />
                                )}
                                <span className="relative z-10 whitespace-nowrap">
                                    {tabButtonLoading['pending-confirmations']
                                        ? 'Loading...'
                                        : 'Confirmations'}
                                </span>
                                {activeTab === 'pending-confirmations' && pendingConfirmations.length > 0 && (
                                    <span className="ml-2 px-2.5 py-0.5 bg-black text-white text-xs font-bold rounded-full animate-pulse">
                                        {pendingConfirmations.length}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Stats Card */}
                    <div className="mt-6 bg-gradient-to-r from-white to-[#C3EAE7]/20 border-2 border-[#C3EAE7]/30 rounded-2xl p-5 shadow-lg backdrop-blur-sm max-w-2xl mx-auto">
                        <div className="flex items-center justify-center">
                            {activeTab === 'pending-confirmations' ? (
                                <>
                                    <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl mr-4 shadow-md">
                                        <FaClock className="text-white text-xl" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 font-medium">Awaiting Your Response</p>
                                        <p className="text-2xl font-black text-gray-800">
                                            {pendingConfirmations.length} Confirmation{pendingConfirmations.length !== 1 ? 's' : ''}
                                        </p>
                                    </div>
                                </>
                            ) : activeTab === 'request-appoitment' ? (
                                <>
                                    <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-[#C3EAE7] to-[#9DD4D0] rounded-xl mr-4 shadow-md">
                                        <FaHistory className="text-black text-xl" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 font-medium">Available Opportunities</p>
                                        <p className="text-2xl font-black text-gray-800">
                                            {requests.length} Appointment{requests.length !== 1 ? 's' : ''}
                                        </p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl mr-4 shadow-md">
                                        <FaClock className="text-white text-xl" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 font-medium">Pending Applications</p>
                                        <p className="text-2xl font-black text-gray-800">
                                            {filteredApplicationHistory.length} Application{filteredApplicationHistory.length !== 1 ? 's' : ''}
                                        </p>
                                    </div>
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
                                Error loading {errorEntityLabels[activeTab]}. Please try again later.
                            </span>
                        </div>
                    </div>
                )}

                {activeTab === 'pending-confirmations' ? (
                    pendingConfirmations.length === 0 ? (
                        <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-xl p-12 text-center border-2 border-gray-100">
                            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full mb-6">
                                <FaClock className="text-gray-400 text-5xl" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-3">No Pending Confirmations</h3>
                            <p className="text-gray-600 text-lg max-w-md mx-auto">
                                You're all caught up! No appointments are waiting for your confirmation at the moment.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6">
                            {pendingConfirmations.map((confirmation) => {
                                const isLoading = loadingStates[confirmation.confirmation_id];

                                return (
                                    <div
                                        key={confirmation.confirmation_id}
                                        className="bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-gray-100 hover:border-[#C3EAE7] transform hover:-translate-y-1"
                                    >
                                        <div className="bg-gradient-to-r from-[#C3EAE7] to-[#9DD4D0] px-6 py-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-md">
                                                        <FaCalendarAlt className="text-[#5BA8A0] text-xl" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-xl font-black text-black">{confirmation.practice.name}</h3>
                                                        {confirmation.branch && (
                                                            <p className="text-sm font-semibold text-gray-700">
                                                                Branch: {confirmation.branch.name}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                <span className="inline-flex items-center px-4 py-2 rounded-full text-xs font-bold bg-yellow-400 text-black shadow-md animate-pulse">
                                                    <FaClock className="mr-2" />
                                                    Awaiting Response
                                                </span>
                                            </div>
                                        </div>

                                        <div className="p-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                                <div className="space-y-4">
                                                    <div className="flex items-start space-x-3">
                                                        <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center flex-shrink-0">
                                                            <FaCalendarAlt className="text-blue-600" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Date & Time</p>
                                                            <p className="text-sm font-bold text-gray-900 mt-1">
                                                                {formatDateTime(confirmation.appointment.date)}
                                                            </p>
                                                            <p className="text-sm text-gray-600 mt-1">
                                                                {confirmation.appointment.start_time} - {confirmation.appointment.end_time}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-start space-x-3">
                                                        <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center flex-shrink-0">
                                                            <FaMapMarkerAlt className="text-green-600" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Location</p>
                                                            <p className="text-sm font-medium text-gray-900 mt-1">
                                                                {confirmation.appointment.location}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    <div className="flex items-start space-x-3">
                                                        <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center flex-shrink-0">
                                                            <FaPhoneAlt className="text-purple-600" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Contact</p>
                                                            <p className="text-sm font-medium text-gray-900 mt-1">
                                                                {confirmation.practice.telephone}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-start space-x-3">
                                                        <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                                                            <span className="text-gray-600 font-bold text-xs">#</span>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Confirmation ID</p>
                                                            <p className="text-sm font-medium text-gray-900 mt-1">
                                                                #{confirmation.confirmation_number}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t-2 border-gray-100">
                                                <button
                                                    onClick={() => handleConfirmation(confirmation.confirmation_id, 'CONFIRM', confirmation)}
                                                    disabled={isLoading}
                                                    className="flex-1 inline-flex items-center justify-center px-6 py-4 border-2 border-transparent text-base font-bold rounded-xl text-white bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-400 focus:outline-none focus:ring-4 focus:ring-green-300 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                                                >
                                                    {isLoading ? (
                                                        <FaSpinner className="animate-spin mr-2 text-xl" />
                                                    ) : (
                                                        <FaCheck className="mr-2 text-xl" />
                                                    )}
                                                    Accept Appointment
                                                </button>

                                                <button
                                                    onClick={() => handleConfirmation(confirmation.confirmation_id, 'REJECT', confirmation)}
                                                    disabled={isLoading}
                                                    className="flex-1 inline-flex items-center justify-center px-6 py-4 border-2 border-red-300 text-base font-bold rounded-xl text-red-600 bg-white hover:bg-red-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-300 focus:outline-none focus:ring-4 focus:ring-red-200 transition-all duration-200 shadow-md hover:shadow-lg"
                                                >
                                                    {isLoading ? (
                                                        <FaSpinner className="animate-spin mr-2 text-xl" />
                                                    ) : (
                                                        <FaTimes className="mr-2 text-xl" />
                                                    )}
                                                    Decline
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )
                ) : activeTab === 'pending-requests' ? (
                    filteredApplicationHistory.length === 0 ? (
                        <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-xl p-12 text-center border-2 border-gray-100">
                            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full mb-6">
                                <FaHistory className="text-gray-400 text-5xl" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-3">No Pending Applications</h3>
                            <p className="text-gray-600 text-lg max-w-md mx-auto">
                                You haven't applied to any appointments yet. Check the Available Requests tab to find opportunities!
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6">
                            {filteredApplicationHistory.map((application) => (
                                <div
                                    key={application.response_id}
                                    className={`bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border-2 ${
                                        application.request.is_past ? 'border-gray-300 opacity-75' : 'border-gray-100 hover:border-[#C3EAE7]'
                                    }`}
                                >
                                    <div className="bg-gradient-to-r from-blue-100 to-blue-200 px-6 py-4">
                                        <div className="flex items-center justify-between flex-wrap gap-3">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-md">
                                                    <FaCalendarAlt className="text-blue-600 text-xl" />
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-black text-black">{application.request.practice.name}</h3>
                                                    {application.request.branch && (
                                                        <p className="text-sm font-semibold text-gray-700">
                                                            Branch: {application.request.branch.name}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                <span className={`inline-flex items-center px-4 py-2 rounded-full text-xs font-bold shadow-md ${
                                                    application.status === 'ACCEPTED'
                                                        ? 'bg-green-400 text-black'
                                                        : 'bg-red-400 text-white'
                                                }`}>
                                                    {application.request.status_label}
                                                </span>
                                                {application.request.is_past && (
                                                    <span className="inline-flex items-center px-4 py-2 rounded-full text-xs font-bold bg-gray-400 text-white shadow-md">
                                                        Past Event
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-6">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="flex items-start space-x-3">
                                                <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center flex-shrink-0">
                                                    <FaCalendarAlt className="text-blue-600" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Appointment</p>
                                                    <p className="text-sm font-bold text-gray-900 mt-1">
                                                        {formatDateTime(application.request.request_date)}
                                                    </p>
                                                    <p className="text-sm text-gray-600 mt-1">
                                                        {application.request.request_start_time} - {application.request.request_end_time}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-start space-x-3">
                                                <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center flex-shrink-0">
                                                    <FaMapMarkerAlt className="text-green-600" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Location</p>
                                                    <p className="text-sm font-medium text-gray-900 mt-1">
                                                        {application.request.location}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        Role: {application.request.required_role}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-start space-x-3">
                                                <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center flex-shrink-0">
                                                    <FaClock className="text-purple-600" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Applied On</p>
                                                    <p className="text-sm font-medium text-gray-900 mt-1">
                                                        {formatDateTime(application.responded_at)}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-1 flex items-center">
                                                        <FaPhoneAlt className="mr-1" />
                                                        {application.request.practice.telephone}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                ) : (
                    <div className="space-y-6">
                        {/* Filters and Actions Bar */}
                        <div className="bg-gradient-to-r from-[#C3EAE7] to-[#9DD4D0] rounded-3xl shadow-xl p-6 border-2 border-[#C3EAE7]">
                            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                                <div>
                                    <h2 className="text-2xl font-black text-black mb-2">Browse Opportunities</h2>
                                    <p className="text-gray-800 font-medium">
                                        {requests.length} appointment{requests.length !== 1 ? 's' : ''} match your criteria
                                        {distanceFilter !== 999999 && (
                                            <span className="ml-2 px-3 py-1 bg-black text-white text-xs font-bold rounded-full">
                                                ≤ {distanceFilter} km
                                            </span>
                                        )}
                                    </p>
                                </div>
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
                                    <div className="flex items-center space-x-3 bg-white rounded-xl px-4 py-3 shadow-md">
                                        <FaMapMarkerAlt className="text-[#5BA8A0] text-lg" />
                                        <select
                                            id="distance-filter"
                                            value={distanceFilter}
                                            onChange={(e) => setDistanceFilter(Number(e.target.value))}
                                            className="flex-1 sm:flex-none font-bold text-sm focus:outline-none bg-transparent cursor-pointer"
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
                                        className="flex items-center justify-center px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl font-bold transform hover:scale-105"
                                    >
                                        <FaHistory className="mr-2" />
                                        Refresh
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Payment Card Warning */}
                        {!isLoadingCardStatus && cardStatusData && !cardStatusData.hasCards && (
                            <div className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-300 rounded-2xl p-5 shadow-lg">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-1.964-1.333-2.732 0L3.918 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-lg font-black text-red-900 mb-1">Payment Card Required</h4>
                                        <p className="text-sm text-red-700 mb-3">
                                            You need to add payment details before applying for appointments.
                                        </p>
                                        <button
                                            onClick={() => router.push('/locumStaff/payment')}
                                            className="inline-flex items-center px-5 py-2.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all shadow-md hover:shadow-lg"
                                        >
                                            Add Payment Card
                                            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                        {/* Appointments Grid */}
                        {requests.length > 0 ? (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {requests.map((req) => {
                                    const acceptKey = `accept-${req.request_id}`;
                                    const ignoreKey = `ignore-${req.request_id}`;
                                    const isAccepting = loadingStates[acceptKey];
                                    const isIgnoring = loadingStates[ignoreKey];
                                    const isLoading = isAccepting || isIgnoring;

                                    return (
                                        <div
                                            key={req.request_id}
                                            className="bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-gray-100 hover:border-[#C3EAE7] transform hover:-translate-y-1"
                                        >
                                            {/* Card Header */}
                                            <div className="bg-gradient-to-r from-[#C3EAE7] to-[#9DD4D0] px-6 py-4">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex items-center space-x-3 flex-1">
                                                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
                                                            <svg className="w-6 h-6 text-[#5BA8A0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                            </svg>
                                                        </div>
                                                        <div className="min-w-0">
                                                            <h3 className="text-lg font-black text-black truncate">{req.practice.name}</h3>
                                                            {req.branch && (
                                                                <p className="text-sm font-semibold text-gray-700 truncate">
                                                                    {req.branch.name}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {req.is_urgent && (
                                                        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-red-500 text-white shadow-md animate-pulse flex-shrink-0">
                                                            <FaExclamationTriangle className="mr-1" />
                                                            URGENT
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Card Body */}
                                            <div className="p-6 space-y-4">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="flex items-start space-x-3">
                                                        <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center flex-shrink-0">
                                                            <FaCalendarAlt className="text-blue-600" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</p>
                                                            <p className="text-sm font-bold text-gray-900 mt-1">
                                                                {formatDate(req.request_date)}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-start space-x-3">
                                                        <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center flex-shrink-0">
                                                            <FaClock className="text-purple-600" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Time</p>
                                                            <p className="text-sm font-bold text-gray-900 mt-1">
                                                                {formatTime(req.request_start_time)}
                                                            </p>
                                                            <p className="text-xs text-gray-600">
                                                                to {formatTime(req.request_end_time)}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-start space-x-3">
                                                        <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center flex-shrink-0">
                                                            <FaMapMarkerAlt className="text-green-600" />
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Location</p>
                                                            <p className="text-sm font-medium text-gray-900 mt-1 truncate" title={req.location}>
                                                                {req.location}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-start space-x-3">
                                                        <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg flex items-center justify-center flex-shrink-0">
                                                            <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                                            </svg>
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Distance</p>
                                                            <p className="text-sm font-bold text-gray-900 mt-1">
                                                                {req.distance !== null ? (
                                                                    <span>{req.distance} km away</span>
                                                                ) : (
                                                                    <span className="text-gray-400">N/A</span>
                                                                )}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center space-x-2 pt-2">
                                                    <FaPhoneAlt className="text-gray-400 text-sm" />
                                                    <p className="text-sm text-gray-600 font-medium">{req.practice.telephone}</p>
                                                </div>

                                                {/* Action Buttons */}
                                                <div className="flex gap-3 pt-4 border-t-2 border-gray-100">
                                                    <button
                                                        onClick={() => handleAccept(req.request_id)}
                                                        disabled={isLoading}
                                                        className="flex-1 inline-flex items-center justify-center px-5 py-3.5 border-2 border-transparent text-sm font-bold rounded-xl text-white bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-green-300 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                                                    >
                                                        {isAccepting ? (
                                                            <>
                                                                <FaSpinner className="animate-spin mr-2" />
                                                                Applying...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <FaCheck className="mr-2" />
                                                                Apply Now
                                                            </>
                                                        )}
                                                    </button>

                                                    <button
                                                        onClick={() => handleIgnore(req.request_id)}
                                                        disabled={isLoading}
                                                        className="inline-flex items-center justify-center px-5 py-3.5 border-2 border-gray-300 text-sm font-bold rounded-xl text-gray-600 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-gray-200 transition-all duration-200 shadow-md hover:shadow-lg"
                                                    >
                                                        {isIgnoring ? (
                                                            <FaSpinner className="animate-spin" />
                                                        ) : (
                                                            <FaEyeSlash />
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-xl p-16 text-center border-2 border-gray-100">
                                <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full mb-6">
                                    <FaClock className="text-gray-400 text-5xl" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-800 mb-3">No Appointments Available</h3>
                                <p className="text-gray-600 text-lg max-w-md mx-auto mb-6">
                                    There are no appointments matching your current filter criteria. Try adjusting the distance filter or check back later!
                                </p>
                                <button
                                    onClick={() => refetch()}
                                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#C3EAE7] to-[#9DD4D0] text-black font-bold rounded-xl hover:shadow-lg transition-all"
                                >
                                    <FaHistory className="mr-2" />
                                    Refresh List
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default WaitingList;