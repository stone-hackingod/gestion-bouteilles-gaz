import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import NetworkService from '../services/networkService';

const NetworkDiagnostic = () => {
  const [diagnostic, setDiagnostic] = useState(null);
  const [loading, setLoading] = useState(false);
  const [networkConfig, setNetworkConfig] = useState(null);

  useEffect(() => {
    setNetworkConfig(NetworkService.getNetworkConfig());
  }, []);

  const runDiagnostic = async () => {
    setLoading(true);
    try {
      const result = await NetworkService.performNetworkDiagnostic();
      setDiagnostic(result);
      
      if (!result.internetConnection) {
        Alert.alert('❌ Problème de connectivité', 'Aucune connexion internet détectée.');
      } else if (!result.apiConnection) {
        Alert.alert('🌐 Serveur inaccessible', 'Impossible de se connecter au serveur API.');
      } else {
        Alert.alert('✅ Connectivité OK', 'La connexion au serveur API fonctionne.');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Erreur lors du diagnostic réseau.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (isConnected) => {
    return isConnected ? '#4CAF50' : '#F44336';
  };

  const getStatusIcon = (isConnected) => {
    return isConnected ? '✅' : '❌';
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🔧 Diagnostic Réseau</Text>
        <Text style={styles.subtitle}>Test de connectivité API</Text>
      </View>

      {networkConfig && (
        <View style={styles.configSection}>
          <Text style={styles.sectionTitle}>📋 Configuration</Text>
          <View style={styles.configItem}>
            <Text style={styles.configLabel}>URL API:</Text>
            <Text style={styles.configValue}>{networkConfig.apiUrl}</Text>
          </View>
          <View style={styles.configItem}>
            <Text style={styles.configLabel}>Timeout:</Text>
            <Text style={styles.configValue}>{networkConfig.timeout}ms</Text>
          </View>
        </View>
      )}

      <TouchableOpacity style={styles.button} onPress={runDiagnostic} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Lancer le diagnostic</Text>}
      </TouchableOpacity>

      {diagnostic && (
        <View style={styles.results}>
          <Text style={styles.resultText}>
            Internet: {getStatusIcon(diagnostic.internetConnection)}
          </Text>
          <Text style={styles.resultText}>
            API: {getStatusIcon(diagnostic.apiConnection)}
          </Text>
        </View>
      )}

      <View style={styles.helpSection}>
        <Text style={styles.sectionTitle}>🆘 Aide</Text>
        <Text style={styles.helpText}>
          Si le diagnostic échoue, vérifiez :
        </Text>
        <Text style={styles.helpItem}>• Votre connexion internet</Text>
        <Text style={styles.helpItem}>• Que le serveur 31.97.55.154:5000 soit actif</Text>
        <Text style={styles.helpItem}>• Les paramètres de sécurité réseau</Text>
        <Text style={styles.helpItem}>• Contactez l'administrateur système</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  configSection: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  configItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  configLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  configValue: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'monospace',
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
    elevation: 2,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  results: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  resultText: {
    fontSize: 16,
    marginBottom: 8,
  },
  helpSection: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    elevation: 2,
  },
  helpText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  helpItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    paddingLeft: 8,
  },
});

export default NetworkDiagnostic; 