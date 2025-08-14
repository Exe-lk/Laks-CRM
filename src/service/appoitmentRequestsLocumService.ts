import axios from 'axios';

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

export const getAvailableRequests = async (locum_id: string): Promise<AvailableRequestsResponse> => {
  try {
    const token = localStorage.getItem('token');
    
    const response = await axios.get('/api/appointment/available-requests', {
      params: {
        locum_id,
      },
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Failed to fetch available requests');
  }
};

export const acceptAppointment = async (data: AcceptAppointmentData): Promise<AcceptAppointmentResponse> => {
  try {
    const token = localStorage.getItem('token');
    
    const response = await axios.post('/api/appointment/accept', data, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Failed to accept appointment');
  }
};

export const getPendingConfirmations = async (locum_id: string): Promise<PendingConfirmationsResponse> => {
  try {
    const token = localStorage.getItem('token');
    
    const response = await axios.get('/api/appointment/pending-confirmations', {
      params: {
        locum_id,
      },
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Failed to fetch pending confirmations');
  }
};

export const confirmAppointment = async (data: ConfirmAppointmentData): Promise<ConfirmAppointmentResponse> => {
  try {
    const token = localStorage.getItem('token');
    
    const response = await axios.post('/api/appointment/locum-confirm', data, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Failed to confirm appointment');
  }
};
