import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface AvailableAppointmentRequest {
  request_id: string;
  practice_id: string;
  request_date: Date | string;
  request_start_time: string;
  request_end_time: string;
  location: string;
  required_role: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  practice: {
    id: string;
    name: string;
    location: string;
    address: string;
    telephone: string;
  };
  applicants_count: number;
  time_until_appointment: number;
  is_urgent: boolean;
}

export interface AcceptAppointmentData {
  request_id: string;
  locum_id: string;
  message?: string;
}

export interface AvailableRequestsResponse {
  success: boolean;
  data: AvailableAppointmentRequest[];
  total: number;
}

export interface AcceptAppointmentResponse {
  success: boolean;
  data: {
    request_id: string;
    locum_id: string;
    status: string;
    locumProfile: {
      fullName: string;
      location: string;
      contactNumber: string;
      emailAddress: string;
      specialties: string;
    };
  };
  message: string;
}

export interface PendingConfirmation {
  confirmation_id: string;
  request_id: string;
  practice: {
    name: string;
    telephone: string;
    location: string;
  };
  appointment: {
    date: Date | string;
    start_time: string;
    end_time: string;
    location: string;
  };
  practice_confirmed_at: Date | string;
  expires_at: Date | string;
  time_left_ms: number | null;
  time_left_formatted: {
    hours: number;
    minutes: number;
    seconds: number;
  } | null;
  confirmation_number: number;
}

export interface PendingConfirmationsResponse {
  success: boolean;
  data: {
    pending_confirmations: PendingConfirmation[];
    total_pending: number;
  };
}

export interface ConfirmAppointmentData {
  confirmation_id: string;
  locum_id: string;
  action: 'CONFIRM' | 'REJECT';
  rejection_reason?: string;
}

export interface BookingData {
  booking_id: string;
  request_id: string;
  locum_id: string;
  practice_id: string;
  booking_date: Date | string;
  booking_start_time: string;
  booking_end_time: string;
  location: string;
  status: string;
  accept_time: Date | string;
  locumProfile: {
    fullName: string;
    contactNumber: string;
  };
  practice: {
    name: string;
    telephone: string;
  };
}

export interface ConfirmAppointmentResponse {
  success: boolean;
  message: string;
  data?: BookingData | any;
}

export interface ApplicationHistoryItem {
  response_id: string;
  request_id: string;
  locum_id: string;
  status: string;
  message?: string;
  responded_at: Date | string;
  expires_at?: Date | string;
  request: {
    request_id: string;
    practice_id: string;
    request_date: Date | string;
    request_start_time: string;
    request_end_time: string;
    location: string;
    required_role: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    practice: {
      name: string;
      location: string;
      telephone: string;
    };
    is_past: boolean;
    status_label: string;
  };
}

export interface ApplicationHistoryResponse {
  success: boolean;
  data: ApplicationHistoryItem[];
  total: number;
}

export interface ErrorResponse {
  error: string;
  details?: string;
  status?: string;
}

export const appointmentRequestsLocumApiSlice = createApi({
  reducerPath: 'appointmentRequestsLocumApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/appointment',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['AvailableRequests', 'PendingConfirmations', 'ApplicationHistory'],
  endpoints: (builder) => ({
    getAvailableRequests: builder.query<AvailableRequestsResponse, { locum_id: string }>({
      query: ({ locum_id }) => ({
        url: 'available-requests',
        params: {
          locum_id,
        },
      }),
      providesTags: ['AvailableRequests'],
    }),

    acceptAppointment: builder.mutation<AcceptAppointmentResponse, AcceptAppointmentData>({
      query: (acceptData) => ({
        url: 'accept',
        method: 'POST',
        body: acceptData,
      }),
      invalidatesTags: ['AvailableRequests'],
    }),

    getPendingConfirmations: builder.query<PendingConfirmationsResponse, { locum_id: string }>({
      query: ({ locum_id }) => ({
        url: 'pending-confirmations',
        params: {
          locum_id,
        },
      }),
      providesTags: ['PendingConfirmations'],
    }),

    confirmAppointment: builder.mutation<ConfirmAppointmentResponse, ConfirmAppointmentData>({
      query: (confirmData) => ({
        url: 'locum-confirm',
        method: 'POST',
        body: confirmData,
      }),
      invalidatesTags: ['PendingConfirmations'],
    }),

    getApplicationHistory: builder.query<ApplicationHistoryResponse, { locum_id: string }>({
      query: ({ locum_id }) => ({
        url: 'locum-apply-history',
        params: {
          locum_id,
        },
      }),
      providesTags: ['ApplicationHistory'],
    }),
  }),
});

export const {
  useGetAvailableRequestsQuery,
  useAcceptAppointmentMutation,
  useGetPendingConfirmationsQuery,
  useConfirmAppointmentMutation,
  useGetApplicationHistoryQuery,
} = appointmentRequestsLocumApiSlice;
