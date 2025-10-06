const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Middleware pour vérifier l'authentification JWT
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token d'accès requis",
      });
    }

    // Vérifier le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Vérifier que l'utilisateur existe toujours
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Token invalide - utilisateur non trouvé",
      });
    }

    // Ajouter les informations utilisateur à la requête
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      isPremium: user.is_premium, // Prendre la valeur actuelle de la DB
    };

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expiré",
        code: "TOKEN_EXPIRED",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Token invalide",
        code: "INVALID_TOKEN",
      });
    }

    console.error("Erreur lors de la vérification du token:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la vérification de l'authentification",
    });
  }
};

// Middleware optionnel - ajoute les infos utilisateur si token présent, mais n'exige pas l'auth
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);

        if (user) {
          req.user = {
            userId: decoded.userId,
            email: decoded.email,
            isPremium: user.is_premium,
          };
        }
      } catch (error) {
        // Ignore les erreurs de token pour l'auth optionnelle
        console.log("Token optionnel invalide, continuons sans auth");
      }
    }

    next();
  } catch (error) {
    console.error("Erreur dans l'auth optionnelle:", error);
    next(); // Continuer même en cas d'erreur
  }
};

// Middleware pour vérifier que l'utilisateur est Premium
const requirePremium = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentification requise",
    });
  }

  if (!req.user.isPremium) {
    return res.status(403).json({
      success: false,
      message: "Accès Premium requis",
      code: "PREMIUM_REQUIRED",
    });
  }

  next();
};

// Middleware pour vérifier les droits d'administration
const requireAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentification requise",
      });
    }

    // Vérifier si l'utilisateur est admin (à implémenter selon votre logique)
    // Pour l'instant, on considère les admins comme des utilisateurs spéciaux
    const user = await User.findById(req.user.userId);

    // Vous pouvez ajouter un champ 'is_admin' à votre table users
    // ou gérer les admins avec des emails spécifiques
    const adminEmails = [
      "admin@invitation-system.com",
      "admin@example.com",
      process.env.ADMIN_EMAIL,
    ].filter(Boolean);

    if (!adminEmails.includes(user.email)) {
      return res.status(403).json({
        success: false,
        message: "Droits d'administration requis",
        code: "ADMIN_REQUIRED",
      });
    }

    req.user.isAdmin = true;
    next();
  } catch (error) {
    console.error("Erreur lors de la vérification admin:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la vérification des droits",
    });
  }
};

// Middleware pour limiter le taux de requêtes (rate limiting simple)
const createRateLimit = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  const requests = new Map();

  return (req, res, next) => {
    const identifier = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const windowStart = now - windowMs;

    // Nettoyer les anciennes entrées
    for (const [key, timestamps] of requests.entries()) {
      const validTimestamps = timestamps.filter((time) => time > windowStart);
      if (validTimestamps.length === 0) {
        requests.delete(key);
      } else {
        requests.set(key, validTimestamps);
      }
    }

    // Vérifier le taux pour cet identifiant
    const userRequests = requests.get(identifier) || [];
    const recentRequests = userRequests.filter((time) => time > windowStart);

    if (recentRequests.length >= maxRequests) {
      return res.status(429).json({
        success: false,
        message: "Trop de requêtes, veuillez réessayer plus tard",
        code: "RATE_LIMITED",
        retryAfter: Math.ceil(windowMs / 1000),
      });
    }

    // Ajouter cette requête
    recentRequests.push(now);
    requests.set(identifier, recentRequests);

    // Ajouter des headers informatifs
    res.setHeader("X-RateLimit-Limit", maxRequests);
    res.setHeader("X-RateLimit-Remaining", maxRequests - recentRequests.length);
    res.setHeader("X-RateLimit-Reset", new Date(now + windowMs));

    next();
  };
};

// Middleware pour vérifier la propriété d'une ressource
const checkResourceOwnership = (resourceType) => {
  return async (req, res, next) => {
    try {
      const { id } = req.params;
      const userId = req.user.userId;

      let resource;
      switch (resourceType) {
        case "invitation":
          const Invitation = require("../models/Invitation");
          resource = await Invitation.findById(id);
          break;
        case "payment":
          const Payment = require("../models/Payment");
          resource = await Payment.findById(id);
          break;
        default:
          return res.status(400).json({
            success: false,
            message: "Type de ressource non supporté",
          });
      }

      if (!resource) {
        return res.status(404).json({
          success: false,
          message: `${resourceType} non trouvé(e)`,
        });
      }

      if (resource.user_id !== userId) {
        return res.status(403).json({
          success: false,
          message: "Accès non autorisé à cette ressource",
        });
      }

      // Ajouter la ressource à la requête pour éviter de la rechercher à nouveau
      req.resource = resource;
      next();
    } catch (error) {
      console.error("Erreur lors de la vérification de propriété:", error);
      return res.status(500).json({
        success: false,
        message: "Erreur lors de la vérification des droits",
      });
    }
  };
};

// Middleware pour gérer les erreurs de validation
const handleValidationErrors = (req, res, next) => {
  const { validationResult } = require("express-validator");
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Données invalides",
      errors: errors.array().map((error) => ({
        field: error.path,
        message: error.msg,
        value: error.value,
      })),
    });
  }

  next();
};

// Middleware pour logger les requêtes (développement)
const requestLogger = (req, res, next) => {
  if (process.env.NODE_ENV === "development") {
    const timestamp = new Date().toISOString();
    const method = req.method;
    const url = req.originalUrl;
    const userInfo = req.user ? `User: ${req.user.email}` : "No auth";

    console.log(`[${timestamp}] ${method} ${url} - ${userInfo}`);
  }
  next();
};

// Middleware pour gérer les erreurs CORS en développement
const corsHandler = (req, res, next) => {
  if (process.env.NODE_ENV === "development") {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
  }
  next();
};

module.exports = {
  authenticateToken,
  optionalAuth,
  requirePremium,
  requireAdmin,
  createRateLimit,
  checkResourceOwnership,
  handleValidationErrors,
  requestLogger,
  corsHandler,
};
