import { create } from 'zustand';
import apiClient from '../api/client';
import toast from 'react-hot-toast';

const useAuthStore = create((set, get) => ({
    user: JSON.parse(localStorage.getItem('user_data')) || null,
    token: localStorage.getItem('auth_token') || null,
    isAuthenticated: !!localStorage.getItem('auth_token'),
    isLoading: false,

    login: async (email, password) => {
        set({ isLoading: true });
        try {
            // OAuth2PasswordRequestForm expects form-data
            const formData = new URLSearchParams();
            formData.append('username', email); // OAuth2 uses username field
            formData.append('password', password);

            const response = await apiClient.post('/auth/login', formData, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });

            const { access_token } = response.data;
            localStorage.setItem('auth_token', access_token);

            // Fetch user profile securely
            const profileRes = await apiClient.get('/users/me', {
                headers: { Authorization: `Bearer ${access_token}` }
            });

            localStorage.setItem('user_data', JSON.stringify(profileRes.data));

            set({
                token: access_token,
                user: profileRes.data,
                isAuthenticated: true,
                isLoading: false
            });
            toast.success('Welcome back to ArogyaMitra!');
            return true;
        } catch (error) {
            set({ isLoading: false });
            toast.error(error.response?.data?.detail || 'Login failed');
            return false;
        }
    },

    register: async (userData) => {
        set({ isLoading: true });
        try {
            await apiClient.post('/auth/register', userData);
            toast.success('Registration successful! Please log in.');
            set({ isLoading: false });
            return true;
        } catch (error) {
            set({ isLoading: false });
            const detail = error.response?.data?.detail;
            const msg = Array.isArray(detail) ? detail[0]?.msg : detail;
            toast.error(msg || 'Registration failed');
            return false;
        }
    },

    logout: () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        set({ user: null, token: null, isAuthenticated: false });
        toast.success('Logged out successfully');
    },

    updateProfile: async (updates) => {
        try {
            const res = await apiClient.put('/users/profile', updates);
            localStorage.setItem('user_data', JSON.stringify(res.data));
            set({ user: res.data });
            toast.success('Profile updated');
        } catch (e) {
            toast.error('Failed to update profile');
        }
    }
}));

export default useAuthStore;
