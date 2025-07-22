import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Button, Alert, ActivityIndicator, FlatList, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import { Picker } from '@react-native-picker/picker'; // Assurez-vous d'avoir installé cette dépendance (npm install @react-native-picker/picker)
import deliveryApi from '../api/deliveryApi';
import userApi from '../api/userApi'; // Importez l'API des utilisateurs
import truckApi from '../api/truckApi'; // Importez l'API des camions
import { useTheme } from '../context/ThemeContext';
import { saveOfflineAction, watchNetworkAndSync } from '../services/offlineManager';

function DeliveryScreen() {
  const { colors, theme } = useTheme();
  const [deliveries, setDeliveries] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [trucks, setTrucks] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [selectedTruck, setSelectedTruck] = useState(null);
  const [fullBottlesSent, setFullBottlesSent] = useState('');
  const [emptyBottlesSent, setEmptyBottlesSent] = useState('');
  const [fullBottlesReturned, setFullBottlesReturned] = useState('');
  const [emptyBottlesReturned, setEmptyBottlesReturned] = useState('');
  const [consignedBottles, setConsignedBottles] = useState('');
  const [loading, setLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editingDelivery, setEditingDelivery] = useState(null); // Pour la modification

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    // Fonction pour envoyer une livraison offline au backend
    const syncFunction = async (action) => {
      if (action.type === 'CREATE_DELIVERY') {
        await deliveryApi.createDelivery(action.payload);
      }
    };
    // Lancer la surveillance réseau
    const unsubscribe = watchNetworkAndSync(syncFunction);
    return () => unsubscribe();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, trucksRes] = await Promise.all([
        userApi.getUsers(),
        truckApi.getTrucks()
      ]);
      setDrivers(usersRes.filter(user => user.role === 'driver'));
      setTrucks(trucksRes);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger les données : ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDelivery = async () => {
    if (!selectedDriver || !selectedTruck || !fullBottlesSent || !emptyBottlesSent) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires (chauffeur, camion, bouteilles envoyées).');
      return;
    }

    setLoading(true);
    try {
      const deliveryData = {
        driver: selectedDriver,
        truck: selectedTruck,
        fullBottlesSent: parseInt(fullBottlesSent),
        emptyBottlesSent: parseInt(emptyBottlesSent),
        consignedBottles: parseInt(consignedBottles) || 0,
      };
      await deliveryApi.createDelivery(deliveryData);
      Alert.alert('Succès', 'Livraison créée avec succès !');
      resetForm();
      fetchData(); // Recharger les données
      setIsCreating(false);
    } catch (error) {
      if (!error.response) {
        // Erreur réseau : on sauvegarde localement
        await saveOfflineAction({
          type: 'CREATE_DELIVERY',
          payload: {
            driver: selectedDriver,
            truck: selectedTruck,
            fullBottlesSent: parseInt(fullBottlesSent),
            emptyBottlesSent: parseInt(emptyBottlesSent),
            consignedBottles: parseInt(consignedBottles) || 0,
          },
          date: new Date().toISOString(),
        });
        Alert.alert('Hors-ligne', 'Livraison enregistrée localement. Elle sera synchronisée dès que la connexion revient.');
        resetForm();
        setIsCreating(false);
      } else {
        Alert.alert('Erreur', 'Échec de la création de la livraison : ' + (error.response?.data?.message || error.message));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditDelivery = (delivery) => {
    setEditingDelivery(delivery);
    setSelectedDriver(delivery.driver._id || delivery.driver);
    setSelectedTruck(delivery.truck._id || delivery.truck);
    setFullBottlesSent(delivery.fullBottlesSent.toString());
    setEmptyBottlesSent(delivery.emptyBottlesSent.toString());
    setFullBottlesReturned(delivery.fullBottlesReturned?.toString() || '');
    setEmptyBottlesReturned(delivery.emptyBottlesReturned?.toString() || '');
    setConsignedBottles(delivery.consignedBottles?.toString() || '');
    setIsCreating(true);
  };

  const handleUpdateDelivery = async () => {
    if (!editingDelivery) return;

    setLoading(true);
    try {
      const updatedData = {
        fullBottlesReturned: parseInt(fullBottlesReturned) || 0,
        emptyBottlesReturned: parseInt(emptyBottlesReturned) || 0,
        consignedBottles: parseInt(consignedBottles) || 0,
        // Ajoutez d'autres champs à mettre à jour si nécessaire (ex: status)
      };
      await deliveryApi.updateDelivery(editingDelivery._id, updatedData);
      Alert.alert('Succès', 'Livraison mise à jour avec succès !');
      resetForm();
      fetchData();
      setIsCreating(false);
      setEditingDelivery(null);
    } catch (error) {
      Alert.alert('Erreur', 'Échec de la mise à jour de la livraison : ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedDriver(null);
    setSelectedTruck(null);
    setFullBottlesSent('');
    setEmptyBottlesSent('');
    setFullBottlesReturned('');
    setEmptyBottlesReturned('');
    setConsignedBottles('');
    setEditingDelivery(null);
  };

  const renderDeliveryItem = ({ item }) => {
    const driverName = drivers.find(d => d._id === (item.driver?._id || item.driver))?.name || 'N/A';
    const truckName = trucks.find(t => t._id === (item.truck?._id || item.truck))?.name || 'N/A';

    return (
      <View style={styles.deliveryItem}>
        <Text style={styles.itemText}><Text style={styles.itemLabel}>Chauffeur:</Text> {driverName}</Text>
        <Text style={styles.itemText}><Text style={styles.itemLabel}>Camion:</Text> {truckName}</Text>
        <Text style={styles.itemText}><Text style={styles.itemLabel}>Envoyées (pleines):</Text> {item.fullBottlesSent}</Text>
        <Text style={styles.itemText}><Text style={styles.itemLabel}>Envoyées (vides):</Text> {item.emptyBottlesSent}</Text>
        <Text style={styles.itemText}><Text style={styles.itemLabel}>Retournées (pleines):</Text> {item.fullBottlesReturned}</Text>
        <Text style={styles.itemText}><Text style={styles.itemLabel}>Retournées (vides):</Text> {item.emptyBottlesReturned}</Text>
        <Text style={styles.itemText}><Text style={styles.itemLabel}>Consignées:</Text> {item.consignedBottles}</Text>
        <Text style={styles.itemText}><Text style={styles.itemLabel}>Statut:</Text> {item.status}</Text>
        <TouchableOpacity style={styles.editButton} onPress={() => handleEditDelivery(item)}>
          <Text style={styles.editButtonText}>Modifier</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.buttonPrimary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>Chargement des données...</Text>
      </View>
    );
  }

  return (
    <>
      <StatusBar
        backgroundColor={theme === 'dark' ? '#121212' : '#F5F8F7'}
        barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
      />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.title, { color: colors.buttonPrimary }]}>{editingDelivery ? 'Modifier la Livraison' : 'Gestion des Livraisons'}</Text>

        {!isCreating && (
          <TouchableOpacity style={[styles.createButton, { backgroundColor: colors.buttonPrimary }]} onPress={() => setIsCreating(true)}>
            <Text style={styles.createButtonText}>Nouvelle Livraison</Text>
          </TouchableOpacity>
        )}

        {isCreating ? (
          <ScrollView contentContainerStyle={styles.formScrollViewContent}>
            <View style={[styles.formContainer, { backgroundColor: colors.cardBackground, borderColor: colors.inputBorder }]}>
              <Text style={[styles.formTitle, { color: colors.text }]}>{editingDelivery ? 'Modifier la Livraison' : 'Nouvelle Livraison'}</Text>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Chauffeur :</Text>
                <View style={[styles.pickerContainer, { borderColor: colors.inputBorder, backgroundColor: colors.inputBackground }]}>
                  <Picker
                    selectedValue={selectedDriver}
                    onValueChange={(itemValue) => setSelectedDriver(itemValue)}
                    style={[styles.picker, { color: colors.text, backgroundColor: colors.inputBackground }]}
                    dropdownIconColor={colors.text}
                  >
                    <Picker.Item label="Sélectionner un chauffeur" value={null} />
                    {drivers.map(driver => (
                      <Picker.Item key={driver._id} label={driver.name} value={driver._id} />
                    ))}
                  </Picker>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Camion :</Text>
                <View style={[styles.pickerContainer, { borderColor: colors.inputBorder, backgroundColor: colors.inputBackground }]}>
                  <Picker
                    selectedValue={selectedTruck}
                    onValueChange={(itemValue) => setSelectedTruck(itemValue)}
                    style={[styles.picker, { color: colors.text, backgroundColor: colors.inputBackground }]}
                    dropdownIconColor={colors.text}
                  >
                    <Picker.Item label="Sélectionner un camion" value={null} />
                    {trucks.map(truck => (
                      <Picker.Item key={truck._id} label={truck.name} value={truck._id} />
                    ))}
                  </Picker>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Bouteilles pleines au départ :</Text>
                <TextInput
                  style={[styles.input, { color: colors.text, borderColor: colors.inputBorder, backgroundColor: colors.inputBackground }]}
                  keyboardType="numeric"
                  value={fullBottlesSent}
                  onChangeText={setFullBottlesSent}
                  placeholder="Quantité"
                  placeholderTextColor={colors.placeholder}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Bouteilles vides au départ :</Text>
                <TextInput
                  style={[styles.input, { color: colors.text, borderColor: colors.inputBorder, backgroundColor: colors.inputBackground }]}
                  keyboardType="numeric"
                  value={emptyBottlesSent}
                  onChangeText={setEmptyBottlesSent}
                  placeholder="Quantité"
                  placeholderTextColor={colors.placeholder}
                />
              </View>

              {editingDelivery && (
                <>
                  <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: colors.text }]}>Bouteilles pleines au retour :</Text>
                    <TextInput
                      style={[styles.input, { color: colors.text, borderColor: colors.inputBorder, backgroundColor: colors.inputBackground }]}
                      keyboardType="numeric"
                      value={fullBottlesReturned}
                      onChangeText={setFullBottlesReturned}
                      placeholder="Quantité"
                      placeholderTextColor={colors.placeholder}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: colors.text }]}>Bouteilles vides au retour :</Text>
                    <TextInput
                      style={[styles.input, { color: colors.text, borderColor: colors.inputBorder, backgroundColor: colors.inputBackground }]}
                      keyboardType="numeric"
                      value={emptyBottlesReturned}
                      onChangeText={setEmptyBottlesReturned}
                      placeholder="Quantité"
                      placeholderTextColor={colors.placeholder}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: colors.text }]}>Bouteilles consignées :</Text>
                    <TextInput
                      style={[styles.input, { color: colors.text, borderColor: colors.inputBorder, backgroundColor: colors.inputBackground }]}
                      keyboardType="numeric"
                      value={consignedBottles}
                      onChangeText={setConsignedBottles}
                      placeholder="Quantité"
                      placeholderTextColor={colors.placeholder}
                    />
                  </View>
                </>
              )}

              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: colors.buttonPrimary }]}
                onPress={editingDelivery ? handleUpdateDelivery : handleCreateDelivery}
                disabled={loading}
              >
                <Text style={styles.saveButtonText}>
                  {loading ? (editingDelivery ? "Mise à jour..." : "Création...") : (editingDelivery ? "Mettre à jour" : "Créer la Livraison")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={() => { resetForm(); setIsCreating(false); }}>
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        ) : (
          <FlatList
            data={deliveries}
            renderItem={renderDeliveryItem}
            keyExtractor={item => item._id}
            ListEmptyComponent={<Text style={styles.emptyListText}>Aucune livraison trouvée.</Text>}
            style={styles.listContainer}
          />
        )}

        {loading && isCreating && <ActivityIndicator size="small" color={colors.buttonPrimary} style={{ marginTop: 10 }} />}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 50,
    backgroundColor: '#f7fafd',
  },
  formScrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f7fafd',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#2d3a4b',
  },
  createButton: {
    backgroundColor: '#28a745',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 20,
    alignSelf: 'center',
    elevation: 2,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  formContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    elevation: 3,
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  formTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#1976d2',
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 15,
    marginBottom: 5,
    color: '#555',
    fontWeight: '500',
  },
  input: {
    height: 54,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    fontSize: 18,
    color: '#333',
  },
  pickerContainer: {
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: '#fff',
    overflow: 'hidden',
    height: 54,
    justifyContent: 'center',
  },
  picker: {
    height: 54,
    width: '100%',
    color: '#333',
    fontSize: 18,
  },
  saveButton: {
    backgroundColor: '#1976d2',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    elevation: 2,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#6c757d',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    elevation: 2,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  listContainer: {
    width: '100%',
  },
  deliveryItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
    borderLeftWidth: 5,
    borderLeftColor: '#1976d2',
  },
  itemText: {
    fontSize: 15,
    marginBottom: 5,
    color: '#333',
  },
  itemLabel: {
    fontWeight: 'bold',
    color: '#1976d2',
  },
  editButton: {
    backgroundColor: '#ffc107',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginTop: 10,
    alignSelf: 'flex-end',
  },
  editButtonText: {
    color: '#333',
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyListText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#777',
  },
});

export default DeliveryScreen; 