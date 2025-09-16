// shared/common.js - Fonctions communes pour tous les thèmes

// ================================
// 🔧 UTILITAIRES GÉNÉRAUX
// ================================

/**
 * Fonction debounce pour limiter les appels répétés
 * @param {Function} func - Fonction à débouncer
 * @param {number} wait - Délai en millisecondes
 * @returns {Function} - Fonction débouncée
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Fonction throttle pour limiter la fréquence d'exécution
 * @param {Function} func - Fonction à throttler
 * @param {number} limit - Délai minimum entre les appels
 * @returns {Function} - Fonction throttlée
 */
function throttle(func, limit) {
  let inThrottle;
  return function () {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Valide une adresse email
 * @param {string} email - Email à valider
 * @returns {boolean} - True si valide
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Formate un numéro de téléphone
 * @param {string} phone - Numéro à formater
 * @returns {string} - Numéro formaté
 */
function formatPhoneNumber(phone) {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(
      6
    )}`;
  }
  return phone;
}

/**
 * Génère un ID unique
 * @returns {string} - ID unique
 */
function generateUniqueId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// ================================
// 📅 GESTION DES DATES
// ================================

/**
 * Formate une date pour affichage
 * @param {string} dateString - Date au format YYYY-MM-DD
 * @param {string} locale - Locale (défaut: 'en-US')
 * @returns {string} - Date formatée
 */
function formatDisplayDate(dateString, locale = "en-US") {
  if (!dateString) return "Date to be announced";

  try {
    const dateObj = new Date(dateString + "T00:00:00");
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return dateObj.toLocaleDateString(locale, options);
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid date";
  }
}

/**
 * Vérifie si une date est dans le futur
 * @param {string} dateString - Date au format YYYY-MM-DD
 * @returns {boolean} - True si dans le futur
 */
function isDateInFuture(dateString) {
  if (!dateString) return false;
  const eventDate = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return eventDate >= today;
}

/**
 * Calcule les jours jusqu'à un événement
 * @param {string} dateString - Date au format YYYY-MM-DD
 * @returns {number} - Nombre de jours (négatif si passé)
 */
function daysUntilEvent(dateString) {
  if (!dateString) return null;
  const eventDate = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  eventDate.setHours(0, 0, 0, 0);
  return Math.ceil((eventDate - today) / (1000 * 60 * 60 * 24));
}

// ================================
// 💾 GESTION DU STOCKAGE LOCAL
// ================================

/**
 * Sauvegarde des données dans localStorage (si disponible)
 * @param {string} key - Clé de stockage
 * @param {*} data - Données à sauvegarder
 */
function saveToLocalStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.warn("localStorage not available:", error);
  }
}

/**
 * Récupère des données depuis localStorage
 * @param {string} key - Clé de stockage
 * @returns {*} - Données récupérées ou null
 */
function loadFromLocalStorage(key) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.warn("Error loading from localStorage:", error);
    return null;
  }
}

/**
 * Supprime des données du localStorage
 * @param {string} key - Clé à supprimer
 */
function removeFromLocalStorage(key) {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.warn("Error removing from localStorage:", error);
  }
}

// ================================
// 📨 GESTION DES FORMULAIRES
// ================================

/**
 * Valide un formulaire complet
 * @param {HTMLFormElement} form - Formulaire à valider
 * @returns {Object} - Résultat de la validation
 */
function validateForm(form) {
  const results = {
    isValid: true,
    errors: [],
    warnings: [],
  };

  const requiredFields = form.querySelectorAll("[required]");

  requiredFields.forEach((field) => {
    const value = field.value.trim();

    if (!value) {
      results.isValid = false;
      results.errors.push({
        field: field.name || field.id,
        message: `${
          field.previousElementSibling?.textContent || "This field"
        } is required`,
      });
    } else if (field.type === "email" && !isValidEmail(value)) {
      results.isValid = false;
      results.errors.push({
        field: field.name || field.id,
        message: "Please enter a valid email address",
      });
    }
  });

  return results;
}

/**
 * Nettoie et formate les données du formulaire
 * @param {Object} formData - Données brutes du formulaire
 * @returns {Object} - Données nettoyées
 */
function sanitizeFormData(formData) {
  const cleaned = {};

  Object.keys(formData).forEach((key) => {
    let value = formData[key];

    if (typeof value === "string") {
      // Nettoyer les chaînes de caractères
      value = value.trim().replace(/\s+/g, " ");
    }

    // Formater le téléphone si c'est un champ phone
    if (key.toLowerCase().includes("phone")) {
      value = formatPhoneNumber(value);
    }

    cleaned[key] = value;
  });

  return cleaned;
}

// ================================
// 🎨 GESTION DES THÈMES ET STYLES
// ================================

/**
 * Change la classe de thème du body
 * @param {string} themeName - Nom du nouveau thème
 * @param {Array} availableThemes - Liste des thèmes disponibles
 */
function changeTheme(themeName, availableThemes = []) {
  // Retirer toutes les classes de thème existantes
  availableThemes.forEach((theme) => {
    document.body.classList.remove(`theme-${theme}`);
  });

  // Ajouter la nouvelle classe
  document.body.classList.add(`theme-${themeName}`);

  // Sauvegarder le choix
  saveToLocalStorage("selectedTheme", themeName);
}

/**
 * Applique des styles CSS dynamiques
 * @param {string} css - CSS à appliquer
 * @param {string} id - ID unique pour le style
 */
function applyDynamicStyles(css, id) {
  // Supprimer l'ancien style s'il existe
  const oldStyle = document.getElementById(id);
  if (oldStyle) {
    oldStyle.remove();
  }

  // Créer et ajouter le nouveau style
  const style = document.createElement("style");
  style.id = id;
  style.textContent = css;
  document.head.appendChild(style);
}

// ================================
// 📱 DÉTECTION D'APPAREIL
// ================================

/**
 * Détecte si l'utilisateur est sur mobile
 * @returns {boolean} - True si mobile
 */
function isMobile() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

/**
 * Détecte si l'utilisateur est sur tablette
 * @returns {boolean} - True si tablette
 */
function isTablet() {
  return /iPad|Android|Tablet/i.test(navigator.userAgent) && !isMobile();
}

/**
 * Obtient la taille de l'écran
 * @returns {Object} - Largeur et hauteur
 */
function getScreenSize() {
  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
}

// ================================
// 🎉 EFFETS VISUELS COMMUNS
// ================================

/**
 * Créer un effet de particules générique
 * @param {Object} options - Options de configuration
 */
function createParticleEffect(options = {}) {
  const defaults = {
    container: document.body,
    particleCount: 50,
    colors: ["#ff6b9d", "#c44569", "#f8b500"],
    shapes: ["circle"],
    duration: 3000,
    size: { min: 2, max: 8 },
    speed: { min: 1, max: 3 },
  };

  const config = { ...defaults, ...options };
  const particles = [];

  for (let i = 0; i < config.particleCount; i++) {
    const particle = document.createElement("div");
    particle.style.cssText = `
      position: fixed;
      pointer-events: none;
      z-index: 10000;
      width: ${
        Math.random() * (config.size.max - config.size.min) + config.size.min
      }px;
      height: ${
        Math.random() * (config.size.max - config.size.min) + config.size.min
      }px;
      background: ${
        config.colors[Math.floor(Math.random() * config.colors.length)]
      };
      border-radius: ${config.shapes.includes("circle") ? "50%" : "0"};
      left: ${Math.random() * window.innerWidth}px;
      top: ${Math.random() * window.innerHeight}px;
      animation: particleFloat ${config.duration}ms ease-out forwards;
    `;

    config.container.appendChild(particle);
    particles.push(particle);
  }

  // Nettoyer après l'animation
  setTimeout(() => {
    particles.forEach((particle) => {
      if (particle.parentNode) {
        particle.parentNode.removeChild(particle);
      }
    });
  }, config.duration);
}

/**
 * Affiche un message toast
 * @param {string} message - Message à afficher
 * @param {string} type - Type de message (info, success, warning, error)
 * @param {number} duration - Durée d'affichage en ms
 */
function showToast(message, type = "info", duration = 3000) {
  const toastId = `toast-${generateUniqueId()}`;
  const colors = {
    info: "#2196f3",
    success: "#4caf50",
    warning: "#ff9800",
    error: "#f44336",
  };

  const toast = document.createElement("div");
  toast.id = toastId;
  toast.innerHTML = message;
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: ${colors[type]}15;
    color: ${colors[type]};
    border: 2px solid ${colors[type]};
    padding: 15px 25px;
    border-radius: 12px;
    z-index: 10000;
    font-weight: 600;
    font-size: 14px;
    box-shadow: 0 4px 20px ${colors[type]}20;
    animation: toastSlideIn 0.4s ease-out;
    max-width: 90%;
    text-align: center;
    pointer-events: auto;
    cursor: pointer;
  `;

  // Style CSS pour les animations
  if (!document.getElementById("toast-styles")) {
    const style = document.createElement("style");
    style.id = "toast-styles";
    style.textContent = `
      @keyframes toastSlideIn {
        from { 
          opacity: 0; 
          transform: translateX(-50%) translateY(-20px); 
        }
        to { 
          opacity: 1; 
          transform: translateX(-50%) translateY(0); 
        }
      }
      
      @keyframes toastSlideOut {
        from { 
          opacity: 1; 
          transform: translateX(-50%) translateY(0); 
        }
        to { 
          opacity: 0; 
          transform: translateX(-50%) translateY(-20px); 
        }
      }
    `;
    document.head.appendChild(style);
  }

  // Fermer au clic
  toast.addEventListener("click", () => hideToast(toastId));

  document.body.appendChild(toast);

  // Auto-fermeture
  setTimeout(() => hideToast(toastId), duration);
}

/**
 * Cache un message toast
 * @param {string} toastId - ID du toast à cacher
 */
function hideToast(toastId) {
  const toast = document.getElementById(toastId);
  if (toast) {
    toast.style.animation = "toastSlideOut 0.4s ease-in forwards";
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 400);
  }
}

