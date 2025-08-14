import axios from 'axios';

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

export const ratePracticeService = {
  getAllLocums: async (): Promise<GetAllLocumsResponse> => {
    try {
      const response = await axios.get('/api/locum-profile/get-all');
      return response.data;
    } catch (error) {
      console.error('Error fetching locums:', error);
      throw error;
    }
  },

  rateLocum: async (rateData: RateLocumRequest): Promise<RateLocumResponse> => {
    try {
      const response = await axios.post('/api/locum-profile/rate', rateData);
      return response.data;
    } catch (error) {
      console.error('Error rating locum:', error);
      throw error;
    }
  },

  getLocumById: async (locumId: string): Promise<LocumProfile> => {
    try {
      const response = await axios.get(`/api/locum-profile/get-all?id=${locumId}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching locum by ID:', error);
      throw error;
    }
  },

  getPracticeRatingForLocum: async (practiceId: string, locumId: string): Promise<number | null> => {
    try {
      const response = await axios.get(`/api/locum-profile/get-rating?practiceId=${practiceId}&locumId=${locumId}`);
      return response.data.rating;
    } catch (error) {
      console.error('Error fetching practice rating:', error);
      return null;
    }
  },

  updateRating: async (rateData: RateLocumRequest): Promise<RateLocumResponse> => {
    try {
      const response = await axios.post('/api/locum-profile/rate', rateData);
      return response.data;
    } catch (error) {
      console.error('Error updating rating:', error);
      throw error;
    }
  },

  getTopRatedLocums: async (limit: number = 10): Promise<GetAllLocumsResponse> => {
    try {
      const response = await axios.get(`/api/locum-profile/get-all?limit=${limit}&sortBy=rating`);
      return response.data;
    } catch (error) {
      console.error('Error fetching top rated locums:', error);
      throw error;
    }
  },

  searchLocumsBySpecialty: async (specialty: string): Promise<GetAllLocumsResponse> => {
    try {
      const response = await axios.get(`/api/locum-profile/get-all?specialty=${encodeURIComponent(specialty)}`);
      return response.data;
    } catch (error) {
      console.error('Error searching locums by specialty:', error);
      throw error;
    }
  },

  filterLocumsByLocation: async (location: string): Promise<GetAllLocumsResponse> => {
    try {
      const response = await axios.get(`/api/locum-profile/get-all?location=${encodeURIComponent(location)}`);
      return response.data;
    } catch (error) {
      console.error('Error filtering locums by location:', error);
      throw error;
    }
  }
};

export const {
  getAllLocums,
  rateLocum,
  getLocumById,
  getPracticeRatingForLocum,
  updateRating,
  getTopRatedLocums,
  searchLocumsBySpecialty,
  filterLocumsByLocation
} = ratePracticeService;
