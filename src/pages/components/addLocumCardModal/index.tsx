import React, { useState } from 'react';
import { useCreateCardMutation, useGetLocumCardsQuery } from '../../../redux/slices/locumCardSlice';
import Swal from 'sweetalert2';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

interface AddLocumCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  locumId: string;
  locumEmail?: string;
  locumName?: string;
  onSuccess?: () => void;
}

interface CardFormData {
  cardHolderName: string;
  isDefault: boolean;
}

// Stripe publishable key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

// Inner component that uses Stripe hooks
const AddLocumCardForm: React.FC<{
  locumId: string;
  locumEmail?: string;
  locumName?: string;
  onSuccess: () => void;
  onClose: () => void;
  existingCards?: any[];
}> = ({ locumId, locumEmail, locumName, onSuccess, onClose, existingCards = [] }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [createCard, { isLoading }] = useCreateCardMutation();
  const [formData, setFormData] = useState<CardFormData>({
    cardHolderName: '',
    isDefault: existingCards.length === 0 // Set as default if no cards exist
  });
  const [cardError, setCardError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const validateForm = (): boolean => {
    if (!formData.cardHolderName.trim()) {
      setCardError('Card holder name is required');
      return false;
    }

    const cardElement = elements?.getElement(CardElement);
    if (!cardElement) {
      setCardError('Card element not loaded');
      return false;
    }

    setCardError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      setCardError('Stripe not initialized');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsProcessing(true);
    setCardError(null);

    try {
      Swal.fire({
        title: 'Adding Card...',
        html: 'Please wait while we securely process your payment method',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      // Step 1: Get customer ID
      const customerResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || ''}/api/locum-card/customer-management`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'create_customer',
          locum_id: locumId,
          email: locumEmail,
          name: locumName
        })
      });

      const customerData = await customerResponse.json();
      const customerId = customerData.customer?.id;

      if (!customerId) {
        throw new Error('Failed to get customer ID');
      }

      // Step 2: Create Setup Intent
      const setupIntentResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || ''}/api/payments/create-setup-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          customer_id: customerId
        })
      });

      const setupIntentData = await setupIntentResponse.json();
      
      if (!setupIntentResponse.ok || !setupIntentData.client_secret) {
        throw new Error(setupIntentData.details || setupIntentData.error || 'Failed to create setup intent');
      }

      // Step 3: Get card element and create payment method
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      // Create payment method from card element
      const { error: pmError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          name: formData.cardHolderName,
        },
      });

      if (pmError || !paymentMethod) {
        throw new Error(pmError?.message || 'Failed to create payment method');
      }

      // Check for duplicate card (same last4 digits)
      const newCardLast4 = paymentMethod.card?.last4;
      if (newCardLast4 && existingCards.length > 0) {
        const duplicateCard = existingCards.find((card: any) => {
          const cardLast4 = card.card?.last4 || card.lastFourDigits;
          return cardLast4 === newCardLast4;
        });
        
        if (duplicateCard) {
          throw new Error(`This card ending in ${newCardLast4} is already added to your account.`);
        }
      }

      // Step 4: Confirm setup intent with payment method
      const { error: confirmError, setupIntent } = await stripe.confirmCardSetup(setupIntentData.client_secret, {
        payment_method: paymentMethod.id,
      });

      if (confirmError || !setupIntent || !setupIntent.payment_method) {
        throw new Error(confirmError?.message || 'Failed to confirm setup intent');
      }

      const paymentMethodId = typeof setupIntent.payment_method === 'string' 
        ? setupIntent.payment_method 
        : setupIntent.payment_method.id;

      // Step 5: Attach payment method to customer via Redux
      const result = await createCard({
        locumId,
        paymentMethodId: paymentMethodId,
        isDefault: formData.isDefault,
        email: locumEmail,
        name: locumName
      }).unwrap();

      Swal.close();

      await Swal.fire({
        title: 'Success!',
        text: result.message || 'Payment method added successfully',
        icon: 'success',
        confirmButtonText: 'OK',
        confirmButtonColor: '#C3EAE7'
      });

      setFormData({
        cardHolderName: '',
        isDefault: false
      });
      setCardError(null);

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error adding payment method:', error);
      Swal.close();
      
      const errorMessage = error?.data?.error || error?.message || 'Failed to add payment method. Please try again.';
      setCardError(errorMessage);
      
      await Swal.fire({
        title: 'Error!',
        html: `
          <p>${errorMessage}</p>
          ${error?.data?.details ? `<p class="text-sm text-gray-600 mt-2">${error.data.details}</p>` : ''}
        `,
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#C3EAE7'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
        fontFamily: 'system-ui, sans-serif',
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };

  return (
    <form onSubmit={handleSubmit} className="px-6 py-6 space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Card Holder Name *
        </label>
        <input
          type="text"
          value={formData.cardHolderName}
          onChange={(e) => {
            setFormData(prev => ({ ...prev, cardHolderName: e.target.value }));
            setCardError(null);
          }}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C3EAE7] ${
            cardError && !formData.cardHolderName.trim() ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Enter card holder name"
        />
        {cardError && !formData.cardHolderName.trim() && (
          <p className="text-red-500 text-xs mt-1">{cardError}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Card Details *
        </label>
        <div className="px-3 py-3 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-[#C3EAE7]">
          <CardElement options={cardElementOptions} />
        </div>
        {cardError && formData.cardHolderName.trim() && (
          <p className="text-red-500 text-xs mt-1">{cardError}</p>
        )}
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="isDefault"
          checked={formData.isDefault}
          onChange={(e) => setFormData(prev => ({ ...prev, isDefault: e.target.checked }))}
          className="w-4 h-4 text-[#C3EAE7] border-gray-300 rounded focus:ring-[#C3EAE7]"
        />
        <label htmlFor="isDefault" className="ml-2 text-sm text-gray-700">
          Set as default payment method
        </label>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading || isProcessing || !stripe}
          className="flex-1 px-4 py-2 bg-[#C3EAE7] text-black rounded-lg hover:bg-[#B8E0DD] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading || isProcessing ? 'Adding...' : 'Add Card'}
        </button>
      </div>
    </form>
  );
};

const AddLocumCardModal: React.FC<AddLocumCardModalProps> = ({ 
  isOpen, 
  onClose, 
  locumId,
  locumEmail,
  locumName,
  onSuccess 
}) => {
  const { data: cardsData } = useGetLocumCardsQuery(locumId, { skip: !isOpen || !locumId });
  const existingCards = cardsData?.cards || [];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="bg-[#C3EAE7] px-6 py-4 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-black">Add Payment Card</h2>
            <button
              onClick={onClose}
              className="text-gray-600 hover:text-gray-800 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <Elements stripe={stripePromise}>
          <AddLocumCardForm 
            locumId={locumId}
            locumEmail={locumEmail}
            locumName={locumName}
            onSuccess={onSuccess || (() => {})}
            onClose={onClose}
            existingCards={existingCards}
          />
        </Elements>
      </div>
    </div>
  );
};

export default AddLocumCardModal;
