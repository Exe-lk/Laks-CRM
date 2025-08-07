import React, { useEffect, useState } from 'react';
import NavBar from "../../components/navBarPracticeUser";
import Footer from "../../components/footer/index";
import AppointmentsTable from "../../components/appointmentsTable";
import { FiPlus } from "react-icons/fi";
import Swal from 'sweetalert2';
import { useCreateAppointmentRequestMutation, useGetPracticeRequestsQuery } from '../../../redux/slices/appointmentPracticeSlice';


interface Profile {
    id?: string;
    address?: string;
}

const CreateAppointmentPage = () => {

    const [profile, setProfile] = useState<Profile | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    console.log(profile)

    const [createAppointmentRequest, { isLoading: isCreatingAppointment }] = useCreateAppointmentRequestMutation();
    
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
    const [appointmentFormData, setAppointmentFormData] = useState({
        practice_id: '',
        request_date: '',
        request_start_time: '',
        request_end_time: '',
        location: '',
        required_role:''
    });

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

    const openAppointmentModal = () => {
        if (profile?.id && profile?.address) {
            setAppointmentFormData(prev => ({
                ...prev,
                practice_id: profile.id || '',
                location: profile.address || ''
            }));
        }
        setIsAppointmentModalOpen(true);
    };

    const closeAppointmentModal = () => {
        setIsAppointmentModalOpen(false);
        setAppointmentFormData({
            practice_id: '',
            request_date: '',
            request_start_time: '',
            request_end_time: '',
            location: '',
            required_role:''
        });
    };

    const handleAppointmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAppointmentFormData({ ...appointmentFormData, [e.target.name]: e.target.value });
    };

    const handleAppointmentSubmit = async () => {
        if (!appointmentFormData.practice_id || !appointmentFormData.request_date ||
            !appointmentFormData.request_start_time || !appointmentFormData.request_end_time ||
            !appointmentFormData.location || !appointmentFormData.required_role) {
            Swal.fire({
                icon: 'warning',
                title: 'Missing Fields',
                text: 'All fields are required.',
                confirmButtonColor: '#C3EAE7',
            });
            return;
        }

        try {
            const result = await createAppointmentRequest(appointmentFormData).unwrap();

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

                        <div className="space-y-4">

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
                                    value={appointmentFormData.request_date}
                                    onChange={handleAppointmentChange}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl 
                           focus:border-[#C3EAE7] focus:ring-2 focus:ring-[#C3EAE7]/30 
                           transition-all duration-200 outline-none 
                           hover:border-[#C3EAE7]/50 group-hover:shadow-md"
                                    required
                                />
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
                                    value={appointmentFormData.request_start_time}
                                    onChange={handleAppointmentChange}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl 
                           focus:border-[#C3EAE7] focus:ring-2 focus:ring-[#C3EAE7]/30 
                           transition-all duration-200 outline-none 
                           hover:border-[#C3EAE7]/50 group-hover:shadow-md"
                                    required
                                />
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
                                    value={appointmentFormData.request_end_time}
                                    onChange={handleAppointmentChange}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl 
                           focus:border-[#C3EAE7] focus:ring-2 focus:ring-[#C3EAE7]/30 
                           transition-all duration-200 outline-none 
                           hover:border-[#C3EAE7]/50 group-hover:shadow-md"
                                    required
                                />
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
                                    value={appointmentFormData.location}
                                    onChange={handleAppointmentChange}
                                    placeholder="Enter location"
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl 
                           focus:border-[#C3EAE7] focus:ring-2 focus:ring-[#C3EAE7]/30 
                           transition-all duration-200 outline-none 
                           hover:border-[#C3EAE7]/50 group-hover:shadow-md"
                                    required
                                    disabled
                                />
                            </div>
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
                                    value={appointmentFormData.required_role}
                                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleAppointmentChange(e as unknown as React.ChangeEvent<HTMLInputElement>)}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl 
               focus:border-[#C3EAE7] focus:ring-2 focus:ring-[#C3EAE7]/30 
               transition-all duration-200 outline-none 
               hover:border-[#C3EAE7]/50 group-hover:shadow-md"
                                    required
                                >
                                    <option value="">Select Role</option>
                                    <option value="Nurse">Nurse</option>
                                    <option value="Receptionist">Receptionist</option>
                                    <option value="Hygienist">Hygienist</option>
                                    <option value="Dentist">Dentist</option>
                                </select>
                            </div>

                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={closeAppointmentModal}
                                className="px-5 py-2 bg-gray-300 text-black rounded-xl 
                         hover:bg-gray-400 transition-all duration-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAppointmentSubmit}
                                disabled={isCreatingAppointment}
                                className={`px-5 py-2 font-bold rounded-xl transition-all duration-200 
                                    ${isCreatingAppointment
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'bg-[#C3EAE7] text-black hover:bg-[#A9DBD9]'
                                    }`}
                            >
                                {isCreatingAppointment ? 'Creating...' : 'Create Request'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
};

export default CreateAppointmentPage;
