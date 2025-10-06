const express = require("express");
const router = express.Router();

// Import des contrôleurs
const AuthController = require("../controllers/authController");

// Import des middleware
const { authenticateToken, createRateLimit } = require("../middleware/auth");
const {
  validateRegistration,
  validateLogin,
  validateProfileUpdate,
  validatePasswordChange,
  validatePasswordReset,
  validateAccountDeletion,
} = require("../middleware/validation");
const { handleValidationErrors } = require("../middleware/auth");

// Rate limiting pour les routes sensibles
const authRateLimit = createRateLimit(10, 15 * 60 * 1000); // 10 requêtes par 15 minutes
const loginRateLimit = createRateLimit(5, 15 * 60 * 1000); // 5 tentatives de connexion par 15 minutes

// Routes publiques

/**
 * POST /api/auth/register
 * Inscription d'un nouvel utilisateur
 */
router.post(
  "/register",
  authRateLimit,
  validateRegistration,
  handleValidationErrors,
  AuthController.register
);

/**
 * POST /api/auth/login
 * Connexion utilisateur
 */
router.post(
  "/login",
  loginRateLimit,
  validateLogin,
  handleValidationErrors,
  AuthController.login
);

/**
 * POST /api/auth/forgot-password
 * Demande de réinitialisation de mot de passe
 */
router.post(
  "/forgot-password",
  authRateLimit,
  validatePasswordReset,
  handleValidationErrors,
  AuthController.requestPasswordReset
);

// Routes protégées (nécessitent une authentification)

/**
 * GET /api/auth/profile
 * Récupérer le profil de l'utilisateur connecté
 */
router.get("/profile", authenticateToken, AuthController.getProfile);

/**
 * PUT /api/auth/profile
 * Mettre à jour le profil utilisateur
 */
router.put(
  "/profile",
  authenticateToken,
  validateProfileUpdate,
  handleValidationErrors,
  AuthController.updateProfile
);

/**
 * POST /api/auth/change-password
 * Changer le mot de passe
 */
router.post(
  "/change-password",
  authenticateToken,
  authRateLimit,
  validatePasswordChange,
  handleValidationErrors,
  AuthController.changePassword
);

/**
 * POST /api/auth/verify-token
 * Vérifier la validité du token JWT
 */
router.post("/verify-token", authenticateToken, AuthController.verifyToken);

/**
 * POST /api/auth/refresh-token
 * Rafraîchir le token JWT
 */
router.post("/refresh-token", authenticateToken, AuthController.refreshToken);

/**
 * DELETE /api/auth/account
 * Supprimer le compte utilisateur
 */
router.delete(
  "/account",
  authenticateToken,
  authRateLimit,
  validateAccountDeletion,
  handleValidationErrors,
  AuthController.deleteAccount
);

module.exports = router;
