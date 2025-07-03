import axios from 'axios';

export interface Specialty {
    speciality: string;
    numberOfYears: number;
}

export interface LocumProfile {
    fullName: string;
    emailAddress: string;
    contactNumber: string;
    address: string;
    password: string;
    gdcNumber: string;
    employeeType: string;
    software?: string;
    specialties?: Specialty[];
}

export const addLocumProfile = async (locumProfile: LocumProfile) => {
    try {
        const response = await axios.post('/api/locum-profiles', locumProfile);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.error || 'Failed to add locum profile');
    }
};

export const getLocumProfiles = async () => {
    try {
        const response = await axios.get('/api/locum-profiles');
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.error || 'Failed to fetch locum profiles');
    }
};