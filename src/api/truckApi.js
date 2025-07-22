import apiClient from './apiClient';

const truckApi = {
  getTrucks: async () => {
    try {
      const response = await apiClient.get('/trucks');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des camions :', error.response ? error.response.data : error.message);
      throw error;
    }
  },
  // Vous pouvez ajouter d'autres fonctions ici (getTruckById, createTruck, updateTruck, deleteTruck)
};

export default truckApi; 