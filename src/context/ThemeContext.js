import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light'); // 'light' ou 'dark'

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const storedTheme = await AsyncStorage.getItem('appTheme');
        if (storedTheme) {
          setTheme(storedTheme);
        }
      } catch (error) {
        console.error('Erreur lors du chargement du thème depuis AsyncStorage:', error);
      }
    };
    loadTheme();
  }, []);

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    try {
      await AsyncStorage.setItem('appTheme', newTheme);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du thème dans AsyncStorage:', error);
    }
  };

  // Définir les styles de base pour chaque thème
  const colors = {
    light: {
      background: '#F5F8F7',
      cardBackground: '#FFFFFF',
      text: '#2D3A4B',
      secondaryText: '#4A4A4A',
      inputBorder: '#E0E0E0',
      placeholder: '#999',
      buttonPrimary: '#4CAF50',
      buttonSecondary: '#2196F3',
      inputBackground: '#FFFFFF',
      // Ajoutez d'autres couleurs spécifiques au thème clair ici
    },
    dark: {
      background: '#121212',
      cardBackground: '#1E1E1E',
      text: '#FFFFFF',
      secondaryText: '#BBBBBB',
      inputBorder: '#555555',
      placeholder: '#AAAAAA',
      buttonPrimary: '#6A1B9A', // Un violet plus foncé pour le mode sombre
      buttonSecondary: '#00BCD4', // Un bleu sarcelle pour le mode sombre
      inputBackground: '#222222',
      // Ajoutez d'autres couleurs spécifiques au thème sombre ici
    },
  };

  const currentColors = colors[theme];

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, colors: currentColors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext); 