# Bibliothèque Numérique Coopérative

Plateforme locale de partage de fichiers pour les coopératives et associations rurales au Burkina Faso.

## 📋 Présentation du projet

Cette plateforme permet aux coopératives rurales de partager des fichiers (PDF, audio, vidéo, images) sur un réseau local sans connexion Internet, en utilisant un Raspberry Pi comme serveur. Les utilisateurs se connectent via un Wi-Fi local et accèdent à une interface web responsive adaptée aux mobiles et PC.

### 🎯 Objectifs
- **Accessibilité** : Fonctionnement sans Internet
- **Simplicité** : Interface intuitive pour tous niveaux
- **Mobilité** : Optimisé pour smartphones et tablettes
- **Autonomie** : Serveur local sur Raspberry Pi
- **Collaboration** : Partage de connaissances entre coopératives

## 👥 Utilisateurs cibles

### Utilisateur simple
- Se connecter à la plateforme
- Parcourir la bibliothèque de fichiers
- Rechercher et filtrer les contenus
- Consulter les détails des fichiers
- Télécharger les ressources
- Gérer son profil personnel

### Administrateur
- Toutes les fonctions utilisateur
- Ajouter de nouveaux fichiers
- Modifier les informations des fichiers
- Supprimer des contenus
- Gérer les utilisateurs

## 🏗 Architecture technique

### Stack technologique
- **Frontend** : React 18 + Vite + Tailwind CSS
- **Backend** : Node.js + Express.js
- **Base de données** : SQLite (léger, adapté au Raspberry Pi)
- **Stockage** : Système de fichiers local
- **Authentification** : JWT avec rôles utilisateur/admin

### Infrastructure
- **Serveur** : Raspberry Pi avec point d'accès Wi-Fi
- **Accès** : http://bibliotheque.local
- **Réseau** : Wi-Fi local sans Internet
- **Stockage** : Carte SD ou disque USB externe

## 📁 Structure du projet

```
bibliotheque-coop/
│
├── backend/                  # API Node.js/Express
│   ├── src/
│   │   ├── config/           # Configuration DB et sécurité
│   │   ├── controllers/      # Logique métier
│   │   ├── middlewares/      # Auth, validation, upload
│   │   ├── models/           # Modèles de données
│   │   ├── routes/           # Routes API REST
│   │   ├── utils/            # Utilitaires
│   │   └── app.js            # Application principale
│   │
│   ├── uploads/              # Stockage des fichiers
│   │   ├── pdf/
│   │   ├── audio/
│   │   ├── video/
│   │   └── images/
│   │
│   └── package.json
│
├── frontend/                 # Interface React
│   ├── src/
│   │   ├── components/       # Composants réutilisables
│   │   ├── pages/            # Pages de l'application
│   │   ├── services/         # Services API
│   │   ├── context/          # Gestion d'état
│   │   └── assets/           # Ressources statiques
│   │
│   └── package.json
│
└── README.md                 # Documentation principale
```

## 🚀 Installation et démarrage

### Prérequis
- Node.js 16+ et npm
- Raspberry Pi avec Raspberry Pi OS (pour production)

### 1. Cloner le projet
```bash
git clone <repository-url>
cd bibliotheque-coop
```

### 2. Installation du backend
```bash
cd backend
npm install
npm run init-db
npm start
```
Le serveur API sera accessible sur http://localhost:3001

### 3. Installation du frontend
```bash
cd frontend
npm install
npm run dev
```
L'interface sera accessible sur http://localhost:3000

### 4. Compte administrateur par défaut
- **Email** : admin@bibliotheque.local
- **Mot de passe** : admin123

⚠️ **Important** : Changez ce mot de passe lors du premier déploiement !

## 📱 Fonctionnalités principales

### Interface utilisateur
- **Tableau de bord** avec statistiques et fichiers récents
- **Bibliothèque** avec recherche avancée et filtres
- **Visualisation** intégrée (PDF, images, audio, vidéo)
- **Téléchargement** de fichiers avec gestion des noms originaux
- **Profil utilisateur** avec gestion du mot de passe

