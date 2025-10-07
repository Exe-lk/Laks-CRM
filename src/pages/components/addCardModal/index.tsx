import React, { useState } from 'react';
import { useCreateCardMutation } from '../../../redux/slices/cardPracticeUserSlice';
import Swal from 'sweetalert2';

interface AddCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  practiceId: string;
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

const AddCardModal: React.FC<AddCardModalProps> = ({ 
  isOpen, 
  onClose, 
  practiceId, 
  onSuccess 
}) => {
  const [createCard, { isLoading }] = useCreateCardMutation();
  const [formData, setFormData] = useState<CardFormData>({
    cardHolderName: '',
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    isDefault: false
  });

  const [errors, setErrors] = useState<Partial<CardFormData>>({});

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

    try {
      const result = await createCard({
        practiceId,
        cardHolderName: formData.cardHolderName,
        cardNumber: formData.cardNumber.replace(/\s/g, ''),
        expiryMonth: formData.expiryMonth,
        expiryYear: formData.expiryYear,
        cvv: formData.cvv,
        isDefault: formData.isDefault
      }).unwrap();

      await Swal.fire({
        title: 'Success!',
        text: result.message || 'Card added successfully',
        icon: 'success',
        confirmButtonText: 'OK',
        confirmButtonColor: '#C3EAE7'
      });

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
      console.error('Error creating card:', error);
      console.error('Error details:', {
        status: error?.status,
        data: error?.data,
        message: error?.data?.error
      });
      
      await Swal.fire({
        title: 'Error!',
        text: error?.data?.error || 'Failed to add card. Please try again.',
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

export default AddCardModal;
