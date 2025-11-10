import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface PaymentCard {
  id: string;
  locumId: string;
  cardHolderName: string;
  lastFourDigits: string;
  cardType: string;
  isDefault: boolean;
  status: string;
  maskedCardNumber: string;
  expiryDisplay: string;
  createdAt: string;
  updatedAt: string;
  locum?: {
    id: string;
    name: string;
  };
}

export interface CreateCardRequest {
  locumId: string;
  cardHolderName: string;
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  cardType?: string;
  isDefault?: boolean;
  email?: string;
  name?: string;
}

export interface CreateCardResponse {
  card?: PaymentCard;
  message: string;
  success?: boolean;
}

export interface CardsResponse {
  cards: PaymentCard[];
  locum?: {
    id: string;
    name: string;
  };
  count: number;
}

export interface ErrorResponse {
  error: string;
  details?: string;
}

export const locumCardApiSlice = createApi({
  reducerPath: 'locumCardApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/api/`,
    prepareHeaders: (headers) => {
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['LocumPaymentCard'],
  endpoints: (builder) => ({
    getLocumCards: builder.query<CardsResponse, string>({
      query: (locumId) => `payments/list-payment-methods?locum_id=${locumId}`,
      transformResponse: (response: any) => {
        console.log('Raw payment methods response:', response);
        
        const paymentMethods = response.data || [];
        const transformedCards = paymentMethods.map((pm: any) => {
          const card = pm.card || {};
          return {
            id: pm.id,
            locumId: '',
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
      providesTags: ['LocumPaymentCard'],
    }),
    
    createCard: builder.mutation<CreateCardResponse, CreateCardRequest>({
      queryFn: async (cardData, _queryApi, _extraOptions, fetchWithBQ) => {
        try {
          const emailToUse = cardData.email && cardData.email.trim() !== '' 
            ? cardData.email 
            : `locum-${cardData.locumId}@example.com`;
          const nameToUse = cardData.name && cardData.name.trim() !== '' 
            ? cardData.name 
            : `Locum ${cardData.locumId}`;

          const customerResponse = await fetchWithBQ({
            url: 'locum-card/customer-management',
            method: 'POST',
            body: {
              action: 'create_customer',
              locum_id: cardData.locumId,
              email: emailToUse,
              name: nameToUse,
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
            url: 'locum-card/customer-management',
            method: 'POST',
            body: {
              action: 'attach_payment_method',
              customer_id: customerId,
              locum_id: cardData.locumId,
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
      invalidatesTags: ['LocumPaymentCard'],
    }),
    
    updateCard: builder.mutation<CreateCardResponse, { id: string; data: Partial<CreateCardRequest> }>({
      query: ({ id, data }) => ({
        url: `card/update?id=${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['LocumPaymentCard'],
    }),
    
    deleteCard: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `card/delete?id=${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['LocumPaymentCard'],
    }),
    
    checkLocumHasCards: builder.query<{ hasCards: boolean; count: number }, string>({
      query: (locumId) => `payments/list-payment-methods?locum_id=${locumId}`,
      transformResponse: (response: any) => {
        const count = response.data?.length || 0;
        return {
          hasCards: count > 0,
          count
        };
      },
      providesTags: ['LocumPaymentCard'],
    }),
  }),
});

export const {
  useGetLocumCardsQuery,
  useCreateCardMutation,
  useUpdateCardMutation,
  useDeleteCardMutation,
  useCheckLocumHasCardsQuery,
} = locumCardApiSlice;