// ================================
// 🔄 GESTION DES ÉTATS DE CHARGEMENT
// ================================

/**
 * Affiche un indicateur de chargement
 * @param {HTMLElement} element - Élément parent
 * @param {string} message - Message de chargement
 * @returns {string} - ID du loader
 */
function showLoader(element, message = "Loading...") {
  const loaderId = `loader-${generateUniqueId()}`;
  const loader = document.createElement("div");
  loader.id = loaderId;
  loader.innerHTML = `
    <div class="spinner"></div>
    <div class="loader-message">${message}</div>
  `;
  loader.style.cssText = `
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    z-index: 1000;
  `;

  // Ajouter les styles du spinner si nécessaire
  if (!document.getElementById("loader-styles")) {
    const style = document.createElement("style");
    style.id = "loader-styles";
    style.textContent = `
      .spinner {
        width: 40px;
        height: 40px;
        border: 4px solid #f3f3f3;
        border-top: 4px solid #3498db;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto 10px;
      }
      
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      
      .loader-message {
        font-size: 14px;
        color: #666;
      }
    `;
    document.head.appendChild(style);
  }

  element.style.position = "relative";
  element.appendChild(loader);

  return loaderId;
}

/**
 * Cache un indicateur de chargement
 * @param {string} loaderId - ID du loader à cacher
 */
