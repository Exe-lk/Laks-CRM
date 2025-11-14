import { createApi } from '@reduxjs/toolkit/query/react';
import { createBaseQueryWithReauth } from '@/redux/baseQueryWithReauth';

export interface Notification {
  id: string;
  locumId: string | null;
  practiceId: string | null;
  branchId: string | null;
  message: string;
  status: 'UNREAD' | 'READ' | 'PENDING';
  createdAt: Date;
  updatedAt: Date;
  locumProfile?: {
    id: string;
    fullName: string;
    emailAddress: string;
  } | null;
  practice?: {
    id: string;
    name: string;
    email: string;
  } | null;
  branch?: {
    id: string;
    name: string;
    email: string;
  } | null;
}

export interface GetNotificationsParams {
  locumId?: string;
  practiceId?: string;
  branchId?: string;
  status?: 'UNREAD' | 'READ' | 'PENDING';
  page?: number;
  limit?: number;
}

export interface NotificationResponse {
  success: boolean;
  data: Notification[];
  pagination?: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface SingleNotificationResponse {
  success: boolean;
  data: Notification;
}

export interface UpdateNotificationParams {
  id: string;
  status: 'UNREAD' | 'READ' | 'PENDING';
}

export const notificationApiSlice = createApi({
  reducerPath: 'notificationApi',
  baseQuery: createBaseQueryWithReauth(`${process.env.NEXT_PUBLIC_SITE_URL}/api/notification2`),
  tagTypes: ['Notification'],
  endpoints: (builder) => ({
    getNotifications: builder.query<NotificationResponse, GetNotificationsParams>({
      query: (params) => ({
        url: 'getNotification',
        params: {
          ...(params.locumId && { locumId: params.locumId }),
          ...(params.practiceId && { practiceId: params.practiceId }),
          ...(params.branchId && { branchId: params.branchId }),
          ...(params.status && { status: params.status }),
          page: params.page || 1,
          limit: params.limit || 20,
        },
      }),
      providesTags: ['Notification'],
    }),

    getNotificationById: builder.query<SingleNotificationResponse, string>({
      query: (id) => ({
        url: 'getNotificationbyId',
        params: { id },
      }),
      providesTags: (result, error, id) => [{ type: 'Notification', id }],
    }),

    createNotification: builder.mutation<
      SingleNotificationResponse,
      {
        locumId?: string;
        practiceId?: string;
        branchId?: string;
        message: string;
        status?: 'UNREAD' | 'READ' | 'PENDING';
      }
    >({
      query: (body) => ({
        url: 'createNotification',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Notification'],
    }),

    updateNotification: builder.mutation<
      SingleNotificationResponse,
      UpdateNotificationParams
    >({
      query: (body) => ({
        url: 'updateNotification',
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'Notification', id: arg.id },
        'Notification',
      ],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useGetNotificationByIdQuery,
  useCreateNotificationMutation,
  useUpdateNotificationMutation,
} = notificationApiSlice;

