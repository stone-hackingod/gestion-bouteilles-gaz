import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native'; // Pour simuler des icônes avec du texte pour l'instant

import HomeScreen from './screens/HomeScreen'; // Nous allons créer ce fichier plus tard
import DeliveryScreen from './screens/DeliveryScreen'; // Importez le nouvel écran
import AuthScreen from './screens/AuthScreen'; // Importez le nouvel écran d'authentification
import StockScreen from './screens/StockScreen';
import NotificationsScreen from './screens/NotificationsScreen';
import DashboardScreen from './screens/DashboardScreen';
import ParametresScreen from './screens/ParametresScreen';
import ProfilScreen from './screens/ProfilScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Accueil') {
            iconName = '🏠'; // Exemple d'icône textuelle
          } else if (route.name === 'Livraisons') {
            iconName = '🚚';
          } else if (route.name === 'Stock') {
            iconName = '📦';
          } else if (route.name === 'Notifications') {
            iconName = '🔔';
          } else if (route.name === 'Dashboard') {
            iconName = '📊';
          } else if (route.name === 'Paramètres') {
            iconName = '⚙️';
          } else if (route.name === 'Profil') {
            iconName = '👤';
          }
          return <Text style={{ color: focused ? '#8E2DE2' : color, fontSize: size }}>{iconName}</Text>;
        },
        tabBarActiveTintColor: '#8E2DE2', // Couleur active pour les icônes et labels
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: '#FFFFFF', // Fond de la barre d'onglets
          borderTopWidth: 1,
          borderTopColor: '#E0E0E0',
          height: 60,
          paddingBottom: 5,
          paddingTop: 5,
        },
        tabBarLabelStyle: {
          fontSize: 12,
        },
        headerShown: false, // Cache l'en-tête pour les écrans à l'intérieur des onglets
      })}
    >
      <Tab.Screen name="Accueil" component={HomeScreen} />
      <Tab.Screen name="Livraisons" component={DeliveryScreen} />
      <Tab.Screen name="Stock" component={StockScreen} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} />
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Paramètres" component={ParametresScreen} />
      <Tab.Screen name="Profil" component={ProfilScreen} />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  return (
    <NavigationContainer>
      {/* TODO: Implémenter la logique de redirection après authentification réussie */}
      <Stack.Navigator initialRouteName="Auth">
        <Stack.Screen name="Auth" component={AuthScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Main" component={MainTabNavigator} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default AppNavigator; 