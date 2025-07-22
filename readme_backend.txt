# 🔧 BackendGaz - API Node.js pour la gestion de gaz

BackendGaz est une API RESTful développée en Node.js avec Express, conçue pour gérer les opérations de distribution de gaz : utilisateurs, livraisons, stocks, etc.

---

## 📦 Fonctionnalités principales

- 🔐 Authentification JWT
- 👤 Gestion des utilisateurs
- 📦 Gestion des stocks de gaz
- 🧾 Création / modification / suppression de commandes
- 🚚 Suivi des livraisons

---

## 🛠️ Technologies utilisées

| Technologie       | Rôle                                 |
|-------------------|--------------------------------------|
| Node.js           | Environnement JavaScript backend     |
| Express.js        | Framework web léger pour API REST    |
| MongoDB + Mongoose| Base de données NoSQL + ODM          |
| JSON Web Token    | Authentification sécurisée           |
| Nodemon           | Rechargement automatique en dev      |
| GitHub Actions    | Intégration continue (CI/CD)         |

---

## ⚙️ Installation & Lancement

```bash
git clone https://github.com/Yuniel241/BackendGaz.git
cd BackendGaz
npm install

# 🔄 Lancer en mode développement (rechargement automatique)
nodemon src/index.js

# 🚀 Lancer en mode production
node src/index.js

# 🌐 L'API sera accessible à l'adresse :
# http://localhost:5000

```
---



# 📚 Documentation API

**Base URL:** `http://localhost:5000/api`

## 🔐 Middleware liés à l'authentification
   Middleware | Description |
 |------------|-------------|
 | `protect` | Protège les routes. Vérifie et décode le token JWT. Autorise aussi l'inscription du tout premier utilisateur sans authentification. |
 | `isAdmin` | Vérifie que l'utilisateur est un administrateur. |
 | `restrictTo(...roles)` | Permet d’autoriser l’accès à certaines routes uniquement à certains rôles définis. |

## 📌 Authentification

### POST /api/auth/register

**Description:** Crée un nouvel utilisateur. Le premier utilisateur créé devient administrateur automatiquement. Ensuite, seuls les admins peuvent en créer d'autres.

**Protection:** Ouvert sans token si aucun utilisateur n'existe. Protégé par `protect` ensuite.

**Corps de la requête:**
```json
{
  "name": "Nom Complet",
  "email": "exemple@email.com",
  "password": "MotDePasseFort123",
  "role": "admin"
}
```
**Réponse réussie:**
```json
{
  "message": "Utilisateur créé avec succès",
  "user": {
    "name": "Nom Complet",
    "email": "exemple@email.com",
    "password": "\$2b\$10\$2H4qUmb0/I...",
    "role": "admin",
    "_id": "68449a7efaccd886e6d9379f",
    "createdAt": "2025-06-07T20:01:02.631Z",
    "updatedAt": "2025-06-07T20:01:02.631Z"
  }
}
```
**Erreurs possibles:**  

400: Email déjà utilisé  
403: Seuls les admins peuvent créer de nouveaux utilisateurs  
500: Erreur serveur  

### POST /api/auth/login
**Description:** Connexion utilisateur (sauf le rôle driver).

**Corps de la requête**:
```json
{
  "email": "exemple@email.com",
  "password": "MotDePasseFort123"
}
```
**Réponse réussie:** 
```json
{
  "_id": "id_utilisateur",
  "name": "Nom",
  "email": "exemple@email.com",
  "role": "admin",
  "token": "jwt_token"
}
```

**Erreurs possibles:**  

401: Email ou mot de passe incorrect  
401: Les chauffeurs ne peuvent pas se connecter  

## GET /api/auth/profile
**Description**: Récupère les informations du profil de l’utilisateur actuellement connecté.  

**Protection:** protect

**Réponse réussie:**
```json
{
  "_id": "id_utilisateur",
  "name": "Nom",
  "email": "email@email.com",
  "role": "admin"
}
```
**Erreurs possibles:**  

401: Token absent, invalide ou expiré  
404: Utilisateur non trouvé  
### Exemple de Header d’authentification: 
```http
Authorization: Bearer <token JWT>
```