function hideLoader(loaderId) {
  const loader = document.getElementById(loaderId);
  if (loader && loader.parentNode) {
    loader.parentNode.removeChild(loader);
  }
}

// ================================
// 📊 ANALYTICS ET TRACKING
// ================================

/**
 * Track un événement personnalisé
 * @param {string} eventName - Nom de l'événement
 * @param {Object} properties - Propriétés de l'événement
 */
function trackEvent(eventName, properties = {}) {
  // Log pour développement
  console.log(`📊 Event tracked: ${eventName}`, properties);

  // Ici vous pourriez intégrer Google Analytics, Mixpanel, etc.
  // Exemple pour Google Analytics:
  // if (typeof gtag !== 'undefined') {
  //   gtag('event', eventName, properties);
  // }
}

/**
 * Track les erreurs JavaScript
 * @param {Error} error - Erreur à tracker
 * @param {Object} context - Contexte additionnel
 */
function trackError(error, context = {}) {
  console.error("📊 Error tracked:", error, context);

  // Track l'erreur dans votre système d'analytics
  trackEvent("javascript_error", {
    message: error.message,
    stack: error.stack,
    ...context,
  });
}

// ================================
// 🔒 SÉCURITÉ ET VALIDATION
// ================================

/**
 * Échappe les caractères HTML dangereux
 * @param {string} text - Texte à échapper
 * @returns {string} - Texte échappé
 */
