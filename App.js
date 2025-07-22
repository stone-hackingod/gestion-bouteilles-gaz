import React from 'react';
import AppNavigator from './src/AppNavigator';
import { ThemeProvider } from './src/context/ThemeContext';
import { LoaderProvider } from './src/context/LoaderContext';

export default function App() {
  return (
    <LoaderProvider>
      <ThemeProvider>
        <AppNavigator />
      </ThemeProvider>
    </LoaderProvider>
  );
}
