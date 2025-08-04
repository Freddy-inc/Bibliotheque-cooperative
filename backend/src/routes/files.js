const express = require('express');
const router = express.Router();
const FileController = require('../controllers/fileController');
const { authenticateToken, requireAdmin } = require('../middlewares/auth');
const { validate, validateFileType, validateFileSize } = require('../middlewares/validation');
const { upload, handleUploadError } = require('../utils/upload');

// Routes publiques (lecture seule pour tous les utilisateurs connectés)
router.get('/', authenticateToken, FileController.getAllFiles);
router.get('/search', authenticateToken, FileController.searchFiles);
router.get('/stats', authenticateToken, FileController.getStats);
router.get('/:id', authenticateToken, FileController.getFileById);
router.get('/:id/download', authenticateToken, FileController.downloadFile);
router.get('/:id/serve', authenticateToken, FileController.serveFile);

// Routes admin seulement (gestion des fichiers)
router.post(
  '/upload',
  authenticateToken,
  requireAdmin,
  upload.single('file'),
  handleUploadError,
  validateFileType,
  validateFileSize,
  validate('fileUpload'),
  FileController.uploadFile
);

router.put(
  '/:id',
  authenticateToken,
  requireAdmin,
  validate('fileUpdate'),
  FileController.updateFile
);

router.delete(
  '/:id',
  authenticateToken,
  requireAdmin,
  FileController.deleteFile
);

module.exports = router;
