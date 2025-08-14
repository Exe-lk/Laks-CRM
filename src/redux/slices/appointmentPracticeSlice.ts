import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface AppointmentRequest {
  id?: string;
  practice_id: string;
  request_date: Date | string;
  request_start_time: string;
  request_end_time: string;
  location: string;
  required_role: string;
  status?: string;
  createdAt?: Date;
  updatedAt?: Date;
  practice?: {
    id: string;
    name: string;
    location: string;
    address: string;
  };
}

export interface CreateAppointmentRequestData {
  practice_id: string;
  request_date: Date | string;
  request_start_time: string;
  request_end_time: string;
  location: string;
  required_role: string;
}

export interface AvailableRequestsParams {
  locum_id: string;
  page?: number;
  limit?: number;
}

export interface PracticeRequestsParams {
  practice_id: string;
  page?: number;
  limit?: number;
}

export interface PracticeRequest {
  request_id: string;
  request_date: string;
  request_start_time: string;
  request_end_time: string;
  required_role:string;
  location: string;
  status: string;
  total_applicants: number;
  latest_applicants: Array<{
    locum_name: string;
    responded_at: string;
  }>;
  current_selection: {
    confirmation_id: string;
    chosen_locum: string;
    status: string;
    practice_confirmed_at?: string;
    expires_at?: string;
  } | null;
  booking_created: boolean;
  can_select_applicant: boolean;
  created_at: string;
  updated_at: string;
}

export interface PracticeRequestsResponse {
  success: boolean;
  data: {
    requests: PracticeRequest[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      total_pages: number;
    };
  };
}

export interface ErrorResponse {
  error: string;
  details?: string;
  status?: string;
}

export interface Applicant {
  response_id: string;
  responded_at: string;
  locumProfile: {
    id: string;
    fullName: string;
    location: string;
    contactNumber: string;
    emailAddress: string;
    employeeType: string;
    averageRating?: number;
    specialties: Array<{
      speciality: string;
      numberOfYears: number;
    }>;
  };
}

export interface JobDetails {
  request_id: string;
  request_date: string;
  request_start_time: string;
  request_end_time: string;
  location: string;
  required_role: string;
  practice: {
    name: string;
    location: string;
  };
}

export interface GetApplicantsResponse {
  success: boolean;
  data: {
    applicants: Applicant[];
    job: JobDetails;
    total_applicants: number;
    active_selection: any;
    can_select_applicant: boolean;
  };
}

export interface SelectApplicantRequest {
  request_id: string;
  locum_id: string;
}

export interface SelectApplicantResponse {
  success: boolean;
  data: any;
  message: string;
}

export const appointmentApiSlice = createApi({
  reducerPath: 'appointmentApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://laks-crm.netlify.app/api/appointment',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['AppointmentRequest'],
  endpoints: (builder) => ({
    createAppointmentRequest: builder.mutation<
      { success: boolean; data: AppointmentRequest; message: string },
      CreateAppointmentRequestData
    >({
      query: (newRequest) => ({
        url: 'create-request',
        method: 'POST',
        body: newRequest,
      }),
      invalidatesTags: ['AppointmentRequest'],
    }),

    getAvailableRequests: builder.query<AppointmentRequest[], AvailableRequestsParams>({
      query: ({ locum_id, page = 1, limit = 20 }) => ({
        url: 'available-requests',
        params: {
          locum_id,
          page,
          limit,
        },
      }),
      providesTags: ['AppointmentRequest'],
    }),

    getPracticeRequests: builder.query<PracticeRequestsResponse, PracticeRequestsParams>({
      query: ({ practice_id, page = 1, limit = 20 }) => ({
        url: 'practice-requests',
        params: {
          practice_id,
          page,
          limit,
        },
      }),
      providesTags: ['AppointmentRequest'],
    }),

    getApplicants: builder.query<GetApplicantsResponse, { request_id: string }>({
      query: ({ request_id }) => ({
        url: 'applicants',
        params: {
          request_id,
        },
      }),
      providesTags: ['AppointmentRequest'],
    }),

    selectApplicant: builder.mutation<SelectApplicantResponse, SelectApplicantRequest>({
      query: (data) => ({
        url: 'select-applicant',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['AppointmentRequest'],
    }),
  }),
});

export const {
  useCreateAppointmentRequestMutation,
  useGetAvailableRequestsQuery,
  useGetPracticeRequestsQuery,
  useGetApplicantsQuery,
  useSelectApplicantMutation,
} = appointmentApiSlice;
