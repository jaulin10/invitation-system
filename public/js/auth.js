// Configuration API
const API_BASE_URL = "/api";
let currentMode = "login";

// Client API
class APIClient {
  static async request(endpoint, options = {}) {
    const config = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    if (config.body && typeof config.body === "object") {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Erreur API");
      }

      return data;
    } catch (error) {
      console.error("Erreur API:", error);
      throw error;
    }
  }

  static async post(endpoint, data) {
    return this.request(endpoint, { method: "POST", body: data });
  }
}

// Gestion des messages
function showMessage(text, type = "info", duration = 5000) {
  const container = document.getElementById("messageContainer");
  container.innerHTML = `<div class="message ${type}">${text}</div>`;

  if (duration > 0) {
    setTimeout(() => {
      container.innerHTML = "";
    }, duration);
  }
}

function clearMessage() {
  document.getElementById("messageContainer").innerHTML = "";
}

// Gestion du loading
function showLoading() {
  document.getElementById("loadingOverlay").classList.remove("hidden");
}

function hideLoading() {
  document.getElementById("loadingOverlay").classList.add("hidden");
}

function showButtonLoading(button, text = "Chargement...") {
  button.disabled = true;
  button.innerHTML = `<span class="loading"></span>${text}`;
}

function hideButtonLoading(button, originalText) {
  button.disabled = false;
  button.innerHTML = originalText;
}

// Changement de mode d'authentification
function switchAuthMode(mode) {
  currentMode = mode;

  // Mettre à jour les boutons
  document.querySelectorAll(".auth-btn").forEach((btn) => {
    btn.classList.remove("active");
  });
  document.querySelector(`[data-mode="${mode}"]`).classList.add("active");

  // Masquer tous les formulaires
  document.querySelectorAll(".auth-form").forEach((form) => {
    form.classList.add("hidden");
  });

  // Afficher le formulaire approprié
  const formMap = {
    login: "loginForm",
    register: "registerForm",
    guest: "guestForm",
  };

  document.getElementById(formMap[mode]).classList.remove("hidden");
  clearMessage();
}

// Validation du mot de passe
function checkPasswordStrength(password) {
  const strengthElement = document.getElementById("passwordStrength");
  if (!strengthElement) return;

  let strength = 0;
  const checks = [
    password.length >= 8,
    /[a-z]/.test(password),
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^a-zA-Z0-9]/.test(password),
  ];

  strength = checks.filter(Boolean).length;

  strengthElement.className = "password-strength";
  if (strength >= 4) {
    strengthElement.classList.add("strong");
  } else if (strength >= 3) {
    strengthElement.classList.add("medium");
  } else if (strength >= 1) {
    strengthElement.classList.add("weak");
  }
}

// Validation email
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validation des mots de passe identiques
function checkPasswordMatch() {
  const password = document.getElementById("registerPassword").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  if (password && confirmPassword && password !== confirmPassword) {
    showMessage("Les mots de passe ne correspondent pas", "error");
    return false;
  }
  return true;
}

// Connexion
async function handleLogin(e) {
  e.preventDefault();

  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;
  const submitBtn = document.getElementById("loginSubmitBtn");

  // Validation
  if (!email || !password) {
    showMessage("Veuillez remplir tous les champs", "error");
    return;
  }

  if (!isValidEmail(email)) {
    showMessage("Adresse email invalide", "error");
    return;
  }

  showButtonLoading(submitBtn, "Connexion...");
  clearMessage();

  try {
    const response = await APIClient.post("/auth/login", {
      email,
      password,
    });

    // Stocker le token
    localStorage.setItem("auth_token", response.data.token);
    localStorage.setItem("user_data", JSON.stringify(response.data.user));

    showMessage("Connexion réussie ! Redirection...", "success");

    // Redirection vers le dashboard
    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 1500);
  } catch (error) {
    showMessage(error.message, "error");
    hideButtonLoading(submitBtn, "🚀 Accéder au tableau de bord");
  }
}

