const File = require('../models/File');
const path = require('path');
const fs = require('fs-extra');

class FileController {
  // Obtenir tous les fichiers avec filtres
  static async getAllFiles(req, res) {
    try {
      const filters = {
        type: req.query.type,
        theme: req.query.theme,
        search: req.query.search,
        sortBy: req.query.sortBy || 'date_added',
        sortOrder: req.query.sortOrder || 'DESC',
        limit: req.query.limit,
        offset: req.query.offset
      };

      const files = await File.getAll(filters);

      res.json({
        success: true,
        data: {
          files,
          count: files.length
        }
      });

    } catch (error) {
      console.error('Erreur lors de la récupération des fichiers:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  }

  // Obtenir un fichier par ID
  static async getFileById(req, res) {
    try {
      const { id } = req.params;
      const file = await File.findById(id);

      if (!file) {
        return res.status(404).json({
          success: false,
          message: 'Fichier non trouvé'
        });
      }

      res.json({
        success: true,
        data: {
          file
        }
      });

    } catch (error) {
      console.error('Erreur lors de la récupération du fichier:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  }

  // Upload d'un fichier (admin seulement)
  static async uploadFile(req, res) {
    try {
      const { title, description, theme } = req.validatedData;
      const uploadedFile = req.file;
      const fileType = req.fileType;

      if (!uploadedFile) {
        return res.status(400).json({
          success: false,
          message: 'Aucun fichier fourni'
        });
      }

      // Générer un nom de fichier unique
      const timestamp = Date.now();
      const fileExtension = path.extname(uploadedFile.originalname);
      const fileName = `${timestamp}_${uploadedFile.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const relativePath = `${fileType}/${fileName}`;
      const fullPath = path.join(__dirname, '../../uploads', relativePath);

      // Créer le dossier s'il n'existe pas
      await fs.ensureDir(path.dirname(fullPath));

      // Déplacer le fichier vers le dossier de destination
      await fs.move(uploadedFile.path, fullPath);

      // Enregistrer les informations du fichier en base
      const fileData = {
        title,
        description,
        type: fileType,
        theme,
        file_path: relativePath,
        original_name: uploadedFile.originalname,
        file_size: uploadedFile.size,
        uploaded_by: req.user.id
      };

      const newFile = await File.create(fileData);

      res.status(201).json({
        success: true,
        message: 'Fichier uploadé avec succès',
        data: {
          file: newFile
        }
      });

    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
      
      // Nettoyer le fichier temporaire en cas d'erreur
      if (req.file && req.file.path) {
        fs.remove(req.file.path).catch(console.error);
      }

      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  }

  // Télécharger un fichier
  static async downloadFile(req, res) {
    try {
      const { id } = req.params;
      const file = await File.findById(id);

      if (!file) {
        return res.status(404).json({
          success: false,
          message: 'Fichier non trouvé'
        });
      }

      const filePath = path.join(__dirname, '../../uploads', file.file_path);

      // Vérifier si le fichier existe physiquement
      const fileExists = await fs.pathExists(filePath);
      if (!fileExists) {
        return res.status(404).json({
          success: false,
          message: 'Fichier physique non trouvé'
        });
      }

      // Définir les headers pour le téléchargement
      res.setHeader('Content-Disposition', `attachment; filename="${file.original_name}"`);
      res.setHeader('Content-Type', 'application/octet-stream');

      // Envoyer le fichier
      res.sendFile(filePath);

    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  }

  // Servir un fichier pour visualisation (streaming)
  static async serveFile(req, res) {
    try {
      const { id } = req.params;
      const file = await File.findById(id);

      if (!file) {
        return res.status(404).json({
          success: false,
          message: 'Fichier non trouvé'
        });
      }

      const filePath = path.join(__dirname, '../../uploads', file.file_path);

      // Vérifier si le fichier existe physiquement
      const fileExists = await fs.pathExists(filePath);
      if (!fileExists) {
        return res.status(404).json({
          success: false,
          message: 'Fichier physique non trouvé'
        });
      }

      // Définir le type MIME approprié
      const mimeTypes = {
        pdf: 'application/pdf',
        image: 'image/jpeg',
        audio: 'audio/mpeg',
        video: 'video/mp4'
      };

      const mimeType = mimeTypes[file.type] || 'application/octet-stream';
      res.setHeader('Content-Type', mimeType);

      // Pour les fichiers vidéo et audio, supporter le streaming
      if (file.type === 'video' || file.type === 'audio') {
        const stat = await fs.stat(filePath);
        const fileSize = stat.size;
        const range = req.headers.range;

        if (range) {
          const parts = range.replace(/bytes=/, "").split("-");
          const start = parseInt(parts[0], 10);
          const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
          const chunksize = (end - start) + 1;

          res.status(206);
          res.setHeader('Content-Range', `bytes ${start}-${end}/${fileSize}`);
          res.setHeader('Accept-Ranges', 'bytes');
          res.setHeader('Content-Length', chunksize);

          const stream = fs.createReadStream(filePath, { start, end });
          stream.pipe(res);
        } else {
          res.setHeader('Content-Length', fileSize);
          fs.createReadStream(filePath).pipe(res);
        }
      } else {
        // Pour les autres types de fichiers
        res.sendFile(filePath);
      }

    } catch (error) {
      console.error('Erreur lors du service du fichier:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  }

  // Mettre à jour un fichier (admin seulement)
  static async updateFile(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.validatedData;

      const file = await File.findById(id);
      if (!file) {
        return res.status(404).json({
          success: false,
          message: 'Fichier non trouvé'
        });
      }

      await File.update(id, updateData);

      // Récupérer le fichier mis à jour
      const updatedFile = await File.findById(id);

      res.json({
        success: true,
        message: 'Fichier mis à jour avec succès',
        data: {
          file: updatedFile
        }
      });

    } catch (error) {
      console.error('Erreur lors de la mise à jour du fichier:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  }

  // Supprimer un fichier (admin seulement)
  static async deleteFile(req, res) {
    try {
      const { id } = req.params;

      const file = await File.findById(id);
      if (!file) {
        return res.status(404).json({
          success: false,
          message: 'Fichier non trouvé'
        });
      }

      await File.delete(id);

      res.json({
        success: true,
        message: 'Fichier supprimé avec succès'
      });

    } catch (error) {
      console.error('Erreur lors de la suppression du fichier:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  }

  // Rechercher des fichiers
  static async searchFiles(req, res) {
    try {
      const { q: searchTerm } = req.query;
      
      if (!searchTerm) {
        return res.status(400).json({
          success: false,
          message: 'Terme de recherche requis'
        });
      }

      const filters = {
        type: req.query.type
      };

      const files = await File.search(searchTerm, filters);

      res.json({
        success: true,
        data: {
          files,
          count: files.length,
          searchTerm
        }
      });

    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  }

  // Obtenir les statistiques des fichiers
  static async getStats(req, res) {
    try {
      const stats = await File.getStats();

      res.json({
        success: true,
        data: stats
      });

    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  }
}

module.exports = FileController;
