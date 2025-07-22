import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, Alert, Modal, TextInput, Pressable, StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';

function ParametresScreen() {
  const { theme, toggleTheme, colors } = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const navigation = useNavigation();

  // Pour le changement de mot de passe
  const [modalVisible, setModalVisible] = useState(false);
  const [aboutVisible, setAboutVisible] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('userToken');
    navigation.replace('Auth');
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Erreur', 'Les nouveaux mots de passe ne correspondent pas.');
      return;
    }
    setLoading(true);
    try {
      setTimeout(() => {
        setLoading(false);
        setModalVisible(false);
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        Alert.alert('Succès', 'Mot de passe modifié avec succès !');
      }, 1200);
    } catch (error) {
      setLoading(false);
      Alert.alert('Erreur', 'Impossible de changer le mot de passe.');
    }
  };

  return (
    <>
      <StatusBar
        backgroundColor={theme === 'dark' ? '#121212' : '#F5F8F7'}
        barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
      />
      <View style={styles.container(colors)}>
        <Text style={styles.title(colors)}>Paramètres</Text>

        <TouchableOpacity style={styles.option(colors)} onPress={() => setModalVisible(true)}>
          <Text style={styles.optionText(colors)}>Modifier le mot de passe</Text>
        </TouchableOpacity>

        <View style={styles.optionRow(colors)}>
          <Text style={styles.optionText(colors)}>Thème sombre</Text>
          <Switch
            value={theme === 'dark'}
            onValueChange={toggleTheme}
          />
        </View>

        <View style={styles.optionRow(colors)}>
          <Text style={styles.optionText(colors)}>Notifications</Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
          />
        </View>

        <TouchableOpacity style={styles.logout(colors)} onPress={handleLogout}>
          <Text style={styles.logoutText(colors)}>Déconnexion</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.option(colors)} onPress={() => setAboutVisible(true)}>
          <Text style={styles.optionText(colors)}>À propos</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.option(colors)} onPress={() => Alert.alert('Support', 'Contactez-nous à support@votresite.com')}>
          <Text style={styles.optionText(colors)}>Support / Contact</Text>
        </TouchableOpacity>

        {/* Modal pour changer le mot de passe */}
        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent(colors)}>
              <Text style={styles.modalTitle(colors)}>Changer le mot de passe</Text>
              <TextInput
                style={styles.input(colors)}
                placeholder="Ancien mot de passe"
                placeholderTextColor={colors.placeholder}
                secureTextEntry
                value={oldPassword}
                onChangeText={setOldPassword}
              />
              <TextInput
                style={styles.input(colors)}
                placeholder="Nouveau mot de passe"
                placeholderTextColor={colors.placeholder}
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
              />
              <TextInput
                style={styles.input(colors)}
                placeholder="Confirmer le nouveau mot de passe"
                placeholderTextColor={colors.placeholder}
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
                <Pressable style={styles.modalButton(colors)} onPress={() => setModalVisible(false)} disabled={loading}>
                  <Text style={styles.modalButtonText(colors)}>Annuler</Text>
                </Pressable>
                <Pressable style={[styles.modalButton(colors), { backgroundColor: colors.buttonPrimary }]} onPress={handleChangePassword} disabled={loading}>
                  <Text style={[styles.modalButtonText(colors), { color: '#fff' }]}>{loading ? '...' : 'Valider'}</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>

        {/* Modal À propos */}
        <Modal
          visible={aboutVisible}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setAboutVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.aboutContent(colors)}>
              <Text style={styles.aboutTitle(colors)}>À propos de Gaza Gabon</Text>
              <Text style={styles.aboutText(colors)}>
                Gaza Gabon est une application mobile de gestion des livraisons et du stock de bouteilles de gaz, conçue pour les opérateurs terrain (contrôleurs).{"\n\n"}
                Elle permet de :{"\n"}
                - Saisir et valider les livraisons de bouteilles de gaz (pleines/vides) pour chaque camion.{"\n"}
                - Gérer le décompte des bouteilles au départ et au retour.{"\n"}
                - Suivre l'état du stock en temps réel.{"\n"}
                - Enregistrer les mouvements de stock et consulter l'historique.{"\n"}
                - Recevoir des notifications et alertes en cas d'anomalie.{"\n"}
                - Travailler en mode hors-ligne avec synchronisation automatique des données.{"\n\n"}
                Développée par :{"\n"}
                BAYANI LIYOKO Jen-Stone Ezéchiel     (+241 66 97 76 98){"\n"}
                MOUIDY MOUIDI Maurice Aurel Vivaldi  (+241 60 05 08 04)
              </Text>
              <Pressable style={[styles.modalButton(colors), { marginTop: 18 }]} onPress={() => setAboutVisible(false)}>
                <Text style={styles.modalButtonText(colors)}>Fermer</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </View>
    </>
  );
}

const styles = {
  container: (colors) => ({
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  }),
  title: (colors) => ({
    fontSize: 26,
    fontWeight: '700',
    color: colors.buttonPrimary,
    marginBottom: 18,
    textAlign: 'center',
    letterSpacing: 0.5,
  }),
  option: (colors) => ({
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.inputBorder,
  }),
  optionText: (colors) => ({
    fontSize: 16,
    color: colors.text,
  }),
  optionRow: (colors) => ({
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.inputBorder,
  }),
  logout: (colors) => ({
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.inputBorder,
    marginTop: 10,
    marginBottom: 6,
  }),
  logoutText: (colors) => ({
    fontSize: 16,
    color: '#F44336',
    fontWeight: 'bold',
    textAlign: 'left',
  }),
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: (colors) => ({
    width: '90%',
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 24,
    elevation: 6,
  }),
  modalTitle: (colors) => ({
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.buttonPrimary,
    marginBottom: 20,
    textAlign: 'center',
  }),
  input: (colors) => ({
    width: '100%',
    height: 48,
    backgroundColor: 'transparent',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    paddingHorizontal: 16,
    fontSize: 16,
    color: colors.text,
    marginBottom: 14,
  }),
  aboutContent: (colors) => ({
    width: '92%',
    backgroundColor: colors.cardBackground,
    borderRadius: 18,
    padding: 24,
    elevation: 8,
    alignItems: 'center',
  }),
  aboutTitle: (colors) => ({
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.buttonPrimary,
    marginBottom: 12,
    textAlign: 'center',
  }),
  aboutText: (colors) => ({
    fontSize: 15,
    color: colors.text,
    marginBottom: 10,
    textAlign: 'left',
    lineHeight: 22,
  }),
  modalButton: (colors) => ({
    flex: 1,
    backgroundColor: colors.cardBackground,
    paddingVertical: 12,
    marginHorizontal: 5,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.buttonPrimary,
  }),
  modalButtonText: (colors) => ({
    fontSize: 16,
    color: colors.buttonPrimary,
    fontWeight: 'bold',
  }),
};

export default ParametresScreen; 