// Configuration de l'API
const API_BASE_URL = "/api";
let currentUser = null;
let selectedTemplateId = null;
let currentPage = 1;
let allTemplates = [];

// Utilitaires
class APIClient {
  static async request(endpoint, options = {}) {
    const token = localStorage.getItem("auth_token");
    const config = {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
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
      if (error.message.includes("Token") || error.status === 401) {
        logout();
      }
      throw error;
    }
  }

  static async get(endpoint) {
    return this.request(endpoint, { method: "GET" });
  }

  static async post(endpoint, data) {
    return this.request(endpoint, { method: "POST", body: data });
  }

  static async put(endpoint, data) {
    return this.request(endpoint, { method: "PUT", body: data });
  }

  static async delete(endpoint) {
    return this.request(endpoint, { method: "DELETE" });
  }

  static async uploadFile(endpoint, formData) {
    const token = localStorage.getItem("auth_token");
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Erreur upload");
    }
    return data;
  }
}

// Gestion des messages
function showMessage(text, type = "info", duration = 5000) {
  const container = document.getElementById("messageContainer");
  const messageId = "msg_" + Date.now();

  const messageEl = document.createElement("div");
  messageEl.id = messageId;
  messageEl.className = `message ${type}`;
  messageEl.innerHTML = `
        ${text}
        <button onclick="removeMessage('${messageId}')" style="float: right; background: none; border: none; font-size: 18px; cursor: pointer;">×</button>
    `;

  container.appendChild(messageEl);

  if (duration > 0) {
    setTimeout(() => removeMessage(messageId), duration);
  }
}

function removeMessage(messageId) {
  const message = document.getElementById(messageId);
  if (message) {
    message.style.opacity = "0";
    setTimeout(() => message.remove(), 300);
  }
}

// Gestion du loading
function showLoading() {
  document.getElementById("loadingOverlay").classList.remove("hidden");
}

function hideLoading() {
  document.getElementById("loadingOverlay").classList.add("hidden");
}

// Navigation entre les onglets
function showTab(tabName) {
  // Masquer tous les onglets
  document.querySelectorAll(".tab-content").forEach((tab) => {
    tab.classList.remove("active");
  });

  // Désactiver tous les boutons
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.classList.remove("active");
  });

  // Afficher l'onglet sélectionné
  document.getElementById(tabName + "Tab").classList.add("active");

  // Activer le bouton correspondant
  event.target.classList.add("active");

  // Charger le contenu spécifique
  switch (tabName) {
    case "invitations":
      loadUserInvitations();
      break;
    case "templates":
      loadTemplatesGallery();
      break;
    case "settings":
      loadUserProfile();
      break;
  }
}

// Gestion des templates
async function loadTemplates() {
  try {
    const response = await APIClient.get("/templates");
    allTemplates = response.data.templates;
    displayTemplates(allTemplates);
  } catch (error) {
    showMessage("Erreur lors du chargement des templates", "error");
  }
}

function displayTemplates(templates) {
  const grid = document.getElementById("templateGrid");

  if (typeof templates === "object" && !Array.isArray(templates)) {
    // Templates groupés par catégorie
    const allTemplatesList = [];
    Object.values(templates).forEach((categoryTemplates) => {
      allTemplatesList.push(...categoryTemplates);
    });
    templates = allTemplatesList;
  }

  grid.innerHTML = templates
    .map(
      (template) => `
        <div class="template-card ${
          selectedTemplateId === template.id ? "selected" : ""
        }" 
             onclick="selectTemplate(${template.id})">
            <div class="template-preview">
                ${
                  template.thumbnail_url
                    ? `<img src="${template.thumbnail_url}" alt="${template.name}">`
                    : `<div style="display: flex; align-items: center; justify-content: center; height: 100%; font-size: 2rem;">🎨</div>`
                }
            </div>
            <h4>${template.name}</h4>
            <p>Catégorie: ${template.category}</p>
            ${
              template.is_premium
                ? '<span class="premium-badge">✨ Premium</span>'
                : ""
            }
        </div>
    `
    )
    .join("");
}

