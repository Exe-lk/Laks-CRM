import React from 'react';
import { PaymentCard } from '../../../redux/slices/cardPracticeUserSlice';
import { useDeleteCardMutation } from '../../../redux/slices/cardPracticeUserSlice';
import Swal from 'sweetalert2';

interface CardListProps {
  cards: PaymentCard[];
  onEdit?: (card: PaymentCard) => void;
  onAddNew?: () => void;
}

const CardList: React.FC<CardListProps> = ({ cards = [], onEdit, onAddNew }) => {
  const [deleteCard, { isLoading: isDeleting }] = useDeleteCardMutation();

  const handleDeleteCard = async (cardId: string, cardNumber: string) => {
    const result = await Swal.fire({
      title: 'Delete Card',
      text: `Are you sure you want to delete card ending in ${cardNumber}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#C3EAE7',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        await deleteCard(cardId).unwrap();
        
        await Swal.fire({
          title: 'Deleted!',
          text: 'Card has been deleted successfully.',
          icon: 'success',
          confirmButtonColor: '#C3EAE7'
        });
      } catch (error: any) {
        console.error('Error deleting card:', error);
        
        await Swal.fire({
          title: 'Error!',
          text: error?.data?.error || 'Failed to delete card. Please try again.',
          icon: 'error',
          confirmButtonColor: '#C3EAE7'
        });
      }
    }
  };

  const getCardTypeIcon = (cardType: string) => {
    switch (cardType.toLowerCase()) {
      case 'visa':
        return (
          <div className="w-8 h-5 bg-blue-600 rounded flex items-center justify-center">
            <span className="text-white text-xs font-bold">VISA</span>
          </div>
        );
      case 'mastercard':
        return (
          <div className="w-8 h-5 bg-red-600 rounded flex items-center justify-center">
            <span className="text-white text-xs font-bold">MC</span>
          </div>
        );
      case 'amex':
        return (
          <div className="w-8 h-5 bg-green-600 rounded flex items-center justify-center">
            <span className="text-white text-xs font-bold">AMEX</span>
          </div>
        );
      default:
        return (
          <div className="w-8 h-5 bg-gray-600 rounded flex items-center justify-center">
            <span className="text-white text-xs font-bold">CARD</span>
          </div>
        );
    }
  };

  if (cards.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No payment cards</h3>
        <p className="text-gray-500 mb-4">You haven't added any payment cards yet.</p>
        {onAddNew && (
          <button
            onClick={onAddNew}
            className="px-4 py-2 bg-[#C3EAE7] text-black rounded-lg hover:bg-[#B8E0DD] transition-colors"
          >
            Add Your First Card
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Payment Cards</h3>
        {onAddNew && (
          <button
            onClick={onAddNew}
            className="px-4 py-2 bg-[#C3EAE7] text-black rounded-lg hover:bg-[#B8E0DD] transition-colors text-sm"
          >
            Add New Card
          </button>
        )}
      </div>

      <div className="grid gap-4">
        {cards.map((card) => (
          <div
            key={card.id}
            className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {getCardTypeIcon(card.cardType)}
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900">
                      {card.maskedCardNumber}
                    </span>
                    {card.isDefault && (
                      <span className="px-2 py-1 bg-[#C3EAE7] text-black text-xs rounded-full">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    {card.cardHolderName} • Expires {card.expiryDisplay}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {onEdit && (
                  <button
                    onClick={() => onEdit(card)}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Edit card"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                )}
                <button
                  onClick={() => handleDeleteCard(card.id, card.lastFourDigits)}
                  disabled={isDeleting}
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                  title="Delete card"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CardList;
