import React, { useEffect, useState } from 'react';
import NavBar from "../../components/navBarPracticeUser";
import Footer from "../../components/footer/index";
import { useGetLocumProfilesQuery } from '../../../redux/slices/locumProfileSlice';

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
}

const PastAndCurrentPaymentsPage = () => {

    const [profile, setProfile] = useState<Profile | null>(null);
    const { data: locumProfiles, isLoading, error } = useGetLocumProfilesQuery();

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

    const [nearbyLocums, setNearbyLocums] = useState<Profile[]>([]);

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

    return (
        <div className="min-h-screen bg-white flex flex-col">
            <NavBar />
            <div className="flex-1 w-full">
                <div className="text-center mb-8 pt-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-black rounded-full mb-4 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 10c-4.41 0-8-1.79-8-4V6c0-2.21 3.59-4 8-4s8 1.79 8 4v8c0 2.21-3.59 4-8 4z" />
                        </svg>
                    </div>
                    <h1 className="text-4xl font-bold text-black mb-2 bg-gradient-to-r from-black to-gray-700 bg-clip-text">
                        Nearby Locum Nurses
                    </h1>
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

                <div className="bg-white rounded-none shadow-xl border-b-2 border-gray-200 w-full mx-auto px-2 sm:px-4 md:px-8">
                    <div className="px-2 sm:px-4 md:px-8 mt-12">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-[#C3EAE7]/20">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Email</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Telephone</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Address</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100">
                                    {nearbyLocums.length > 0 ? (
                                        nearbyLocums.map((nurse, index) => (
                                            <tr key={index} className="hover:bg-[#C3EAE7]/10 transition-all">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{nurse.fullName}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{nurse.emailAddress}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{nurse.contactNumber}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{nurse.location}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="text-center text-gray-500 py-4">No nurses found within 10 km.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </div>
            <Footer />
        </div>
    );
};

export default PastAndCurrentPaymentsPage;
