import React, { useState } from 'react';
import { FiX, FiUser, FiMapPin, FiPhone, FiMail, FiClock, FiCheck, FiLoader, FiStar, FiFilter } from 'react-icons/fi';
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
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [hoveredFilter, setHoveredFilter] = useState<string | null>(null);
  
  const { 
    data: applicantsData, 
    isLoading: loading, 
    error: fetchError,
    refetch 
  } = useGetApplicantsQuery(
    { request_id: requestId },
    { skip: !isOpen || !requestId }
  );
  console.log(applicantsData)
  
  const [selectApplicant] = useSelectApplicantMutation();

  const applicants = applicantsData?.data?.applicants || [];
  const jobDetails = applicantsData?.data?.job || null;
  const canSelectApplicant = applicantsData?.data?.can_select_applicant || false;

  // Function to calculate distance between two coordinates (in kilometers)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Parse coordinates from address string (format: "lat,lon")
  const parseCoordinates = (address: string): { lat: number; lon: number } | null => {
    try {
      const parts = address.split(',');
      if (parts.length === 2) {
        const lat = parseFloat(parts[0].trim());
        const lon = parseFloat(parts[1].trim());
        if (!isNaN(lat) && !isNaN(lon)) {
          return { lat, lon };
        }
      }
    } catch (error) {
      console.error('Error parsing coordinates:', error);
    }
    return null;
  };

  // Sort applicants by rating (highest first) and then by distance (closest first)
  const sortedApplicants = [...applicants].sort((a, b) => {
    // First sort by rating (highest to lowest)
    const ratingA = a.locumProfile.averageRating || 0;
    const ratingB = b.locumProfile.averageRating || 0;
    
    if (ratingA !== ratingB) {
      return ratingB - ratingA; // Higher rating first
    }
    
    // If ratings are equal, sort by distance (closest first)
    if (jobDetails?.practice?.address && a.locumProfile.address && b.locumProfile.address) {
      const practiceCoords = parseCoordinates(jobDetails.practice.address);
      const locumCoordsA = parseCoordinates(a.locumProfile.address);
      const locumCoordsB = parseCoordinates(b.locumProfile.address);
      
      if (practiceCoords && locumCoordsA && locumCoordsB) {
        const distanceA = calculateDistance(
          practiceCoords.lat, practiceCoords.lon,
          locumCoordsA.lat, locumCoordsA.lon
        );
        const distanceB = calculateDistance(
          practiceCoords.lat, practiceCoords.lon,
          locumCoordsB.lat, locumCoordsB.lon
        );
        return distanceA - distanceB; // Closer distance first
      }
    }
    
    return 0; // Keep original order if no distance data
  });

  const filteredApplicants = ratingFilter === null 
    ? sortedApplicants 
    : sortedApplicants.filter(applicant => {
        const rating = applicant.locumProfile.averageRating || 0;
        return rating >= ratingFilter;
      });

  const getFilterTooltip = (rating: number | null) => {
    if (rating === null) {
      return `Show all applicants regardless of rating (${applicants.length} total)`;
    }
    const count = applicants.filter(applicant => (applicant.locumProfile.averageRating || 0) >= rating).length;
    return `Show only applicants with ${rating}+ star rating (${count} match${count !== 1 ? 'es' : ''})`;
  };

  const renderStarRating = (rating: number | undefined) => {
    if (rating === undefined || rating === null) {
      return (
        <div className="flex items-center gap-1 text-gray-400">
          <FiStar className="text-sm" />
          <span className="text-xs">No rating</span>
        </div>
      );
    }

    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <FiStar key={i} className="text-yellow-400 fill-current text-sm" />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <div key={i} className="relative">
            <FiStar className="text-gray-300 text-sm" />
            <div className="absolute inset-0 overflow-hidden w-1/2">
              <FiStar className="text-yellow-400 fill-current text-sm" />
            </div>
          </div>
        );
      } else {
        stars.push(
          <FiStar key={i} className="text-gray-300 text-sm" />
        );
      }
    }

    return (
      <div className="flex items-center gap-1">
        <div className="flex">{stars}</div>
        <span className="text-xs text-gray-600 ml-1">({rating.toFixed(1)})</span>
      </div>
    );
  };

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
    if (filteredApplicants.length === 1 && canSelectApplicant && !selectingApplicant && !hasShownAutoSelect && isOpen && ratingFilter === null) {
      const singleApplicant = filteredApplicants[0];
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
  }, [filteredApplicants, canSelectApplicant, selectingApplicant, hasShownAutoSelect, isOpen, ratingFilter]);

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

  const getDistanceText = (applicant: Applicant) => {
    // Debug information - showing actual addresses
    const practiceAddr = jobDetails?.practice?.location;
    const locumAddr = applicant.locumProfile.address;
    
    if (!practiceAddr) {
      return `Practice address missing`;
    }
    
    if (!locumAddr) {
      return `Locum address missing`;
    }
    
    const practiceCoords = parseCoordinates(practiceAddr);
    const locumCoords = parseCoordinates(locumAddr);
    
    if (!practiceCoords) {
      return `Practice coords invalid: "${practiceAddr}"`;
    }
    
    if (!locumCoords) {
      return `Locum coords invalid: "${locumAddr}"`;
    }
    
    const distance = calculateDistance(
      practiceCoords.lat, practiceCoords.lon,
      locumCoords.lat, locumCoords.lon
    );
    return `${distance.toFixed(1)} km away`;
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
                  {filteredApplicants.length} of {applicants.length} Applicant{applicants.length !== 1 ? 's' : ''}
                  {ratingFilter && ` (${ratingFilter}+ stars)`}
                  <span className="text-sm font-normal text-gray-600 block">Sorted by rating (highest first) and distance (closest first)</span>
                </h3>
                <div className="flex gap-2 items-center">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm font-medium"
                  >
                    <FiFilter className="text-sm" />
                    Filters
                  </button>
                  {filteredApplicants.length === 1 && canSelectApplicant && ratingFilter === null && (
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

              {showFilters && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Filter by Minimum Rating</h4>
                  <p className="text-xs text-gray-500 mb-3">Applicants are automatically sorted by rating (5★ to 1★) and then by distance (closest first)</p>
                  <div className="flex gap-2 flex-wrap relative">
                    <div className="relative">
                      <button
                        onClick={() => setRatingFilter(null)}
                        onMouseEnter={() => setHoveredFilter('all')}
                        onMouseLeave={() => setHoveredFilter(null)}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                          ratingFilter === null
                            ? 'bg-[#C3EAE7] text-black'
                            : 'bg-white text-gray-600 hover:bg-gray-100 border'
                        }`}
                      >
                        All Ratings
                      </button>
                      {hoveredFilter === 'all' && (
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg shadow-lg whitespace-nowrap z-10">
                          {getFilterTooltip(null)}
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                        </div>
                      )}
                    </div>
                    {[5, 4, 3, 2, 1].map((rating) => (
                      <div key={rating} className="relative">
                        <button
                          onClick={() => setRatingFilter(rating)}
                          onMouseEnter={() => setHoveredFilter(rating.toString())}
                          onMouseLeave={() => setHoveredFilter(null)}
                          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors flex items-center gap-1 ${
                            ratingFilter === rating
                              ? 'bg-[#C3EAE7] text-black'
                              : 'bg-white text-gray-600 hover:bg-gray-100 border'
                          }`}
                        >
                          <FiStar className="text-yellow-400 fill-current" />
                          {rating}+
                        </button>
                        {hoveredFilter === rating.toString() && (
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg shadow-lg whitespace-nowrap z-10">
                            {getFilterTooltip(rating)}
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {filteredApplicants.length === 0 && ratingFilter !== null ? (
                <div className="text-center py-12">
                  <FiStar className="text-6xl text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-500 mb-2">No Applicants Match Filter</h3>
                  <p className="text-gray-400">No applicants have a rating of {ratingFilter}+ stars.</p>
                  <button
                    onClick={() => setRatingFilter(null)}
                    className="mt-4 px-4 py-2 bg-[#C3EAE7] text-black rounded-lg hover:bg-[#A9DBD9] transition-colors"
                  >
                    Clear Filter
                  </button>
                </div>
              ) : null}

              {filteredApplicants.map((applicant) => (
                <div
                  key={applicant.response_id}
                  className={`rounded-lg p-6 border transition-shadow ${
                    filteredApplicants.length === 1 && canSelectApplicant && ratingFilter === null
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
                          <p className="text-sm text-gray-600 mb-1">
                            {applicant.locumProfile.employeeType}
                          </p>
                          {renderStarRating(applicant.locumProfile.averageRating)}
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
                        <div className="flex items-center gap-2 text-sm text-gray-600 col-span-1 md:col-span-2">
                          <FiMapPin className="text-green-500" />
                          <span className="font-medium text-green-600">{getDistanceText(applicant)}</span>
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