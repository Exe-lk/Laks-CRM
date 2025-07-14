import React from "react";
import NavBar from "../components/navBar/nav";
import Footer from "../components/footer/index";

const samplePayments = [
  {
    id: "PAY-0001",
    date: "2024-07-01",
    amount: "£80.00",
    method: "Card",
    status: "Completed",
    description: "July 2024 Cleaning"
  },
  {
    id: "PAY-0002",
    date: "2024-07-05",
    amount: "£120.00",
    method: "Bank Transfer",
    status: "Pending",
    description: "Filling Appointment"
  },
  {
    id: "PAY-0003",
    date: "2024-07-10",
    amount: "£30.00",
    method: "Card",
    status: "Failed",
    description: "Missed Appointment Fee"
  },
];

const PastAndCurrentPaymentsPage = () => {
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
            Past and Current Payments
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            View your payment history and current payment statuses for your dental services
          </p>
          <div className="flex justify-center gap-2 mt-4">
            <div className="w-2 h-2 bg-[#C3EAE7] rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-[#C3EAE7] rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-[#C3EAE7] rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>

        <div className="bg-white rounded-none shadow-xl border-b-2 border-gray-200 w-full mx-auto px-2 sm:px-4 md:px-8">
          <div className="bg-[#C3EAE7] px-2 sm:px-4 py-6 w-full rounded-none">
            <h2 className="text-2xl font-bold text-black">Past and Current Payments</h2>
            <p className="text-gray-700 mt-1">All your payments in one place</p>
          </div>

          <div className="py-8 w-full overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-[#C3EAE7]/20">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Payment ID</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Method</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Description</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {samplePayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-[#C3EAE7]/10 transition-all">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-black">{payment.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{payment.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{payment.amount}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{payment.method}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-[#C3EAE7] text-black">
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{payment.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {samplePayments.length === 0 && (
              <div className="text-center text-gray-500 py-8">No payments found.</div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PastAndCurrentPaymentsPage;
