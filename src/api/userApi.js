import apiClient from './apiClient';

const userApi = {
  getUsers: async () => {
    try {
      const response = await apiClient.get('/users');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs :', error.response ? error.response.data : error.message);
      throw error;
    }
  },
  // Vous pouvez ajouter d'autres fonctions ici (getUserById, updateUser, deleteUser)
};

export default userApi; 