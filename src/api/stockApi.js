import apiClient from './apiClient';

const stockApi = {
  getStock: async () => {
    try {
      const response = await apiClient.get('/stock');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération du stock :', error.response ? error.response.data : error.message);
      throw error;
    }
  },

  updateStock: async (stockData) => {
    try {
      const response = await apiClient.put('/stock', stockData);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du stock :', error.response ? error.response.data : error.message);
      throw error;
    }
  },

  getStockMovements: async () => {
    try {
      const response = await apiClient.get('/stock/movements');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des mouvements de stock :', error.response ? error.response.data : error.message);
      throw error;
    }
  },
};

export default stockApi; 