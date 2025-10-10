import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface Specialty {
  speciality: string;
  numberOfYears: number;
}

export interface LocumProfile {
  id: string;
  fullName: string;
  location: string;
  employeeType: string;
  role: string;
  status: string;
  averageRating: number | null;
  totalRatings: number | null;
  specialties: Specialty[];
}

export interface RateLocumRequest {
  locumId: string;
  practiceId: string;
  rating: number;
}

export interface RateLocumResponse {
  success: boolean;
  message: string;
  data: {
    locumId: string;
    averageRating: number;
    totalRatings: number;
    yourRating: number;
  };
}

export interface GetAllLocumsResponse {
  success: boolean;
  data: LocumProfile[];
  count: number;
}

export const ratePracticeApiSlice = createApi({
  reducerPath: 'ratePracticeApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: 'https://laks-crm.netlify.app/api/',
    prepareHeaders: (headers) => {
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['LocumRating', 'LocumProfile'],
  endpoints: (builder) => ({
    getAllLocums: builder.query<GetAllLocumsResponse, void>({
      query: () => 'locum-profile/get-all',
      providesTags: ['LocumProfile'],
    }),
    rateLocum: builder.mutation<RateLocumResponse, RateLocumRequest>({
      query: (rateData) => ({
        url: 'locum-profile/rate',
        method: 'POST',
        body: rateData,
      }),
      invalidatesTags: ['LocumProfile', 'LocumRating'],
      onQueryStarted: async (rateData, { dispatch, queryFulfilled }) => {
        const patchResult = dispatch(
          ratePracticeApiSlice.util.updateQueryData('getAllLocums', undefined, (draft) => {
            const locumIndex = draft.data.findIndex(locum => locum.id === rateData.locumId);
            if (locumIndex !== -1) {
            }
          })
        );
        
        try {
          const { data } = await queryFulfilled;
          dispatch(
            ratePracticeApiSlice.util.updateQueryData('getAllLocums', undefined, (draft) => {
              const locumIndex = draft.data.findIndex(locum => locum.id === data.data.locumId);
              if (locumIndex !== -1) {
                draft.data[locumIndex].averageRating = data.data.averageRating;
                draft.data[locumIndex].totalRatings = data.data.totalRatings;
              }
            })
          );
        } catch {
          patchResult.undo();
        }
      },
    }),
  }),
});

export const {
  useGetAllLocumsQuery,
  useRateLocumMutation,
} = ratePracticeApiSlice;