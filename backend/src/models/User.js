const db = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  // Créer un nouvel utilisateur
  static create(userData) {
    return new Promise((resolve, reject) => {
      const { name, email, password, role = 'user' } = userData;
      
      bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
          return reject(err);
        }
        
        db.run(
          'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
          [name, email, hashedPassword, role],
          function(err) {
            if (err) {
              return reject(err);
            }
            resolve({ id: this.lastID, name, email, role });
          }
        );
      });
    });
  }

  // Trouver un utilisateur par email
  static findByEmail(email) {
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM users WHERE email = ?',
        [email],
        (err, row) => {
          if (err) {
            return reject(err);
          }
          resolve(row);
        }
      );
    });
  }

  // Trouver un utilisateur par ID
  static findById(id) {
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
        [id],
        (err, row) => {
          if (err) {
            return reject(err);
          }
          resolve(row);
        }
      );
    });
  }

  // Vérifier le mot de passe
  static verifyPassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  // Mettre à jour un utilisateur
  static update(id, userData) {
    return new Promise((resolve, reject) => {
      const { name, email } = userData;
      
      db.run(
        'UPDATE users SET name = ?, email = ? WHERE id = ?',
        [name, email, id],
        function(err) {
          if (err) {
            return reject(err);
          }
          resolve({ changes: this.changes });
        }
      );
    });
  }

  // Changer le mot de passe
  static changePassword(id, newPassword) {
    return new Promise((resolve, reject) => {
      bcrypt.hash(newPassword, 10, (err, hashedPassword) => {
        if (err) {
          return reject(err);
        }
        
        db.run(
          'UPDATE users SET password = ? WHERE id = ?',
          [hashedPassword, id],
          function(err) {
            if (err) {
              return reject(err);
            }
            resolve({ changes: this.changes });
          }
        );
      });
    });
  }

  // Obtenir tous les utilisateurs (admin seulement)
  static getAll() {
    return new Promise((resolve, reject) => {
      db.all(
        'SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC',
        [],
        (err, rows) => {
          if (err) {
            return reject(err);
          }
          resolve(rows);
        }
      );
    });
  }
}

module.exports = User;
