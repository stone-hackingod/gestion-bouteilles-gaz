import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

const OFFLINE_ACTIONS_KEY = 'OFFLINE_ACTIONS';

// Sauvegarder une action en attente de synchronisation
export async function saveOfflineAction(action) {
  const actions = await getOfflineActions();
  actions.push(action);
  await AsyncStorage.setItem(OFFLINE_ACTIONS_KEY, JSON.stringify(actions));
}

// Récupérer toutes les actions en attente
export async function getOfflineActions() {
  const data = await AsyncStorage.getItem(OFFLINE_ACTIONS_KEY);
  return data ? JSON.parse(data) : [];
}

// Supprimer toutes les actions synchronisées
export async function clearOfflineActions() {
  await AsyncStorage.removeItem(OFFLINE_ACTIONS_KEY);
}

// Tenter de synchroniser les actions locales avec le backend
export async function syncOfflineActions(syncFunction) {
  const actions = await getOfflineActions();
  if (actions.length === 0) return;
  try {
    for (const action of actions) {
      await syncFunction(action); // syncFunction doit envoyer l'action au backend
    }
    await clearOfflineActions();
  } catch (e) {
    // Si une erreur survient, on garde les actions pour une prochaine tentative
    console.log('Erreur de synchronisation offline:', e);
  }
}

// Surveiller la connexion et lancer la synchronisation si besoin
export function watchNetworkAndSync(syncFunction) {
  return NetInfo.addEventListener(state => {
    if (state.isConnected) {
      syncOfflineActions(syncFunction);
    }
  });
}

// --- Gestion du cache de données (stock, mouvements, etc.) ---
export async function saveCache(key, data) {
  await AsyncStorage.setItem(key, JSON.stringify(data));
}
export async function getCache(key) {
  const data = await AsyncStorage.getItem(key);
  return data ? JSON.parse(data) : null;
}
export async function clearCache(key) {
  await AsyncStorage.removeItem(key);
} 