## 👥 Utilisateurs
## GET /api/users
**Description:** Récupère la liste de tous les utilisateurs.  
**Accès:** Admin uniquement  
**Headers:**
```http
Authorization: Bearer <token>
```
**Réponse réussie:**
```json
[
  {
    "_id": "664c3c6e1234567890abcdef",
    "name": "Jean Dupont",
    "email": "jean@example.com",
    "role": "driver",
    "createdAt": "2024-05-23T12:34:56.789Z",
    "updatedAt": "2024-05-23T12:34:56.789Z"
  }
]
```

## PUT /api/users/
**Description:** Met à jour un utilisateur existant.  
**Accès:** Admin uniquement  
**Headers:**
```http
Authorization: Bearer <token>
Content-Type: application/json
```
**Corps de la requête:**
```json
{
  "name": "Nouveau Nom",
  "email": "nouveau@email.com",
  "role": "controller"
}
```
**Réponse réussie:**

```json
{
  "_id": "664c3c6e1234567890abcdef",
  "name": "Nouveau Nom",
  "email": "nouveau@email.com",
  "role": "controller",
  "createdAt": "...",
  "updatedAt": "..."
}
```

**Erreurs possibles:**

404: Utilisateur non trouvé  
400: Email invalide ou rôle non autorisé   
500: Erreur serveur  

## DELETE /api/users/

**Description:** Supprime un utilisateur existant.  
**Accès:** Admin uniquement  
**Headers:**
```http
Authorization: Bearer <token>
```
**Réponse réussie:**
```json
{ "message": "Utilisateur supprimé avec succès" }
```
**Erreurs possibles:**  
404: Utilisateur non trouvé  
403: Tentative de suppression de son propre compte  
500: Erreur serveur  

## 🚛 Camions

## POST /api/trucks
**Description:** Ajouter un nouveau camion.  
**Accès:** Admin uniquement.  
**Headers:**
```http
Authorization: Bearer <token>
Content-Type: application/json
```
**Corps de la requête:**
```json
{
  "name": "Camion 01",
  "licensePlate": "GA-123-XY",
  "capacity": 5000
}
```
**Réponse réussie:**
```json
{
  "_id": "664c41a41234567890abcdef",
  "name": "Camion 01",
  "licensePlate": "GA-123-XY",
  "capacity": 5000,
  "status": "disponible",
  "createdAt": "2024-05-23T12:00:00.000Z",
  "updatedAt": "2024-05-23T12:00:00.000Z"
}
```
**Erreurs possibles:**  
400: Camion avec cette plaque déjà existant  
500: Erreur serveur  

## GET /api/trucks  
**Description:** Récupérer la liste de tous les camions.  
**Accès:** Tous les utilisateurs connectés (admin, controller, driver).  

**Headers:**
```http
Authorization: Bearer <token>
```
**Réponse réussie:**

```json
[
  {
    "_id": "664c41a41234567890abcdef",
    "name": "Camion 01",
    "licensePlate": "GA-123-XY",
    "capacity": 5000,
    "status": "disponible",
    "createdAt": "...",
    "updatedAt": "..."
  }
]
```

## PUT /api/trucks/
**Description:** Modifier les informations d’un camion existant.  
**Accès:** Admin uniquement.
**Headers:**
```http
Authorization: Bearer <token>
Content-Type: application/json
```

**Corps de la requête:**
```json
{
  "name": "Camion 01 MAJ",
  "licensePlate": "GA-456-ZT",
  "capacity": 6000,
  "status": "en maintenance"
}
```
**Réponse réussie:**

```json
{
  "_id": "664c41a41234567890abcdef",
  "name": "Camion 01 MAJ",
  "licensePlate": "GA-456-ZT",
  "capacity": 6000,
  "status": "en maintenance",
  "createdAt": "...",
  "updatedAt": "..."
}
```
**Erreurs possibles:**

404: Camion non trouvé  
500: Erreur serveur  

## DELETE /api/trucks/
**Description:** Supprimer un camion existant.
**Accès:** Admin uniquement.

**Headers:**
```http
Authorization: Bearer <token>
```

**Réponse réussie:**
```json
{ "message": "Camion supprimé avec succès" }
```

**Erreurs possibles:**  

404: Camion non trouvé  
500: Erreur serveur  
Valeurs autorisées pour le champ status:

"disponible" (par défaut)
"en livraison"
"en maintenance"

## 🔧 Remarques techniques
Chaque camion est identifié par un nom unique (name) et une plaque unique (licensePlate).  
Les modifications et suppressions sont effectuées via l’_id MongoDB.  
Les dates createdAt et updatedAt sont automatiquement générées via timestamps.  


