import React from 'react';
import NavBar from "../../components/navBar/nav";
import { FaCheck, FaTimes } from "react-icons/fa"

const LocumStaffRequestList = () => {
    const requests = [
        {
            name: 'Sarah Johnson',
            email: 'sarah@example.com',
            bookingDate: '2025-07-30',
            bookingTime: '10:30 AM',
            description: 'Need a locum nurse for a morning shift in the dental clinic.',
            location: 'Colombo, Sri Lanka',
        },
        {
            name: 'John Doe',
            email: 'john@example.com',
            bookingDate: '2025-07-31',
            bookingTime: '2:00 PM',
            description: 'Assistance required for afternoon shift covering hygiene treatments.',
            location: 'Kandy, Sri Lanka',
        },
    ];

    return (
        <div className="min-h-screen bg-white flex flex-col">
            <NavBar />

            <div className="text-center mb-8 pt-12 px-4">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-black rounded-full mb-4 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 10c-4.41 0-8-1.79-8-4V6c0-2.21 3.59-4 8-4s8 1.79 8 4v8c0 2.21-3.59 4-8 4z" />
                    </svg>
                </div>
                <h1 className="text-2xl sm:text-4xl font-bold text-black mb-2 bg-gradient-to-r from-black to-gray-700 bg-clip-text">
                    Locum Staff Request List
                </h1>
                <p className="text-sm sm:text-lg text-gray-600 max-w-2xl mx-auto">
                    View and manage locum staff booking requests for your practice.
                </p>
            </div>

            <div className="w-full px-2 sm:px-6 md:px-12 mb-12">
                <div className="bg-[#C3EAE7] px-2 sm:px-4 py-6 w-full rounded-none mb-4">
                        <h2 className="text-2xl font-bold text-black">Request List</h2>
                        <p className="text-gray-700 mt-1">All your requests in one place</p>
                    </div>
                <div className="bg-white shadow-xl rounded-xl border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 text-sm sm:text-base">
                            <thead className="bg-[#C3EAE7]/20">
                                <tr>
                                    <th className="px-4 sm:px-6 py-3 text-left font-bold text-black uppercase tracking-wider">Name</th>
                                    <th className="px-4 sm:px-6 py-3 text-left font-bold text-black uppercase tracking-wider">Email</th>
                                    <th className="px-4 sm:px-6 py-3 text-left font-bold text-black uppercase tracking-wider">Booking Date</th>
                                    <th className="px-4 sm:px-6 py-3 text-left font-bold text-black uppercase tracking-wider">Booking Time</th>
                                    <th className="px-4 sm:px-6 py-3 text-left font-bold text-black uppercase tracking-wider">Description</th>
                                    <th className="px-4 sm:px-6 py-3 text-left font-bold text-black uppercase tracking-wider">Location</th>
                                    <th className="px-4 sm:px-6 py-3 text-center font-bold text-black uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {requests.length > 0 ? (
                                    requests.map((req, index) => (
                                        <tr key={index} className="hover:bg-[#C3EAE7]/10 transition-all">
                                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-gray-700">{req.name}</td>
                                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-gray-700">{req.email}</td>
                                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-gray-700">{req.bookingDate}</td>
                                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-gray-700">{req.bookingTime}</td>
                                            <td className="px-4 sm:px-6 py-4 text-gray-700">{req.description}</td>
                                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-gray-700">{req.location}</td>
                                            <td className="px-4 sm:px-6 py-4 text-center">
                                                <div className="flex justify-center gap-2 sm:gap-3">
                                                    <button className="flex items-center justify-center bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg shadow-md transition-all text-sm sm:text-base">
                                                        <FaCheck />
                                                    </button>
                                                    <button className="flex items-center justify-center bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg shadow-md transition-all text-sm sm:text-base">
                                                        <FaTimes />
                                                    </button>
                                                </div>
                                            </td>

                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="text-center text-gray-500 py-4">No requests found.</td>
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