function filterTemplates(category) {
  // Mettre à jour les boutons
  document.querySelectorAll(".category-btn").forEach((btn) => {
    btn.classList.remove("active");
  });
  event.target.classList.add("active");

  // Filtrer les templates
  if (category === "all") {
    displayTemplates(allTemplates);
  } else {
    const filtered = allTemplates.filter(
      (template) => template.category === category
    );
    displayTemplates(filtered);
  }
}

function selectTemplate(templateId) {
  selectedTemplateId = templateId;

  // Mettre à jour l'affichage
  document.querySelectorAll(".template-card").forEach((card) => {
    card.classList.remove("selected");
  });
  event.target.closest(".template-card").classList.add("selected");

  // Trouver le template sélectionné dans la structure groupée
  let template = null;

  if (Array.isArray(allTemplates)) {
    template = allTemplates.find((t) => t.id === templateId);
  } else if (typeof allTemplates === "object") {
    // Chercher dans toutes les catégories
    for (const category in allTemplates) {
      if (Array.isArray(allTemplates[category])) {
        template = allTemplates[category].find((t) => t.id === templateId);
        if (template) break;
      }
    }
  }

  if (template) {
    document.getElementById("selectedTemplateIcon").textContent =
      template.category === "enfant"
        ? "🎀"
        : template.category === "femme-adulte"
        ? "👗"
        : template.category === "homme-adulte"
        ? "🎩"
        : "🎨";

    updatePreview();
    showMessage(`Template "${template.name}" sélectionné`, "success");
  } else {
    console.error("Template non trouvé:", templateId);
    showMessage("Erreur lors de la sélection du template", "error");
  }
}

// Gestion du formulaire d'invitation
function setupFormListeners() {
  const form = document.getElementById("invitationForm");
  const formFields = [
    "title",
    "eventDate",
    "eventTime",
    "eventLocation",
    "customMessage",
  ];

  // Écouteurs pour la preview en temps réel
  formFields.forEach((fieldId) => {
    const field = document.getElementById(fieldId);
    if (field) {
      field.addEventListener("input", updatePreview);
      field.addEventListener("change", updatePreview);
    }
  });

  // Soumission du formulaire
  form.addEventListener("submit", handleFormSubmit);
}

function updatePreview() {
  const title =
    document.getElementById("title").value || "Titre de l'événement";
  const date = document.getElementById("eventDate").value;
  const time = document.getElementById("eventTime").value || "Non définie";
  const location =
    document.getElementById("eventLocation").value || "Non défini";
  const message = document.getElementById("customMessage").value;

  document.getElementById("previewTitle").textContent = title;
  document.getElementById("previewTime").textContent = time;
  document.getElementById("previewLocation").textContent = location;

  if (date) {
    const dateObj = new Date(date);
    document.getElementById("previewDate").textContent =
      dateObj.toLocaleDateString("fr-FR", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
  } else {
    document.getElementById("previewDate").textContent = "Non définie";
  }

  const messageEl = document.getElementById("previewMessage");
  if (message) {
    messageEl.textContent = message;
    messageEl.style.display = "block";
  } else {
    messageEl.style.display = "none";
  }
}

async function handleFormSubmit(e) {
  e.preventDefault();

  if (!selectedTemplateId) {
    showMessage("Veuillez sélectionner un template", "error");
    return;
  }

  showLoading();

  try {
    const formData = new FormData(e.target);
    formData.append("template_id", selectedTemplateId);

    // Si une image est sélectionnée, l'envoyer
    const response = await APIClient.uploadFile("/invitations", formData);

    // Afficher le lien généré
    const invitation = response.data.invitation;
    document.getElementById("invitationLink").textContent =
      invitation.public_url;
    document.getElementById("generatedLinkSection").classList.remove("hidden");

    showMessage("Invitation créée avec succès!", "success");

    // Scroll vers le lien
    document.getElementById("generatedLinkSection").scrollIntoView({
      behavior: "smooth",
    });
  } catch (error) {
    showMessage(error.message, "error");
  } finally {
    hideLoading();
  }
}

// Gestion des images
function previewImage(input) {
  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const preview = document.getElementById("imagePreview");
      const img = document.getElementById("previewImg");
      img.src = e.target.result;
      preview.classList.remove("hidden");
    };
    reader.readAsDataURL(input.files[0]);
  }
}