## 📦 Stock
## GET /api/stock
**Description:** Récupère l'état actuel du stock.

**Réponse réussie:**
```json
{
  "_id": "680c987f686d639324ee0574",
  "fullBottles": 120,
  "emptyBottles": 110,
  "consignedBottles": 40,
  "createdAt": "2025-04-26T08:25:35.110Z",
  "updatedAt": "2025-05-26T11:09:21.222Z"
}
```
## PUT /api/stock
- **Authentification** : Requise
- **Rôle requis** : `controller`
- **Description** : Met à jour le stock en fonction du type de mouvement (entrée ou sortie).
- **Corps de la requête** :
  ```json
  {
    "fullBottles": 10,
    "emptyBottles": 5,
    "consignedBottles": 2,
    "type": "entrée",
    "description": "Description du mouvement"
  }

**Réponse réussie :**  
Code : 200 OK  
```json
{
  "message": "Stock mis à jour avec succès",
  "stock": {
    "fullBottles": 110,
    "emptyBottles": 55,
    "consignedBottles": 22
  }
}
```

## PATCH /api/stock  
Authentification : Requise  
Rôle requis : controller  
Description : Ajoute partiellement des quantités au stock.  
**Corps de la requête :**
```json
{
  "fullBottles": 10,
  "emptyBottles": 5,
  "consignedBottles": 2
}
```

**Réponse réussie :**
Code : 200 OK
```json
{
  "message": "Stock mis à jour",
  "stock": {
    "fullBottles": 110,
    "emptyBottles": 55,
    "consignedBottles": 22
  }
}
```
## GET /api/stock/movements  
Authentification : Requise  
Description : Récupère l'historique des mouvements de stock.  
Réponse réussie :  
Code : 200 OK  
```json
[
  {
    "type": "entrée",
    "fullBottles": 10,
    "emptyBottles": 5,
    "consignedBottles": 2,
    "description": "Description du mouvement",
    "user": {
      "name": "Nom de l'utilisateur",
      "email": "utilisateur@example.com"
    }
  }
]
```
**Erreurs**  
Stock insuffisant :  
Code : 400 Bad Request
 ```json
{
  "message": "Stock insuffisant"
}
```

Type de mouvement invalide :  
Code : 400 Bad Request
```json
{
  "message": "Type de mouvement invalide (entrée ou sortie requis)"
}
```
Erreur serveur :  
Code : 500 Internal Server Error  
```json
{
  "message": "Erreur serveur",
  "error": "Détails de l'erreur"
}
```

## 📦 Livraisons

### Schéma de Livraison

Le schéma de livraison est défini comme suit :
   Champ | Type | Description | Requis |
 |-------|------|-------------|--------|
 | `driver` | ObjectId | Référence à un utilisateur (chauffeur) | Oui |
 | `truck` | ObjectId | Référence à un camion existant | Oui |
 | `fullBottlesSent` | Number | Nombre de bouteilles pleines envoyées | Oui |
 | `emptyBottlesSent` | Number | Nombre de bouteilles vides envoyées | Oui |
 | `consignedBottles` | Number | Nombre de bouteilles consignées | Non (par défaut : 0) |
 | `fullBottlesReturned` | Number | Nombre de bouteilles pleines retournées | Non (par défaut : 0) |
 | `emptyBottlesReturned` | Number | Nombre de bouteilles vides retournées | Non (par défaut : 0) |
 | `status` | String | Statut de la livraison : "en cours", "terminée", "annulée" | Non (par défaut : "en cours") |

### Routes
 | Route | Méthode | Description | Middleware |
 |-------|---------|-------------|------------|
 | `/deliveries/` | POST | Crée une nouvelle livraison | `protect`, `restrictTo("controller")` |
 | `/deliveries/:id` | PATCH | Met à jour une livraison existante | `protect`, `restrictTo("controller")` |

### POST /api/deliveries

**Description :** Crée une nouvelle livraison.  
**Accès :** Contrôleur uniquement.  
**Headers :**  
```http
Authorization: Bearer <token>
Content-Type: application/json
```
**Corps de la requête :**
```json
{
  "driver": "ID_DU_CHAUFFEUR",
  "truck": "ID_DU_CAMION",
  "fullBottlesSent": 100,
  "emptyBottlesSent": 50
}
```
**Réponse réussie :**
```json
{
  "_id": "ID_DE_LA_LIVRAISON",
  "driver": "ID_DU_CHAUFFEUR",
  "truck": "ID_DU_CAMION",
  "fullBottlesSent": 100,
  "emptyBottlesSent": 50,
  "consignedBottles": 0,
  "fullBottlesReturned": 0,
  "emptyBottlesReturned": 0,
  "status": "en cours",
  "createdAt": "2023-10-10T12:00:00.000Z",
  "updatedAt": "2023-10-10T12:00:00.000Z"
}
```
**Erreurs possibles :**  
500 : Erreur serveur

## PATCH /api/deliveries/

**Description :** Met à jour une livraison existante, notamment pour indiquer les bouteilles retournées et le statut.  
**Accès :** Contrôleur uniquement.  
**Headers :**  
```http
Authorization: Bearer <token>
Content-Type: application/json
```
**Corps de la requête :**
```json
{
  "fullBottlesReturned": 40,
  "emptyBottlesReturned": 30,
  "status": "terminée"
}
```
**Réponse réussie :**
```json
{
  "message": "Livraison mise à jour avec succès",
  "livraison": {
    "_id": "ID_DE_LA_LIVRAISON",
    "driver": "ID_DU_CHAUFFEUR",
    "truck": "ID_DU_CAMION",
    "fullBottlesSent": 100,
    "emptyBottlesSent": 50,
    "consignedBottles": 20,
    "fullBottlesReturned": 40,
    "emptyBottlesReturned": 30,
    "status": "terminée",
    "createdAt": "2023-10-10T12:00:00.000Z",
    "updatedAt": "2023-10-11T10:00:00.000Z"
  }
}
```
**Erreurs possibles :**  
404 : Livraison non trouvée  
500 : Erreur serveur  

**Remarques techniques**  

Les livraisons sont liées à un chauffeur et un camion existants.  
Le statut de la livraison peut être "en cours", "terminée", ou "annulée".  
Lorsque le statut est mis à jour à "terminée", le stock est automatiquement mis à jour avec les bouteilles retournées.  

## 💰 Salaires

### Schéma de Salaire

Le schéma de salaire est défini comme suit :
   Champ | Type | Description | Requis |
 |-------|------|-------------|--------|
 | `driver` | ObjectId | Référence à un utilisateur (chauffeur) | Oui |
 | `totalDeliveries` | Number | Nombre total de livraisons effectuées | Non (par défaut : 0) |
 | `totalBottlesSold` | Number | Nombre total de bouteilles vendues | Non (par défaut : 0) |
 | `totalConsignedBottles` | Number | Nombre total de bouteilles consignées | Non (par défaut : 0) |
 | `salaryAmount` | Number | Montant total du salaire | Oui |
 | `status` | String | Statut du salaire : "en attente", "payé" | Non (par défaut : "en attente") |

### Routes
 | Route | Méthode | Description | Middleware |
 |-------|---------|-------------|------------|
 | `/salaries/` | GET | Récupère tous les salaires | `protect`, `restrictTo("admin", "controller")` |
 | `/salaries/calculate/:driverId` | POST | Calcule le salaire d'un chauffeur | `protect`, `restrictTo("admin", "controller")` |
 | `/salaries/pay/:id` | PUT | Marque un salaire comme payé | `protect`, `restrictTo("admin", "controller")` |

## GET /api/salaries

**Description :** Récupère tous les salaires.  
**Accès :** Admin et contrôleur uniquement.  
**Headers :**  
```http
Authorization: Bearer <token>
```

Réponse réussie :  
```json
[
  {
    "_id": "ID_DU_SALAIRE",
    "driver": {
      "name": "Nom du chauffeur",
      "email": "chauffeur@example.com"
    },
    "totalDeliveries": 10,
    "totalBottlesSold": 500,
    "totalConsignedBottles": 20,
    "salaryAmount": 5040,
    "status": "en attente",
    "createdAt": "2023-10-10T12:00:00.000Z",
    "updatedAt": "2023-10-10T12:00:00.000Z"
  }
]
```

Erreurs possibles :  
500 : Erreur serveur  

## POST /api/salaries/calculate/
**Description :** Calcule le salaire d'un chauffeur en fonction de ses livraisons terminées.  
**Accès :** Admin et contrôleur uniquement.  
**Headers :**  
```http
Authorization: Bearer <token>
```

**Réponse réussie :**  
```json
{
  "_id": "ID_DU_SALAIRE",
  "driver": "ID_DU_CHAUFFEUR",
  "totalDeliveries": 10,
  "totalBottlesSold": 500,
  "totalConsignedBottles": 20,
  "salaryAmount": 5040,
  "status": "en attente",
  "createdAt": "2023-10-10T12:00:00.000Z",
  "updatedAt": "2023-10-10T12:00:00.000Z"
}
```

**Erreurs possibles :**  
400 : Ce chauffeur n'existe pas  
500 : Erreur serveur  

## PUT /api/salaries/pay/
**Description :** Met à jour le statut d'un salaire à "payé".  
**Accès :** Admin et contrôleur uniquement.  
**Headers :**

```http
Authorization: Bearer <token>
```

**Réponse réussie :**
```json
{
  "_id": "ID_DU_SALAIRE",
  "driver": "ID_DU_CHAUFFEUR",
  "totalDeliveries": 10,
  "totalBottlesSold": 500,
  "totalConsignedBottles": 20,
  "salaryAmount": 5040,
  "status": "payé",
  "createdAt": "2023-10-10T12:00:00.000Z",
  "updatedAt": "2023-10-11T10:00:00.000Z"
}
```

**Erreurs possibles :**  
404 : Salaire non trouvé  
500 : Erreur serveur  

**Remarques techniques**  
Le calcul du salaire est basé sur le nombre de bouteilles vendues et consignées.  
Le prix par bouteille vendue est de 10 unités et le bonus pour bouteille consignée est de 2 unités.  
Le statut du salaire est mis à jour manuellement après paiement.  


## 📊 Statistiques du Tableau de Bord

### Route
   Route | Méthode | Description | Middleware |
 |-------|---------|-------------|------------|
 | `/stats/` | GET | Récupère les statistiques globales du tableau de bord | `protect`, `restrictTo("admin", "controller")` |

### GET /api/stats

**Description :** Récupère les statistiques globales pour le tableau de bord, incluant des informations sur les utilisateurs, les livraisons, les camions, le stock, et les salaires en attente.

**Accès :** Admin et contrôleur uniquement.

**Headers :**
```http
Authorization: Bearer <token>
```

**Réponse réussie :**  
```json
{
  "totalUsers": 50,
  "totalDrivers": 20,
  "totalDeliveries": 150,
  "totalTrucks": 10,
  "stock": {
    "fullBottles": 1200,
    "emptyBottles": 800,
    "consignedBottles": 200
  },
  "totalSalariesPending": 5000
}
```

**Détails des champs :**  

| Champ                | Description                                                   |
|----------------------|---------------------------------------------------------------|
| `totalUsers`         | Nombre total d'utilisateurs                                   |
| `totalDrivers`       | Nombre total de chauffeurs                                    |
| `totalDeliveries`    | Nombre total de livraisons terminées                          |
| `totalTrucks`        | Nombre total de camions disponibles                           |
| `stock`              | État actuel du stock, incluant les bouteilles pleines, vides et consignées |
| `totalSalariesPending` | Montant total des salaires en attente de paiement             |

**Erreurs possibles :**  
500 : Erreur serveur  

**Remarques techniques**  

Les statistiques sont calculées en temps réel à partir des données actuelles de la base de données.  
Les informations sur le stock sont récupérées à partir du document de stock le plus récent ou initialisées à zéro si aucun document n'existe.  
Le montant total des salaires en attente est calculé en utilisant une agrégation MongoDB pour sommer les montants des salaires avec le statut "en attente".  


## 🔔 Notifications

### Schéma de Notification

Le schéma de notification est défini comme suit :
   Champ | Type | Description | Requis |
 |-------|------|-------------|--------|
 | `type` | String | Type de notification : "stock", "livraison", "salaire" | Oui |
 | `message` | String | Message de la notification | Oui |
 | `isRead` | Boolean | Indique si la notification a été lue | Non (par défaut : false) |
 | `createdAt` | Date | Date de création de la notification | Non (par défaut : Date.now) |

### Routes
 | Route | Méthode | Description | Middleware |
 |-------|---------|-------------|------------|
 | `/notifications/` | GET | Récupère toutes les notifications | `protect` |
 | `/notifications/:id` | PUT | Marque une notification comme lue | `protect` |
 | `/notifications/` | POST | Crée une notification manuellement | `protect`, `restrictTo("admin")` |

### GET /api/notifications

**Description :** Récupère toutes les notifications, triées par statut de lecture et date de création.

**Accès :** Tous les utilisateurs connectés.

**Headers :**
```http
Authorization: Bearer <token>
```

**Réponse réussie :**
```json
[
  {
    "_id": "ID_DE_LA_NOTIFICATION",
    "type": "livraison",
    "message": "Une livraison a été mise à jour.",
    "isRead": false,
    "createdAt": "2023-10-10T12:00:00.000Z"
  }
]
```
**Erreurs possibles :**  
500 : Erreur serveur  

## PUT /api/notifications/

**Description :** Marque une notification comme lue.  
**Accès :** Tous les utilisateurs connectés.  
**Headers :**  
```http
Authorization: Bearer <token>
```

**Réponse réussie :**  
```json
{
  "_id": "ID_DE_LA_NOTIFICATION",
  "type": "livraison",
  "message": "Une livraison a été mise à jour.",
  "isRead": true,
  "createdAt": "2023-10-10T12:00:00.000Z"
}
```
**Erreurs possibles :**  
404 : Notification non trouvée  
500 : Erreur serveur  

## POST /api/notifications
**Description :** Crée une notification manuellement.  
**Accès :** Admin uniquement.  
**Headers :**
```http
Authorization: Bearer <token>
Content-Type: application/json
```

**Corps de la requête :**
```json
{
  "type": "stock",
  "message": "Le stock de bouteilles pleines est bas."
}
```
**Réponse réussie :**  
```json
{
  "_id": "ID_DE_LA_NOTIFICATION",
  "type": "stock",
  "message": "Le stock de bouteilles pleines est bas.",
  "isRead": false,
  "createdAt": "2023-10-10T12:00:00.000Z"
}
```
**Erreurs possibles :**  
500 : Erreur serveur  

**Remarques techniques**  
Les notifications sont triées pour afficher d'abord celles qui n'ont pas été lues, suivies par les plus récentes.  
Les notifications peuvent être créées manuellement par un administrateur pour informer les utilisateurs de divers événements ou alertes.  

## 📜 Historique des Actions

### Schéma de Log d'Action

Le schéma de log d'action est défini comme suit :
   Champ | Type | Description | Requis |
 |-------|------|-------------|--------|
 | `user` | ObjectId | Référence à l'utilisateur qui a effectué l'action | Oui |
 | `action` | String | Description de l'action effectuée | Oui |
 | `target` | String | Type de cible de l'action (par exemple, "Utilisateur", "Stock", "Livraison") | Oui |
 | `targetId` | ObjectId | Référence à l'identifiant de la cible de l'action | Non |
 | `timestamp` | Date | Date et heure de l'action | Non (par défaut : Date.now) |

### Route
 | Route | Méthode | Description | Middleware |
 |-------|---------|-------------|------------|
 | `/logs/` | GET | Récupère l'historique des actions | `protect`, `restrictTo("admin")` |

### GET /api/logs

**Description :** Récupère l'historique des actions effectuées par les utilisateurs, triées par date et heure de l'action.

**Accès :** Admin uniquement.

**Headers :**
```http
Authorization: Bearer <token>
```
**Réponse réussie :**
```json
[
  {
    "_id": "ID_DU_LOG",
    "user": {
      "name": "Nom de l'utilisateur",
      "email": "utilisateur@example.com"
    },
    "action": "Modification du stock",
    "target": "Stock",
    "targetId": "ID_DE_LA_CIBLE",
    "timestamp": "2023-10-10T12:00:00.000Z"
  }
]
```
Détails des champs :

| Champ       | Description                                                                 |
|-------------|-----------------------------------------------------------------------------|
| `user`      | Informations sur l'utilisateur qui a effectué l'action                     |
| `action`    | Description de l'action effectuée                                           |
| `target`    | Type de cible de l'action (ex. : Stock, Livraison, Utilisateur, etc.)      |
| `targetId`  | Identifiant de la cible de l'action, le cas échéant                        |
| `timestamp` | Date et heure de l'action    


**Erreurs possibles :**  
500 : Erreur serveur  

**Remarques techniques**  
Les logs sont triés par ordre décroissant de date et heure, ce qui permet de voir les actions les plus récentes en premier.  
Les informations sur l'utilisateur sont peuplées pour inclure le nom et l'email.  