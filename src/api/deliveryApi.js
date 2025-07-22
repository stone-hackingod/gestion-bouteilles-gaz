import apiClient from './apiClient';

const deliveryApi = {
  createDelivery: async (deliveryData) => {
    try {
      const response = await apiClient.post('/deliveries', deliveryData);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création de la livraison :', error.response ? error.response.data : error.message);
      throw error;
    }
  },

  getDeliveries: async () => {
    try {
      const response = await apiClient.get('/deliveries');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des livraisons :', error.response ? error.response.data : error.message);
      throw error;
    }
  },

  updateDelivery: async (id, deliveryData) => {
    try {
      const response = await apiClient.patch(`/deliveries/${id}`, deliveryData);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de la livraison ${id} :`, error.response ? error.response.data : error.message);
      throw error;
    }
  },

  // Vous pouvez ajouter d'autres fonctions ici, comme getDeliveries, updateDelivery, etc.
};

export default deliveryApi; 