function escapeHtml(text) {
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

/**
 * Valide une URL
 * @param {string} url - URL à valider
 * @returns {boolean} - True si valide
 */
function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Génère un hash simple pour vérification d'intégrité
 * @param {string} text - Texte à hasher
 * @returns {string} - Hash simple
 */
function simpleHash(text) {
  let hash = 0;
  if (text.length === 0) return hash.toString();
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convertir en 32bit
  }
  return Math.abs(hash).toString(16);
}

// ================================
// 🎯 INITIALISATION COMMUNE
// ================================

/**
 * Initialise les fonctionnalités communes
 */
function initCommonFeatures() {
  // Gestion des erreurs globales
  window.addEventListener("error", (event) => {
    trackError(event.error, {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  });

  // Gestion des promesses rejetées
  window.addEventListener("unhandledrejection", (event) => {
    trackError(new Error(event.reason), {
      type: "unhandled_promise_rejection",
    });
  });

  // Responsive design helpers
  window.addEventListener(
    "resize",
    throttle(() => {
      const screenSize = getScreenSize();
      document.documentElement.style.setProperty(
        "--screen-width",
        `${screenSize.width}px`
      );
      document.documentElement.style.setProperty(
        "--screen-height",
        `${screenSize.height}px`
      );
    }, 100)
  );

  // Détection de l'appareil
  document.body.classList.toggle("is-mobile", isMobile());
  document.body.classList.toggle("is-tablet", isTablet());

  console.log("✅ Common features initialized");
}

// ================================
// 📋 EXPORT DES FONCTIONS
// ================================

// Si utilisé comme module ES6
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    // Utilitaires
    debounce,
    throttle,
    isValidEmail,
    formatPhoneNumber,
    generateUniqueId,

    // Dates
    formatDisplayDate,
    isDateInFuture,
    daysUntilEvent,

    // Stockage
    saveToLocalStorage,
    loadFromLocalStorage,
    removeFromLocalStorage,

    // Formulaires
    validateForm,
    sanitizeFormData,

    // Thèmes
    changeTheme,
    applyDynamicStyles,

    // Détection
    isMobile,
    isTablet,
    getScreenSize,

    // Effets visuels
    createParticleEffect,
    showToast,
    hideToast,

    // Chargement
    showLoader,
    hideLoader,

    // Analytics
    trackEvent,
    trackError,

    // Sécurité
    escapeHtml,
    isValidUrl,
    simpleHash,

    // Initialisation
    initCommonFeatures,
  };
}

// Auto-initialisation si chargé dans le navigateur
if (typeof window !== "undefined") {
  // Attendre que le DOM soit prêt
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initCommonFeatures);
  } else {
    initCommonFeatures();
  }
}

/*
🔧 NOTES D'UTILISATION :

Ce fichier common.js peut être utilisé de plusieurs façons :

1. 📁 Inclusion directe dans chaque thème :
   <script src="../shared/common.js"></script>

2. 📦 Import ES6 (si vous utilisez un bundler) :
   import { debounce, showToast } from '../shared/common.js';

3. 🌐 CDN ou chemin relatif :
   <script src="https://votre-cdn.com/shared/common.js"></script>

🎯 Fonctions principales :
- debounce/throttle : Performance
- validateForm : Validation
- showToast : Messages utilisateur
- trackEvent : Analytics
- formatDisplayDate : Formatage dates
- createParticleEffect : Effets visuels

💡 Conseils :
- Toutes les fonctions gèrent les erreurs gracieusement
- localStorage est utilisé optionnellement
- Compatible avec tous les navigateurs modernes
- Facile à étendre avec de nouvelles fonctions
*/
