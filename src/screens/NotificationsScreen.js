import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, FlatList, TouchableOpacity, StatusBar } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import notificationApi from '../api/notificationApi';
import { useTheme } from '../context/ThemeContext';

function NotificationsScreen() {
  const { colors, theme } = useTheme();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const data = await notificationApi.getNotifications();
      // Trier pour afficher les non lues en premier, puis par date (les plus récentes d'abord)
      const sortedData = data.sort((a, b) => {
        if (a.isRead === b.isRead) {
          return new Date(b.createdAt) - new Date(a.createdAt);
        }
        return a.isRead ? 1 : -1; // Les non lues (false) viennent avant les lues (true)
      });
      setNotifications(sortedData);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger les notifications : ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  // Utiliser useFocusEffect pour recharger les notifications chaque fois que l'écran est mis au point
  useFocusEffect(
    useCallback(() => {
      fetchNotifications();
    }, [])
  );

  const handleMarkAsRead = async (id) => {
    try {
      await notificationApi.markAsRead(id);
      // Mettre à jour l'état local pour marquer comme lu sans recharger toutes les données
      setNotifications(prevNotifications =>
        prevNotifications.map(notif =>
          notif._id === id ? { ...notif, isRead: true } : notif
        ).sort((a, b) => {
          if (a.isRead === b.isRead) {
            return new Date(b.createdAt) - new Date(a.createdAt);
          }
          return a.isRead ? 1 : -1;
        })
      );
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de marquer la notification comme lue : ' + (error.response?.data?.message || error.message));
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.buttonPrimary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>Chargement des notifications...</Text>
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
        <Text style={[styles.title, { color: colors.buttonPrimary }]}>Notifications</Text>
        <FlatList
          data={notifications}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={[
                styles.notificationItem,
                { backgroundColor: colors.cardBackground, borderLeftColor: item.isRead ? colors.inputBorder : colors.buttonSecondary },
                item.isRead ? styles.readItem : styles.unreadItem
              ]}
              onPress={() => !item.isRead && handleMarkAsRead(item._id)}
              activeOpacity={item.isRead ? 1 : 0.7}
            >
              <Text style={[styles.notificationType, { color: colors.buttonSecondary }]}>Type: {item.type}</Text>
              <Text style={[styles.notificationMessage, item.isRead ? styles.readText : styles.unreadText, { color: colors.text }]}>
                {item.message}
              </Text>
              <Text style={[styles.notificationDate, { color: colors.secondaryText }]}>Créé le: {new Date(item.createdAt).toLocaleString()}</Text>
              {!item.isRead && <Text style={[styles.unreadIndicator, { color: colors.buttonPrimary }]}>Nouveau !</Text>}
            </TouchableOpacity>
          )}
          keyExtractor={item => item._id}
          ListEmptyComponent={<Text style={[styles.emptyListText, { color: colors.secondaryText }]}>Aucune notification pour le moment.</Text>}
          style={styles.listContainer}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f7fafd',
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
  listContainer: {
    width: '100%',
  },
  notificationItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
    borderLeftWidth: 5,
  },
  unreadItem: {
    borderLeftColor: '#ffc107', // Couleur pour les notifications non lues (jaune/orange)
  },
  readItem: {
    borderLeftColor: '#6c757d', // Couleur pour les notifications lues (gris)
    opacity: 0.7,
  },
  notificationType: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: 5,
  },
  notificationMessage: {
    fontSize: 16,
    marginBottom: 5,
  },
  unreadText: {
    color: '#333',
    fontWeight: '600',
  },
  readText: {
    color: '#555',
    fontStyle: 'italic',
  },
  notificationDate: {
    fontSize: 12,
    color: '#777',
    textAlign: 'right',
  },
  unreadIndicator: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#dc3545',
    textAlign: 'right',
    marginTop: 5,
  },
  emptyListText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#777',
  },
});

export default NotificationsScreen; 