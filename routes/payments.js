const express = require("express");
const router = express.Router();

// Import des contrôleurs
const PaymentController = require("../controllers/paymentController");

// Import des middleware
const {
  authenticateToken,
  requireAdmin,
  createRateLimit,
} = require("../middleware/auth");
const {
  validatePaymentIntent,
  validateIdParam,
  validatePagination,
  validateDateRange,
} = require("../middleware/validation");
const { handleValidationErrors } = require("../middleware/auth");

// Rate limiting pour les paiements
const paymentRateLimit = createRateLimit(20, 60 * 60 * 1000); // 20 paiements par heure

// Routes publiques

/**
 * GET /api/payments/pricing
 * Obtenir les tarifs actuels
 */
router.get("/pricing", PaymentController.getPricing);

/**
 * POST /api/payments/webhook/stripe
 * Webhook Stripe pour traiter les événements de paiement
 * Note: Cette route doit être configurée avec express.raw() pour le body
 */
router.post(
  "/webhook/stripe",
  express.raw({ type: "application/json" }),
  PaymentController.handleStripeWebhook
);

// Routes protégées (nécessitent une authentification)

/**
 * GET /api/payments
 * Obtenir l'historique des paiements de l'utilisateur
 * Query params: page, limit
 */
router.get(
  "/",
  authenticateToken,
  validatePagination,
  PaymentController.getUserPayments
);

/**
 * GET /api/payments/:id
 * Obtenir un paiement spécifique
 */
router.get(
  "/:id",
  authenticateToken,
  validateIdParam,
  handleValidationErrors,
  PaymentController.getPayment
);

/**
 * POST /api/payments/premium/create-intent
 * Créer un Payment Intent pour passage en Premium
 */
router.post(
  "/premium/create-intent",
  authenticateToken,
  paymentRateLimit,
  PaymentController.createPremiumPaymentIntent
);

/**
 * POST /api/payments/template/create-intent
 * Créer un Payment Intent pour achat de template
 */
router.post(
  "/template/create-intent",
  authenticateToken,
  paymentRateLimit,
  validatePaymentIntent,
  handleValidationErrors,
  PaymentController.createTemplatePaymentIntent
);

/**
 * POST /api/payments/custom-design/create-intent
 * Créer un Payment Intent pour design personnalisé
 */
router.post(
  "/custom-design/create-intent",
  authenticateToken,
  paymentRateLimit,
  validatePaymentIntent,
  handleValidationErrors,
  PaymentController.createCustomDesignPaymentIntent
);

/**
 * POST /api/payments/:id/cancel
 * Annuler un paiement en cours
 */
router.post(
  "/:id/cancel",
  authenticateToken,
  validateIdParam,
  handleValidationErrors,
  PaymentController.cancelPayment
);

// Routes d'administration (nécessitent des droits admin)

/**
 * GET /api/payments/admin/stats
 * Obtenir les statistiques des paiements (admin)
 * Query params: dateFrom, dateTo
 */
router.get(
  "/admin/stats",
  authenticateToken,
  requireAdmin,
  validateDateRange,
  PaymentController.getPaymentStats
);

/**
 * POST /api/payments/:id/refund
 * Rembourser un paiement (admin)
 */
router.post(
  "/:id/refund",
  authenticateToken,
  requireAdmin,
  validateIdParam,
  handleValidationErrors,
  PaymentController.refundPayment
);

module.exports = router;
