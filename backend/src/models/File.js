const db = require('../config/database');
const fs = require('fs-extra');
const path = require('path');

class File {
  // Créer un nouveau fichier
  static create(fileData) {
    return new Promise((resolve, reject) => {
      const { title, description, type, theme, file_path, original_name, file_size, uploaded_by } = fileData;
      
      db.run(
        `INSERT INTO files (title, description, type, theme, file_path, original_name, file_size, uploaded_by) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [title, description, type, theme, file_path, original_name, file_size, uploaded_by],
        function(err) {
          if (err) {
            return reject(err);
          }
          resolve({ id: this.lastID, ...fileData });
        }
      );
    });
  }

  // Obtenir tous les fichiers avec filtres
  static getAll(filters = {}) {
    return new Promise((resolve, reject) => {
      let query = `
        SELECT f.*, u.name as uploader_name 
        FROM files f 
        LEFT JOIN users u ON f.uploaded_by = u.id 
        WHERE 1=1
      `;
      const params = [];

      // Filtres
      if (filters.type) {
        query += ' AND f.type = ?';
        params.push(filters.type);
      }

      if (filters.theme) {
        query += ' AND f.theme LIKE ?';
        params.push(`%${filters.theme}%`);
      }

      if (filters.search) {
        query += ' AND (f.title LIKE ? OR f.description LIKE ?)';
        params.push(`%${filters.search}%`, `%${filters.search}%`);
      }

      // Tri
      const sortBy = filters.sortBy || 'date_added';
      const sortOrder = filters.sortOrder || 'DESC';
      query += ` ORDER BY f.${sortBy} ${sortOrder}`;

      // Pagination
      if (filters.limit) {
        query += ' LIMIT ?';
        params.push(parseInt(filters.limit));
        
        if (filters.offset) {
          query += ' OFFSET ?';
          params.push(parseInt(filters.offset));
        }
      }

      db.all(query, params, (err, rows) => {
        if (err) {
          return reject(err);
        }
        resolve(rows);
      });
    });
  }

  // Obtenir un fichier par ID
  static findById(id) {
    return new Promise((resolve, reject) => {
      db.get(
        `SELECT f.*, u.name as uploader_name 
         FROM files f 
         LEFT JOIN users u ON f.uploaded_by = u.id 
         WHERE f.id = ?`,
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

  // Mettre à jour un fichier
  static update(id, updateData) {
    return new Promise((resolve, reject) => {
      const { title, description, theme } = updateData;
      
      db.run(
        'UPDATE files SET title = ?, description = ?, theme = ? WHERE id = ?',
        [title, description, theme, id],
        function(err) {
          if (err) {
            return reject(err);
          }
          resolve({ changes: this.changes });
        }
      );
    });
  }

  // Supprimer un fichier
  static delete(id) {
    return new Promise((resolve, reject) => {
      // D'abord récupérer le chemin du fichier
      db.get('SELECT file_path FROM files WHERE id = ?', [id], (err, row) => {
        if (err) {
          return reject(err);
        }
        
        if (!row) {
          return reject(new Error('Fichier non trouvé'));
        }

        // Supprimer le fichier physique
        const filePath = path.join(__dirname, '../../uploads', row.file_path);
        fs.remove(filePath, (fsErr) => {
          if (fsErr) {
            console.warn('Erreur suppression fichier physique:', fsErr);
          }

          // Supprimer l'entrée de la base de données
          db.run('DELETE FROM files WHERE id = ?', [id], function(dbErr) {
            if (dbErr) {
              return reject(dbErr);
            }
            resolve({ changes: this.changes });
          });
        });
      });
    });
  }

  // Obtenir les statistiques des fichiers
  static getStats() {
    return new Promise((resolve, reject) => {
      const queries = [
        'SELECT COUNT(*) as total FROM files',
        'SELECT type, COUNT(*) as count FROM files GROUP BY type',
        'SELECT theme, COUNT(*) as count FROM files GROUP BY theme ORDER BY count DESC LIMIT 5'
      ];

      Promise.all(queries.map(query => 
        new Promise((res, rej) => {
          db.all(query, [], (err, rows) => {
            if (err) rej(err);
            else res(rows);
          });
        })
      ))
      .then(([totalResult, typeStats, themeStats]) => {
        resolve({
          total: totalResult[0].total,
          byType: typeStats,
          topThemes: themeStats
        });
      })
      .catch(reject);
    });
  }

  // Recherche avancée
  static search(searchTerm, filters = {}) {
    return new Promise((resolve, reject) => {
      let query = `
        SELECT f.*, u.name as uploader_name 
        FROM files f 
        LEFT JOIN users u ON f.uploaded_by = u.id 
        WHERE (f.title LIKE ? OR f.description LIKE ? OR f.theme LIKE ?)
      `;
      const params = [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`];

      if (filters.type) {
        query += ' AND f.type = ?';
        params.push(filters.type);
      }

      query += ' ORDER BY f.date_added DESC';

      db.all(query, params, (err, rows) => {
        if (err) {
          return reject(err);
        }
        resolve(rows);
      });
    });
  }
}

module.exports = File;
