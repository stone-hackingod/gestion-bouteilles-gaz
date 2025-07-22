import NetInfo from '@react-native-community/netinfo';
import apiClient from '../api/apiClient';

class NetworkService {
  /**
   * Vérifie la connectivité internet
   */
  static async checkInternetConnection() {
    try {
      const state = await NetInfo.fetch();
      console.log('📡 État de la connexion:', {
        isConnected: state.isConnected,
        isInternetReachable: state.isInternetReachable,
        type: state.type,
        isWifi: state.isWifi,
        isCellular: state.isCellular
      });
      return state.isConnected && state.isInternetReachable;
    } catch (error) {
      console.error('❌ Erreur lors de la vérification de la connectivité:', error);
      return false;
    }
  }

  /**
   * Teste la connexion à l'API
   */
  static async testApiConnection() {
    try {
      console.log('🔍 Test de connexion à l\'API...');
      const response = await apiClient.get('/health', { timeout: 5000 });
      console.log('✅ API accessible:', response.status);
      return { success: true, status: response.status };
    } catch (error) {
      console.error('❌ API inaccessible:', {
        message: error.message,
        code: error.code,
        status: error.response?.status
      });
      
      // Diagnostic détaillé
      if (error.code === 'ECONNABORTED') {
        console.error('⏰ Le serveur ne répond pas dans les délais');
      } else if (error.code === 'ERR_NETWORK') {
        console.error('🌐 Impossible de se connecter au serveur');
      } else if (error.response?.status === 404) {
        console.error('🔍 Endpoint non trouvé');
      } else if (error.response?.status >= 500) {
        console.error('🔧 Erreur serveur');
      }
      
      return { 
        success: false, 
        error: error.message,
        code: error.code,
        status: error.response?.status 
      };
    }
  }

  /**
   * Diagnostic complet de la connectivité
   */
  static async performNetworkDiagnostic() {
    console.log('🔧 Début du diagnostic réseau...');
    
    // 1. Vérifier la connectivité internet
    const isConnected = await this.checkInternetConnection();
    if (!isConnected) {
      console.error('❌ Pas de connexion internet');
      return {
        internetConnection: false,
        apiConnection: false,
        recommendations: ['Vérifiez votre connexion internet', 'Activez les données mobiles ou WiFi']
      };
    }

    // 2. Tester la connexion API
    const apiTest = await this.testApiConnection();
    
    const recommendations = [];
    if (!apiTest.success) {
      if (apiTest.code === 'ECONNABORTED') {
        recommendations.push('Le serveur est lent ou surchargé');
        recommendations.push('Vérifiez que le serveur 31.97.55.154:5000 est actif');
      } else if (apiTest.code === 'ERR_NETWORK') {
        recommendations.push('Le serveur est inaccessible');
        recommendations.push('Vérifiez l\'adresse IP et le port du serveur');
        recommendations.push('Contactez l\'administrateur système');
      }
    }

    return {
      internetConnection: isConnected,
      apiConnection: apiTest.success,
      apiStatus: apiTest.status,
      recommendations
    };
  }

  /**
   * Retourne les informations de configuration réseau
   */
  static getNetworkConfig() {
    return {
      apiUrl: 'http://31.97.55.154:5000/api',
      timeout: 10000,
      retryAttempts: 3
    };
  }
}

export default NetworkService; 