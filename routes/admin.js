const express = require("express");
const router = express.Router();

// Import des contrôleurs
const AdminController = require("../controllers/adminController");
const TemplateController = require("../controllers/templateController"); // AJOUT MANQUANT

// Import des middleware
const { authenticateToken, requireAdmin } = require("../middleware/auth");
const {
  validateIdParam,
  validatePagination,
  validateDateRange,
  validateTemplateCreation,
} = require("../middleware/validation");
const { handleValidationErrors } = require("../middleware/auth");

// Toutes les routes admin nécessitent une authentification et des droits admin
router.use(authenticateToken);
router.use(requireAdmin);

// Dashboard et statistiques générales

/**
 * GET /api/admin/dashboard
 * Obtenir les données du dashboard admin
 */
router.get("/dashboard", AdminController.getDashboard);

// Gestion des utilisateurs

/**
 * GET /api/admin/users
 * Obtenir la liste des utilisateurs avec filtres
 * Query params: page, limit, search, filter (all, premium, regular)
 */
router.get("/users", validatePagination, AdminController.getUsers);

/**
 * GET /api/admin/users/:id
 * Obtenir les détails d'un utilisateur spécifique
 */
router.get(
  "/users/:id",
  validateIdParam,
  handleValidationErrors,
  AdminController.getUserDetails
);

/**
 * POST /api/admin/users/:id/toggle-status
 * Suspendre/réactiver un utilisateur
 */
router.post(
  "/users/:id/toggle-status",
  validateIdParam,
  handleValidationErrors,
  AdminController.toggleUserStatus
);

// Gestion des templates

/**
 * GET /api/admin/templates
 * Obtenir tous les templates (y compris privés)
 * Query params: category
 */
router.get("/templates", AdminController.getTemplates);

/**
 * POST /api/admin/templates/seed
 * Initialiser les templates depuis les fichiers
 */
router.post("/templates/seed", TemplateController.seedTemplatesFromFiles);

/**
 * POST /api/admin/templates/from-files
 * Créer un template depuis des fichiers
 */
router.post(
  "/templates/from-files",
  validateTemplateCreation,
  handleValidationErrors,
  TemplateController.createTemplateFromFiles
);

/**
 * GET /api/admin/templates/available-files
 * Lister les fichiers de templates disponibles
 */
router.get(
  "/templates/available-files",
  TemplateController.getAvailableTemplateFiles
);

/**
 * POST /api/admin/templates/sync
 * Synchroniser templates entre fichiers et base de données
 */
router.post("/templates/sync", TemplateController.syncTemplates);

/**
 * POST /api/admin/templates/:id/save-to-files
 * Sauvegarder un template de la DB vers des fichiers
 */
router.post(
  "/templates/:id/save-to-files",
  validateIdParam,
  handleValidationErrors,
  TemplateController.saveTemplateToFiles
);

// Gestion des invitations

/**
 * GET /api/admin/invitations
 * Obtenir toutes les invitations avec filtres
 * Query params: page, limit, search
 */
router.get("/invitations", validatePagination, AdminController.getInvitations);

// Analytics et statistiques

/**
 * GET /api/admin/analytics/payments
 * Obtenir les analytics détaillées des paiements
 * Query params: dateFrom, dateTo
 */
router.get(
  "/analytics/payments",
  validateDateRange,
  AdminController.getPaymentAnalytics
);

// Export de données

/**
 * GET /api/admin/export/:type
 * Exporter des données en CSV ou JSON
 * Params: type (users, invitations, payments)
 * Query params: format (csv, json)
 */
router.get(
  "/export/:type",
  (req, res, next) => {
    const { type } = req.params;
    const allowedTypes = ["users", "invitations", "payments"];

    if (!allowedTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message:
          "Type d'export invalide. Types autorisés: " + allowedTypes.join(", "),
      });
    }

    next();
  },
  AdminController.exportData
);

// Logs système

/**
 * GET /api/admin/logs
 * Obtenir les logs système
 * Query params: page, limit, level (all, error, warning, info)
 */
router.get("/logs", validatePagination, AdminController.getSystemLogs);

module.exports = router;
