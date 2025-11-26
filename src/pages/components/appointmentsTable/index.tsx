import React, { useState } from 'react';
import { PracticeRequest } from '../../../redux/slices/appointmentPracticeSlice';
import { FiCalendar, FiClock, FiMapPin, FiUsers, FiCheck, FiX, FiAlertCircle } from 'react-icons/fi';
import ApplicantsModal from '../applicantsModal';

interface AppointmentsTableProps {
  requests: PracticeRequest[];
  loading?: boolean;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
  onPageChange?: (page: number) => void;
  onRequestUpdated?: () => void;
}

const AppointmentsTable: React.FC<AppointmentsTableProps> = ({
  requests = [],
  loading = false,
  pagination,
  onPageChange,
  onRequestUpdated
}) => {
  const [currentPage, setCurrentPage] = useState(pagination?.page || 1);
  const [isApplicantsModalOpen, setIsApplicantsModalOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  console.log(requests)

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    onPageChange?.(page);
  };

  const handleSelectApplicant = (requestId: string) => {
    setSelectedRequestId(requestId);
    setIsApplicantsModalOpen(true);
  };

  const handleCloseApplicantsModal = () => {
    setIsApplicantsModalOpen(false);
    setSelectedRequestId(null);
  };

  const handleApplicantSelected = () => {
    onRequestUpdated?.();
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <FiAlertCircle className="text-yellow-500" />;
      case 'confirmed':
        return <FiCheck className="text-green-500" />;
      case 'cancelled':
        return <FiX className="text-red-500" />;
      default:
        return <FiAlertCircle className="text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    return `${day}/${month}/${year}`;
  };

  const formatTime = (timeString: string) => {
    return new Date(`1970-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-100 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="px-6 py-4 bg-gradient-to-r from-[#C3EAE7] to-[#A9DBD9] border-b">
        <div className="flex items-center gap-3">
          <FiCalendar className="text-2xl text-gray-700" />
          <h2 className="text-2xl font-bold text-gray-800">Your Appointment Requests</h2>
        </div>
        <p className="text-gray-600 mt-1">Manage and track your appointment requests</p>
      </div>

      {requests.length === 0 ? (
        <div className="p-12 text-center">
          <FiCalendar className="text-6xl text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-500 mb-2">No Appointments Found</h3>
          <p className="text-gray-400">You haven't created any appointment requests yet.</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Required Role
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Applicants
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Selection
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {requests.map((request) => (
                  <tr key={request.request_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                          <FiCalendar className="text-[#C3EAE7]" />
                          {formatDate(request.request_date)}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                          <FiClock className="text-[#C3EAE7]" />
                          {formatTime(request.request_start_time)} - {formatTime(request.request_end_time)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-900">
                        <FiMapPin className="text-[#C3EAE7]" />
                        <div>
                          <div>{request.location}</div>
                          {request.branch && (
                            <div className="text-xs text-blue-600 font-medium mt-1">Branch: {request.branch.name}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-900">
                        <svg className="w-4 h-4 text-[#C3EAE7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {request.required_role}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(request.status)}`}>
                        {getStatusIcon(request.status)}
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`flex items-center gap-2 ${request.status.toLowerCase() === 'cancelled' ? 'opacity-50' : ''}`}>
                        <FiUsers className={request.status.toLowerCase() === 'cancelled' ? 'text-gray-400' : 'text-[#C3EAE7]'} />
                        <span className={`text-sm font-medium ${request.status.toLowerCase() === 'cancelled' ? 'text-gray-400' : 'text-gray-900'}`}>
                          {request.status.toLowerCase() === 'cancelled' ? '-' : request.total_applicants}
                        </span>
                        {request.total_applicants > 0 && request.status.toLowerCase() !== 'cancelled' && (
                          <div className="text-xs text-gray-500">
                            <div className="max-w-32 truncate">
                              Latest: {request.latest_applicants?.slice(0, 2).map(app => app.locum_name).join(', ') || 'N/A'}
                              {request.total_applicants > 2 && '...'}
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {request.status.toLowerCase() === 'cancelled' ? (
                        <span className="text-sm text-gray-400 opacity-50">-</span>
                      ) : request.current_selection ? (
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">{request.current_selection?.chosen_locum}</div>
                          <div className={`text-xs ${request.current_selection?.status === 'PRACTICE_CONFIRMED' ? 'text-yellow-600' :
                              request.current_selection?.status === 'LOCUM_CONFIRMED' ? 'text-green-600' :
                                request.current_selection?.status === 'LOCUM_REJECTED' ? 'text-red-600' :
                                  'text-gray-600'
                            }`}>
                            {request.current_selection?.status === 'LOCUM_REJECTED' ? 'REJECTED - Can select another' :
                              request.current_selection?.status?.replace('_', ' ')}
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">No selection</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {request.status.toLowerCase() === 'cancelled' ? (
                          <span className="text-sm text-gray-400 opacity-50">-</span>
                        ) : (
                          <>
                            {request.can_select_applicant && request.total_applicants > 0 && (
                              <button
                                onClick={() => handleSelectApplicant(request.request_id)}
                                className="px-3 py-1 bg-[#C3EAE7] text-black text-xs font-medium rounded-md hover:bg-[#A9DBD9] transition-colors"
                              >
                                Select Applicant
                              </button>
                            )}
                            {request.booking_created && (
                              <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-md">
                                Booking Created
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination && pagination.total_pages > 1 && (
            <div className="px-6 py-4 bg-gray-50 border-t flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing page {pagination.page} of {pagination.total_pages}
                ({pagination.total} total requests)
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="px-3 py-1 text-sm border rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                {[...Array(Math.min(5, pagination.total_pages))].map((_, i) => {
                  const page = Math.max(1, currentPage - 2) + i;
                  if (page > pagination.total_pages) return null;
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-1 text-sm border rounded-md ${page === currentPage
                          ? 'bg-[#C3EAE7] border-[#C3EAE7] text-black'
                          : 'hover:bg-gray-100'
                        }`}
                    >
                      {page}
                    </button>
                  );
                })}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= pagination.total_pages}
                  className="px-3 py-1 text-sm border rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {selectedRequestId && (
        <ApplicantsModal
          isOpen={isApplicantsModalOpen}
          onClose={handleCloseApplicantsModal}
          requestId={selectedRequestId}
          onApplicantSelected={handleApplicantSelected}
        />
      )}
    </div>
  );
};

export default AppointmentsTable;