const Joi = require('joi');

// Schémas de validation
const schemas = {
  // Validation pour l'inscription/connexion
  register: Joi.object({
    name: Joi.string().min(2).max(50).required().messages({
      'string.min': 'Le nom doit contenir au moins 2 caractères',
      'string.max': 'Le nom ne peut pas dépasser 50 caractères',
      'any.required': 'Le nom est requis'
    }),
    email: Joi.string().email({ tlds: { allow: false } }).required().messages({
      'string.email': 'Email invalide',
      'any.required': 'L\'email est requis'
    }),
    password: Joi.string().min(6).required().messages({
      'string.min': 'Le mot de passe doit contenir au moins 6 caractères',
      'any.required': 'Le mot de passe est requis'
    })
  }),

  login: Joi.object({
    email: Joi.string().email({ tlds: { allow: false } }).required().messages({
      'string.email': 'Email invalide',
      'any.required': 'L\'email est requis'
    }),
    password: Joi.string().required().messages({
      'any.required': 'Le mot de passe est requis'
    })
  }),

  // Validation pour les fichiers
  fileUpload: Joi.object({
    title: Joi.string().min(2).max(100).required().messages({
      'string.min': 'Le titre doit contenir au moins 2 caractères',
      'string.max': 'Le titre ne peut pas dépasser 100 caractères',
      'any.required': 'Le titre est requis'
    }),
    description: Joi.string().min(10).max(500).required().messages({
      'string.min': 'La description doit contenir au moins 10 caractères',
      'string.max': 'La description ne peut pas dépasser 500 caractères',
      'any.required': 'La description est requise'
    }),
    theme: Joi.string().min(2).max(50).required().messages({
      'string.min': 'La thématique doit contenir au moins 2 caractères',
      'string.max': 'La thématique ne peut pas dépasser 50 caractères',
      'any.required': 'La thématique est requise'
    })
  }),

  fileUpdate: Joi.object({
    title: Joi.string().min(2).max(100).messages({
      'string.min': 'Le titre doit contenir au moins 2 caractères',
      'string.max': 'Le titre ne peut pas dépasser 100 caractères'
    }),
    description: Joi.string().min(10).max(500).messages({
      'string.min': 'La description doit contenir au moins 10 caractères',
      'string.max': 'La description ne peut pas dépasser 500 caractères'
    }),
    theme: Joi.string().min(2).max(50).messages({
      'string.min': 'La thématique doit contenir au moins 2 caractères',
      'string.max': 'La thématique ne peut pas dépasser 50 caractères'
    })
  }),

  // Validation pour la mise à jour du profil
  updateProfile: Joi.object({
    name: Joi.string().min(2).max(50).messages({
      'string.min': 'Le nom doit contenir au moins 2 caractères',
      'string.max': 'Le nom ne peut pas dépasser 50 caractères'
    }),
    email: Joi.string().email().messages({
      'string.email': 'Email invalide'
    })
  }),

  changePassword: Joi.object({
    currentPassword: Joi.string().required().messages({
      'any.required': 'Le mot de passe actuel est requis'
    }),
    newPassword: Joi.string().min(6).required().messages({
      'string.min': 'Le nouveau mot de passe doit contenir au moins 6 caractères',
      'any.required': 'Le nouveau mot de passe est requis'
    })
  })
};

// Middleware de validation générique
const validate = (schemaName) => {
  return (req, res, next) => {
    const schema = schemas[schemaName];
    if (!schema) {
      return res.status(500).json({
        success: false,
        message: 'Schéma de validation non trouvé'
      });
    }

    const { error, value } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors
      });
    }

    req.validatedData = value;
    next();
  };
};

// Validation des types de fichiers autorisés
const validateFileType = (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'Aucun fichier fourni'
    });
  }

  const allowedTypes = {
    'application/pdf': 'pdf',
    'image/jpeg': 'image',
    'image/jpg': 'image',
    'image/png': 'image',
    'image/gif': 'image',
    'audio/mpeg': 'audio',
    'audio/mp3': 'audio',
    'audio/wav': 'audio',
    'audio/ogg': 'audio',
    'video/mp4': 'video',
    'video/avi': 'video',
    'video/mov': 'video',
    'video/wmv': 'video'
  };

  const fileType = allowedTypes[req.file.mimetype];
  if (!fileType) {
    return res.status(400).json({
      success: false,
      message: 'Type de fichier non autorisé. Types acceptés: PDF, images (JPEG, PNG, GIF), audio (MP3, WAV, OGG), vidéo (MP4, AVI, MOV, WMV)'
    });
  }

  req.fileType = fileType;
  next();
};

// Validation de la taille des fichiers (50MB max)
const validateFileSize = (req, res, next) => {
  const maxSize = 50 * 1024 * 1024; // 50MB
  
  if (req.file && req.file.size > maxSize) {
    return res.status(400).json({
      success: false,
      message: 'Le fichier est trop volumineux. Taille maximale: 50MB'
    });
  }
  
  next();
};

module.exports = {
  validate,
  validateFileType,
  validateFileSize,
  schemas
};
