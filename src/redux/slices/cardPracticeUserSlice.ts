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
      transformResponse: (response: any) => ({
        cards: response.data || [],
        count: response.data?.length || 0
      }),
      providesTags: ['PaymentCard'],
    }),
    
    createCard: builder.mutation<CreateCardResponse, CreateCardRequest>({
      queryFn: async (cardData, _queryApi, _extraOptions, fetchWithBQ) => {
        try {
          // Step 1: Create or get customer
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

          // Step 2: Attach payment method to customer
          // Using Stripe's test payment method for development
          // In production, this should be replaced with Stripe.js tokenization
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
    
    deleteCard: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `card/delete?id=${id}`,
        method: 'DELETE',
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