function removeImage() {
  document.getElementById("guestPhoto").value = "";
  document.getElementById("imagePreview").classList.add("hidden");
}

// Gestion du lien généré
function copyLink() {
  const linkText = document.getElementById("invitationLink").textContent;
  navigator.clipboard
    .writeText(linkText)
    .then(() => {
      showMessage("Lien copié dans le presse-papiers!", "success");
    })
    .catch(() => {
      showMessage("Erreur lors de la copie", "error");
    });
}

function previewInvitation() {
  const link = document.getElementById("invitationLink").textContent;
  if (link) {
    window.open(link, "_blank");
  }
}

function shareInvitation() {
  const link = document.getElementById("invitationLink").textContent;
  const title = document.getElementById("title").value;

  if (navigator.share) {
    navigator.share({
      title: title,
      text: "Vous êtes invité(e) à cet événement!",
      url: link,
    });
  } else {
    // Fallback: copier le lien
    copyLink();
  }
}

// Gestion des invitations existantes
async function loadUserInvitations() {
  try {
    showLoading();
    const response = await APIClient.get(
      `/invitations?page=${currentPage}&limit=12`
    );
    displayInvitations(response.data.invitations);
    updateInvitationsStats(response.data.invitations);
    hideLoading();
  } catch (error) {
    hideLoading();
    showMessage("Erreur lors du chargement des invitations", "error");
  }
}

