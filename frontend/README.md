# Frontend - Bibliothèque Numérique Coopérative

Interface utilisateur React pour la plateforme de partage de fichiers des coopératives rurales au Burkina Faso.

## 🚀 Installation et démarrage

### Prérequis
- Node.js (version 16 ou supérieure)
- npm ou yarn
- Backend API en fonctionnement sur le port 3001

### Installation des dépendances
```bash
npm install
```

### Variables d'environnement
Créez un fichier `.env` à la racine du projet frontend :
```bash
VITE_API_URL=http://localhost:3001/api
```

### Démarrage du serveur de développement
```bash
npm run dev
```

L'application sera accessible sur `http://localhost:3000`

### Build de production
```bash
npm run build
```

## 📱 Fonctionnalités

### Pour tous les utilisateurs
- **Connexion sécurisée** avec authentification JWT
- **Tableau de bord** avec aperçu des statistiques
- **Bibliothèque** avec recherche et filtrage avancés
- **Visualisation de fichiers** (PDF, images, audio, vidéo)
- **Téléchargement** de fichiers
- **Gestion du profil** (informations personnelles, mot de passe)

### Pour les administrateurs
- **Gestion complète des fichiers** (ajout, modification, suppression)
- **Upload par glisser-déposer** avec barre de progression
- **Gestion des utilisateurs** (inscription de nouveaux utilisateurs)

## 🎨 Interface utilisateur

### Design
- **Responsive** : Optimisé pour mobile, tablette et desktop
- **Moderne** : Interface claire et intuitive avec Tailwind CSS
- **Accessible** : Respect des bonnes pratiques d'accessibilité
- **Thème cohérent** : Couleurs adaptées au contexte rural africain

### Navigation
- **Sidebar** avec navigation principale
- **Breadcrumbs** pour la navigation contextuelle
- **Modals** pour les actions importantes
- **Toast notifications** pour les retours utilisateur

## 🔧 Technologies utilisées

- **React 18** - Framework JavaScript
- **Vite** - Outil de build moderne et rapide
- **React Router** - Navigation côté client
- **Tailwind CSS** - Framework CSS utilitaire
- **Headless UI** - Composants accessibles
- **Heroicons** - Icônes SVG
- **Axios** - Client HTTP
- **React Hot Toast** - Notifications
- **React Dropzone** - Upload de fichiers par glisser-déposer
- **js-file-download** - Téléchargement de fichiers

## 📁 Structure du projet

```
frontend/
├── public/                 # Fichiers statiques
├── src/
│   ├── assets/            # Images, icônes
│   ├── components/        # Composants réutilisables
│   │   ├── Layout.jsx     # Layout principal avec sidebar
│   │   ├── ProtectedRoute.jsx  # Route protégée
│   │   ├── AdminRoute.jsx      # Route admin
│   │   └── LoadingSpinner.jsx  # Composant de chargement
│   ├── context/           # Contextes React
│   │   └── AuthContext.jsx     # Gestion de l'authentification
│   ├── pages/             # Pages de l'application
│   │   ├── Login.jsx           # Page de connexion
│   │   ├── Dashboard.jsx       # Tableau de bord
│   │   ├── Library.jsx         # Bibliothèque de fichiers
│   │   ├── FileDetail.jsx      # Détail d'un fichier
│   │   ├── FileManagement.jsx  # Gestion des fichiers (admin)
│   │   └── Profile.jsx         # Profil utilisateur
│   ├── services/          # Services API
│   │   └── api.js              # Configuration Axios et services
│   ├── App.jsx            # Composant racine
│   ├── main.jsx           # Point d'entrée
│   └── index.css          # Styles globaux
├── index.html             # Template HTML
├── package.json           # Dépendances et scripts
├── vite.config.js         # Configuration Vite
├── tailwind.config.js     # Configuration Tailwind
└── postcss.config.js      # Configuration PostCSS
```

## 🔐 Authentification

### Système de connexion
- **JWT Token** stocké en localStorage
- **Vérification automatique** du token au chargement
- **Redirection automatique** si non connecté
- **Gestion des rôles** (utilisateur/admin)

### Sécurité
- **Protection des routes** selon les rôles
- **Validation côté client** des formulaires
- **Gestion des erreurs** API avec messages utilisateur
- **Déconnexion automatique** en cas de token expiré

## 📱 Responsive Design

### Breakpoints Tailwind
- **sm**: 640px et plus (tablettes)
- **md**: 768px et plus (tablettes larges)
- **lg**: 1024px et plus (desktop)
- **xl**: 1280px et plus (grands écrans)

### Adaptations mobiles
- **Sidebar** convertie en menu hamburger
- **Grilles** adaptatives (1 colonne sur mobile, 2-3 sur desktop)
- **Formulaires** optimisés pour le tactile
- **Modals** pleine largeur sur mobile

## 🎯 Types de fichiers supportés

### Visualisation intégrée
- **PDF** : Viewer intégré dans iframe
- **Images** : Affichage direct (JPEG, PNG, GIF)
- **Audio** : Lecteur HTML5 (MP3, WAV, OGG)
- **Vidéo** : Lecteur HTML5 avec streaming (MP4, AVI, MOV, WMV)

### Téléchargement
- **Tous types** supportés pour téléchargement
- **Noms de fichiers** préservés
- **Taille maximale** : 50MB par fichier

## 🔍 Fonctionnalités de recherche

### Filtres disponibles
- **Type de fichier** (PDF, Image, Audio, Vidéo)
- **Thématique** (Agriculture, Santé, Éducation, etc.)
- **Tri** par date, titre, type, thématique
- **Ordre** croissant ou décroissant

### Recherche textuelle
- **Recherche globale** dans titre, description et thématique
- **Résultats en temps réel**
- **Mise en évidence** des termes recherchés

## 🚨 Gestion des erreurs

### Types d'erreurs gérées
- **Erreurs réseau** (pas de connexion)
- **Erreurs serveur** (500, 503)
- **Erreurs d'authentification** (401, 403)
- **Erreurs de validation** (400)
- **Fichiers non trouvés** (404)

### Notifications utilisateur
- **Toast success** pour les actions réussies
- **Toast error** pour les erreurs
- **Messages contextuels** dans les formulaires
- **États de chargement** avec spinners

## 🔧 Développement

### Scripts disponibles
```bash
npm run dev        # Serveur de développement
npm run build      # Build de production
npm run preview    # Aperçu du build
npm run lint       # Vérification ESLint
```

### Bonnes pratiques
- **Composants fonctionnels** avec hooks
- **Gestion d'état** avec Context API
- **Code splitting** automatique par route
- **Lazy loading** des composants lourds
- **Optimisation des images** et assets

## 🌐 Déploiement

### Build de production
Le build génère des fichiers statiques dans le dossier `dist/` qui peuvent être servis par n'importe quel serveur web.

### Configuration serveur
Pour le déploiement sur Raspberry Pi :
1. Builder l'application : `npm run build`
2. Copier le contenu de `dist/` vers le serveur web
3. Configurer le serveur pour servir `index.html` pour toutes les routes (SPA)
4. S'assurer que l'API backend est accessible

### Variables d'environnement de production
```bash
VITE_API_URL=http://bibliotheque.local:3001/api
```

## 📞 Support

Pour toute question ou problème :
1. Vérifiez que le backend est démarré
2. Vérifiez la configuration des variables d'environnement
3. Consultez la console du navigateur pour les erreurs
4. Vérifiez la connectivité réseau avec l'API
