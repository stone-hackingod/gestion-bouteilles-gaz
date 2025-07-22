import React, { useMemo, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, ActivityIndicator, StatusBar } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import stockApi from '../api/stockApi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { getCache, saveCache } from '../services/offlineManager';

const { width } = Dimensions.get('window');
const CHART_WIDTH = width - 40;
const CHART_HEIGHT = 180;

// Données de démonstration
const stockData = {
  labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'],
  datasets: [{
    data: [1200, 1300, 1250, 1400, 1350, 1234],
  }]
};

const deliveryData = {
  labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'],
  datasets: [{
    data: [10, 8, 12, 9, 11, 6],
  }]
};

const distributionData = [
  {
    name: 'Plein',
    population: 800,
    color: '#43A047',
    legendFontColor: '#7F7F7F',
  },
  {
    name: 'Vide',
    population: 300,
    color: '#E53935',
    legendFontColor: '#7F7F7F',
  },
  {
    name: 'En cours',
    population: 134,
    color: '#FFA000',
    legendFontColor: '#7F7F7F',
  },
];

const KPIs = [
  {
    title: 'Taux de Livraison',
    value: '98%',
    icon: 'truck-delivery',
    color: '#43A047',
  },
  {
    title: 'Satisfaction',
    value: '4.8/5',
    icon: 'star',
    color: '#FFA000',
  },
  {
    title: 'Efficacité',
    value: '92%',
    icon: 'chart-line',
    color: '#2196F3',
  },
];

const OFFLINE_ACTIONS_KEY = 'OFFLINE_ACTIONS';
const STOCK_CACHE_KEY = 'CACHE_STOCK';
const MOVEMENTS_CACHE_KEY = 'CACHE_MOVEMENTS';

function DashboardScreen() {
  const { colors, theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [stock, setStock] = useState(null);
  const [localDeliveries, setLocalDeliveries] = useState([]);
  const [movements, setMovements] = useState([]);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      if (isConnected) {
        try {
          const [stockRes, movementsRes] = await Promise.all([
            stockApi.getStock(),
            stockApi.getStockMovements(),
          ]);
          setStock(stockRes);
          setMovements(movementsRes);
          await saveCache(STOCK_CACHE_KEY, stockRes);
          await saveCache(MOVEMENTS_CACHE_KEY, movementsRes);
          // Charger les livraisons locales (offline)
          const data = await AsyncStorage.getItem(OFFLINE_ACTIONS_KEY);
          let deliveries = [];
          if (data) {
            deliveries = JSON.parse(data).filter(a => a.type === 'CREATE_DELIVERY');
          }
          setLocalDeliveries(deliveries);
        } catch (e) {
          setError('Erreur lors du chargement des données.');
        } finally {
          setLoading(false);
        }
      } else {
        // Mode offline : lecture du cache
        const cachedStock = await getCache(STOCK_CACHE_KEY);
        const cachedMovements = await getCache(MOVEMENTS_CACHE_KEY);
        setStock(cachedStock);
        setMovements(cachedMovements || []);
        // Charger les livraisons locales (offline)
        const data = await AsyncStorage.getItem(OFFLINE_ACTIONS_KEY);
        let deliveries = [];
        if (data) {
          deliveries = JSON.parse(data).filter(a => a.type === 'CREATE_DELIVERY');
        }
        setLocalDeliveries(deliveries);
        setLoading(false);
      }
    };
    fetchData();
  }, [isConnected]);

  // Livraisons du jour (locales)
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  const deliveriesToday = localDeliveries.filter(d => (d.date || '').slice(0, 10) === todayStr);

  // Graphique d'évolution du stock (par mois)
  const stockChartData = useMemo(() => {
    if (!movements.length) return {
      labels: [],
      datasets: [{ data: [] }],
    };
    // Regrouper par mois (exemple)
    const grouped = {};
    movements.forEach(m => {
      const mois = new Date(m.createdAt).toLocaleString('fr-FR', { month: 'short' });
      grouped[mois] = (grouped[mois] || 0) + (m.fullBottles || 0);
    });
    const labels = Object.keys(grouped);
    const data = Object.values(grouped);
    return {
      labels,
      datasets: [{ data }],
    };
  }, [movements]);

  const chartConfig = useMemo(() => ({
    backgroundGradientFrom: colors.background,
    backgroundGradientTo: colors.background,
    color: (opacity = 1) => colors.buttonPrimary,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
  }), [colors]);

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}> 
        <ActivityIndicator size="large" color={colors.buttonPrimary} />
        <Text style={{ color: colors.text, marginTop: 16 }}>Chargement du tableau de bord...</Text>
      </View>
    );
  }
  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}> 
        <Text style={{ color: 'red' }}>{error}</Text>
      </View>
    );
  }

  return (
    <>
      <StatusBar
        backgroundColor={theme === 'dark' ? '#121212' : '#F5F8F7'}
        barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
      />
      <ScrollView 
        style={[styles.container, { backgroundColor: colors.background }]}
        showsVerticalScrollIndicator={false}
      >
        {/* KPIs */}
        <View style={styles.kpiContainer}>
          {KPIs.map((kpi) => (
            <View key={kpi.title} style={[styles.kpiCard, { backgroundColor: colors.cardBackground }]}>
              <MaterialCommunityIcons name={kpi.icon} size={24} color={kpi.color} />
              <Text style={[styles.kpiValue, { color: colors.text }]}>{kpi.value}</Text>
              <Text style={[styles.kpiTitle, { color: colors.secondaryText }]}>{kpi.title}</Text>
            </View>
          ))}
        </View>

        {/* Statistiques rapides */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Aperçu</Text>
          <View style={styles.statsContainer}>
            <View style={[styles.statCard, { backgroundColor: colors.cardBackground }]}>
              <Text style={[styles.statValue, { color: colors.text }]}>{stock ? stock.fullBottles + stock.emptyBottles + stock.consignedBottles : '-'}</Text>
              <Text style={[styles.statLabel, { color: colors.secondaryText }]}>Bouteilles en Stock</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.cardBackground }]}>
              <Text style={[styles.statValue, { color: colors.text }]}>{deliveriesToday.length}</Text>
              <Text style={[styles.statLabel, { color: colors.secondaryText }]}>Livraisons du Jour</Text>
            </View>
          </View>
        </View>

        {/* Graphique d'évolution du stock */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Évolution du Stock</Text>
          <LineChart
            data={stockChartData}
            width={CHART_WIDTH}
            height={CHART_HEIGHT}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
        </View>

        {/* Graphique des livraisons */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Livraisons de la Semaine</Text>
          <BarChart
            data={deliveryData}
            width={CHART_WIDTH}
            height={CHART_HEIGHT}
            chartConfig={chartConfig}
            style={styles.chart}
          />
        </View>

        {/* Distribution des bouteilles */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Distribution des Bouteilles</Text>
          <PieChart
            data={distributionData}
            width={CHART_WIDTH}
            height={CHART_HEIGHT}
            chartConfig={chartConfig}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            style={styles.chart}
          />
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 50,
  },
  kpiContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  kpiCard: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    marginHorizontal: 5,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  kpiValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 5,
  },
  kpiTitle: {
    fontSize: 12,
    marginTop: 2,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    marginHorizontal: 5,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
});

export default DashboardScreen; 