function displayInvitations(invitations) {
  const grid = document.getElementById("invitationsGrid");

  if (!invitations || invitations.length === 0) {
    grid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: white;">
                <h3>Aucune invitation trouvée</h3>
                <p>Créez votre première invitation pour commencer!</p>
                <button class="btn btn-primary" onclick="showTab('create')">Créer une invitation</button>
            </div>
        `;
    return;
  }

  grid.innerHTML = invitations
    .map(
      (invitation) => `
        <div class="invitation-card">
            <div class="invitation-header">
                <div>
                    <div class="invitation-title">${invitation.title}</div>
                    <div class="invitation-meta">
                        Créé le ${new Date(
                          invitation.created_at
                        ).toLocaleDateString("fr-FR")}
                    </div>
                </div>
                <span class="invitation-status ${
                  invitation.is_public ? "status-public" : "status-private"
                }">
                    ${invitation.is_public ? "Public" : "Privé"}
                </span>
            </div>
            
            <div class="invitation-stats">
                <span>👁️ ${invitation.view_count || 0} vues</span>
                <span>📝 ${
                  invitation.rsvp_stats?.confirmed || 0
                } confirmés</span>
            </div>
            
            <div class="invitation-actions">
                <button class="btn btn-small btn-secondary" onclick="editInvitation(${
                  invitation.id
                })">
                    ✏️ Modifier
                </button>
                <button class="btn btn-small btn-secondary" onclick="viewInvitation('${
                  invitation.unique_url
                }')">
                    👀 Voir
                </button>
                <button class="btn btn-small btn-secondary" onclick="toggleInvitationPublic(${
                  invitation.id
                })">
                    ${invitation.is_public ? "🔒 Privé" : "🌐 Public"}
                </button>
                <button class="btn btn-small btn-secondary" onclick="duplicateInvitation(${
                  invitation.id
                })">
                    📋 Dupliquer
                </button>
                <button class="btn btn-small" style="background: #ff4757; color: white;" onclick="deleteInvitation(${
                  invitation.id
                })">
                    🗑️ Supprimer
                </button>
            </div>
        </div>
    `
    )
    .join("");
}

function updateInvitationsStats(invitations) {
  const total = invitations.length;
  const publicCount = invitations.filter((inv) => inv.is_public).length;
  const totalViews = invitations.reduce(
    (sum, inv) => sum + (inv.view_count || 0),
    0
  );
  const totalRSVP = invitations.reduce(
    (sum, inv) => sum + (inv.rsvp_stats?.total_responses || 0),
    0
  );

  document.getElementById("totalInvitations").textContent = total;
  document.getElementById("publicInvitations").textContent = publicCount;
  document.getElementById("totalViews").textContent = totalViews;
  document.getElementById("totalRSVP").textContent = totalRSVP;
}

// Actions sur les invitations
async function editInvitation(id) {
  try {
    const response = await APIClient.get(`/invitations/${id}`);
    const invitation = response.data.invitation;

    // Remplir le formulaire avec les données existantes
    document.getElementById("title").value = invitation.title;
    document.getElementById("eventDate").value =
      invitation.event_date?.split("T")[0] || "";
    document.getElementById("eventTime").value = invitation.event_time || "";
    document.getElementById("eventLocation").value =
      invitation.event_location || "";
    document.getElementById("contactPhone").value =
      invitation.contact_phone || "";
    document.getElementById("eventTheme").value = invitation.event_theme || "";
    document.getElementById("customMessage").value =
      invitation.custom_message || "";
    document.getElementById("isPublic").checked = invitation.is_public;

    // Sélectionner le template
    selectedTemplateId = invitation.template_id;

    // Basculer vers l'onglet création
    showTab("create");

    // Modifier le bouton de soumission
    const submitBtn = document.querySelector(
      '#invitationForm button[type="submit"]'
    );
    submitBtn.textContent = "💾 Mettre à jour l'invitation";
    submitBtn.onclick = (e) => updateInvitation(e, id);

    updatePreview();
    showMessage("Invitation chargée pour modification", "info");
  } catch (error) {
    showMessage("Erreur lors du chargement de l'invitation", "error");
  }
}

async function updateInvitation(e, id) {
  e.preventDefault();

  showLoading();
  try {
    const formData = new FormData(e.target);
    const response = await APIClient.uploadFile(`/invitations/${id}`, formData);

    showMessage("Invitation mise à jour avec succès!", "success");

    // Réinitialiser le formulaire
    resetForm();

    // Recharger la liste des invitations
    if (
      document.getElementById("invitationsTab").classList.contains("active")
    ) {
      loadUserInvitations();
    }
  } catch (error) {
    showMessage(error.message, "error");
  } finally {
    hideLoading();
  }
}

function viewInvitation(uniqueUrl) {
  window.open(`/invitation/${uniqueUrl}`, "_blank");
}

async function toggleInvitationPublic(id) {
  try {
    await APIClient.post(`/invitations/${id}/toggle-public`);
    showMessage("Statut de l'invitation modifié", "success");
    loadUserInvitations();
  } catch (error) {
    showMessage("Erreur lors de la modification du statut", "error");
  }
}

async function duplicateInvitation(id) {
  try {
    const newTitle = prompt("Titre pour la copie:");
    if (!newTitle) return;

    await APIClient.post(`/invitations/${id}/duplicate`, {
      new_title: newTitle,
    });
    showMessage("Invitation dupliquée avec succès!", "success");
    loadUserInvitations();
  } catch (error) {
    showMessage("Erreur lors de la duplication", "error");
  }
}

async function deleteInvitation(id) {
  if (!confirm("Êtes-vous sûr de vouloir supprimer cette invitation?")) return;

  try {
    await APIClient.delete(`/invitations/${id}`);
    showMessage("Invitation supprimée", "success");
    loadUserInvitations();
  } catch (error) {
    showMessage("Erreur lors de la suppression", "error");
  }
}

// Gestion des templates (onglet galerie)
async function loadTemplatesGallery() {
  try {
    const response = await APIClient.get("/templates");
    displayTemplatesGallery(response.data.templates);
  } catch (error) {
    showMessage("Erreur lors du chargement de la galerie", "error");
  }
}

function displayTemplatesGallery(templates) {
  const gallery = document.getElementById("templatesGallery");

  if (typeof templates === "object" && !Array.isArray(templates)) {
    const allTemplatesList = [];
    Object.values(templates).forEach((categoryTemplates) => {
      allTemplatesList.push(...categoryTemplates);
    });
    templates = allTemplatesList;
  }

  gallery.innerHTML = templates
    .map(
      (template) => `
        <div class="template-gallery-card">
            <div class="template-image">
                ${
                  template.thumbnail_url
                    ? `<img src="${template.thumbnail_url}" alt="${template.name}" style="width: 100%; height: 100%; object-fit: cover;">`
                    : "🎨"
                }
            </div>
            <div class="template-info">
                <div class="template-name">${template.name}</div>
                <span class="template-category">${template.category}</span>
                ${
                  template.is_premium
                    ? '<span class="premium-badge">✨ Premium</span>'
                    : ""
                }
                <p class="template-description">Template pour ${
                  template.category
                }</p>
                <div class="template-actions">
                    <button class="btn btn-small btn-primary" onclick="useTemplate(${
                      template.id
                    })">
                        ✨ Utiliser
                    </button>
                    <button class="btn btn-small btn-secondary" onclick="previewTemplate(${
                      template.id
                    })">
                        👀 Aperçu
                    </button>
                </div>
            </div>
        </div>
    `
    )
    .join("");
}

function filterTemplatesView(category) {
  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.classList.remove("active");
  });
  event.target.classList.add("active");

  const cards = document.querySelectorAll(".template-gallery-card");
  cards.forEach((card) => {
    if (category === "all") {
      card.style.display = "block";
    } else if (category === "premium") {
      card.style.display = card.querySelector(".premium-badge")
        ? "block"
        : "none";
    } else {
      const categorySpan = card.querySelector(".template-category");
      card.style.display =
        categorySpan && categorySpan.textContent === category
          ? "block"
          : "none";
    }
  });
}

function useTemplate(templateId) {
  selectedTemplateId = templateId;
  showTab("create");

  // Sélectionner le template dans la sidebar
  loadTemplates().then(() => {
    const templateCard = document.querySelector(
      `[onclick="selectTemplate(${templateId})"]`
    );
    if (templateCard) {
      templateCard.classList.add("selected");
      const template = allTemplates.find((t) => t.id === templateId);
      if (template) {
        document.getElementById("selectedTemplateIcon").textContent =
          template.category === "enfant"
            ? "🎀"
            : template.category === "femme-adulte"
            ? "👗"
            : template.category === "homme-adulte"
            ? "�"
            : "🎨";
      }
    }
  });

  showMessage("Template sélectionné! Configurez votre invitation.", "success");
}

async function previewTemplate(templateId) {
  try {
    const response = await APIClient.get(`/templates/${templateId}/preview`);

    // Ouvrir une nouvelle fenêtre avec l'aperçu
    const previewWindow = window.open("", "_blank");
    previewWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Aperçu du template</title>
                <style>${response.data.rendered_css}</style>
            </head>
            <body>${response.data.rendered_html}</body>
            </html>
        `);
    previewWindow.document.close();
  } catch (error) {
    showMessage("Erreur lors de l'aperçu du template", "error");
  }
}

