import React, { useCallback, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Animated, ScrollView, ActivityIndicator, StatusBar } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');
const CARD_SIZE = width / 2.2;

const actions = [
  {
    key: 'livraisons',
    label: 'Livraisons',
    icon: <MaterialCommunityIcons name="truck-delivery" size={32} color="#fff" />,
    screen: 'Livraisons',
    colors: ['#2196F3', '#1976D2'],
  },
  {
    key: 'stock',
    label: 'Stock',
    icon: <FontAwesome5 name="boxes" size={32} color="#fff" />,
    screen: 'Stock',
    colors: ['#43A047', '#2E7D32'],
  },
  {
    key: 'notifications',
    label: 'Notifications',
    icon: <Ionicons name="notifications" size={32} color="#fff" />,
    screen: 'Notifications',
    colors: ['#FF9800', '#F57C00'],
  },
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: <MaterialCommunityIcons name="view-dashboard" size={32} color="#fff" />,
    screen: 'Dashboard',
    colors: ['#8E24AA', '#6A1B9A'],
  },
];

function HomeScreen({ navigation }) {
  const { theme, colors } = useTheme();
  const scaleAnim = React.useRef(new Animated.Value(0)).current;
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const [prenom, setPrenom] = useState('');

  const startAnimations = useCallback(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 10,
        friction: 3,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    ]).start();
  }, [scaleAnim, fadeAnim]);

  useEffect(() => {
    const fetchPrenom = async () => {
      try {
        const userStr = await AsyncStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          setPrenom(user.name || user.prenom || user.email || '');
        }
      } catch (e) {
        setPrenom('');
      }
    };
    fetchPrenom();
  }, []);

  React.useEffect(() => {
    startAnimations();
  }, [startAnimations]);

  const handleNavigation = useCallback((screen) => {
    navigation.navigate(screen);
  }, [navigation]);

  return (
    <>
      <StatusBar
        backgroundColor={theme === 'dark' ? '#121212' : '#F5F8F7'}
        barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
      />
      <View style={[styles.mainWrapper, { backgroundColor: colors.background }]}>
    <ScrollView 
          contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.logoContainer}>
        <MaterialCommunityIcons 
          name="gas-cylinder" 
              size={70} 
          color={colors.buttonPrimary}
        />
      </View>
      {prenom ? (
        <Text style={[styles.welcome, { color: colors.buttonPrimary }]}>Bienvenue, {prenom} !</Text>
      ) : (
        <Text style={[styles.welcome, { color: colors.buttonPrimary }]}>Bienvenue à Gaza Gabon</Text>
      )}
      <Text style={[styles.subtitle, { color: colors.secondaryText }]}>Votre application de gestion de bouteilles de gaz</Text>
      <View style={styles.gridContainer}>
            <View style={styles.row}>
              {actions.slice(0,2).map((action) => (
                <Animated.View
                  key={action.key}
                  style={[
                    styles.cardWrapper,
                    { transform: [{ scale: scaleAnim }], opacity: scaleAnim },
                  ]}
                >
                  <TouchableOpacity
                    style={styles.card}
                    onPress={() => handleNavigation(action.screen)}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={action.colors}
                      style={styles.gradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <View style={styles.iconContainer}>{action.icon}</View>
                      <Text style={styles.cardLabel}>{action.label}</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>
            <View style={styles.row}>
              {actions.slice(2,4).map((action) => (
          <Animated.View
            key={action.key}
            style={[
              styles.cardWrapper,
                    { transform: [{ scale: scaleAnim }], opacity: scaleAnim },
            ]}
          >
            <TouchableOpacity
              style={styles.card}
              onPress={() => handleNavigation(action.screen)}
                    activeOpacity={0.8}
            >
              <LinearGradient
                colors={action.colors}
                style={styles.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.iconContainer}>{action.icon}</View>
                <Text style={styles.cardLabel}>{action.label}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        ))}
            </View>
      </View>
    </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  mainWrapper: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  container: {
    width: '100%',
    flex: 1,
    paddingHorizontal: 10,
  },
  logoContainer: {
    width: 130,
    height: 130,
    marginBottom: 28,
    borderRadius: 65,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 7,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    alignSelf: 'center',
  },
  welcome: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 17,
    marginBottom: 38,
    textAlign: 'center',
    color: '#6B7A8F',
  },
  gridContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },
  cardWrapper: {
    marginHorizontal: 10,
    marginVertical: 5,
  },
  card: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    borderRadius: 22,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 7,
    backgroundColor: '#fff',
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
  },
  iconContainer: {
    marginBottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    padding: 18,
    borderRadius: 18,
  },
  cardLabel: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
});

export default HomeScreen; 