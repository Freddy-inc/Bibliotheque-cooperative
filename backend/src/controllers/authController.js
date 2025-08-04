const User = require('../models/User');
const { generateToken } = require('../middlewares/auth');

class AuthController {
  // Connexion utilisateur
  static async login(req, res) {
    try {
      const { email, password } = req.validatedData;

      // Vérifier si l'utilisateur existe
      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Email ou mot de passe incorrect'
        });
      }

      // Vérifier le mot de passe
      const isValidPassword = await User.verifyPassword(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: 'Email ou mot de passe incorrect'
        });
      }

      // Générer le token
      const token = generateToken(user.id);

      // Retourner les données utilisateur (sans le mot de passe)
      const { password: _, ...userWithoutPassword } = user;

      res.json({
        success: true,
        message: 'Connexion réussie',
        data: {
          user: userWithoutPassword,
          token
        }
      });

    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  }

  // Inscription utilisateur (admin seulement)
  static async register(req, res) {
    try {
      const { name, email, password } = req.validatedData;

      // Vérifier si l'email existe déjà
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'Cet email est déjà utilisé'
        });
      }

      // Créer l'utilisateur
      const newUser = await User.create({ name, email, password, role: 'user' });

      res.status(201).json({
        success: true,
        message: 'Utilisateur créé avec succès',
        data: {
          user: newUser
        }
      });

    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  }

  // Obtenir le profil de l'utilisateur connecté
  static async getProfile(req, res) {
    try {
      const user = await User.findById(req.user.id);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Utilisateur non trouvé'
        });
      }

      res.json({
        success: true,
        data: {
          user
        }
      });

    } catch (error) {
      console.error('Erreur lors de la récupération du profil:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  }

  // Mettre à jour le profil
  static async updateProfile(req, res) {
    try {
      const { name, email } = req.validatedData;
      const userId = req.user.id;

      // Vérifier si le nouvel email existe déjà (sauf pour l'utilisateur actuel)
      if (email) {
        const existingUser = await User.findByEmail(email);
        if (existingUser && existingUser.id !== userId) {
          return res.status(409).json({
            success: false,
            message: 'Cet email est déjà utilisé'
          });
        }
      }

      // Mettre à jour l'utilisateur
      const updateData = {};
      if (name) updateData.name = name;
      if (email) updateData.email = email;

      await User.update(userId, updateData);

      // Récupérer l'utilisateur mis à jour
      const updatedUser = await User.findById(userId);

      res.json({
        success: true,
        message: 'Profil mis à jour avec succès',
        data: {
          user: updatedUser
        }
      });

    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  }

  // Changer le mot de passe
  static async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.validatedData;
      const userId = req.user.id;

      // Récupérer l'utilisateur avec le mot de passe
      const user = await User.findByEmail(req.user.email);
      
      // Vérifier le mot de passe actuel
      const isValidPassword = await User.verifyPassword(currentPassword, user.password);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: 'Mot de passe actuel incorrect'
        });
      }

      // Changer le mot de passe
      await User.changePassword(userId, newPassword);

      res.json({
        success: true,
        message: 'Mot de passe modifié avec succès'
      });

    } catch (error) {
      console.error('Erreur lors du changement de mot de passe:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  }

  // Vérifier le token (pour maintenir la session)
  static async verifyToken(req, res) {
    try {
      // Le middleware d'authentification a déjà vérifié le token
      // et ajouté l'utilisateur à req.user
      res.json({
        success: true,
        data: {
          user: req.user
        }
      });

    } catch (error) {
      console.error('Erreur lors de la vérification du token:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  }
}

module.exports = AuthController;
