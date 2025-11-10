import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface PaymentCard {
  id: string;
  practiceId: string;
  cardHolderName: string;
  lastFourDigits: string;
  cardType: string;
  isDefault: boolean;
  status: string;
  maskedCardNumber: string;
  expiryDisplay: string;
  createdAt: string;
  updatedAt: string;
  practice?: {
    id: string;
    name: string;
  };
}

export interface CreateCardRequest {
  practiceId: string;
  cardHolderName: string;
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  cardType?: string;
  isDefault?: boolean;
}

export interface CreateCardResponse {
  card: PaymentCard;
  message: string;
}

export interface CardsResponse {
  cards: PaymentCard[];
  practice?: {
    id: string;
    name: string;
  };
  count: number;
}

export interface ErrorResponse {
  error: string;
  details?: string;
}

export const cardPracticeUserApiSlice = createApi({
  reducerPath: 'cardPracticeUserApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/api/`,
    prepareHeaders: (headers) => {
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['PaymentCard'],
  endpoints: (builder) => ({
    getPracticeCards: builder.query<CardsResponse, string>({
      query: (practiceId) => `payments/list-payment-methods?practice_id=${practiceId}`,
      transformResponse: (response: any) => {
        console.log('Raw payment methods response:', response);
        
        const paymentMethods = response.data || [];
        const transformedCards = paymentMethods.map((pm: any) => {
          const card = pm.card || {};
          return {
            id: pm.id,
            practiceId: '',
            cardHolderName: pm.billing_details?.name || 'N/A',
            lastFourDigits: card.last4 || '****',
            cardType: card.brand || 'card',
            isDefault: false,
            status: 'active',
            maskedCardNumber: `•••• •••• •••• ${card.last4 || '****'}`,
            expiryDisplay: card.exp_month && card.exp_year ? `${card.exp_month}/${card.exp_year}` : 'N/A',
            createdAt: pm.created ? new Date(pm.created * 1000).toISOString() : new Date().toISOString(),
            updatedAt: pm.created ? new Date(pm.created * 1000).toISOString() : new Date().toISOString(),
          };
        });
        
        console.log('Transformed cards:', transformedCards);
        
        return {
          cards: transformedCards,
          count: transformedCards.length
        };
      },
      providesTags: ['PaymentCard'],
    }),
    
    createCard: builder.mutation<CreateCardResponse, CreateCardRequest>({
      queryFn: async (cardData, _queryApi, _extraOptions, fetchWithBQ) => {
        try {
          const customerResponse = await fetchWithBQ({
            url: 'practice-card/customer-management',
            method: 'POST',
            body: {
              action: 'create_customer',
              practice_id: cardData.practiceId,
            },
          });

          if (customerResponse.error) {
            return { error: customerResponse.error as any };
          }

          const customerData = customerResponse.data as any;
          const customerId = customerData.customer?.id;

          if (!customerId) {
            return { 
              error: { 
                status: 500, 
                data: { error: 'Failed to get customer ID' } 
              } as any 
            };
          }

          const testPaymentMethodId = 'pm_card_visa';
          
          const cardResponse = await fetchWithBQ({
            url: 'practice-card/customer-management',
            method: 'POST',
            body: {
              action: 'attach_payment_method',
              customer_id: customerId,
              practice_id: cardData.practiceId,
              payment_method_id: testPaymentMethodId,
            },
          });

          if (cardResponse.error) {
            return { error: cardResponse.error as any };
          }

          return { data: cardResponse.data as CreateCardResponse };
        } catch (error: any) {
          return { 
            error: { 
              status: 500, 
              data: { error: error.message || 'An error occurred' } 
            } as any 
          };
        }
      },
      invalidatesTags: ['PaymentCard'],
    }),
    
    updateCard: builder.mutation<CreateCardResponse, { id: string; data: Partial<CreateCardRequest> }>({
      query: ({ id, data }) => ({
        url: `card/update?id=${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['PaymentCard'],
    }),
    
    deleteCard: builder.mutation<{ message: string }, { id: string; practiceId: string }>({
      query: ({ id, practiceId }) => ({
        url: 'payments/delete-payment-method',
        method: 'DELETE',
        body: {
          payment_method_id: id,
          practice_id: practiceId,
        },
      }),
      invalidatesTags: ['PaymentCard'],
    }),
    
    checkPracticeHasCards: builder.query<{ hasCards: boolean; count: number }, string>({
      query: (practiceId) => `payments/list-payment-methods?practice_id=${practiceId}`,
      transformResponse: (response: any) => {
        const count = response.data?.length || 0;
        return {
          hasCards: count > 0,
          count
        };
      },
      providesTags: ['PaymentCard'],
    }),
  }),
});

export const {
  useGetPracticeCardsQuery,
  useCreateCardMutation,
  useUpdateCardMutation,
  useDeleteCardMutation,
  useCheckPracticeHasCardsQuery,
} = cardPracticeUserApiSlice;
