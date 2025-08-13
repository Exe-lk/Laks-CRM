import axios from 'axios';

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

export const createAppointmentRequest = async (data: CreateAppointmentRequestData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post('/api/appointment/create-request', data, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Failed to create appointment request');
  }
};

export const getAvailableRequests = async (params: AvailableRequestsParams) => {
  try {
    const token = localStorage.getItem('token');
    const { locum_id, page = 1, limit = 20 } = params;
    
    const response = await axios.get('/api/appointment/available-requests', {
      params: {
        locum_id,
        page,
        limit,
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
  required_role: string;
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

export const getPracticeRequests = async (params: PracticeRequestsParams) => {
  try {
    const token = localStorage.getItem('token');
    const { practice_id, page = 1, limit = 20 } = params;
    
    const response = await axios.get('/api/appointment/practice-requests', {
      params: {
        practice_id,
        page,
        limit,
      },
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Failed to fetch practice requests');
  }
};

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
    averageRating:string;
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

export interface GetApplicantsParams {
  request_id: string;
}

export interface SelectApplicantParams {
  request_id: string;
  locum_id: string;
}

export const getApplicants = async (params: GetApplicantsParams) => {
  try {
    const token = localStorage.getItem('token');
    const { request_id } = params;
    
    const response = await axios.get('/api/appointment/applicants', {
      params: {
        request_id,
      },
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Failed to fetch applicants');
  }
};

export const selectApplicant = async (params: SelectApplicantParams) => {
  try {
    const token = localStorage.getItem('token');
    
    const response = await axios.post('/api/appointment/select-applicant', params, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Failed to select applicant');
  }
};