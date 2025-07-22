# 🚀 Instructions de Build - Application Front Gaz

## 📋 Prérequis
- Node.js installé
- Expo CLI installé (`npm install -g @expo/cli`)
- Compte Expo configuré
- EAS CLI installé (`npm install -g eas-cli`)

## 🔧 Configuration effectuée

### ✅ Problèmes résolus :
1. **Configuration de sécurité réseau Android** : Fichier `network_security_config.xml` créé
2. **Permissions réseau** : Ajoutées dans `AndroidManifest.xml`
3. **Client API amélioré** : Timeout et gestion d'erreur dans `apiClient.js`
4. **Service de diagnostic** : `NetworkService` pour tester la connectivité
5. **Configuration EAS** : Mise à jour pour générer des APK

## 🏗️ Génération de l'APK

### Étape 1 : Préparation
```bash
cd "front gaz/front-gaz"
npm install
```

### Étape 2 : Configuration EAS (si pas déjà fait)
```bash
eas login
eas build:configure
```

### Étape 3 : Build de l'APK
```bash
# Build pour preview (APK)
eas build --platform android --profile preview

# Ou build pour développement
eas build --platform android --profile development
```

### Étape 4 : Téléchargement
- Le build sera disponible dans votre dashboard Expo
- Téléchargez l'APK et installez-le sur votre appareil

## 🔍 Test de la connectivité

### Dans l'application :
1. Ouvrez l'application
2. Allez dans les paramètres ou utilisez le composant `NetworkDiagnostic`
3. Lancez le diagnostic réseau
4. Vérifiez les logs dans la console

### Vérification manuelle :
```bash
# Test de connectivité vers le serveur
curl -v http://31.97.55.154:5000/api/health
```

## 🐛 Diagnostic des problèmes

### Si l'APK ne se connecte toujours pas :

1. **Vérifiez le serveur** :
   - Le serveur `31.97.55.154:5000` est-il actif ?
   - Le port 5000 est-il ouvert ?

2. **Vérifiez la configuration réseau** :
   - L'appareil a-t-il une connexion internet ?
   - Le firewall ne bloque-t-il pas la connexion ?

3. **Vérifiez les logs** :
   - Ouvrez les logs de développement
   - Recherchez les erreurs de connexion

### Messages d'erreur courants :
- `ECONNABORTED` : Timeout - serveur lent ou inaccessible
- `ERR_NETWORK` : Problème de réseau - vérifiez la connectivité
- `401` : Erreur d'authentification
- `500+` : Erreur serveur

## 📞 Support
En cas de problème persistant, contactez l'équipe technique avec :
- Les logs d'erreur
- La version de l'APK
- Le modèle d'appareil
- La version Android 