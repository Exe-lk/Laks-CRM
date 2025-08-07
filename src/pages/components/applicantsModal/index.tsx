import React, { useState } from 'react';
import { FiX, FiUser, FiMapPin, FiPhone, FiMail, FiClock, FiCheck, FiLoader } from 'react-icons/fi';
import Swal from 'sweetalert2';
import { useGetApplicantsQuery, useSelectApplicantMutation, Applicant, JobDetails } from '@/redux/slices/appointmentPracticeSlice';



interface ApplicantsModalProps {
  isOpen: boolean;
  onClose: () => void;
  requestId: string;
  onApplicantSelected: () => void;
}

const ApplicantsModal: React.FC<ApplicantsModalProps> = ({
  isOpen,
  onClose,
  requestId,
  onApplicantSelected
}) => {
  const [selectingApplicant, setSelectingApplicant] = useState<string | null>(null);
  const [hasShownAutoSelect, setHasShownAutoSelect] = useState(false);
  
  const { 
    data: applicantsData, 
    isLoading: loading, 
    error: fetchError,
    refetch 
  } = useGetApplicantsQuery(
    { request_id: requestId },
    { skip: !isOpen || !requestId }
  );
  
  const [selectApplicant] = useSelectApplicantMutation();

  const applicants = applicantsData?.data?.applicants || [];
  const jobDetails = applicantsData?.data?.job || null;
  const canSelectApplicant = applicantsData?.data?.can_select_applicant || false;

  React.useEffect(() => {
    if (fetchError) {
      console.error('Error fetching applicants:', fetchError);
      Swal.fire({
        title: 'Error!',
        text: 'error' in fetchError ? fetchError.error : 'Failed to fetch applicants',
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#EF4444'
      });
    }
  }, [fetchError]);

  React.useEffect(() => {
    if (applicants.length === 1 && canSelectApplicant && !selectingApplicant && !hasShownAutoSelect && isOpen) {
      const singleApplicant = applicants[0];
      setHasShownAutoSelect(true);
      
      Swal.fire({
        title: 'Auto-Selection',
        text: `There is only one applicant available: ${singleApplicant.locumProfile.fullName}. Would you like to select them automatically?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#C3EAE7',
        cancelButtonColor: '#EF4444',
        confirmButtonText: 'Yes, Auto-Select',
        cancelButtonText: 'Let me choose manually'
      }).then((result) => {
        if (result.isConfirmed) {
          handleSelectApplicant(singleApplicant.locumProfile.id, singleApplicant.locumProfile.fullName);
        }
      });
    }
  }, [applicants, canSelectApplicant, selectingApplicant, hasShownAutoSelect, isOpen]);

  React.useEffect(() => {
    if (!isOpen) {
      setHasShownAutoSelect(false);
    }
  }, [isOpen]);

  const handleSelectApplicant = async (locumId: string, applicantName: string) => {
    try {
      const result = await Swal.fire({
        title: 'Confirm Selection',
        text: `Are you sure you want to select ${applicantName} for this appointment?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#C3EAE7',
        cancelButtonColor: '#EF4444',
        confirmButtonText: 'Yes, Select',
        cancelButtonText: 'Cancel'
      });

      if (!result.isConfirmed) return;

      setSelectingApplicant(locumId);

      const response = await selectApplicant({
        request_id: requestId,
        locum_id: locumId
      }).unwrap();

      await Swal.fire({
        title: 'Success!',
        text: response.message,
        icon: 'success',
        confirmButtonText: 'OK',
        confirmButtonColor: '#C3EAE7'
      });
      
      onApplicantSelected();
      onClose();
    } catch (error: any) {
      console.error('Error selecting applicant:', error);
      await Swal.fire({
        title: 'Error!',
        text: error.data?.error || error.message || 'Failed to select applicant',
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#EF4444'
      });
    } finally {
      setSelectingApplicant(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`1970-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatResponseTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-[#C3EAE7] to-[#A9DBD9] border-b flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Applicants for Appointment</h2>
            {jobDetails && (
              <p className="text-gray-600 mt-1">
                {formatDate(jobDetails.request_date)} • {formatTime(jobDetails.request_start_time)} - {formatTime(jobDetails.request_end_time)} • {jobDetails.location}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
          >
            <FiX className="text-2xl text-gray-700" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <FiLoader className="animate-spin text-4xl text-[#C3EAE7]" />
              <span className="ml-3 text-lg text-gray-600">Loading applicants...</span>
            </div>
          ) : applicants.length === 0 ? (
            <div className="text-center py-12">
              <FiUser className="text-6xl text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-500 mb-2">No Applicants Yet</h3>
              <p className="text-gray-400">No locums have applied for this appointment yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-800">
                  {applicants.length} Applicant{applicants.length !== 1 ? 's' : ''}
                </h3>
                <div className="flex gap-2">
                  {applicants.length === 1 && canSelectApplicant && (
                    <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                      <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
                      Auto-selection available
                    </div>
                  )}
                  {!canSelectApplicant && (
                    <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                      Selection not available
                    </div>
                  )}
                </div>
              </div>

              {applicants.map((applicant) => (
                <div
                  key={applicant.response_id}
                  className={`rounded-lg p-6 border transition-shadow ${
                    applicants.length === 1 && canSelectApplicant
                      ? 'bg-blue-50 border-blue-200 hover:shadow-lg border-2'
                      : 'bg-gray-50 border-gray-200 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 bg-[#C3EAE7] rounded-full flex items-center justify-center">
                          <FiUser className="text-xl text-gray-700" />
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">
                            {applicant.locumProfile.fullName}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {applicant.locumProfile.employeeType}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <FiMapPin className="text-[#C3EAE7]" />
                          {applicant.locumProfile.location}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <FiPhone className="text-[#C3EAE7]" />
                          {applicant.locumProfile.contactNumber}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <FiMail className="text-[#C3EAE7]" />
                          {applicant.locumProfile.emailAddress}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <FiClock className="text-[#C3EAE7]" />
                          Applied: {formatResponseTime(applicant.responded_at)}
                        </div>
                      </div>

                      {applicant.locumProfile.specialties && applicant.locumProfile.specialties.length > 0 && (
                        <div className="mb-4">
                          <h5 className="text-sm font-semibold text-gray-700 mb-2">Specialties:</h5>
                          <div className="flex flex-wrap gap-2">
                            {applicant.locumProfile.specialties.map((specialty, index) => (
                              <span
                                key={index}
                                className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium"
                              >
                                {specialty.speciality} ({specialty.numberOfYears} years)
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {canSelectApplicant && (
                      <div className="ml-4">
                        <button
                          onClick={() => handleSelectApplicant(applicant.locumProfile.id, applicant.locumProfile.fullName)}
                          disabled={selectingApplicant === applicant.locumProfile.id}
                          className="px-4 py-2 bg-[#C3EAE7] text-black font-medium rounded-lg hover:bg-[#A9DBD9] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          {selectingApplicant === applicant.locumProfile.id ? (
                            <>
                              <FiLoader className="animate-spin" />
                              Selecting...
                            </>
                          ) : (
                            <>
                              <FiCheck />
                              Select
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicantsModal;