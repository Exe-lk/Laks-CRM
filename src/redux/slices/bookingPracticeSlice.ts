import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface Booking {
  id?: string;
  locum_id: string;
  practice_id: string;
  booking_date: Date;
  booking_start_time: string;
  booking_end_time: string;
  status: string;
  location: string;
  description?: string;
  accept_time?: Date;
  cancel_by?: string;
  cancel_time?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ErrorResponse {
  error: string;
  details?: string;
  status?: string;
}

export const bookingApiSlice = createApi({
  reducerPath: 'bookingApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/api/booking`,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      console.log('Token from localStorage:', token); 
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Booking'],
  endpoints: (builder) => ({
    getBookings: builder.query<any, { userId: string; userType: 'locum' | 'practice' | 'branch' }>({
      query: ({ userId, userType }) => ({
        url: 'booking',
        params: {
          user_id: userId,
          user_type: userType
        }
      }),
      providesTags: ['Booking'],
    }),

    getBookingById: builder.query<Booking, string>({
      query: (id) => `booking?id=${id}`,
      providesTags: ['Booking'],
    }),

    addBooking: builder.mutation<Booking, Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>>({
      query: (newBooking) => ({
        url: 'booking',
        method: 'POST',
        body: newBooking,
      }),
      invalidatesTags: ['Booking'],
    }),

    updateBooking: builder.mutation<Booking, Partial<Booking> & { id: string }>({
      query: (updatedBooking) => ({
        url: 'booking',
        method: 'PUT',
        body: updatedBooking,
      }),
      invalidatesTags: ['Booking'],
    }),

    deleteBooking: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `booking?id=${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Booking'],
    }),

    cancelBooking: builder.mutation<
      { success: boolean; message: string; data: any }, 
      { booking_id: string; user_id: string; user_type: 'locum' | 'practice' | 'branch'; cancellation_reason?: string }
    >({
      query: (cancelData) => ({
        url: 'cancel-booking',
        method: 'POST',
        body: cancelData,
      }),
      invalidatesTags: ['Booking'],
    }),
  }),
});

export const {
  useGetBookingsQuery,
  useGetBookingByIdQuery,
  useAddBookingMutation,
  useUpdateBookingMutation,
  useDeleteBookingMutation,
  useCancelBookingMutation,
} = bookingApiSlice;
