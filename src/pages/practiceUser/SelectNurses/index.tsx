import React, { useEffect, useState } from 'react';
import NavBar from "../../components/navBarPracticeUser";
import Footer from "../../components/footer/index";
import { useGetLocumProfilesQuery } from '../../../redux/slices/locumProfileSlice';
import { FiSend } from "react-icons/fi";
import { useAddBookingMutation } from '../../../redux/slices/bookingPracticeSlice';
import Swal from 'sweetalert2';

interface Profile {
    contactNumber: string;
    emailAddress: string;
    fullName: string;
    name?: string;
    email?: string;
    telephone?: string;
    address?: string;
    location?: string;
    GDCnumber?: string;
    dob?: string;
    status?: string;
    id?: string;
}

const PastAndCurrentPaymentsPage = () => {

    const [profile, setProfile] = useState<Profile | null>(null);
    const { data: locumProfiles, isLoading, error } = useGetLocumProfilesQuery();
    const [addBooking] = useAddBookingMutation();

    const [nearbyLocums, setNearbyLocums] = useState<Profile[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedNurseId, setSelectedNurseId] = useState<string | null>(null);
    const [token, setToken] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        booking_date: '',
        booking_start_time: '',
        booking_end_time: '',
        description: ''
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

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                setToken(token);
            } catch {
                setToken(null);
            }
        }
    }, []);


    const haversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const toRad = (value: number) => (value * Math.PI) / 180;
        const R = 6371;

        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);

        const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    useEffect(() => {
        if (!profile?.location || !locumProfiles) return;

        const [userLat, userLon] = profile.location.split(',').map(Number);

        const filtered = locumProfiles.filter((locum: any) => {
            if (!locum.address) return false;
            const [locumLat, locumLon] = locum.address.split(',').map(Number);
            const distance = haversineDistance(userLat, userLon, locumLat, locumLon);
            return distance <= 10;
        });

        setNearbyLocums(filtered);
    }, [profile, locumProfiles]);

    const openModal = (nurseId: string) => {
        setSelectedNurseId(nurseId);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setFormData({ booking_date: '', booking_start_time: '', booking_end_time: '', description: '' });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        if (!formData.booking_date || !formData.booking_start_time || !formData.booking_end_time) {
            Swal.fire({
                icon: 'warning',
                title: 'Missing Fields',
                text: 'Date, Start Time, and End Time are required.',
                confirmButtonColor: '#C3EAE7',
            });
            return;
        }

        if (selectedNurseId && profile?.id) {
            const bookingData = {
                locum_id: selectedNurseId,
                practice_id: profile.id,
                booking_date: new Date(formData.booking_date),
                booking_start_time: formData.booking_start_time,
                booking_end_time: formData.booking_end_time,
                status: "pending",
                location: profile.address || "",
                description: formData.description || "No description",
            };
            console.log(bookingData)

            try {
                await addBooking(bookingData).unwrap();
                Swal.fire({
                    icon: 'success',
                    title: 'Booking Sent!',
                    text: 'Booking request has been sent successfully.',
                    confirmButtonColor: '#C3EAE7',
                });
                closeModal();
            } catch (error) {
                console.error("Error adding booking:", error);
                Swal.fire({
                    icon: 'error',
                    title: 'Failed',
                    text: 'Failed to create booking. Please try again.',
                    confirmButtonColor: '#C3EAE7',
                });
            }
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col">
            <NavBar />
            <div className="flex-1 w-full">
                <div className="text-center mb-8 pt-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-black rounded-full mb-4 shadow-lg">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 10c-4.41 0-8-1.79-8-4V6c0-2.21 3.59-4 8-4s8 1.79 8 4v8c0 2.21-3.59 4-8 4z" />
                        </svg>
                    </div>
                    <h1 className="text-4xl font-bold text-black mb-2">Nearby Locum Nurses</h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Discover locum nurses available near your practice location.
                    </p>
                     <div className="flex justify-center gap-2 mt-4">
                        <div className="w-2 h-2 bg-[#C3EAE7] rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-[#C3EAE7] rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 bg-[#C3EAE7] rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                     <div className="flex justify-center items-center gap-6 mt-6">
                        <div className="flex flex-col">
                            <label className="text-gray-700 font-medium mb-1">Select Date</label>
                            <input
                                type="date"
                                className="border border-gray-300 rounded-lg px-4 py-2 w-56 focus:outline-none focus:ring-2 focus:ring-gray-400"
                            />
                        </div>

                        <div className="flex flex-col">
                            <label className="text-gray-700 font-medium mb-1">Select Time</label>
                            <input
                                type="time"
                                className="border border-gray-300 rounded-lg px-4 py-2 w-56 focus:outline-none focus:ring-2 focus:ring-gray-400"
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-white shadow-xl border-b-2 border-gray-200 w-full mx-auto px-2 sm:px-4 md:px-8">
                    <div className="mt-12">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-[#C3EAE7]/20">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Email</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Telephone</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Address</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100">
                                    {nearbyLocums.length > 0 ? (
                                        nearbyLocums.map((nurse, index) => (
                                            <tr key={index} className="hover:bg-[#C3EAE7]/10 transition-all">
                                                <td className="px-6 py-4 text-sm text-gray-700">{nurse.fullName}</td>
                                                <td className="px-6 py-4 text-sm text-gray-700">{nurse.emailAddress}</td>
                                                <td className="px-6 py-4 text-sm text-gray-700">{nurse.contactNumber}</td>
                                                <td className="px-6 py-4 text-sm text-gray-700">{nurse.location}</td>
                                                <td className="px-6 py-4 text-sm text-gray-700">
                                                    <button
                                                        onClick={() => openModal(nurse.id!)}
                                                        className="flex items-center gap-1 px-2 py-1 bg-[#C3EAE7] text-black font-bold rounded hover:bg-[#A9DBD9] transition"
                                                    >
                                                        <FiSend className="text-lg" />
                                                        Request
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="text-center text-gray-500 py-4">No nurses found within 10 km.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-2xl shadow-2xl w-96 border border-gray-100">
                        <h2 className="text-2xl font-bold mb-6 text-black text-center">Create Booking</h2>

                        <div className="space-y-4">
                            <div className="space-y-2 group">
                                <label className="block text-sm font-semibold text-black flex items-center gap-2">
                                    <svg className="w-4 h-4 text-[#C3EAE7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3M3 11h18M5 19h14" />
                                    </svg>
                                    Date *
                                </label>
                                <input
                                    type="date"
                                    name="booking_date"
                                    value={formData.booking_date}
                                    onChange={handleChange}
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
                                    name="booking_start_time"
                                    value={formData.booking_start_time}
                                    onChange={handleChange}
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
                                    name="booking_end_time"
                                    value={formData.booking_end_time}
                                    onChange={handleChange}
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
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h8m-8 4h6m2 4H6a2 2 0 01-2-2V6a2 2 0 012-2h6l6 6v12a2 2 0 01-2 2z" />
                                    </svg>
                                    Description
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Add details..."
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl 
                       focus:border-[#C3EAE7] focus:ring-2 focus:ring-[#C3EAE7]/30 
                       transition-all duration-200 outline-none 
                       hover:border-[#C3EAE7]/50 group-hover:shadow-md"
                                ></textarea>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={closeModal}
                                className="px-5 py-2 bg-gray-300 text-black rounded-xl 
                     hover:bg-gray-400 transition-all duration-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                className="px-5 py-2 bg-[#C3EAE7] text-black font-bold rounded-xl 
                     hover:bg-[#A9DBD9] transition-all duration-200"
                            >
                                Book
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
};

export default PastAndCurrentPaymentsPage;
