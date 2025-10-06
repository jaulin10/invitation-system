const express = require("express");
const router = express.Router();

// Import des contrôleurs
const TemplateController = require("../controllers/templateController");

// Import des middleware
const {
  authenticateToken,
  optionalAuth,
  requireAdmin,
} = require("../middleware/auth");
const {
  validateTemplateCreation,
  validateIdParam,
  validatePagination,
  validateSearch,
} = require("../middleware/validation");
const { handleValidationErrors } = require("../middleware/auth");
const {
  uploadTemplatePreview,
  handleUploadError,
} = require("../middleware/upload");

// Routes publiques (accessible sans authentification)

/**
 * GET /api/templates
 * Obtenir tous les templates disponibles
 * Query params: category, page, limit
 */
router.get(
  "/",
  optionalAuth,
  validatePagination,
  TemplateController.getAvailableTemplates
);

/**
 * GET /api/templates/categories
 * Obtenir toutes les catégories de templates
 */
router.get("/categories", TemplateController.getCategories);

/**
 * GET /api/templates/premium
 * Obtenir les templates premium (pour inciter à l'upgrade)
 */
router.get("/premium", TemplateController.getPremiumTemplates);

/**
 * GET /api/templates/search
 * Rechercher des templates
 * Query params: q (terme de recherche)
 */
router.get(
  "/search",
  optionalAuth,
  validateSearch,
  handleValidationErrors,
  TemplateController.searchTemplates
);

// Routes protégées (nécessitent une authentification)

/**
 * GET /api/templates/:id
 * Obtenir un template spécifique avec son contenu
 */
router.get(
  "/:id",
  authenticateToken,
  validateIdParam,
  handleValidationErrors,
  TemplateController.getTemplate
);

/**
 * GET /api/templates/:id/preview
 * Prévisualiser un template avec des données d'exemple
 */
router.get(
  "/:id/preview",
  authenticateToken,
  validateIdParam,
  handleValidationErrors,
  TemplateController.previewTemplate
);

/**
 * GET /api/templates/:id/stats
 * Obtenir les statistiques d'utilisation d'un template
 */
router.get(
  "/:id/stats",
  authenticateToken,
  validateIdParam,
  handleValidationErrors,
  TemplateController.getTemplateStats
);

// Routes d'administration (nécessitent des droits admin)

/**
 * POST /api/templates
 * Créer un nouveau template (admin seulement)
 */
router.post(
  "/",
  authenticateToken,
  requireAdmin,
  uploadTemplatePreview,
  handleUploadError,
  validateTemplateCreation,
  handleValidationErrors,
  TemplateController.createTemplate
);

/**
 * PUT /api/templates/:id
 * Mettre à jour un template (admin seulement)
 */
router.put(
  "/:id",
  authenticateToken,
  requireAdmin,
  validateIdParam,
  uploadTemplatePreview,
  handleUploadError,
  validateTemplateCreation,
  handleValidationErrors,
  TemplateController.updateTemplate
);

/**
 * POST /api/templates/:id/duplicate
 * Dupliquer un template (admin seulement)
 */
router.post(
  "/:id/duplicate",
  authenticateToken,
  requireAdmin,
  validateIdParam,
  handleValidationErrors,
  TemplateController.duplicateTemplate
);

/**
 * DELETE /api/templates/:id
 * Supprimer un template (admin seulement)
 */
router.delete(
  "/:id",
  authenticateToken,
  requireAdmin,
  validateIdParam,
  handleValidationErrors,
  TemplateController.deleteTemplate
);

// NOUVELLES ROUTES pour la gestion des fichiers

/**
 * POST /api/templates/seed
 * Initialiser tous les templates depuis les fichiers (admin seulement)
 */
router.post(
  "/seed",
  authenticateToken,
  requireAdmin,
  TemplateController.seedTemplatesFromFiles
);

/**
 * POST /api/templates/from-files
 * Créer un template à partir de fichiers existants (admin seulement)
 */
router.post(
  "/from-files",
  authenticateToken,
  requireAdmin,
  TemplateController.createTemplateFromFiles
);

/**
 * GET /api/templates/available-files
 * Lister les templates disponibles dans les fichiers (admin seulement)
 */
router.get(
  "/available-files",
  authenticateToken,
  requireAdmin,
  TemplateController.getAvailableTemplateFiles
);

/**
 * POST /api/templates/sync
 * Synchroniser templates entre fichiers et base de données (admin seulement)
 */
router.post(
  "/sync",
  authenticateToken,
  requireAdmin,
  TemplateController.syncTemplates
);

/**
 * POST /api/templates/:id/save-to-files
 * Sauvegarder un template de la DB vers des fichiers (admin seulement)
 */
router.post(
  "/:id/save-to-files",
  authenticateToken,
  requireAdmin,
  validateIdParam,
  handleValidationErrors,
  TemplateController.saveTemplateToFiles
);

module.exports = router;
