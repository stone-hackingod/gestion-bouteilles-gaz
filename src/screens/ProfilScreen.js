import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, Image, StatusBar } from 'react-native';
import apiClient from '../api/apiClient';
import { useTheme } from '../context/ThemeContext';

function ProfilScreen() {
  const { colors, theme } = useTheme();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/auth/profile');
      setProfile(response.data);
    } catch (error) {
      Alert.alert('Erreur', "Impossible de charger le profil : " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <StatusBar
          backgroundColor={theme === 'dark' ? '#121212' : '#F5F8F7'}
          barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
        />
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          <ActivityIndicator size="large" color={colors.buttonPrimary} />
          <Text style={{ marginTop: 10, color: colors.text }}>Chargement du profil...</Text>
        </View>
      </>
    );
  }

  if (!profile) {
    return (
      <>
        <StatusBar
          backgroundColor={theme === 'dark' ? '#121212' : '#F5F8F7'}
          barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
        />
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          <Text style={{ color: colors.text }}>Impossible de charger le profil utilisateur.</Text>
        </View>
      </>
    );
  }

  return (
    <>
      <StatusBar
        backgroundColor={theme === 'dark' ? '#121212' : '#F5F8F7'}
        barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
      />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.card, { backgroundColor: colors.cardBackground, borderColor: colors.inputBorder, shadowColor: colors.inputBorder }]}>
          <View style={[styles.avatarContainer, { borderColor: colors.buttonPrimary }]}>
            <Image
              source={require('../../assets/icon.png')}
              style={styles.avatar}
              resizeMode="cover"
            />
          </View>
          <Text style={[styles.name, { color: colors.buttonPrimary }]}>{profile.name}</Text>
          <Text style={[styles.role, { color: colors.buttonSecondary }]}>{profile.role.toUpperCase()}</Text>
          <View style={[styles.infoRow, { borderBottomColor: colors.inputBorder }]}>
            <Text style={[styles.label, { color: colors.secondaryText }]}>Email :</Text>
            <Text style={[styles.value, { color: colors.text }]}>{profile.email}</Text>
          </View>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 18,
    padding: 28,
    alignItems: 'center',
    elevation: 4,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  avatarContainer: {
    marginBottom: 18,
    borderRadius: 60,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#fff',
    elevation: 2,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  role: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 18,
    letterSpacing: 1,
  },
  infoRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  value: {
    fontSize: 16,
    marginLeft: 10,
  },
});

export default ProfilScreen; 