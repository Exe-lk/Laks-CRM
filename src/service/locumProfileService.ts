import axios from 'axios';
import { LocumProfile, Specialty } from '../redux/slices/locumProfileSlice';

export type { LocumProfile, Specialty };

export const addLocumProfile = async (locumProfile: Omit<LocumProfile, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
        const response = await axios.post('/api/locum-profile/register', locumProfile);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.error || 'Failed to add locum profile');
    }
};

export const getLocumProfiles = async (): Promise<LocumProfile[]> => {
    try {
        const response = await axios.get('/api/locum-profile/register');
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.error || 'Failed to fetch locum profiles');
    }
};

export const login = async (email: string, password: string) => {
    try {
        const response = await axios.post('/api/locum-profile/login', { email, password });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.error || 'Failed to login');
    }
};

export const documentUpload = async (locumId: string, documents: any) => {
    try {
        const response = await axios.post(`/api/locum-profile/document`, { locumId, documents });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.error || 'Failed to upload document');
    }
};

export const verifyEmail = async (email: string, status: string) =>{
     try {
        const response = await axios.put('/api/locum-profile/confirm-email', {email, status });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.error || 'Failed to update status');
    }
}