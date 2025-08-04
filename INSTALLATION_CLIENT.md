# 🚀 Guide d'Installation - Bibliothèque Numérique Coopérative

## 📋 Prérequis

- **Node.js** version 16 ou supérieure ([Télécharger ici](https://nodejs.org/))
- **Git** ([Télécharger ici](https://git-scm.com/))

## 🔧 Installation Rapide

### 1. Cloner le projet
```bash
git clone https://github.com/Freddy-inc/Bibliotheque-cooperative.git
cd Bibliotheque-cooperative
```

### 2. Installer et démarrer le Backend
```bash
cd backend
npm install
npm start
```
Le serveur backend sera accessible sur : http://localhost:3001

### 3. Installer et démarrer le Frontend (dans un nouveau terminal)
```bash
cd frontend
npm install
npm run dev
```
Le site web sera accessible sur : http://localhost:3000

## 🔑 Connexion de Test

- **Email** : `admin@bibliotheque.local`
- **Mot de passe** : `admin123`

## ✨ Fonctionnalités à Tester

1. **Connexion** avec le compte admin
2. **Upload de fichiers** (PDF, images, audio, vidéo)
3. **Recherche et filtrage** dans la bibliothèque
4. **Téléchargement** des fichiers
5. **Gestion des utilisateurs** (admin uniquement)
6. **Interface responsive** (testez sur mobile/tablette)

## 🎯 Architecture

- **Frontend** : React + TailwindCSS (Interface utilisateur)
- **Backend** : Node.js + Express (API et authentification)
- **Base de données** : SQLite (stockage local)
- **Fichiers** : Stockage local dans `/backend/uploads/`

## 📱 Utilisation Mobile

L'interface est entièrement responsive et optimisée pour :
- 📱 Smartphones
- 📱 Tablettes  
- 💻 Ordinateurs

## 🌍 Déploiement Raspberry Pi

Cette application est conçue pour fonctionner sur Raspberry Pi pour les coopératives rurales :
- Fonctionne sans connexion Internet
- Réseau Wi-Fi local uniquement
- Stockage local des fichiers
- Interface multilingue (français)

## 🆘 Support

En cas de problème :
1. Vérifiez que Node.js est installé : `node --version`
2. Vérifiez que les ports 3000 et 3001 sont libres
3. Redémarrez les serveurs si nécessaire

---

**Développé pour les coopératives rurales du Burkina Faso** 🇧🇫
