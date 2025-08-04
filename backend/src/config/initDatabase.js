const db = require('./database');
const bcrypt = require('bcryptjs');

// Initialiser les tables de la base de données
function initDatabase() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Table des utilisateurs
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          role TEXT CHECK(role IN ('admin', 'user')) DEFAULT 'user',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          console.error('Erreur création table users:', err);
          return reject(err);
        }
        console.log('Table users créée avec succès');
      });

      // Table des fichiers
      db.run(`
        CREATE TABLE IF NOT EXISTS files (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          description TEXT NOT NULL,
          type TEXT CHECK(type IN ('audio', 'video', 'pdf', 'image')) NOT NULL,
          theme TEXT NOT NULL,
          file_path TEXT NOT NULL,
          original_name TEXT NOT NULL,
          file_size INTEGER NOT NULL,
          date_added DATETIME DEFAULT CURRENT_TIMESTAMP,
          uploaded_by INTEGER,
          FOREIGN KEY (uploaded_by) REFERENCES users (id)
        )
      `, (err) => {
        if (err) {
          console.error('Erreur création table files:', err);
          return reject(err);
        }
        console.log('Table files créée avec succès');
      });

      // Créer un utilisateur admin par défaut
      const adminEmail = 'admin@bibliotheque.local';
      const adminPassword = 'admin123'; // À changer en production
      
      db.get('SELECT id FROM users WHERE email = ?', [adminEmail], (err, row) => {
        if (err) {
          console.error('Erreur vérification admin:', err);
          return reject(err);
        }
        
        if (!row) {
          bcrypt.hash(adminPassword, 10, (err, hashedPassword) => {
            if (err) {
              console.error('Erreur hashage mot de passe:', err);
              return reject(err);
            }
            
            db.run(
              'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
              ['Administrateur', adminEmail, hashedPassword, 'admin'],
              (err) => {
                if (err) {
                  console.error('Erreur création admin:', err);
                  return reject(err);
                }
                console.log('Utilisateur admin créé avec succès');
                console.log(`Email: ${adminEmail}`);
                console.log(`Mot de passe: ${adminPassword}`);
                resolve();
              }
            );
          });
        } else {
          console.log('Utilisateur admin existe déjà');
          resolve();
        }
      });
    });
  });
}

// Exécuter l'initialisation si ce fichier est appelé directement
if (require.main === module) {
  initDatabase()
    .then(() => {
      console.log('Base de données initialisée avec succès');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Erreur initialisation base de données:', err);
      process.exit(1);
    });
}

module.exports = { initDatabase };
