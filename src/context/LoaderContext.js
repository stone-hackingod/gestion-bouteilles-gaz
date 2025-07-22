import React, { createContext, useState, useContext } from 'react';
import { View, ActivityIndicator, StyleSheet, Modal } from 'react-native';

const LoaderContext = createContext({ showLoader: () => {}, hideLoader: () => {}, loading: false });

export const LoaderProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);

  const showLoader = () => setLoading(true);
  const hideLoader = () => setLoading(false);

  return (
    <LoaderContext.Provider value={{ showLoader, hideLoader, loading }}>
      {children}
      <Modal
        visible={loading}
        transparent
        animationType="fade"
        onRequestClose={() => {}}
      >
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="#43A047" />
        </View>
      </Modal>
    </LoaderContext.Provider>
  );
};

export const useLoader = () => useContext(LoaderContext);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 