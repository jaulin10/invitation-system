const express = require("express");
const router = express.Router();

// Import des contrôleurs
const InvitationController = require("../controllers/invitationController");
const RSVPController = require("../controllers/rsvpController");

// Import des middleware
const {
  authenticateToken,
  checkResourceOwnership,
} = require("../middleware/auth");
const {
  validateInvitationCreation,
  validateInvitationUpdate,
  validateIdParam,
  validateUniqueUrlParam,
  validatePagination,
  validateRSVPSubmission,
} = require("../middleware/validation");
const { handleValidationErrors } = require("../middleware/auth");
const {
  uploadInvitationImage,
  handleUploadError,
  processUploadedImage,
} = require("../middleware/upload");

// Routes publiques (sans authentification)

/**
 * GET /api/invitations/public/:uniqueUrl
 * Afficher une invitation publique
 */
router.get(
  "/public/:uniqueUrl",
  validateUniqueUrlParam,
  handleValidationErrors,
  InvitationController.getPublicInvitation
);

/**
 * GET /api/invitations/public/:uniqueUrl/stats
 * Obtenir les statistiques RSVP publiques d'une invitation
 */
router.get(
  "/public/:uniqueUrl/stats",
  validateUniqueUrlParam,
  handleValidationErrors,
  RSVPController.getPublicRSVPStats
);

/**
 * GET /api/invitations/public/:uniqueUrl/guests
 * Obtenir la liste publique des invités confirmés
 */
router.get(
  "/public/:uniqueUrl/guests",
  validateUniqueUrlParam,
  handleValidationErrors,
  RSVPController.getPublicRSVPList
);

/**
 * GET /api/invitations/public/:uniqueUrl/check-rsvp
 * Vérifier si quelqu'un a déjà répondu
 * Query params: identifier (email ou nom)
 */
router.get(
  "/public/:uniqueUrl/check-rsvp",
  validateUniqueUrlParam,
  handleValidationErrors,
  RSVPController.checkExistingRSVP
);

/**
 * POST /api/invitations/public/:uniqueUrl/rsvp
 * Soumettre une réponse RSVP
 */
router.post(
  "/public/:uniqueUrl/rsvp",
  validateUniqueUrlParam,
  validateRSVPSubmission,
  handleValidationErrors,
  RSVPController.submitRSVP
);

/**
 * PUT /api/invitations/rsvp/:rsvpId
 * Mettre à jour une réponse RSVP existante
 */
router.put(
  "/rsvp/:rsvpId",
  validateIdParam,
  validateRSVPSubmission,
  handleValidationErrors,
  RSVPController.updateRSVP
);

/**
 * GET /api/invitations/rsvp/:rsvpId
 * Obtenir une réponse RSVP spécifique
 */
router.get(
  "/rsvp/:rsvpId",
  validateIdParam,
  handleValidationErrors,
  RSVPController.getRSVP
);

/**
 * DELETE /api/invitations/rsvp/:rsvpId
 * Supprimer une réponse RSVP
 */
router.delete(
  "/rsvp/:rsvpId",
  validateIdParam,
  handleValidationErrors,
  RSVPController.deleteRSVP
);

// Routes protégées (nécessitent une authentification)

/**
 * GET /api/invitations
 * Obtenir toutes les invitations de l'utilisateur connecté
 * Query params: page, limit
 */
router.get(
  "/",
  authenticateToken,
  validatePagination,
  InvitationController.getUserInvitations
);

/**
 * POST /api/invitations
 * Créer une nouvelle invitation
 */
router.post(
  "/",
  authenticateToken,
  uploadInvitationImage,
  handleUploadError,
  processUploadedImage,
  validateInvitationCreation,
  handleValidationErrors,
  InvitationController.create
);

/**
 * GET /api/invitations/:id
 * Obtenir une invitation spécifique avec détails
 */
router.get(
  "/:id",
  authenticateToken,
  validateIdParam,
  handleValidationErrors,
  checkResourceOwnership("invitation"),
  InvitationController.getInvitation
);

/**
 * PUT /api/invitations/:id
 * Mettre à jour une invitation
 */
router.put(
  "/:id",
  authenticateToken,
  validateIdParam,
  uploadInvitationImage,
  handleUploadError,
  processUploadedImage,
  validateInvitationUpdate,
  handleValidationErrors,
  checkResourceOwnership("invitation"),
  InvitationController.updateInvitation
);

/**
 * DELETE /api/invitations/:id
 * Supprimer une invitation
 */
router.delete(
  "/:id",
  authenticateToken,
  validateIdParam,
  handleValidationErrors,
  checkResourceOwnership("invitation"),
  InvitationController.deleteInvitation
);

/**
 * POST /api/invitations/:id/duplicate
 * Dupliquer une invitation
 */
router.post(
  "/:id/duplicate",
  authenticateToken,
  validateIdParam,
  handleValidationErrors,
  checkResourceOwnership("invitation"),
  InvitationController.duplicateInvitation
);

/**
 * POST /api/invitations/:id/toggle-public
 * Basculer le statut public/privé d'une invitation
 */
router.post(
  "/:id/toggle-public",
  authenticateToken,
  validateIdParam,
  handleValidationErrors,
  checkResourceOwnership("invitation"),
  InvitationController.togglePublic
);

/**
 * GET /api/invitations/:id/rsvp
 * Obtenir toutes les réponses RSVP d'une invitation
 */
router.get(
  "/:id/rsvp",
  authenticateToken,
  validateIdParam,
  handleValidationErrors,
  checkResourceOwnership("invitation"),
  InvitationController.getRSVPResponses
);

/**
 * GET /api/invitations/:id/rsvp/export
 * Exporter les réponses RSVP en CSV
 */
router.get(
  "/:id/rsvp/export",
  authenticateToken,
  validateIdParam,
  handleValidationErrors,
  checkResourceOwnership("invitation"),
  InvitationController.exportRSVP
);

/**
 * POST /api/invitations/:id/rsvp/reminder
 * Envoyer des rappels RSVP
 */
router.post(
  "/:id/rsvp/reminder",
  authenticateToken,
  validateIdParam,
  handleValidationErrors,
  checkResourceOwnership("invitation"),
  RSVPController.sendRSVPReminder
);

module.exports = router;
