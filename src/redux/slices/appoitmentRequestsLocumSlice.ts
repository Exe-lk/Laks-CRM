import { createApi } from '@reduxjs/toolkit/query/react';
import { createBaseQueryWithReauth } from '@/redux/baseQueryWithReauth';

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
  branch?: {
    id: string;
    name: string;
    address: string;
    location: string;
  } | null;
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
    id: string;
    name: string;
    telephone: string;
    location: string;
  };
  branch?: {
    id: string;
    name: string;
    address: string;
    location: string;
  } | null;
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
  id: string;
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
    branch?: {
      id: string;
      name: string;
      address: string;
      location: string;
    } | null;
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

export interface IgnoreAppointmentData {
  request_id: string;
  locum_id: string;
  reason?: string;
}

export interface IgnoreAppointmentResponse {
  success: boolean;
  data: {
    request_id: string;
    locum_id: string;
    reason?: string;
    ignored_at: Date | string;
  };
  message: string;
}

export interface CheckIgnoredResponse {
  success: boolean;
  isIgnored: boolean;
  data: any | null;
}

export const appointmentRequestsLocumApiSlice = createApi({
  reducerPath: 'appointmentRequestsLocumApi',
  baseQuery: createBaseQueryWithReauth(`${process.env.NEXT_PUBLIC_SITE_URL}/api/appointment`),
  tagTypes: ['AvailableRequests', 'PendingConfirmations', 'ApplicationHistory', 'IgnoredAppointments'],
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

    ignoreAppointment: builder.mutation<IgnoreAppointmentResponse, IgnoreAppointmentData>({
      query: (ignoreData) => ({
        url: 'ignore',
        method: 'POST',
        body: ignoreData,
      }),
      invalidatesTags: ['AvailableRequests', 'IgnoredAppointments'],
    }),

    checkIgnored: builder.query<CheckIgnoredResponse, { request_id: string; locum_id: string }>({
      query: ({ request_id, locum_id }) => ({
        url: 'check-ignored',
        params: {
          request_id,
          locum_id,
        },
      }),
      providesTags: ['IgnoredAppointments'],
    }),
  }),
});

export const {
  useGetAvailableRequestsQuery,
  useAcceptAppointmentMutation,
  useGetPendingConfirmationsQuery,
  useConfirmAppointmentMutation,
  useGetApplicationHistoryQuery,
  useIgnoreAppointmentMutation,
  useCheckIgnoredQuery,
} = appointmentRequestsLocumApiSlice;