// Inscription
async function handleRegister(e) {
  e.preventDefault();

  const firstName = document.getElementById("firstName").value.trim();
  const lastName = document.getElementById("lastName").value.trim();
  const email = document.getElementById("registerEmail").value.trim();
  const password = document.getElementById("registerPassword").value;
  const confirmPassword = document.getElementById("confirmPassword").value;
  const acceptTerms = document.getElementById("acceptTerms").checked;
  const submitBtn = document.getElementById("registerSubmitBtn");

  // Validation
  if (!firstName || !lastName || !email || !password || !confirmPassword) {
    showMessage("Veuillez remplir tous les champs", "error");
    return;
  }

  if (!isValidEmail(email)) {
    showMessage("Adresse email invalide", "error");
    return;
  }

  if (password.length < 8) {
    showMessage("Le mot de passe doit contenir au moins 8 caractères", "error");
    return;
  }

  if (password !== confirmPassword) {
    showMessage("Les mots de passe ne correspondent pas", "error");
    return;
  }

  if (!acceptTerms) {
    showMessage("Vous devez accepter les conditions d'utilisation", "error");
    return;
  }

  showButtonLoading(submitBtn, "Création du compte...");
  clearMessage();

  try {
    const response = await APIClient.post("/auth/register", {
      first_name: firstName,
      last_name: lastName,
      email,
      password,
    });

    // Stocker le token
    localStorage.setItem("auth_token", response.data.token);
    localStorage.setItem("user_data", JSON.stringify(response.data.user));

    showMessage("Compte créé avec succès ! Redirection...", "success");

    // Redirection vers le dashboard
    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 1500);
  } catch (error) {
    showMessage(error.message, "error");
    hideButtonLoading(submitBtn, "✨ Créer mon compte");
  }
}

// Accès invité
async function handleGuest(e) {
  e.preventDefault();

  const invitationUrl = document.getElementById("invitationUrl").value.trim();
  const submitBtn = document.getElementById("guestSubmitBtn");

  if (!invitationUrl) {
    showMessage("Veuillez saisir le lien d'invitation", "error");
    return;
  }

  // Extraire l'ID d'invitation de l'URL
  let invitationId;
  try {
    // Plusieurs formats possibles d'URL d'invitation
    const urlPatterns = [
      /\/invitation\/([a-zA-Z0-9-]+)/,
      /invitation[_-]?id[=:]([a-zA-Z0-9-]+)/,
      /[?&]id=([a-zA-Z0-9-]+)/,
      /[/?]([a-zA-Z0-9-]{8,})/,
    ];

    for (const pattern of urlPatterns) {
      const match = invitationUrl.match(pattern);
      if (match) {
        invitationId = match[1];
        break;
      }
    }

    // Si aucun pattern ne fonctionne, essayer avec l'URL complète
    if (!invitationId && invitationUrl.length > 10) {
      invitationId = invitationUrl.split("/").pop().split("?")[0];
    }

    if (!invitationId) {
      throw new Error("Format d'URL invalide");
    }
  } catch (error) {
    showMessage("Le lien d'invitation n'est pas valide", "error");
    return;
  }

  showButtonLoading(submitBtn, "Vérification...");
  clearMessage();

  try {
    // Rediriger directement vers l'invitation
    window.location.href = `/invitation/${invitationId}`;
  } catch (error) {
    showMessage("Impossible d'accéder à cette invitation", "error");
    hideButtonLoading(submitBtn, "🎊 Voir l'invitation");
  }
}

// Mot de passe oublié
async function handleForgotPassword(e) {
  e.preventDefault();

  const email = document.getElementById("forgotEmail").value.trim();
  const submitBtn = document.getElementById("forgotSubmitBtn");

  if (!email) {
    showMessage("Veuillez saisir votre adresse email", "error");
    return;
  }

  if (!isValidEmail(email)) {
    showMessage("Adresse email invalide", "error");
    return;
  }

  showButtonLoading(submitBtn, "Envoi en cours...");
  clearMessage();

  try {
    await APIClient.post("/auth/request-password-reset", { email });
    showMessage(
      "Si un compte avec cet email existe, vous recevrez un lien de réinitialisation",
      "success"
    );

    // Retour au formulaire de connexion après 3 secondes
    setTimeout(() => {
      showLogin();
    }, 3000);
  } catch (error) {
    showMessage(error.message, "error");
  } finally {
    hideButtonLoading(submitBtn, "📧 Envoyer le lien");
  }
}

