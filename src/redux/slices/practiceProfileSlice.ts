import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface PracticeProfile {
  id?: string;
  name: string;
  email: string;
  telephone: string;
  address: string;
  password?: string;
  GDCnumber?: string;
  dob?: string;
  location?: string;
  status?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface RegistrationResponse {
  profile: PracticeProfile;
  authUser: any;
  status: number;
}

export interface LoginResponse {
  message: string;
  profile: PracticeProfile;
  accessToken?: string;
  refreshToken?: string;
  session?: {
    access_token: string;
    refresh_token: string;
    expires_at: number;
    token_type: string;
    user: any;
  };
}

export interface ErrorResponse {
  error: string;
  details?: string;
  status?: string;
}

export const PracticeProfileApiSlice = createApi({
  reducerPath: 'PracticeProfileApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: 'https://laks-crm.netlify.app/api/',
    prepareHeaders: (headers) => {
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['PracticeProfile'],
  endpoints: (builder) => ({
    getPracticeProfiles: builder.query<PracticeProfile[], void>({
      query: () => 'practice/register',
      providesTags: ['PracticeProfile'],
    }),
    gePracticeProfileById: builder.query<PracticeProfile, string>({
      query: (id) => `practice/register?id=${id}`,
      providesTags: ['PracticeProfile'],
    }),
    addPracticeProfile: builder.mutation<RegistrationResponse, Omit<PracticeProfile, 'id' | 'createdAt' | 'updatedAt'>>({
      query: (newProfile) => ({
        url: 'practice/register',
        method: 'POST',
        body: newProfile,
      }),
      invalidatesTags: ['PracticeProfile'],
    }),
    updatePracticeProfile: builder.mutation<PracticeProfile, Partial<PracticeProfile> & { id: string }>({
      query: (updatedProfile) => ({
        url: 'practice/register',
        method: 'PUT',
        body: updatedProfile,
      }),
      invalidatesTags: ['PracticeProfile'],
    }),
    deletePracticeProfile: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `practice/register?id=${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['PracticeProfile'],
    }),
    login: builder.mutation<LoginResponse, { email: string; password: string }>({
      query: (credentials) => ({
        url: 'practice/login',
        method: 'POST',
        body: credentials,
      }),
    }),
     VerifyStatus: builder.mutation<PracticeProfile, { email: string; status: string }>({
      query: (updatedProfile) => ({
        url: 'practice/confirm-email',
        method: 'PUT',
        body: updatedProfile,
      }),
    }),
  }),
});

export const {
  useGetPracticeProfilesQuery,
  useGePracticeProfileByIdQuery,
  useAddPracticeProfileMutation,
  useUpdatePracticeProfileMutation,
  useDeletePracticeProfileMutation,
  useLoginMutation,
  useVerifyStatusMutation
} = PracticeProfileApiSlice; 