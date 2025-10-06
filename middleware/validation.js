const { body, param, query } = require("express-validator");

// Validation pour l'inscription
const validateRegistration = [
  body("email").isEmail().normalizeEmail().withMessage("Email invalide"),

  body("password")
    .isLength({ min: 8 })
    .withMessage("Le mot de passe doit contenir au moins 8 caractères")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre"
    ),

  body("first_name")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Le prénom doit contenir entre 2 et 50 caractères")
    .matches(/^[a-zA-ZÀ-ÿ\s-']+$/)
    .withMessage(
      "Le prénom ne peut contenir que des lettres, espaces, tirets et apostrophes"
    ),

  body("last_name")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Le nom doit contenir entre 2 et 50 caractères")
    .matches(/^[a-zA-ZÀ-ÿ\s-']+$/)
    .withMessage(
      "Le nom ne peut contenir que des lettres, espaces, tirets et apostrophes"
    ),
];

// Validation pour la connexion
const validateLogin = [
  body("email").isEmail().normalizeEmail().withMessage("Email invalide"),

  body("password").notEmpty().withMessage("Mot de passe requis"),
];

// Validation pour la mise à jour du profil
const validateProfileUpdate = [
  body("first_name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Le prénom doit contenir entre 2 et 50 caractères"),

  body("last_name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Le nom doit contenir entre 2 et 50 caractères"),
];

// Validation pour le changement de mot de passe
const validatePasswordChange = [
  body("currentPassword").notEmpty().withMessage("Mot de passe actuel requis"),

  body("newPassword")
    .isLength({ min: 8 })
    .withMessage("Le nouveau mot de passe doit contenir au moins 8 caractères")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "Le nouveau mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre"
    ),
];

// Validation pour la création d'invitation
const validateInvitationCreation = [
  body("template_id").isInt({ min: 1 }).withMessage("ID de template invalide"),

  body("title")
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage("Le titre doit contenir entre 3 et 200 caractères"),

  body("event_date")
    .optional()
    .isISO8601()
    .withMessage("Date d'événement invalide (format ISO8601 requis)"),

  body("event_time")
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage("Heure d'événement trop longue"),

  body("event_location")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Lieu d'événement trop long"),

  body("contact_phone")
    .optional()
    .isMobilePhone("any", { strictMode: false })
    .withMessage("Numéro de téléphone invalide"),

  body("event_theme")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Thème d'événement trop long"),

  body("custom_message")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Message personnalisé trop long"),

  body("is_public")
    .optional()
    .isBoolean()
    .withMessage("Statut public invalide"),
];

// Validation pour la mise à jour d'invitation
const validateInvitationUpdate = [
  body("title")
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage("Le titre doit contenir entre 3 et 200 caractères"),

  body("event_date")
    .optional()
    .isISO8601()
    .withMessage("Date d'événement invalide"),

  body("event_time")
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage("Heure d'événement trop longue"),

  body("event_location")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Lieu d'événement trop long"),

  body("contact_phone")
    .optional()
    .isMobilePhone("any", { strictMode: false })
    .withMessage("Numéro de téléphone invalide"),

  body("custom_message")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Message personnalisé trop long"),

  body("is_public")
    .optional()
    .isBoolean()
    .withMessage("Statut public invalide"),
];

// Validation pour les réponses RSVP
const validateRSVPSubmission = [
  body("attendance_status")
    .isIn(["confirmed", "declined", "pending"])
    .withMessage("Statut de présence invalide"),

  body("guest_name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Nom d'invité invalide"),

  body("guest_email")
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage("Email invalide"),

  body("guest_phone")
    .optional()
    .isMobilePhone("any", { strictMode: false })
    .withMessage("Numéro de téléphone invalide"),

  body("plus_one")
    .optional()
    .isInt({ min: 0, max: 10 })
    .withMessage("Nombre d'accompagnants invalide (0-10)"),

  body("children_0_2")
    .optional()
    .isInt({ min: 0, max: 20 })
    .withMessage("Nombre d'enfants 0-2 ans invalide"),

  body("children_2_5")
    .optional()
    .isInt({ min: 0, max: 20 })
    .withMessage("Nombre d'enfants 2-5 ans invalide"),

  body("children_5_10")
    .optional()
    .isInt({ min: 0, max: 20 })
    .withMessage("Nombre d'enfants 5-10 ans invalide"),

  body("dietary_restrictions")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Restrictions alimentaires trop longues"),

  body("special_message")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Message spécial trop long"),

  body("absence_reason")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Raison d'absence trop longue"),

  body("gift_intent")
    .optional()
    .isIn(["yes", "no"])
    .withMessage("Intention de cadeau invalide"),

  body("gift_type")
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage("Type de cadeau trop long"),
];

// Validation pour la création de template (admin)
const validateTemplateCreation = [
  body("name")
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage("Le nom doit contenir entre 3 et 100 caractères"),

  body("category")
    .isIn(["enfant", "femme-adulte", "homme-adulte", "general"])
    .withMessage("Catégorie invalide"),

  body("html_content")
    .trim()
    .isLength({ min: 50, max: 50000 })
    .withMessage("Contenu HTML invalide (50-50000 caractères)"),

  body("css_content")
    .trim()
    .isLength({ min: 10, max: 20000 })
    .withMessage("Contenu CSS invalide (10-20000 caractères)"),

  body("is_premium")
    .optional()
    .isBoolean()
    .withMessage("Statut premium invalide"),

  body("thumbnail_url")
    .optional()
    .isURL()
    .withMessage("URL de miniature invalide"),
];

// Validation pour les paiements
const validatePaymentIntent = [
  body("template_id")
    .optional()
    .isInt({ min: 1 })
    .withMessage("ID de template invalide"),

  body("custom_price")
    .optional()
    .isFloat({ min: 1, max: 1000 })
    .withMessage("Prix personnalisé invalide (1-1000 EUR)"),

  body("design_details")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Détails du design trop longs"),
];

// Validation des paramètres d'URL
const validateIdParam = [
  param("id").isInt({ min: 1 }).withMessage("ID invalide"),
];

const validateUniqueUrlParam = [
  param("uniqueUrl")
    .isLength({ min: 5, max: 100 })
    .matches(/^[a-z0-9-]+$/)
    .withMessage("URL unique invalide"),
];

// Validation des paramètres de pagination
const validatePagination = [
  query("page")
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage("Numéro de page invalide"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limite par page invalide (1-100)"),
];

// Validation pour la recherche
const validateSearch = [
  query("q")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Terme de recherche invalide (2-100 caractères)"),
];

// Validation pour les filtres de date
const validateDateRange = [
  query("dateFrom")
    .optional()
    .isISO8601()
    .withMessage("Date de début invalide"),

  query("dateTo").optional().isISO8601().withMessage("Date de fin invalide"),
];

// Validation pour l'email de réinitialisation
const validatePasswordReset = [
  body("email").isEmail().normalizeEmail().withMessage("Email invalide"),
];

// Validation pour la suppression de compte
const validateAccountDeletion = [
  body("password")
    .notEmpty()
    .withMessage("Mot de passe requis pour la suppression"),
];

// Validation pour l'upload de fichiers
const validateFileUpload = (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "Aucun fichier uploadé",
    });
  }

  // Vérifier le type de fichier
  const allowedMimes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  if (!allowedMimes.includes(req.file.mimetype)) {
    return res.status(400).json({
      success: false,
      message: "Type de fichier non autorisé (JPEG, PNG, WebP uniquement)",
    });
  }

  // Vérifier la taille (5MB max)
  if (req.file.size > 5 * 1024 * 1024) {
    return res.status(400).json({
      success: false,
      message: "Fichier trop volumineux (5MB maximum)",
    });
  }

  next();
};

// Validation sanitaire pour éviter les attaques XSS
const sanitizeInput = [
  body("*").escape(), // Échapper les caractères HTML dans tous les champs
];

module.exports = {
  validateRegistration,
  validateLogin,
  validateProfileUpdate,
  validatePasswordChange,
  validateInvitationCreation,
  validateInvitationUpdate,
  validateRSVPSubmission,
  validateTemplateCreation,
  validatePaymentIntent,
  validateIdParam,
  validateUniqueUrlParam,
  validatePagination,
  validateSearch,
  validateDateRange,
  validatePasswordReset,
  validateAccountDeletion,
  validateFileUpload,
  sanitizeInput,
};
