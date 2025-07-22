import apiClient from './apiClient';

const notificationApi = {
  getNotifications: async () => {
    try {
      const response = await apiClient.get('/notifications');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des notifications :', error.response ? error.response.data : error.message);
      throw error;
    }
  },

  markAsRead: async (id) => {
    try {
      const response = await apiClient.put(`/notifications/${id}`, { isRead: true });
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de la notification ${id} :`, error.response ? error.response.data : error.message);
      throw error;
    }
  },

  // Pourrait ajouter createNotification si l'admin doit pouvoir en créer manuellement
  createNotification: async (notificationData) => {
    try {
      const response = await apiClient.post('/notifications', notificationData);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création de la notification :', error.response ? error.response.data : error.message);
      throw error;
    }
  },
};

export default notificationApi; 