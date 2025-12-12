import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface PaymentMethod {
  id: string;
  type: string;
  card: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  };
}

export interface PaymentMethodsResponse {
  data: PaymentMethod[];
}

export interface CreateCustomerRequest {
  action: 'create_customer' | 'attach_payment_method' | 'list_payment_methods';
  branch_id: string;
  email?: string;
  name?: string;
  payment_method_id?: string;
  customer_id?: string;
  set_as_default?: boolean;
}

export interface CustomerResponse {
  success: boolean;
  customer?: {
    id: string;
    email: string;
    name: string;
  };
  payment_method?: any;
}

export interface DeletePaymentMethodRequest {
  payment_method_id: string;
}

export interface ErrorResponse {
  error: string;
  details?: string;
}

export const cardBranchApiSlice = createApi({
  reducerPath: 'cardBranchApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/api/`,
    prepareHeaders: (headers) => {
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['BranchPaymentMethod'],
  endpoints: (builder) => ({
    getBranchPaymentMethods: builder.query<PaymentMethodsResponse, string>({
      query: (branchId) => `payments/list-payment-methods?branch_id=${branchId}`,
      providesTags: ['BranchPaymentMethod'],
    }),
    
    manageBranchCustomer: builder.mutation<CustomerResponse, CreateCustomerRequest>({
      query: (data) => ({
        url: 'branch-card/customer-management',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['BranchPaymentMethod'],
    }),
    
    deletePaymentMethod: builder.mutation<{ message: string }, DeletePaymentMethodRequest>({
      query: (data) => ({
        url: 'payments/delete-payment-method',
        method: 'DELETE',
        body: data,
      }),
      invalidatesTags: ['BranchPaymentMethod'],
    }),
    
    checkBranchHasPaymentMethods: builder.query<{ hasCards: boolean; count: number }, string>({
      query: (branchId) => `payments/list-payment-methods?branch_id=${branchId}`,
      transformResponse: (response: PaymentMethodsResponse) => ({
        hasCards: response.data && response.data.length > 0,
        count: response.data ? response.data.length : 0
      }),
      providesTags: ['BranchPaymentMethod'],
    }),
  }),
});

export const {
  useGetBranchPaymentMethodsQuery,
  useManageBranchCustomerMutation,
  useDeletePaymentMethodMutation,
  useCheckBranchHasPaymentMethodsQuery,
} = cardBranchApiSlice;

