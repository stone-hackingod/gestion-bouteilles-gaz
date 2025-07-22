import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://31.97.55.154:5000/api'; // URL réelle de votre API backend en ligne

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, // Timeout de 10 secondes
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur de requêtes pour ajouter le token JWT
apiClient.interceptors.request.use(
  async (config) => {
    console.log(`🚀 Requête API: ${config.method?.toUpperCase()} ${config.url}`);
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error("❌ Erreur lors de la préparation de la requête:", error.message);
    return Promise.reject(error);
  }
);

// Intercepteur de réponses pour une meilleure gestion d'erreur
apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ Réponse API: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error("❌ Erreur API:", {
      message: error.message,
      status: error.response?.status,
      url: error.config?.url,
      data: error.response?.data
    });
    
    // Gestion spécifique des erreurs de connexion
    if (error.code === 'ECONNABORTED') {
      console.error("⏰ Timeout de la requête - Le serveur ne répond pas");
    } else if (error.code === 'ERR_NETWORK') {
      console.error("🌐 Erreur réseau - Impossible de se connecter au serveur");
    } else if (error.response?.status === 401) {
      console.error("🔐 Erreur d'authentification - Token invalide ou expiré");
    } else if (error.response?.status >= 500) {
      console.error("🔧 Erreur serveur - Problème côté backend");
    }
    
    return Promise.reject(error);
  }
);

export default apiClient; 