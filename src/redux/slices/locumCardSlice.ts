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
  cardHolderName?: string;
  cardNumber?: string;
  expiryMonth?: string;
  expiryYear?: string;
  cvv?: string;
  cardType?: string;
  isDefault?: boolean;
  email?: string;
  name?: string;
  paymentMethodId?: string; // If provided, use this instead of creating from card details
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
      queryFn: async (locumId, _queryApi, _extraOptions, fetchWithBQ) => {
        try {
          // Fetch payment methods
          const paymentMethodsResponse = await fetchWithBQ({
            url: `payments/list-payment-methods?locum_id=${locumId}`,
          });

          if (paymentMethodsResponse.error) {
            return { error: paymentMethodsResponse.error as any };
          }

          const paymentMethods = (paymentMethodsResponse.data as any)?.data || [];

          // Fetch customer details to get default payment method
          let defaultPaymentMethodId: string | null = null;
          try {
            const customerDetailsResponse = await fetchWithBQ({
              url: `payments/get-customer-details?locum_id=${locumId}`,
            });

            if (!customerDetailsResponse.error && customerDetailsResponse.data) {
              const customerData = customerDetailsResponse.data as any;
              defaultPaymentMethodId = customerData.default_payment_method || 
                                      customerData.customer?.invoice_settings?.default_payment_method || 
                                      null;
            }
          } catch (error) {
            console.warn('Could not fetch customer details for default payment method:', error);
          }

          const transformedCards = paymentMethods.map((pm: any) => {
            const card = pm.card || {};
            return {
              id: pm.id,
              locumId: '',
              cardHolderName: pm.billing_details?.name || 'N/A',
              lastFourDigits: card.last4 || '****',
              cardType: card.brand || 'card',
              isDefault: defaultPaymentMethodId === pm.id,
              status: 'active',
              maskedCardNumber: `•••• •••• •••• ${card.last4 || '****'}`,
              expiryDisplay: card.exp_month && card.exp_year ? `${card.exp_month}/${card.exp_year}` : 'N/A',
              createdAt: pm.created ? new Date(pm.created * 1000).toISOString() : new Date().toISOString(),
              updatedAt: pm.created ? new Date(pm.created * 1000).toISOString() : new Date().toISOString(),
            };
          });

          return {
            data: {
              cards: transformedCards,
              count: transformedCards.length
            }
          };
        } catch (error: any) {
          return {
            error: {
              status: 500,
              data: { error: error.message || 'An error occurred' }
            } as any
          };
        }
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
            url: 'locum-card/customer-management',
            method: 'POST',
            body: {
              action: 'attach_payment_method',
              customer_id: customerId,
              locum_id: cardData.locumId,
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
    
    deleteCard: builder.mutation<{ message: string }, { id: string; locumId: string }>({
      query: ({ id, locumId }) => ({
        url: 'payments/delete-payment-method',
        method: 'DELETE',
        body: {
          payment_method_id: id,
          locum_id: locumId,
        },
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

    setDefaultPaymentMethod: builder.mutation<{ success: boolean; message?: string }, { locumId: string; paymentMethodId: string }>({
      query: ({ locumId, paymentMethodId }) => ({
        url: 'payments/set-default-payment-method',
        method: 'POST',
        body: {
          locum_id: locumId,
          payment_method_id: paymentMethodId
        }
      }),
      invalidatesTags: ['LocumPaymentCard'],
    }),
  }),
});

export const {
  useGetLocumCardsQuery,
  useCreateCardMutation,
  useUpdateCardMutation,
  useDeleteCardMutation,
  useCheckLocumHasCardsQuery,
  useSetDefaultPaymentMethodMutation,
} = locumCardApiSlice;
