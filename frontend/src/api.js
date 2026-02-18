import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const generateTrip = async (tripData) => {
  const response = await api.post('/generate-trip/', tripData);
  return response.data;
};

export const getTrips = async () => {
  const response = await api.get('/trips/');
  return response.data;
};

export const getTrip = async (id) => {
  const response = await api.get(`/trips/${id}/`);
  return response.data;
};

export const getProfile = async () => {
  const response = await api.get('/profile/');
  return response.data;
};

export const updateProfile = async (data) => {
  const profile = await getProfile();
  const response = await api.put(`/profile/${profile.id}/`, data);
  return response.data;
};

export default api;
