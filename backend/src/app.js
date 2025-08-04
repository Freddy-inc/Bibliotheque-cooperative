const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs-extra');

// Import des routes
const authRoutes = require('./routes/auth');
const fileRoutes = require('./routes/files');

// Import de la configuration de base de données
const { initDatabase } = require('./config/initDatabase');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware de sécurité
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Configuration CORS pour permettre les requêtes depuis le frontend
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Limitation du taux de requêtes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limite chaque IP à 100 requêtes par windowMs
  message: {
    success: false,
    message: 'Trop de requêtes, veuillez réessayer plus tard.'
  }
});
app.use(limiter);

// Middleware pour parser le JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir les fichiers statiques (uploads)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/files', fileRoutes);

// Route de base pour vérifier que l'API fonctionne
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'API Bibliothèque Coopérative - Serveur en fonctionnement',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Route pour obtenir les informations système
app.get('/api/info', (req, res) => {
  res.json({
    success: true,
    data: {
      name: 'Bibliothèque Numérique Coopérative',
      description: 'Plateforme de partage de fichiers pour coopératives rurales',
      version: '1.0.0',
      supportedFileTypes: ['PDF', 'Images', 'Audio', 'Vidéo'],
      maxFileSize: '50MB',
      features: [
        'Authentification utilisateur',
        'Gestion de fichiers',
        'Recherche et filtrage',
        'Téléchargement',
        'Interface responsive'
      ]
    }
  });
});

// Middleware de gestion des erreurs 404
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route non trouvée'
  });
});

// Middleware de gestion des erreurs globales
app.use((err, req, res, next) => {
  console.error('Erreur serveur:', err);
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Erreur interne du serveur',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Fonction pour créer les dossiers nécessaires
async function createDirectories() {
  const directories = [
    path.join(__dirname, '../uploads/pdf'),
    path.join(__dirname, '../uploads/audio'),
    path.join(__dirname, '../uploads/video'),
    path.join(__dirname, '../uploads/images'),
    path.join(__dirname, '../temp')
  ];

  for (const dir of directories) {
    await fs.ensureDir(dir);
  }
  
  console.log('Dossiers de stockage créés avec succès');
}

// Démarrage du serveur
async function startServer() {
  try {
    // Créer les dossiers nécessaires
    await createDirectories();
    
    // Initialiser la base de données
    await initDatabase();
    
    // Démarrer le serveur
    app.listen(PORT, () => {
      console.log('=================================');
      console.log('🚀 Serveur Bibliothèque Coopérative');
      console.log('=================================');
      console.log(`📡 Serveur démarré sur le port ${PORT}`);
      console.log(`🌐 API disponible sur: http://localhost:${PORT}/api`);
      console.log(`📊 Santé du serveur: http://localhost:${PORT}/api/health`);
      console.log(`📚 Interface web: http://localhost:3000 (si frontend démarré)`);
      console.log('=================================');
      console.log('📋 Compte admin par défaut:');
      console.log('   Email: admin@bibliotheque.local');
      console.log('   Mot de passe: admin123');
      console.log('=================================');
    });
    
  } catch (error) {
    console.error('Erreur lors du démarrage du serveur:', error);
    process.exit(1);
  }
}

// Gestion propre de l'arrêt du serveur
process.on('SIGINT', () => {
  console.log('\n🛑 Arrêt du serveur...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Arrêt du serveur...');
  process.exit(0);
});

// Démarrer le serveur
startServer();

module.exports = app;
