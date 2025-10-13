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
      query: (practiceId) => `card/practice-cards?practiceId=${practiceId}`,
      providesTags: ['PaymentCard'],
    }),
    
    createCard: builder.mutation<CreateCardResponse, CreateCardRequest>({
      query: (cardData) => ({
        url: 'card/create',
        method: 'POST',
        body: cardData,
      }),
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
      query: (practiceId) => `card/practice-cards?practiceId=${practiceId}`,
      transformResponse: (response: CardsResponse) => ({
        hasCards: response.count > 0,
        count: response.count
      }),
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
