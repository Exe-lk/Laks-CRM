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
  cardHolderName?: string;
  cardNumber?: string;
  expiryMonth?: string;
  expiryYear?: string;
  cvv?: string;
  cardType?: string;
  isDefault?: boolean;
  paymentMethodId?: string; // If provided, use this instead of creating from card details
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

          // Use provided payment method ID, or create from card details (deprecated - use Stripe.js on frontend)
          let paymentMethodId: string;
          
          if (cardData.paymentMethodId) {
            // Use provided payment method ID (created via Stripe.js on frontend)
            paymentMethodId = cardData.paymentMethodId;
            console.log('Using provided payment method ID:', paymentMethodId);
          } else if (cardData.cardNumber && cardData.expiryMonth && cardData.expiryYear && cardData.cvv) {
            // Legacy: Create payment method from card details (not recommended - use Stripe.js instead)
            console.warn('Creating payment method from card details - consider using Stripe.js on frontend');
            const createPMResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || ''}/api/payments/create-payment-method`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                cardNumber: cardData.cardNumber.replace(/\s/g, ''),
                expiryMonth: cardData.expiryMonth,
                expiryYear: cardData.expiryYear,
                cvv: cardData.cvv,
                cardHolderName: cardData.cardHolderName
              })
            });

            const pmData = await createPMResponse.json();
            
            if (!createPMResponse.ok || !pmData.payment_method?.id) {
              return { 
                error: { 
                  status: createPMResponse.status, 
                  data: { error: pmData.details || pmData.error || 'Failed to create payment method' } 
                } as any 
              };
            }

            paymentMethodId = pmData.payment_method.id;
            console.log('Payment method created:', paymentMethodId);
          } else {
            return {
              error: {
                status: 400,
                data: { error: 'Either paymentMethodId or card details (cardNumber, expiryMonth, expiryYear, cvv) must be provided' }
              } as any
            };
          }
          
          const cardResponse = await fetchWithBQ({
            url: 'practice-card/customer-management',
            method: 'POST',
            body: {
              action: 'attach_payment_method',
              customer_id: customerId,
              practice_id: cardData.practiceId,
              payment_method_id: paymentMethodId,
              set_as_default: cardData.isDefault
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
