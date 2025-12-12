import React, { useState, useEffect } from 'react';
import { useManageBranchCustomerMutation } from '../../../redux/slices/cardPracticerUserBranchSlice';
import Swal from 'sweetalert2';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

interface AddBranchCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  branchId: string;
  branchEmail?: string;
  branchName?: string;
  onSuccess?: () => void;
}

interface CardFormData {
  cardHolderName: string;
  isDefault: boolean;
}

// Stripe publishable key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

// Inner component that uses Stripe hooks
const AddBranchCardForm: React.FC<{
  branchId: string;
  branchEmail?: string;
  branchName?: string;
  onSuccess: () => void;
  onClose: () => void;
}> = ({ branchId, branchEmail, branchName, onSuccess, onClose }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [manageBranchCustomer, { isLoading }] = useManageBranchCustomerMutation();
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CardFormData>({
    cardHolderName: '',
    isDefault: false
  });
  const [cardError, setCardError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const initializeCustomer = async () => {
      if (branchId) {
        try {
          const emailToUse = branchEmail && branchEmail.trim() !== '' 
            ? branchEmail 
            : `branch-${branchId}@example.com`;
          const nameToUse = branchName && branchName.trim() !== '' 
            ? branchName 
            : `Branch ${branchId}`;

          const result = await manageBranchCustomer({
            action: 'create_customer',
            branch_id: branchId,
            email: emailToUse,
            name: nameToUse
          }).unwrap();

          if (result.customer) {
            setCustomerId(result.customer.id);
          }
        } catch (error) {
          console.error('Error initializing customer:', error);
        }
      }
    };

    initializeCustomer();
  }, [branchId, branchEmail, branchName, manageBranchCustomer]);

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

    if (!customerId) {
      setCardError('Customer not initialized. Please try again.');
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

      // Step 1: Create Setup Intent
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

      // Step 2: Get card element and create payment method
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

      // Step 3: Confirm setup intent with payment method
      const { error: confirmError, setupIntent } = await stripe.confirmCardSetup(setupIntentData.client_secret, {
        payment_method: paymentMethod.id,
      });

      if (confirmError || !setupIntent || !setupIntent.payment_method) {
        throw new Error(confirmError?.message || 'Failed to confirm setup intent');
      }

      const paymentMethodId = typeof setupIntent.payment_method === 'string' 
        ? setupIntent.payment_method 
        : setupIntent.payment_method.id;

      // Step 4: Attach payment method to customer
      const result = await manageBranchCustomer({
        action: 'attach_payment_method',
        branch_id: branchId,
        customer_id: customerId!,
        payment_method_id: paymentMethodId,
        set_as_default: formData.isDefault
      }).unwrap();

      Swal.close();

      await Swal.fire({
        title: 'Success!',
        text: 'Payment method added successfully',
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
        text: errorMessage,
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
          disabled={isLoading || isProcessing || !stripe || !customerId}
          className="flex-1 px-4 py-2 bg-[#C3EAE7] text-black rounded-lg hover:bg-[#B8E0DD] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading || isProcessing ? 'Adding...' : 'Add Card'}
        </button>
      </div>
    </form>
  );
};

const AddBranchCardModal: React.FC<AddBranchCardModalProps> = ({ 
  isOpen, 
  onClose, 
  branchId,
  branchEmail,
  branchName,
  onSuccess 
}) => {
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
          <AddBranchCardForm 
            branchId={branchId}
            branchEmail={branchEmail}
            branchName={branchName}
            onSuccess={onSuccess || (() => {})}
            onClose={onClose}
          />
        </Elements>
      </div>
    </div>
  );
};

export default AddBranchCardModal;
