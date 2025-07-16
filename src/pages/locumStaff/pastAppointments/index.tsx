import React from "react";
import NavBar from "../../components/navBar/nav";
import Footer from "../../components/footer/index";

const sampleAppointments = [
  {
    number: "APT-00123",
    date: "2024-07-01",
    location: "London Dental Clinic",
    time: "09:00 - 10:00",
    dentist: "Dr. Smith",
    type: "Checkup",
    status: "Completed",
  },
  {
    number: "APT-00124",
    date: "2024-07-03",
    location: "Bright Smiles Centre",
    time: "11:30 - 12:30",
    dentist: "Dr. Patel",
    type: "Cleaning",
    status: "Completed",
  },
  {
    number: "APT-00125",
    date: "2024-07-10",
    location: "City Dental Studio",
    time: "14:00 - 15:00",
    dentist: "Dr. Lee",
    type: "Filling",
    status: "Completed",
  },
];

const PastAppointmentsPage = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <NavBar />
      <div className="flex-1 w-full">
        <div className="text-center mb-8 pt-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-black rounded-full mb-4 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-black mb-2 bg-gradient-to-r from-black to-gray-700 bg-clip-text">
            Past Appointments
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            View your previous dental appointments and their details
          </p>
          <div className="flex justify-center gap-2 mt-4">
            <div className="w-2 h-2 bg-[#C3EAE7] rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-[#C3EAE7] rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-[#C3EAE7] rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>

        <div className="bg-white rounded-none shadow-xl  border-b-2 border-gray-200 w-full mx-auto px-2 sm:px-4 md:px-8">
          <div className="bg-[#C3EAE7] px-2 sm:px-4 py-6 w-full rounded-none">
            <h2 className="text-2xl font-bold text-black">Appointment History</h2>
            <p className="text-gray-700 mt-1">All your past appointments in one place</p>
          </div>

          <div className="py-8 w-full overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-[#C3EAE7]/20">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Appointment #</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Time Range</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Dentist</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {sampleAppointments.map((apt, idx) => (
                  <tr key={apt.number} className="hover:bg-[#C3EAE7]/10 transition-all">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-black">{apt.number}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{apt.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{apt.location}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{apt.time}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{apt.dentist}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{apt.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-[#C3EAE7] text-black">
                        {apt.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {sampleAppointments.length === 0 && (
              <div className="text-center text-gray-500 py-8">No past appointments found.</div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PastAppointmentsPage;
