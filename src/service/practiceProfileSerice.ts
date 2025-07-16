import axios from 'axios';
import { PracticeProfile } from '../redux/slices/practiceProfileSlice';

export type { PracticeProfile };

export const addLocumProfile = async (locumProfile: Omit<PracticeProfile, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
        const response = await axios.post('/api/practice/register', locumProfile);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.error || 'Failed to add locum profile');
    }
};

export const getLocumProfiles = async (): Promise<PracticeProfile[]> => {
    try {
        const response = await axios.get('/api/practice/register');
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.error || 'Failed to fetch locum profiles');
    }
};

export const login = async (email: string, password: string) => {
    try {
        const response = await axios.post('/api/practice/login', { email, password });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.error || 'Failed to login');
    }
};

export const verifyEmail = async (email: string, status: string) =>{
     try {
        const response = await axios.put('/api/practice/confirm-email', { email, status });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.error || 'Failed to update status');
    }
}