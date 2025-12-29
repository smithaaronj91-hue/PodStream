import { create } from 'zustand';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const useStore = create((set) => ({
    user: null,
    token: null,
    categories: [],
    podcasts: [],
    currentPodcast: null,
    favorites: [],
    subscriptions: [],

    // Auth
    login: async (email, password) => {
        try {
            const response = await axios.post(`${API_URL}/auth/login`, {
                email,
                password,
            });
            set({ user: response.data.user, token: response.data.token });
            localStorage.setItem('token', response.data.token);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    register: async (username, email, password) => {
        try {
            const response = await axios.post(`${API_URL}/auth/register`, {
                username,
                email,
                password,
            });
            set({ user: response.data.user, token: response.data.token });
            localStorage.setItem('token', response.data.token);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    logout: () => {
        set({ user: null, token: null });
        localStorage.removeItem('token');
    },

    // Categories
    fetchCategories: async () => {
        try {
            const response = await axios.get(`${API_URL}/categories`);
            set({ categories: response.data });
            return response.data;
        } catch (error) {
            console.error('Error fetching categories:', error);
            return [];
        }
    },

    // Podcasts
    fetchPodcasts: async (filters = {}) => {
        try {
            const params = new URLSearchParams(filters).toString();
            const response = await axios.get(`${API_URL}/podcasts?${params}`);
            set({ podcasts: response.data });
            return response.data;
        } catch (error) {
            console.error('Error fetching podcasts:', error);
            return [];
        }
    },

    fetchPodcastsByCategory: async (category, options = {}) => {
        try {
            const params = new URLSearchParams(options).toString();
            const response = await axios.get(
                `${API_URL}/categories/${category}/podcasts?${params}`
            );
            set({ podcasts: response.data.data });
            return response.data;
        } catch (error) {
            console.error('Error fetching podcasts by category:', error);
            return { data: [], pagination: {} };
        }
    },

    fetchPodcast: async (id) => {
        try {
            const response = await axios.get(`${API_URL}/podcasts/${id}`);
            set({ currentPodcast: response.data });
            return response.data;
        } catch (error) {
            console.error('Error fetching podcast:', error);
            return null;
        }
    },

    // Subscriptions
    subscribeToPodcast: async (podcastId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `${API_URL}/users/subscribe/${podcastId}`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return response.data;
        } catch (error) {
            console.error('Error subscribing:', error);
            throw error;
        }
    },

    unsubscribeFromPodcast: async (podcastId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/users/subscribe/${podcastId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
        } catch (error) {
            console.error('Error unsubscribing:', error);
            throw error;
        }
    },

    // Favorites
    addFavorite: async (episodeId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `${API_URL}/users/favorites/${episodeId}`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return response.data;
        } catch (error) {
            console.error('Error adding favorite:', error);
            throw error;
        }
    },
}));