### Gestion administrative
- **Upload de fichiers** par glisser-déposer
- **Édition** des métadonnées (titre, description, thématique)
- **Suppression** sécurisée avec confirmation
- **Gestion des utilisateurs** et des rôles

### Recherche et navigation
- **Recherche textuelle** dans titre, description et thématiques
- **Filtres** par type de fichier et thématique
- **Tri** par date, titre, type ou thématique
- **Navigation** intuitive avec breadcrumbs

## 🔒 Sécurité

### Authentification
- **JWT tokens** avec expiration automatique
- **Hashage** des mots de passe avec bcrypt
- **Validation** des données côté serveur et client
- **Protection** des routes selon les rôles

### Upload de fichiers
- **Validation** des types de fichiers autorisés
- **Limitation** de taille (50MB maximum)
- **Stockage** sécurisé avec noms uniques
- **Nettoyage** automatique des fichiers temporaires

## 📊 Types de fichiers supportés

| Type | Extensions | Taille max | Visualisation |
|------|------------|------------|---------------|
| PDF | .pdf | 50MB | ✅ Viewer intégré |
| Images | .jpg, .jpeg, .png, .gif | 50MB | ✅ Affichage direct |
| Audio | .mp3, .wav, .ogg | 50MB | ✅ Lecteur HTML5 |
| Vidéo | .mp4, .avi, .mov, .wmv | 50MB | ✅ Lecteur avec streaming |

## 🌐 Déploiement sur Raspberry Pi

### Configuration matérielle recommandée
- **Raspberry Pi 4** (4GB RAM minimum)
- **Carte SD** 32GB classe 10 ou SSD USB
- **Alimentation** officielle 5V/3A
- **Boîtier** avec ventilation

### Installation système
1. **Raspberry Pi OS Lite** (sans interface graphique)
2. **Node.js 18+** via NodeSource
3. **PM2** pour la gestion des processus
4. **Nginx** comme proxy inverse (optionnel)

### Configuration réseau
```bash
# Configuration du point d'accès Wi-Fi
sudo apt install hostapd dnsmasq
# Configuration dans /etc/hostapd/hostapd.conf
# Configuration dans /etc/dnsmasq.conf
```

### Démarrage automatique
```bash
# Installation de PM2
npm install -g pm2

# Démarrage des services
cd backend && pm2 start src/app.js --name "bibliotheque-api"
cd frontend && npm run build
# Servir les fichiers statiques avec nginx ou serveur web
```

## 📈 Monitoring et maintenance

### Logs système
- **Backend** : Logs des requêtes et erreurs
- **Upload** : Suivi des téléchargements de fichiers
- **Authentification** : Tentatives de connexion
- **Système** : Utilisation CPU, RAM, stockage

### Sauvegarde
- **Base de données** SQLite (fichier unique)
- **Fichiers uploadés** (dossier uploads/)
- **Configuration** (variables d'environnement)

### Mise à jour
```bash
# Sauvegarde des données
cp backend/src/database.sqlite backup/
cp -r backend/uploads/ backup/

# Mise à jour du code
git pull origin main
cd backend && npm install
cd frontend && npm install && npm run build

# Redémarrage des services
pm2 restart all
```

## 🤝 Contribution

### Structure de développement
1. **Fork** du repository
2. **Branche** pour chaque fonctionnalité
3. **Tests** avant soumission
4. **Pull request** avec description détaillée

### Standards de code
- **ESLint** pour JavaScript
- **Prettier** pour le formatage
- **Commits** conventionnels
- **Documentation** des nouvelles fonctionnalités

## 📞 Support et contact

### Documentation technique
- `backend/README.md` - Documentation API
- `frontend/README.md` - Documentation interface

### Résolution de problèmes
1. Vérifier les logs avec `pm2 logs`
2. Contrôler l'espace disque disponible
3. Redémarrer les services si nécessaire
4. Vérifier la connectivité réseau

### Contact
- **Projet** : Coopératives Rurales Burkina Faso
- **Support** : Voir documentation technique détaillée

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

---

**Bibliothèque Numérique Coopérative** - Partage de connaissances pour le développement rural au Burkina Faso 🇧🇫
