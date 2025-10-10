import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface PaymentStatusResponse {
  hasPaymentMethod: boolean;
  count: number;
}

export const PracticeUserPaymentApiSlice = createApi({
  reducerPath: 'PracticeUserPaymentApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: 'https://laks-crm.netlify.app/api/',
    prepareHeaders: (headers) => {
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['PaymentStatus'],
  endpoints: (builder) => ({
    checkPaymentStatus: builder.query<PaymentStatusResponse, string>({
      query: (practiceId) => `card/practice-cards?practiceId=${practiceId}`,
      transformResponse: (response: any) => ({
        hasPaymentMethod: response.count > 0,
        count: response.count
      }),
      providesTags: ['PaymentStatus'],
    }),
  }),
});

export const {
  useCheckPaymentStatusQuery,
} = PracticeUserPaymentApiSlice;
