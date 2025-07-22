import apiClient from './apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const authApi = {
  register: async (userData) => {
    try {
      const response = await apiClient.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de l\'inscription :', error.response ? error.response.data : error.message);
      throw error;
    }
  },

  login: async (credentials) => {
    try {
      const response = await apiClient.post('/auth/login', credentials);
      return response.data;
    } catch (error) {
      console.log('Erreur complète :', error);
      console.log('Erreur response :', error.response?.data);
      throw error;
    }
  },

  logout: async () => {
    try {
      // Supprimer le token du stockage local
      await AsyncStorage.removeItem('userToken');
      return true;
    } catch (error) {
      console.error('Erreur lors de la déconnexion :', error);
      throw error;
    }
  }
};

export default authApi; 