// Gestion des paramètres utilisateur
async function loadUserProfile() {
  try {
    const response = await APIClient.get("/auth/profile");
    const user = response.data.user;

    document.getElementById("firstName").value = user.first_name || "";
    document.getElementById("lastName").value = user.last_name || "";

    // Afficher les informations Premium
    updatePremiumInfo(user);
  } catch (error) {
    showMessage("Erreur lors du chargement du profil", "error");
  }
}

function updatePremiumInfo(user) {
  const premiumInfo = document.getElementById("premiumInfo");

  if (user.is_premium) {
    document.getElementById("premiumBadge").classList.remove("hidden");
    premiumInfo.innerHTML = `
            <div class="premium-card">
                <h4>✨ Compte Premium Actif</h4>
                <p>Vous avez accès à tous les templates premium et fonctionnalités avancées!</p>
            </div>
        `;
  } else {
    premiumInfo.innerHTML = `
            <div style="text-align: center; padding: 30px;">
                <h4>Passer en Premium</h4>
                <div class="premium-features">
                    <ul>
                        <li>Accès à tous les templates premium</li>
                        <li>Upload d'images personnalisées</li>
                        <li>Invitations illimitées</li>
                        <li>Statistiques avancées</li>
                        <li>Support prioritaire</li>
                    </ul>
                </div>
                <button class="btn btn-primary" onclick="upgradeToPremium()">
                    ⭐ Passer en Premium - 9,99€
                </button>
            </div>
        `;
  }
}

