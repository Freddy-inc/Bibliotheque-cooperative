# Backend - Bibliothèque Numérique Coopérative

API REST pour la plateforme de partage de fichiers des coopératives rurales au Burkina Faso.

## 🚀 Installation et démarrage

### Prérequis
- Node.js (version 16 ou supérieure)
- npm ou yarn

### Installation des dépendances
```bash
npm install
```

### Initialisation de la base de données
```bash
npm run init-db
```

### Démarrage du serveur
```bash
# Mode développement (avec nodemon)
npm run dev

# Mode production
npm start
```

Le serveur sera accessible sur `http://localhost:3001`

## 📋 Compte administrateur par défaut

- **Email**: admin@bibliotheque.local
- **Mot de passe**: admin123

⚠️ **Important**: Changez ce mot de passe en production !

## 🛠 API Endpoints

### Authentification (`/api/auth`)
- `POST /login` - Connexion utilisateur
- `GET /profile` - Profil utilisateur connecté
- `PUT /profile` - Mise à jour du profil
- `PUT /change-password` - Changement de mot de passe
- `GET /verify` - Vérification du token
- `POST /register` - Inscription (admin seulement)

### Fichiers (`/api/files`)
- `GET /` - Liste des fichiers (avec filtres)
- `GET /search` - Recherche de fichiers
- `GET /stats` - Statistiques des fichiers
- `GET /:id` - Détails d'un fichier
- `GET /:id/download` - Téléchargement d'un fichier
- `GET /:id/serve` - Visualisation d'un fichier
- `POST /upload` - Upload de fichier (admin seulement)
- `PUT /:id` - Modification d'un fichier (admin seulement)
- `DELETE /:id` - Suppression d'un fichier (admin seulement)

### Système
- `GET /api/health` - Santé du serveur
- `GET /api/info` - Informations système

## 📁 Structure des fichiers

```
backend/
├── src/
│   ├── config/          # Configuration DB
│   ├── controllers/     # Logique métier
│   ├── middlewares/     # Authentification, validation
│   ├── models/          # Modèles de données
│   ├── routes/          # Routes API
│   ├── utils/           # Utilitaires (upload, etc.)
│   └── app.js           # Application principale
├── uploads/             # Stockage des fichiers
│   ├── pdf/
│   ├── audio/
│   ├── video/
│   └── images/
└── temp/                # Fichiers temporaires
```

## 🔒 Sécurité

- Authentification JWT
- Hashage des mots de passe avec bcrypt
- Limitation du taux de requêtes
- Validation des données d'entrée
- Headers de sécurité avec Helmet
- CORS configuré

## 📤 Types de fichiers supportés

- **PDF**: application/pdf
- **Images**: JPEG, PNG, GIF
- **Audio**: MP3, WAV, OGG
- **Vidéo**: MP4, AVI, MOV, WMV

**Taille maximale**: 50MB par fichier

## 🗄 Base de données

SQLite avec deux tables principales:
- `users`: Utilisateurs du système
- `files`: Métadonnées des fichiers

## 🔧 Variables d'environnement

```bash
PORT=3001
JWT_SECRET=votre-secret-jwt
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

## 📝 Logs

Les logs du serveur incluent:
- Démarrage/arrêt du serveur
- Erreurs de base de données
- Erreurs d'upload de fichiers
- Tentatives d'authentification

## 🚨 Dépannage

### Erreur de base de données
```bash
# Réinitialiser la base de données
rm src/database.sqlite
npm run init-db
```

### Problème d'upload
- Vérifiez les permissions du dossier `uploads/`
- Vérifiez l'espace disque disponible
- Vérifiez la taille du fichier (max 50MB)

### Port déjà utilisé
```bash
# Changer le port dans package.json ou utiliser une variable d'environnement
PORT=3002 npm start
```
