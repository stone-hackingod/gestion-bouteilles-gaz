import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ImageBackground,
  Image,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authApi from '../api/authApi';
import { useTheme } from '../context/ThemeContext';

const { width, height } = Dimensions.get('window');

function AuthScreen({ navigation }) {
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
      return;
    }

    setLoading(true);
    try {
      const response = await authApi.login({ email, password });
      const { token, user } = response;
      await AsyncStorage.setItem('userToken', token);
      if (user) {
        await AsyncStorage.setItem('user', JSON.stringify(user));
      }
      Alert.alert('Succès', `Bienvenue ${user ? (user.name || user.email) : '!'} !`);
      navigation.replace('Main');
    } catch (error) {
      const errorMessage = error.response && error.response.data && error.response.data.message
        ? error.response.data.message
        : 'Échec de l\'opération. Veuillez réessayer.';
      Alert.alert('Erreur', errorMessage);
      console.log("Erreur de connexion (AuthScreen):", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require('../../assets/bg_leaves.jpeg')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay} />
      <Text style={styles.appName}>Gaza Gabon</Text>
      <Text style={styles.signInTitle}>Connexion</Text>

      <Image
        source={require('../../assets/logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.companyName}>OpusLabs</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, { color: colors.text, borderColor: colors.inputBorder }]}
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
          placeholder="Adresse e-mail"
          placeholderTextColor={colors.placeholder}
        />
        <TextInput
          style={[styles.input, { color: colors.text, borderColor: colors.inputBorder }]}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          placeholder="Mot de passe"
          placeholderTextColor={colors.placeholder}
        />
      </View>

      <TouchableOpacity
        style={styles.signUpButton}
        onPress={handleAuth}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.signUpButtonText}>Se connecter</Text>
        )}
      </TouchableOpacity>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 10,
    marginTop: 30,
    textAlign: 'center',
  },
  signInTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    marginTop: 50,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  companyName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 40,
  },
  inputContainer: {
    width: '80%',
    marginBottom: 30,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 25,
    paddingHorizontal: 20,
    fontSize: 16,
    color: '#fff',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  signUpButton: {
    width: '80%',
    height: 50,
    backgroundColor: '#4CAF50',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  signUpButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  }
});

export default AuthScreen; 