import React, { useEffect, useState } from 'react';
import { useGetAllLocumsQuery, useRateLocumMutation } from '@/redux/slices/ratePracticeSlice';
import NavBarPracticeUser from '../../components/navBarPracticeUser';

interface StarRatingProps {
  rating: number;
  onRatingChange: (rating: number) => void;
  disabled?: boolean;
}

const StarRating: React.FC<StarRatingProps> = ({ rating, onRatingChange, disabled = false }) => {
  const [hoveredRating, setHoveredRating] = useState(0);

  return (
    <div className="flex space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`text-2xl transition-colors ${star <= (hoveredRating || rating)
              ? 'text-yellow-400'
              : 'text-gray-300'
            } ${disabled ? 'cursor-not-allowed' : 'hover:text-yellow-400 cursor-pointer'}`}
          onClick={() => !disabled && onRatingChange(star)}
          onMouseEnter={() => !disabled && setHoveredRating(star)}
          onMouseLeave={() => !disabled && setHoveredRating(0)}
          disabled={disabled}
        >
          ★
        </button>
      ))}
    </div>
  );
};

const RatingPage: React.FC = () => {
  const { data: locumsData, error, isLoading, refetch } = useGetAllLocumsQuery();
  const [rateLocum, { isLoading: isRating, error: ratingError }] = useRateLocumMutation();

  const [practiceProfile, setPracticeProfile] = useState<any>(null);
  const [userRatings, setUserRatings] = useState<{ [locumId: string]: number }>({});
  const [ratingInProgress, setRatingInProgress] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const profileStr = localStorage.getItem('profile');
    if (profileStr) {
      try {
        const profile = JSON.parse(profileStr);
        setPracticeProfile(profile);
      } catch (error) {
        console.error('Error parsing profile from localStorage:', error);
        setErrorMessage('Failed to load practice profile. Please log in again.');
      }
    }
  }, []);

  useEffect(() => {
    if (error) {
      setErrorMessage('Failed to load locum staff. Please try again.');
    }
  }, [error]);

  useEffect(() => {
    if (ratingError) {
      const errorMsg = (ratingError as any)?.data?.message || 'Failed to submit rating. Please try again.';
      setErrorMessage(errorMsg);
    }
  }, [ratingError]);

  useEffect(() => {
    if (successMessage || errorMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
        setErrorMessage('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, errorMessage]);

  const handleRateLocum = async (locumId: string, rating: number) => {
    if (!practiceProfile?.id) {
      setErrorMessage('Practice profile not found. Please log in again.');
      return;
    }

    setRatingInProgress(locumId);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const result = await rateLocum({
        locumId,
        practiceId: practiceProfile.id,
        rating
      }).unwrap();

      setUserRatings(prev => ({
        ...prev,
        [locumId]: rating
      }));

      setSuccessMessage(`Rating submitted successfully! ${result.message}`);
    } catch (error: any) {
      console.error('Rating error:', error);
      setErrorMessage(error?.data?.message || 'Failed to submit rating. Please try again.');
    } finally {
      setRatingInProgress(null);
    }
  };

  const handleRetry = () => {
    setErrorMessage('');
    refetch();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading locum staff...</p>
        </div>
      </div>
    );
  }

  const locums = (locumsData?.data || []).filter(locum => locum.role?.toLowerCase() !== 'admin');

  return (
    <div className="container mx-auto px-4 py-8 pt-32">
      <NavBarPracticeUser />
      {isLoading && (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading locum staff...</p>
        </div>
      </div>
    )}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Rate Locum Staff</h1>
        <p className="text-gray-600">
          Share your experience working with our locum professionals
        </p>
      </div>

      {errorMessage && (
        <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <div className="flex justify-between items-center">
            <span>{errorMessage}</span>
            <div className="flex space-x-2">
              {error && (
                <button
                  onClick={handleRetry}
                  className="text-red-700 hover:text-red-900 underline text-sm"
                >
                  Retry
                </button>
              )}
              <button
                onClick={() => setErrorMessage('')}
                className="text-red-700 hover:text-red-900 text-lg leading-none"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          <div className="flex justify-between items-center">
            <span>{successMessage}</span>
            <button
              onClick={() => setSuccessMessage('')}
              className="text-green-700 hover:text-green-900 text-lg leading-none"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {locums.length === 0 && !isLoading ? (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-4">
            No locum staff available for rating at the moment.
          </div>
          <button
            onClick={handleRetry}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Refresh
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Locum Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Specialties
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Rating
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Your Rating
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {locums.map((locum) => (
                  <tr key={locum.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <div className="text-lg font-semibold text-gray-900">
                          {locum.fullName}
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div><span className="font-medium">Role:</span> {locum.role}</div>
                          <div><span className="font-medium">Type:</span> {locum.employeeType}</div>
                          <div><span className="font-medium">Location:</span> {locum.location}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {locum.specialties && locum.specialties.length > 0 ? (
                          <div className="space-y-1">
                            {locum.specialties.map((specialty, index) => (
                              <div key={index} className="flex flex-col">
                                <span className="font-medium">{specialty.speciality}</span>
                                <span className="text-gray-500 text-xs">
                                  {specialty.numberOfYears} years experience
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-500">No specialties listed</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {locum.averageRating ? (
                          <>
                            <span className="text-yellow-500 text-lg">★</span>
                            <div className="flex flex-col">
                              <span className="font-semibold text-gray-900">
                                {locum.averageRating.toFixed(1)}
                              </span>
                              <span className="text-gray-500 text-xs">
                                {locum.totalRatings} review{locum.totalRatings !== 1 ? 's' : ''}
                              </span>
                            </div>
                          </>
                        ) : (
                          <span className="text-gray-500">No ratings yet</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col space-y-2">
                        <StarRating
                          rating={userRatings[locum.id] || 0}
                          onRatingChange={(rating) => handleRateLocum(locum.id, rating)}
                          disabled={ratingInProgress === locum.id || isRating}
                        />
                        {userRatings[locum.id] && ratingInProgress !== locum.id && (
                          <span className="text-green-600 text-xs font-medium">
                            Rated {userRatings[locum.id]} star{userRatings[locum.id] !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {ratingInProgress === locum.id && (
                        <div className="flex items-center text-blue-600 text-sm">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                          <span className="text-xs">Submitting...</span>
                        </div>
                      )}
                      {userRatings[locum.id] && ratingInProgress !== locum.id && (
                        <div className="flex items-center text-green-600">
                          <span className="text-sm">✓</span>
                          <span className="text-xs ml-1">Submitted</span>
                        </div>
                      )}
                      {!userRatings[locum.id] && ratingInProgress !== locum.id && (
                        <span className="text-gray-400 text-xs">Not rated</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isRating && (
        <div className="text-center mt-8">
          <div className="inline-flex items-center text-blue-600">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-2"></div>
            Processing rating...
          </div>
        </div>
      )}
    </div>
  );
};

export default RatingPage;