// Paiement Premium
async function upgradeToPremium() {
  try {
    showLoading();
    const response = await APIClient.post("/payments/premium/create-intent");

    // Ici vous intégreriez Stripe Elements pour le paiement
    // Pour la démo, on simule un paiement réussi
    showMessage("Redirection vers le paiement...", "info");

    // Simulation: après 3 secondes, marquer comme premium
    setTimeout(async () => {
      try {
        // Recharger le profil pour voir le changement
        await loadUserProfile();
        showMessage("Félicitations! Vous êtes maintenant Premium!", "success");
      } catch (error) {
        showMessage("Erreur lors de la mise à jour du statut", "error");
      }
      hideLoading();
    }, 3000);
  } catch (error) {
    hideLoading();
    showMessage(error.message, "error");
  }
}

// Utilitaires
function resetForm() {
  document.getElementById("invitationForm").reset();
  document.getElementById("generatedLinkSection").classList.add("hidden");
  document.getElementById("imagePreview").classList.add("hidden");
  selectedTemplateId = null;

  // Réinitialiser le bouton de soumission
  const submitBtn = document.querySelector(
    '#invitationForm button[type="submit"]'
  );
  submitBtn.textContent = "🚀 Créer l'invitation";
  submitBtn.onclick = null;

  updatePreview();
  showMessage("Formulaire réinitialisé", "info");
}

function searchInvitations() {
  const searchTerm = document
    .getElementById("searchInvitations")
    .value.toLowerCase();
  const cards = document.querySelectorAll(".invitation-card");

  cards.forEach((card) => {
    const title = card
      .querySelector(".invitation-title")
      .textContent.toLowerCase();
    card.style.display = title.includes(searchTerm) ? "block" : "none";
  });
}

// Notifications
function showNotifications() {
  showMessage("Aucune nouvelle notification", "info");
}

// Modals
function closeModal() {
  document.getElementById("modalOverlay").classList.add("hidden");
  document.getElementById("invitationModal").classList.add("hidden");
}

// Déconnexion
function logout() {
  if (confirm("Êtes-vous sûr de vouloir vous déconnecter?")) {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_data");
    window.location.href = "/";
  }
}

// Initialisation
document.addEventListener("DOMContentLoaded", async function () {
  // Vérifier l'authentification
  const token = localStorage.getItem("auth_token");
  if (!token) {
    window.location.href = "/";
    return;
  }

  try {
    // Charger le profil utilisateur
    const response = await APIClient.get("/auth/profile");
    currentUser = response.data.user;

    document.getElementById("userEmail").textContent = currentUser.email;

    if (currentUser.is_premium) {
      document.getElementById("premiumBadge").classList.remove("hidden");
    }

    // Configurer les écouteurs d'événements
    setupFormListeners();

    // Charger les templates
    await loadTemplates();

    // Définir la date par défaut (dans 7 jours)
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    document.getElementById("eventDate").value = nextWeek
      .toISOString()
      .split("T")[0];

    updatePreview();

    // Gestion des formulaires de paramètres
    const profileForm = document.getElementById("profileForm");
    if (profileForm) {
      profileForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        try {
          const formData = new FormData(e.target);
          await APIClient.put("/auth/profile", Object.fromEntries(formData));
          showMessage("Profil mis à jour avec succès!", "success");
        } catch (error) {
          showMessage(error.message, "error");
        }
      });
    }

    const passwordForm = document.getElementById("passwordForm");
    if (passwordForm) {
      passwordForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);

        if (data.newPassword !== data.confirmPassword) {
          showMessage("Les mots de passe ne correspondent pas", "error");
          return;
        }

        try {
          await APIClient.post("/auth/change-password", {
            currentPassword: data.currentPassword,
            newPassword: data.newPassword,
          });
          showMessage("Mot de passe modifié avec succès!", "success");
          e.target.reset();
        } catch (error) {
          showMessage(error.message, "error");
        }
      });
    }

    console.log("Dashboard initialisé avec succès");
  } catch (error) {
    console.error("Erreur d'initialisation:", error);
    showMessage("Erreur lors de l'initialisation", "error");
    logout();
  }
});

// Gestion des erreurs globales
window.addEventListener("error", function (e) {
  console.error("Erreur globale:", e.error);
  showMessage("Une erreur inattendue s'est produite", "error");
});

window.addEventListener("unhandledrejection", function (e) {
  console.error("Promesse rejetée:", e.reason);
  showMessage("Erreur de connexion", "error");
});
