import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import NavBarPracticeUser from '../../components/navBarPracticeUser';
import Footer from '../../components/footer';
import { useGetPracticeCardsQuery } from '../../../redux/slices/cardPracticeUserSlice';
import AddCardModal from '../../components/addCardModal';
import CardList from '../../components/cardList';
import Swal from 'sweetalert2';

const PaymentPage = () => {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false);

  useEffect(() => {
    const profileStr = localStorage.getItem('profile');
    if (profileStr) {
      const parsedProfile = JSON.parse(profileStr);
      setProfile(parsedProfile);
    } else {
      router.push('/practiceUser/practiceLogin');
    }
  }, [router]);

  const { 
    data: cardsData, 
    isLoading: isLoadingCards,
    error: cardsError,
    refetch: refetchCards 
  } = useGetPracticeCardsQuery(profile?.id || '', {
    skip: !profile?.id
  });

  const handleAddCardSuccess = () => {
    refetchCards();
  };

  const handleEditCard = (card: any) => {
    Swal.fire({
      title: 'Edit Card',
      text: 'Card editing functionality will be available soon.',
      icon: 'info',
      confirmButtonText: 'OK',
      confirmButtonColor: '#C3EAE7'
    });
  };

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C3EAE7] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBarPracticeUser />
      
      <div className="max-w-4xl mx-auto px-4 py-8 pt-32">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 pt-24">Payment Methods</h1>
              <p className="text-gray-600">
                Manage your payment cards for booking appointments
              </p>
            </div>
            <button
              onClick={() => setIsAddCardModalOpen(true)}
              className="px-6 py-3 bg-[#C3EAE7] text-black rounded-lg hover:bg-[#B8E0DD] transition-colors font-medium mt-12"
            >
              Add New Card
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          {isLoadingCards ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C3EAE7] mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your payment cards...</p>
            </div>
          ) : cardsError ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load payment cards</h3>
              <p className="text-gray-500 mb-4">There was an error loading your payment methods.</p>
              <button
                onClick={() => refetchCards()}
                className="px-4 py-2 bg-[#C3EAE7] text-black rounded-lg hover:bg-[#B8E0DD] transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : (
            <CardList
              cards={cardsData?.cards || []}
              onEdit={handleEditCard}
              onAddNew={() => setIsAddCardModalOpen(true)}
            />
          )}
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-medium text-blue-900 mb-2">
                Why do I need to add a payment card?
              </h3>
              <p className="text-blue-800 mb-3">
                Adding a payment card is required to book appointments with locum staff. 
                This ensures secure and reliable payment processing for your dental practice needs.
              </p>
              <ul className="text-blue-800 space-y-1">
                <li>• Secure payment processing for appointments</li>
                <li>• Automatic payment for confirmed bookings</li>
                <li>• Easy management of multiple payment methods</li>
                <li>• PCI-compliant card storage and encryption</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-green-800 font-medium">
              Your payment information is secure and encrypted
            </span>
          </div>
        </div>
      </div>

      <AddCardModal
        isOpen={isAddCardModalOpen}
        onClose={() => setIsAddCardModalOpen(false)}
        practiceId={profile.id}
        onSuccess={handleAddCardSuccess}
      />

      <Footer />
    </div>
  );
};

export default PaymentPage;
