const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const User = require("../models/User");

class AuthController {
  // Inscription d'un nouvel utilisateur
  static async register(req, res) {
    try {
      // Vérifier les erreurs de validation
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Données invalides",
          errors: errors.array(),
        });
      }

      const { email, password, first_name, last_name } = req.body;

      // Créer l'utilisateur
      const user = await User.create({
        email,
        password,
        first_name,
        last_name,
      });

      // Générer le token JWT
      const token = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          isPremium: user.is_premium,
        },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      );

      res.status(201).json({
        success: true,
        message: "Utilisateur créé avec succès",
        data: {
          user: user.toPublicJSON(),
          token,
        },
      });
    } catch (error) {
      console.error("Erreur lors de l'inscription:", error);

      // Gestion des erreurs spécifiques
      if (error.message.includes("email existe déjà")) {
        return res.status(409).json({
          success: false,
          message: "Un compte avec cet email existe déjà",
        });
      }

      res.status(500).json({
        success: false,
        message: "Erreur lors de la création du compte",
      });
    }
  }

  // Connexion d'un utilisateur
  static async login(req, res) {
    try {
      // Vérifier les erreurs de validation
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Données invalides",
          errors: errors.array(),
        });
      }

      const { email, password } = req.body;

      // Authentifier l'utilisateur
      const user = await User.authenticate(email, password);

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Email ou mot de passe incorrect",
        });
      }

      // Générer le token JWT
      const token = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          isPremium: user.is_premium,
        },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      );

      res.json({
        success: true,
        message: "Connexion réussie",
        data: {
          user: user.toPublicJSON(),
          token,
        },
      });
    } catch (error) {
      console.error("Erreur lors de la connexion:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la connexion",
      });
    }
  }

  // Récupérer le profil de l'utilisateur connecté
  static async getProfile(req, res) {
    try {
      const userId = req.user.userId;
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Utilisateur non trouvé",
        });
      }

      // Récupérer les statistiques de l'utilisateur
      const stats = await user.getStats();

      res.json({
        success: true,
        data: {
          user: user.toPublicJSON(),
          stats,
        },
      });
    } catch (error) {
      console.error("Erreur lors de la récupération du profil:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la récupération du profil",
      });
    }
  }

  // Mettre à jour le profil
  static async updateProfile(req, res) {
    try {
      // Vérifier les erreurs de validation
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Données invalides",
          errors: errors.array(),
        });
      }

      const userId = req.user.userId;
      const { first_name, last_name } = req.body;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Utilisateur non trouvé",
        });
      }

      // Mettre à jour le profil
      await user.updateProfile({ first_name, last_name });

      res.json({
        success: true,
        message: "Profil mis à jour avec succès",
        data: {
          user: user.toPublicJSON(),
        },
      });
    } catch (error) {
      console.error("Erreur lors de la mise à jour du profil:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la mise à jour du profil",
      });
    }
  }

  // Changer le mot de passe
  static async changePassword(req, res) {
    try {
      // Vérifier les erreurs de validation
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Données invalides",
          errors: errors.array(),
        });
      }

      const userId = req.user.userId;
      const { currentPassword, newPassword } = req.body;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Utilisateur non trouvé",
        });
      }

      // Changer le mot de passe
      await user.changePassword(currentPassword, newPassword);

      res.json({
        success: true,
        message: "Mot de passe modifié avec succès",
      });
    } catch (error) {
      console.error("Erreur lors du changement de mot de passe:", error);

      if (error.message.includes("incorrect")) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: "Erreur lors du changement de mot de passe",
      });
    }
  }

  // Vérifier la validité du token
  static async verifyToken(req, res) {
    try {
      const userId = req.user.userId;
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Token invalide",
        });
      }

      res.json({
        success: true,
        message: "Token valide",
        data: {
          user: user.toPublicJSON(),
        },
      });
    } catch (error) {
      console.error("Erreur lors de la vérification du token:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la vérification",
      });
    }
  }

  // Demande de réinitialisation de mot de passe
  static async requestPasswordReset(req, res) {
    try {
      // Vérifier les erreurs de validation
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Email invalide",
          errors: errors.array(),
        });
      }

      const { email } = req.body;

      // Vérifier si l'utilisateur existe
      const user = await User.findByEmail(email);

      // Pour des raisons de sécurité, on répond toujours de la même façon
      // même si l'utilisateur n'existe pas
      res.json({
        success: true,
        message:
          "Si un compte avec cet email existe, vous recevrez un lien de réinitialisation",
      });

      // Si l'utilisateur existe, générer un token de réinitialisation
      // (Dans une vraie application, on enverrait un email)
      if (user) {
        const resetToken = jwt.sign(
          { userId: user.id, type: "password_reset" },
          process.env.JWT_SECRET,
          { expiresIn: "1h" }
        );

        console.log(
          `🔐 Token de réinitialisation pour ${email}: ${resetToken}`
        );
        // TODO: Envoyer le token par email
      }
    } catch (error) {
      console.error("Erreur lors de la demande de réinitialisation:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la demande de réinitialisation",
      });
    }
  }

  // Supprimer le compte utilisateur
  static async deleteAccount(req, res) {
    try {
      const userId = req.user.userId;
      const { password } = req.body;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Utilisateur non trouvé",
        });
      }

      // Vérifier le mot de passe avant suppression
      const userData = await User.findByEmail(user.email);
      const isPasswordValid = await User.verifyPassword(
        password,
        userData.password
      );

      if (!isPasswordValid) {
        return res.status(400).json({
          success: false,
          message: "Mot de passe incorrect",
        });
      }

      // Supprimer le compte
      await user.delete();

      res.json({
        success: true,
        message: "Compte supprimé avec succès",
      });
    } catch (error) {
      console.error("Erreur lors de la suppression du compte:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la suppression du compte",
      });
    }
  }

  // Rafraîchir le token
  static async refreshToken(req, res) {
    try {
      const userId = req.user.userId;
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Utilisateur non trouvé",
        });
      }

      // Générer un nouveau token
      const newToken = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          isPremium: user.is_premium,
        },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      );

      res.json({
        success: true,
        message: "Token rafraîchi avec succès",
        data: {
          token: newToken,
          user: user.toPublicJSON(),
        },
      });
    } catch (error) {
      console.error("Erreur lors du rafraîchissement du token:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors du rafraîchissement du token",
      });
    }
  }
}

module.exports = AuthController;
