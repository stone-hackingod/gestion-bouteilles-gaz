import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, TextInput, TouchableOpacity, FlatList, ScrollView, StatusBar } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import stockApi from '../api/stockApi';
import { useTheme } from '../context/ThemeContext';
import * as Notifications from 'expo-notifications';
import NetInfo from '@react-native-community/netinfo';
import { saveOfflineAction, watchNetworkAndSync, saveCache, getCache } from '../services/offlineManager';

const STOCK_CACHE_KEY = 'CACHE_STOCK';
const MOVEMENTS_CACHE_KEY = 'CACHE_MOVEMENTS';

function StockScreen() {
  const { colors, theme } = useTheme();
  const [stock, setStock] = useState(null);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fullBottles, setFullBottles] = useState('');
  const [emptyBottles, setEmptyBottles] = useState('');
  const [consignedBottles, setConsignedBottles] = useState('');
  const [movementType, setMovementType] = useState('entrée'); // 'entrée' ou 'sortie'
  const [description, setDescription] = useState('');
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchStockData = async () => {
      setLoading(true);
      if (isConnected) {
        try {
          const [stockRes, movementsRes] = await Promise.all([
            stockApi.getStock(),
            stockApi.getStockMovements()
          ]);
          setStock(stockRes);
          setMovements(movementsRes);
          await saveCache(STOCK_CACHE_KEY, stockRes);
          await saveCache(MOVEMENTS_CACHE_KEY, movementsRes);
        } catch (error) {
          Alert.alert('Erreur', 'Impossible de charger les données du stock : ' + (error.response?.data?.message || error.message));
        } finally {
          setLoading(false);
        }
      } else {
        // Mode offline : lecture du cache
        const cachedStock = await getCache(STOCK_CACHE_KEY);
        const cachedMovements = await getCache(MOVEMENTS_CACHE_KEY);
        setStock(cachedStock);
        setMovements(cachedMovements || []);
        setLoading(false);
      }
    };
    fetchStockData();
  }, [isConnected]);

  // Synchronisation offline des mouvements
  useEffect(() => {
    const syncFunction = async (action) => {
      if (action.type === 'UPDATE_STOCK') {
        await stockApi.updateStock(action.payload);
      }
    };
    const unsubscribe = watchNetworkAndSync(syncFunction);
    return () => unsubscribe();
  }, []);

  const handleUpdateStock = async () => {
    if ((!fullBottles && !emptyBottles && !consignedBottles) || (!movementType)) {
      Alert.alert('Erreur', 'Veuillez entrer au moins une quantité et un type de mouvement.');
      return;
    }
    setLoading(true);
    const stockUpdateData = {
      fullBottles: parseInt(fullBottles) || 0,
      emptyBottles: parseInt(emptyBottles) || 0,
      consignedBottles: parseInt(consignedBottles) || 0,
      type: movementType,
      description: description,
    };
    if (isConnected) {
      try {
        await stockApi.updateStock(stockUpdateData);
        Alert.alert('Succès', 'Stock mis à jour avec succès !');
        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Mouvement de stock',
            body: `Type: ${movementType}, Pleines: ${stockUpdateData.fullBottles}, Vides: ${stockUpdateData.emptyBottles}`,
          },
          trigger: null,
        });
        resetForm();
        // Rafraîchir les données
        const [stockRes, movementsRes] = await Promise.all([
          stockApi.getStock(),
          stockApi.getStockMovements()
        ]);
        setStock(stockRes);
        setMovements(movementsRes);
        await saveCache(STOCK_CACHE_KEY, stockRes);
        await saveCache(MOVEMENTS_CACHE_KEY, movementsRes);
      } catch (error) {
        Alert.alert('Erreur', 'Échec de la mise à jour du stock : ' + (error.response?.data?.message || error.message));
      } finally {
        setLoading(false);
      }
    } else {
      // Mode offline : on sauvegarde l'action
      await saveOfflineAction({
        type: 'UPDATE_STOCK',
        payload: stockUpdateData,
        date: new Date().toISOString(),
      });
      Alert.alert('Hors-ligne', 'Mouvement enregistré localement. Il sera synchronisé dès que la connexion revient.');
      resetForm();
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFullBottles('');
    setEmptyBottles('');
    setConsignedBottles('');
    setMovementType('entrée');
    setDescription('');
  };

  const renderMovementItem = ({ item }) => (
    <View style={[styles.movementItem, { backgroundColor: colors.cardBackground, borderColor: colors.inputBorder }]}>
      <Text style={[styles.movementTypeText, { color: colors.buttonPrimary }]}>Type: {item.type}</Text>
      {item.fullBottles > 0 && <Text style={[styles.movementText, { color: colors.text }]}>Bouteilles pleines: {item.fullBottles}</Text>}
      {item.emptyBottles > 0 && <Text style={[styles.movementText, { color: colors.text }]}>Bouteilles vides: {item.emptyBottles}</Text>}
      {item.consignedBottles > 0 && <Text style={[styles.movementText, { color: colors.text }]}>Bouteilles consignées: {item.consignedBottles}</Text>}
      {item.description && <Text style={[styles.movementDescription, { color: colors.secondaryText }]}>Description: {item.description}</Text>}
      <Text style={[styles.movementDate, { color: colors.secondaryText }]}>Date: {new Date(item.createdAt).toLocaleString()}</Text>
      {item.user && <Text style={[styles.movementUser, { color: colors.buttonSecondary }]}>Par: {item.user.name}</Text>}
    </View>
  );

  const mouvementsTries = movements.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  if (loading && !stock) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.text} />
        <Text style={[styles.loadingText, { color: colors.text }]}>Chargement des données du stock...</Text>
      </View>
    );
  }

  return (
    <>
      <StatusBar
        backgroundColor={theme === 'dark' ? '#121212' : '#F5F8F7'}
        barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
      />
      <ScrollView contentContainerStyle={[styles.contentContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.title, { color: colors.buttonPrimary }]}>Gestion du Stock</Text>

        {stock && (
          <View style={[styles.sectionCard, { backgroundColor: colors.cardBackground, borderColor: colors.inputBorder }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Stock Actuel</Text>
            <View style={styles.stockRow}>
              <Text style={[styles.stockLabel, { color: colors.secondaryText }]}>Bouteilles Pleines:</Text>
              <Text style={[styles.stockValue, { color: colors.buttonPrimary }]}>{stock.fullBottles}</Text>
            </View>
            <View style={styles.stockRow}>
              <Text style={[styles.stockLabel, { color: colors.secondaryText }]}>Bouteilles Vides:</Text>
              <Text style={[styles.stockValue, { color: colors.buttonPrimary }]}>{stock.emptyBottles}</Text>
            </View>
            <View style={styles.stockRow}>
              <Text style={[styles.stockLabel, { color: colors.secondaryText }]}>Bouteilles Consignées:</Text>
              <Text style={[styles.stockValue, { color: colors.buttonPrimary }]}>{stock.consignedBottles}</Text>
            </View>
          </View>
        )}

        <View style={[styles.sectionCard, { backgroundColor: colors.cardBackground, borderColor: colors.inputBorder }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Enregistrer un Mouvement</Text>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Type de Mouvement :</Text>
            <View style={[styles.pickerContainer, { borderColor: colors.inputBorder, backgroundColor: colors.inputBackground }]}>
              <Picker
                selectedValue={movementType}
                onValueChange={(itemValue) => setMovementType(itemValue)}
                style={[styles.picker, { color: colors.text, backgroundColor: colors.inputBackground }]}
                dropdownIconColor={colors.text}
              >
                <Picker.Item label="Entrée" value="entrée" />
                <Picker.Item label="Sortie" value="sortie" />
              </Picker>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Bouteilles Pleines :</Text>
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.inputBorder, backgroundColor: colors.inputBackground }]}
              keyboardType="numeric"
              value={fullBottles}
              onChangeText={setFullBottles}
              placeholder="Quantité"
              placeholderTextColor={colors.placeholder}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Bouteilles Vides :</Text>
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.inputBorder, backgroundColor: colors.inputBackground }]}
              keyboardType="numeric"
              value={emptyBottles}
              onChangeText={setEmptyBottles}
              placeholder="Quantité"
              placeholderTextColor={colors.placeholder}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Bouteilles Consignées :</Text>
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.inputBorder, backgroundColor: colors.inputBackground }]}
              keyboardType="numeric"
              value={consignedBottles}
              onChangeText={setConsignedBottles}
              placeholder="Quantité"
              placeholderTextColor={colors.placeholder}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Description (optionnel) :</Text>
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.inputBorder, backgroundColor: colors.inputBackground }]}
              value={description}
              onChangeText={setDescription}
              placeholder="Ex: Réapprovisionnement"
              placeholderTextColor={colors.placeholder}
            />
          </View>

          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: colors.buttonPrimary }]}
            onPress={handleUpdateStock}
            disabled={loading}
          >
            <Text style={styles.saveButtonText}>
              {loading ? "Enregistrement..." : "Enregistrer le Mouvement"}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.buttonSecondary }]}>Historique des Mouvements</Text>
        <FlatList
          data={mouvementsTries}
          renderItem={renderMovementItem}
          keyExtractor={item => item._id || Math.random().toString()}
          ListEmptyComponent={<Text style={[styles.emptyListText, { color: colors.secondaryText }]}>Aucun mouvement de stock.</Text>}
          style={styles.listContainer}
          scrollEnabled={false}
        />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 50,
  },
  contentContainer: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#F5F8F7',
    paddingBottom: 50,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F8F7',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 25,
    textAlign: 'center',
    color: '#2D3A4B',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderLeftWidth: 6,
    borderLeftColor: '#5cb85c',
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#2D3A4B',
    textAlign: 'center',
  },
  stockRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingVertical: 4,
  },
  stockLabel: {
    fontSize: 16,
    color: '#424242',
    fontWeight: '500',
  },
  stockValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3A4B',
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 15,
    marginBottom: 5,
    color: '#2D3A4B',
    fontWeight: '500',
  },
  input: {
    height: 48,
    borderColor: '#E0E0E0',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    backgroundColor: '#FDFDFD',
    fontSize: 16,
    color: '#333',
  },
  pickerContainer: {
    borderColor: '#E0E0E0',
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: '#FDFDFD',
    overflow: 'hidden',
    height: 48,
    justifyContent: 'center',
  },
  picker: {
    height: 48,
    width: '100%',
    color: '#333',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 30,
    marginBottom: 15,
    color: '#2D3A4B',
    textAlign: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingBottom: 10,
  },
  listContainer: {
    width: '100%',
    marginTop: 10,
  },
  movementItem: {
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    borderLeftWidth: 5,
    borderLeftColor: '#2196F3',
  },
  movementTypeText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#2D3A4B',
  },
  movementText: {
    fontSize: 15,
    color: '#4A4A4A',
    marginBottom: 3,
  },
  movementDescription: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#666',
    marginTop: 8,
  },
  movementDate: {
    fontSize: 12,
    color: '#777',
    marginTop: 8,
    textAlign: 'right',
  },
  movementUser: {
    fontSize: 13,
    color: '#777',
    textAlign: 'right',
    marginTop: 2,
  },
  emptyListText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#777',
  },
});

export default StockScreen; 