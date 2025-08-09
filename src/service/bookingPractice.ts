import axios from 'axios';
import { Booking } from '../redux/slices/bookingPracticeSlice';

export type { Booking };

export const addBooking = async (
  booking: Omit<Booking, 'booking_id' | 'createdAt' | 'updatedAt'>
) => {
  try {
    const response = await axios.post('/api/booking', booking);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Failed to add booking');
  }
};

export const getBookings = async (userId?: string, userType?: 'locum' | 'practice') => {
  try {
    const token = localStorage.getItem('token');
    const config: any = {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };

    if (userId && userType) {
      config.params = {
        user_id: userId,
        user_type: userType
      };
    }

    const response = await axios.get('/api/booking/booking', config);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Failed to fetch bookings');
  }
};

export const getBookingById = async (bookingId: string) => {
  try {
    const response = await axios.get(`/api/booking?id=${bookingId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Failed to fetch booking');
  }
};

export const updateBooking = async (
  updatedBooking: Partial<Booking> & { booking_id: string }
) => {
  try {
    const response = await axios.put('/api/booking', updatedBooking);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Failed to update booking');
  }
};

export const deleteBooking = async (bookingId: string) => {
  try {
    const response = await axios.delete(`/api/booking?id=${bookingId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Failed to delete booking');
  }
};

