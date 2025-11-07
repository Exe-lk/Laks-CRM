import React, { useState, useEffect } from 'react';
import { useManageBranchCustomerMutation } from '../../../redux/slices/cardPracticerUserBranchSlice';
import Swal from 'sweetalert2';

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
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  isDefault: boolean;
}

const AddBranchCardModal: React.FC<AddBranchCardModalProps> = ({ 
  isOpen, 
  onClose, 
  branchId,
  branchEmail,
  branchName,
  onSuccess 
}) => {
  const [manageBranchCustomer, { isLoading }] = useManageBranchCustomerMutation();
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CardFormData>({
    cardHolderName: '',
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    isDefault: false
  });

  const [errors, setErrors] = useState<Partial<CardFormData>>({});

  // Create or get customer on mount
  useEffect(() => {
    const initializeCustomer = async () => {
      if (isOpen && branchId) {
        try {
          // Ensure email and name are always provided (not undefined)
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
          console.log(result)

          if (result.customer) {
            setCustomerId(result.customer.id);
          }
        } catch (error) {
          console.error('Error initializing customer:', error);
        }
      }
    };

    initializeCustomer();
  }, [isOpen, branchId, branchEmail, branchName, manageBranchCustomer]);

  const validateForm = (): boolean => {
    const newErrors: Partial<CardFormData> = {};

    if (!formData.cardHolderName.trim()) {
      newErrors.cardHolderName = 'Card holder name is required';
    }

    if (!formData.cardNumber.trim()) {
      newErrors.cardNumber = 'Card number is required';
    } else if (formData.cardNumber.replace(/\s/g, '').length < 13) {
      newErrors.cardNumber = 'Card number must be at least 13 digits';
    }

    if (!formData.expiryMonth) {
      newErrors.expiryMonth = 'Expiry month is required';
    }

    if (!formData.expiryYear) {
      newErrors.expiryYear = 'Expiry year is required';
    }

    if (!formData.cvv.trim()) {
      newErrors.cvv = 'CVV is required';
    } else if (formData.cvv.length < 3) {
      newErrors.cvv = 'CVV must be at least 3 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatCardNumber = (value: string): string => {
    // Remove all spaces and non-digit characters
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    
    // Limit to 19 digits (maximum card number length)
    const truncated = v.substring(0, 19);
    
    // Split into groups of 4 digits
    const parts = [];
    for (let i = 0, len = truncated.length; i < len; i += 4) {
      parts.push(truncated.substring(i, i + 4));
    }
    
    return parts.length ? parts.join(' ') : v;
  };

  const handleInputChange = (field: keyof CardFormData, value: string | boolean) => {
    if (field === 'cardNumber') {
      const formattedValue = formatCardNumber(value as string);
      setFormData(prev => ({ ...prev, [field]: formattedValue }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!customerId) {
      await Swal.fire({
        title: 'Error!',
        text: 'Customer not initialized. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#C3EAE7'
      });
      return;
    }

    try {
      // Show loading
      Swal.fire({
        title: 'Adding Card...',
        html: 'Please wait while we add your payment method',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      // In production, you would use Stripe.js to create a payment method
      // For development/testing, we'll use Stripe's test payment method
      // Test card: pm_card_visa or create via API
      
      // Create a test payment method using the card details
      // Using a test payment method ID (in production, this would come from Stripe.js)
      const testPaymentMethodId = 'pm_card_visa'; // Stripe's test payment method

      // Attach the payment method to the customer
      console.log('Attaching payment method with:', {
        action: 'attach_payment_method',
        branch_id: branchId,
        customer_id: customerId,
        payment_method_id: testPaymentMethodId
      });

      const result = await manageBranchCustomer({
        action: 'attach_payment_method',
        branch_id: branchId,
        customer_id: customerId,
        payment_method_id: testPaymentMethodId
      }).unwrap();

      console.log('Payment method attached successfully:', result);

      // Success!
      await Swal.fire({
        title: 'Success!',
        text: 'Payment method added successfully',
        icon: 'success',
        confirmButtonText: 'OK',
        confirmButtonColor: '#C3EAE7'
      });

      // Reset form
      setFormData({
        cardHolderName: '',
        cardNumber: '',
        expiryMonth: '',
        expiryYear: '',
        cvv: '',
        isDefault: false
      });
      setErrors({});

      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error('Error adding payment method:', error);
      console.error('Error details:', {
        data: error?.data,
        status: error?.status,
        message: error?.message
      });
      
      Swal.close();
      
      await Swal.fire({
        title: 'Error!',
        html: `
          <p>${error?.data?.error || 'Failed to add payment method. Please try again.'}</p>
          ${error?.data?.details ? `<p class="text-sm text-gray-600 mt-2">${error.data.details}</p>` : ''}
        `,
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#C3EAE7'
      });
    }
  };

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

        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Card Holder Name *
            </label>
            <input
              type="text"
              value={formData.cardHolderName}
              onChange={(e) => handleInputChange('cardHolderName', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C3EAE7] ${
                errors.cardHolderName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter card holder name"
            />
            {errors.cardHolderName && (
              <p className="text-red-500 text-xs mt-1">{errors.cardHolderName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Card Number *
            </label>
            <input
              type="text"
              value={formData.cardNumber}
              onChange={(e) => handleInputChange('cardNumber', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C3EAE7] ${
                errors.cardNumber ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="1234 5678 9012 3456"
              maxLength={23}
            />
            {errors.cardNumber && (
              <p className="text-red-500 text-xs mt-1">{errors.cardNumber}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Month *
              </label>
              <select
                value={formData.expiryMonth}
                onChange={(e) => handleInputChange('expiryMonth', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C3EAE7] ${
                  errors.expiryMonth ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select Month</option>
                {Array.from({ length: 12 }, (_, i) => {
                  const month = (i + 1).toString().padStart(2, '0');
                  return (
                    <option key={month} value={month}>
                      {month}
                    </option>
                  );
                })}
              </select>
              {errors.expiryMonth && (
                <p className="text-red-500 text-xs mt-1">{errors.expiryMonth}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Year *
              </label>
              <select
                value={formData.expiryYear}
                onChange={(e) => handleInputChange('expiryYear', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C3EAE7] ${
                  errors.expiryYear ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select Year</option>
                {Array.from({ length: 10 }, (_, i) => {
                  const year = (new Date().getFullYear() + i).toString();
                  return (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  );
                })}
              </select>
              {errors.expiryYear && (
                <p className="text-red-500 text-xs mt-1">{errors.expiryYear}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CVV *
            </label>
            <input
              type="text"
              value={formData.cvv}
              onChange={(e) => handleInputChange('cvv', e.target.value.replace(/\D/g, ''))}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C3EAE7] ${
                errors.cvv ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="123"
              maxLength={4}
            />
            {errors.cvv && (
              <p className="text-red-500 text-xs mt-1">{errors.cvv}</p>
            )}
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isDefault"
              checked={formData.isDefault}
              onChange={(e) => handleInputChange('isDefault', e.target.checked)}
              className="h-4 w-4 text-[#C3EAE7] focus:ring-[#C3EAE7] border-gray-300 rounded"
            />
            <label htmlFor="isDefault" className="ml-2 block text-sm text-gray-700">
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
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-[#C3EAE7] text-black rounded-lg hover:bg-[#B8E0DD] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Adding...' : 'Add Card'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBranchCardModal;