// Afficher le formulaire de mot de passe oublié
function showForgotPassword() {
  document.querySelectorAll(".auth-form").forEach((form) => {
    form.classList.add("hidden");
  });
  document.getElementById("forgotPasswordForm").classList.remove("hidden");
  clearMessage();
}

// Retour au formulaire de connexion
function showLogin() {
  switchAuthMode("login");
}

// Afficher les conditions d'utilisation
function showTerms() {
  alert(
    "Les conditions d'utilisation s'ouvriront dans une nouvelle fenêtre.\n\nFonctionnalité à implémenter : page des conditions d'utilisation."
  );
}

// Vérification si l'utilisateur est déjà connecté
function checkAuthStatus() {
  const token = localStorage.getItem("auth_token");
  const userData = localStorage.getItem("user_data");

  if (token && userData) {
    // Vérifier la validité du token
    fetch("/api/auth/verify-token", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (response.ok) {
          // Rediriger vers le dashboard si déjà connecté
          window.location.href = "dashboard.html";
        } else {
          // Token invalide, nettoyer le stockage
          localStorage.removeItem("auth_token");
          localStorage.removeItem("user_data");
        }
      })
      .catch((error) => {
        console.error("Erreur lors de la vérification du token:", error);
      });
  }
}

// Auto-complétion de l'URL d'invitation depuis les paramètres URL
function checkInvitationParam() {
  const urlParams = new URLSearchParams(window.location.search);
  const invitationId = urlParams.get("invitation") || urlParams.get("id");

  if (invitationId) {
    // Basculer vers le mode invité et pré-remplir le champ
    switchAuthMode("guest");
    const invitationInput = document.getElementById("invitationUrl");
    if (invitationInput) {
      invitationInput.value = `${window.location.origin}/invitation/${invitationId}`;
    }
  }
}

// Initialisation au chargement de la page
document.addEventListener("DOMContentLoaded", function () {
  // Vérifier si déjà connecté
  checkAuthStatus();

  // Vérifier les paramètres d'invitation
  checkInvitationParam();

  // Event listeners pour les boutons de mode
  document
    .getElementById("loginBtn")
    .addEventListener("click", () => switchAuthMode("login"));
  document
    .getElementById("registerBtn")
    .addEventListener("click", () => switchAuthMode("register"));
  document
    .getElementById("guestBtn")
    .addEventListener("click", () => switchAuthMode("guest"));

  // Event listeners pour les formulaires
  document.getElementById("loginForm").addEventListener("submit", handleLogin);
  document
    .getElementById("registerForm")
    .addEventListener("submit", handleRegister);
  document.getElementById("guestForm").addEventListener("submit", handleGuest);
  document
    .getElementById("forgotPasswordForm")
    .addEventListener("submit", handleForgotPassword);

  // Event listener pour la vérification de la force du mot de passe
  const registerPassword = document.getElementById("registerPassword");
  if (registerPassword) {
    registerPassword.addEventListener("input", (e) => {
      checkPasswordStrength(e.target.value);
    });
  }

  // Event listener pour la vérification de correspondance des mots de passe
  const confirmPassword = document.getElementById("confirmPassword");
  if (confirmPassword) {
    confirmPassword.addEventListener("blur", checkPasswordMatch);
  }

  // Fermer les messages en cliquant dessus
  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("message")) {
      e.target.remove();
    }
  });

  // Gestion des touches clavier pour améliorer l'UX
  document.addEventListener("keydown", (e) => {
    // Échapper pour fermer les messages
    if (e.key === "Escape") {
      clearMessage();
    }

    // Entrée pour soumettre le formulaire actif
    if (e.key === "Enter" && e.target.tagName !== "BUTTON") {
      const activeForm = document.querySelector(".auth-form:not(.hidden)");
      if (activeForm) {
        const submitBtn = activeForm.querySelector('button[type="submit"]');
        if (submitBtn && !submitBtn.disabled) {
          submitBtn.click();
        }
      }
    }
  });

  console.log("🎉 Système d'authentification initialisé");
});
