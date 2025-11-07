import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import NavBarPracticeUser from '../../components/branchNavBar';
import Footer from '../../components/footer';
import { useGetBranchPaymentMethodsQuery } from '../../../redux/slices/cardPracticerUserBranchSlice';
import AddBranchCardModal from '../../components/addBranchCardModal';
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
    data: paymentMethodsData, 
    isLoading: isLoadingCards, 
    refetch: refetchCards 
  } = useGetBranchPaymentMethodsQuery(profile?.id || '', {
    skip: !profile?.id
  });
  console.log(paymentMethodsData)

  const handleAddCardSuccess = () => {
    refetchCards();
  };

  const handleDeleteCard = async (paymentMethodId: string) => {
    const result = await Swal.fire({
      title: 'Delete Payment Method?',
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280'
    });

    if (result.isConfirmed) {
      Swal.fire({
        title: 'Deleted!',
        text: 'Payment method deletion would be processed in production.',
        icon: 'success',
        confirmButtonColor: '#C3EAE7'
      });
      refetchCards();
    }
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
              <p className="text-gray-600">Loading your payment methods...</p>
            </div>
          ) : paymentMethodsData?.data && paymentMethodsData.data.length > 0 ? (
            <div className="space-y-4">
              {paymentMethodsData.data.map((method) => (
                <div key={method.id} className="border border-gray-200 rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-8 bg-gradient-to-r from-[#C3EAE7] to-[#A9DBD9] rounded flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 capitalize">
                        {method.card.brand} •••• {method.card.last4}
                      </p>
                      <p className="text-sm text-gray-500">
                        Expires {method.card.exp_month}/{method.card.exp_year}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteCard(method.id)}
                    className="text-red-600 hover:text-red-800 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <p className="text-gray-600 mb-4">No payment methods added yet</p>
              <button
                onClick={() => setIsAddCardModalOpen(true)}
                className="px-6 py-2 bg-[#C3EAE7] text-black rounded-lg hover:bg-[#B8E0DD] transition-colors font-medium"
              >
                Add Your First Card
              </button>
            </div>
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

      <AddBranchCardModal
        isOpen={isAddCardModalOpen}
        onClose={() => setIsAddCardModalOpen(false)}
        branchId={profile?.id}
        branchEmail={profile?.email}
        branchName={profile?.name}
        onSuccess={handleAddCardSuccess}
      />

      <Footer />
    </div>
  );
};

export default PaymentPage;
