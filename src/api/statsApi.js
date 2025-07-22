// import api from './apiClient';
//
// export const getStockTotal = async () => {
//   try {
//     const response = await api.get('/stats/stock-total');
//     return response.data;
//   } catch (error) {
//     console.error('Erreur lors de la récupération du stock total:', error);
//     throw error;
//   }
// };
//
// export const getDeliveriesCount = async () => {
//   try {
//     const response = await api.get('/stats/deliveries-count');
//     return response.data;
//   } catch (error) {
//     console.error('Erreur lors de la récupération du nombre de livraisons:', error);
//     throw error;
//   }
// };
//
// export const getAlertsCount = async () => {
//   try {
//     const response = await api.get('/stats/alerts-count');
//     return response.data;
//   } catch (error) {
//     console.error('Erreur lors de la récupération du nombre d\'alertes:', error);
//     throw error;
//   }
// };
//
// export const getAllStats = async () => {
//   try {
//     const [stockTotal, deliveriesCount, alertsCount] = await Promise.all([
//       getStockTotal(),
//       getDeliveriesCount(),
//       getAlertsCount(),
//     ]);
//     return {
//       stockTotal,
//       deliveriesCount,
//       alertsCount,
//     };
//   } catch (error) {
//     console.error('Erreur lors de la récupération des statistiques:', error);
//     throw error;
//   }
// }; 