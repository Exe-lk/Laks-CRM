import axios from 'axios';
import { LocumProfile, Specialty } from '../redux/slices/locumProfileSlice';

export type { LocumProfile, Specialty };

export const addLocumProfile = async (locumProfile: Omit<LocumProfile, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
        const response = await axios.post('/api/locum-profiles', locumProfile);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.error || 'Failed to add locum profile');
    }
};

export const getLocumProfiles = async (): Promise<LocumProfile[]> => {
    try {
        const response = await axios.get('/api/locum-profiles');
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.error || 'Failed to fetch locum profiles');
    }
};