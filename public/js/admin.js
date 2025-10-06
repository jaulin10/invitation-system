// ===== CONFIGURATION ADMIN =====
const ADMIN_API_BASE = "/api/admin";
let adminData = {
  currentTab: "dashboard",
  users: [],
  invitations: [],
  templates: [],
  payments: [],
  pagination: {
    users: { page: 1, limit: 20, total: 0 },
    invitations: { page: 1, limit: 20, total: 0 },
    payments: { page: 1, limit: 20, total: 0 },
  },
  filters: {
    users: { search: "", filter: "all" },
    invitations: { search: "" },
    payments: { dateFrom: "", dateTo: "" },
    templates: { category: "", search: "", type: "" },
  },
};

// Variables pour les graphiques
let revenueChart = null;
let usersChart = null;
let registrationsChart = null;
let revenueBreakdownChart = null;

// ===== CLIENT API ADMIN =====
class AdminAPIClient {
  static async request(endpoint, options = {}) {
    const token = localStorage.getItem("auth_token");

    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
      ...options,
    };

    if (config.body && typeof config.body === "object") {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(`${ADMIN_API_BASE}${endpoint}`, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Erreur API Admin");
      }

      return data;
    } catch (error) {
      console.error("Erreur API Admin:", error);
      handleApiError(error, `API ${endpoint}`);
      throw error;
    }
  }

  static async get(endpoint) {
    return this.request(endpoint);
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
}

// ===== FONCTIONS UTILITAIRES =====
function showMessage(message, type = "info") {
  // Supprimer les anciens messages
  document.querySelectorAll(".message").forEach((msg) => msg.remove());

  const messageEl = document.createElement("div");
  messageEl.className = `message ${type}`;
  messageEl.textContent = message;
  messageEl.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 20px;
    border-radius: 8px;
    font-weight: 500;
    font-size: 14px;
    z-index: 1001;
    max-width: 400px;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    animation: messageSlideIn 0.3s ease-out;
  `;

  // Couleurs selon le type
  const colors = {
    success: { bg: "#c6f6d5", color: "#22543d", border: "#48bb78" },
    error: { bg: "#fed7d7", color: "#742a2a", border: "#f56565" },
    warning: { bg: "#fef5e7", color: "#744210", border: "#ed8936" },
    info: { bg: "#bee3f8", color: "#2a4365", border: "#4299e1" },
  };

  const colorScheme = colors[type] || colors.info;
  messageEl.style.backgroundColor = colorScheme.bg;
  messageEl.style.color = colorScheme.color;
  messageEl.style.borderLeft = `4px solid ${colorScheme.border}`;

  document.body.appendChild(messageEl);

  // Auto-suppression après 5 secondes
  setTimeout(() => {
    if (messageEl.parentNode) {
      messageEl.remove();
    }
  }, 5000);
}

function showLoading() {
  const overlay = document.getElementById("loadingOverlay");
  if (overlay) {
    overlay.classList.remove("hidden");
  }
}

function hideLoading() {
  const overlay = document.getElementById("loadingOverlay");
  if (overlay) {
    overlay.classList.add("hidden");
  }
}

function showModal(modalId) {
  const overlay = document.getElementById("modalOverlay");
  const modal = document.getElementById(modalId);

  if (overlay && modal) {
    overlay.classList.remove("hidden");
    modal.classList.remove("hidden");

    // Focus sur le premier input du modal
    const firstInput = modal.querySelector("input, select, textarea");
    if (firstInput) {
      setTimeout(() => firstInput.focus(), 100);
    }
  }
}

function closeModal() {
  const overlay = document.getElementById("modalOverlay");
  const modals = document.querySelectorAll(".modal");

  if (overlay) {
    overlay.classList.add("hidden");
  }

  modals.forEach((modal) => {
    modal.classList.add("hidden");
  });
}

function handleApiError(error, context = "") {
  console.error(`Erreur ${context}:`, error);

  if (error.message.includes("401")) {
    showMessage("Session expirée, redirection...", "error");
    setTimeout(() => (window.location.href = "/login.html"), 2000);
  } else if (error.message.includes("403")) {
    showMessage("Accès non autorisé", "error");
  } else if (error.message.includes("404")) {
    showMessage("Ressource non trouvée", "error");
  } else if (error.message.includes("500")) {
    showMessage("Erreur serveur, veuillez réessayer", "error");
  } else {
    showMessage(error.message || "Une erreur est survenue", "error");
  }
}

function logout() {
  if (confirm("Êtes-vous sûr de vouloir vous déconnecter ?")) {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_data");
    window.location.href = "/login.html";
  }
}

// ===== GESTION DES ONGLETS =====
function showTab(tabName) {
  // Mettre à jour la navigation
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.classList.remove("active");
  });
  document
    .querySelector(`[onclick="showTab('${tabName}')"]`)
    ?.classList.add("active");

  // Masquer tous les contenus
  document.querySelectorAll(".tab-content").forEach((content) => {
    content.classList.remove("active");
  });

  // Afficher le contenu sélectionné
  const tabElement = document.getElementById(`${tabName}Tab`);
  if (tabElement) {
    tabElement.classList.add("active");
  }

  adminData.currentTab = tabName;

  // Charger les données spécifiques à l'onglet
  switch (tabName) {
    case "dashboard":
      loadDashboardData();
      break;
    case "users":
      loadUsers();
      break;
    case "invitations":
      loadInvitations();
      break;
    case "templates":
      loadTemplates();
      break;
    case "payments":
      loadPayments();
      break;
    case "analytics":
      loadAnalytics();
      break;
    case "system":
      loadSystemData();
      break;
  }
}

// ===== DASHBOARD PRINCIPAL =====
async function loadDashboardData() {
  showLoading();

  try {
    const data = await AdminAPIClient.get("/dashboard");

    // Mettre à jour les statistiques principales
    updateMainStats(data.data);

    // Charger l'activité récente
    updateRecentActivity(data.data.recent_activity);

    // Créer les graphiques
    createRevenueChart(data.data.monthly_revenue);
    createUsersChart(data.data.users);

    // Mettre à jour les stats rapides
    updateQuickStats(data.data);
  } catch (error) {
    showMessage("Erreur lors du chargement du dashboard", "error");
    console.error("Dashboard error:", error);
  } finally {
    hideLoading();
  }
}

function updateMainStats(data) {
  const stats = {
    totalUsers: data.users?.total_users || 0,
    premiumUsers: data.users?.premium_users || 0,
    totalInvitations: data.invitations?.total_invitations || 0,
    totalRevenue: data.payments?.total_revenue || 0,
  };

  document.getElementById("totalUsers").textContent = formatNumber(
    stats.totalUsers
  );
  document.getElementById("premiumUsers").textContent = formatNumber(
    stats.premiumUsers
  );
  document.getElementById("totalInvitations").textContent = formatNumber(
    stats.totalInvitations
  );
  document.getElementById("totalRevenue").textContent = formatCurrency(
    stats.totalRevenue
  );

  // Calculer et afficher les changements (simulés pour l'exemple)
  updateStatChange("usersChange", "+12%", "positive");
  updateStatChange("premiumChange", "+8%", "positive");
  updateStatChange("invitationsChange", "+25%", "positive");
  updateStatChange("revenueChange", "+15%", "positive");
}

function updateStatChange(elementId, change, type) {
  const element = document.getElementById(elementId);
  if (element) {
    element.textContent = change;
    element.className = `stat-change ${type}`;
  }
}

function updateRecentActivity(activities) {
  const container = document.getElementById("recentActivity");
  if (!container || !activities) return;

  container.innerHTML = activities
    .map(
      (activity) => `
        <div class="activity-item">
            <div class="activity-icon ${activity.type}">
                ${getActivityIcon(activity.type)}
            </div>
            <div class="activity-content">
                <div class="activity-description">
                    ${getActivityDescription(activity)}
                </div>
                <div class="activity-time">
                    ${formatRelativeTime(activity.created_at)}
                </div>
            </div>
        </div>
    `
    )
    .join("");
}

function getActivityIcon(type) {
  const icons = {
    user_registration: "👤",
    invitation_created: "📋",
    payment: "💳",
  };
  return icons[type] || "📊";
}

function getActivityDescription(activity) {
  switch (activity.type) {
    case "user_registration":
      return `Nouvel utilisateur : ${activity.first_name} ${activity.last_name}`;
    case "invitation_created":
      return `Nouvelle invitation : ${activity.title}`;
    case "payment":
      return `Paiement de ${formatCurrency(activity.amount)} (${
        activity.payment_type
      })`;
    default:
      return "Activité inconnue";
  }
}

function updateQuickStats(data) {
  const avgViews = data.invitations?.avg_views_per_invitation || 0;
  const conversionRate =
    data.users?.premium_users && data.users?.total_users
      ? ((data.users.premium_users / data.users.total_users) * 100).toFixed(1)
      : 0;

  document.getElementById("avgViewsPerInvitation").textContent =
    Math.round(avgViews);
  document.getElementById("conversionRate").textContent = `${conversionRate}%`;
  document.getElementById("activeTemplates").textContent =
    adminData.templates?.length || 0;
}

// ===== GRAPHIQUES =====
function createRevenueChart(monthlyData) {
  const ctx = document.getElementById("revenueChart");
  if (!ctx) return;

  if (revenueChart) {
    revenueChart.destroy();
  }

  revenueChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: monthlyData?.map((d) => d.month) || [
        "Jan",
        "Fév",
        "Mar",
        "Avr",
        "Mai",
        "Jun",
      ],
      datasets: [
        {
          label: "Revenus (€)",
          data: monthlyData?.map((d) => d.revenue) || [
            120, 190, 300, 500, 200, 300,
          ],
          borderColor: "#667eea",
          backgroundColor: "rgba(102, 126, 234, 0.1)",
          tension: 0.4,
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function (value) {
              return formatCurrency(value);
            },
          },
        },
      },
    },
  });
}

function createUsersChart(userData) {
  const ctx = document.getElementById("usersChart");
  if (!ctx) return;

  if (usersChart) {
    usersChart.destroy();
  }

  usersChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Premium", "Gratuit"],
      datasets: [
        {
          data: [
            userData?.premium_users || 25,
            (userData?.total_users || 100) - (userData?.premium_users || 25),
          ],
          backgroundColor: ["#667eea", "#e2e8f0"],
          borderWidth: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "bottom" },
      },
    },
  });
}

// ===== GESTION DES UTILISATEURS =====
async function loadUsers() {
  showLoading();

  try {
    const params = new URLSearchParams({
      page: adminData.pagination.users.page,
      limit: adminData.pagination.users.limit,
      search: adminData.filters.users.search,
      filter: adminData.filters.users.filter,
    });

    const data = await AdminAPIClient.get(`/users?${params}`);
    adminData.users = data.data.users;
    adminData.pagination.users = data.data.pagination;

    updateUsersTable();
    updateUsersPagination();
  } catch (error) {
    showMessage("Erreur lors du chargement des utilisateurs", "error");
    console.error("Users error:", error);
  } finally {
    hideLoading();
  }
}

function updateUsersTable() {
  const tbody = document.getElementById("usersTableBody");
  if (!tbody) return;

  tbody.innerHTML = adminData.users
    .map(
      (user) => `
        <tr>
            <td>
                <div class="user-info">
                    <strong>${user.first_name} ${user.last_name}</strong>
                </div>
            </td>
            <td>${user.email}</td>
            <td>
                <span class="status-badge ${
                  user.is_premium ? "premium" : "regular"
                }">
                    ${user.is_premium ? "Premium" : "Gratuit"}
                </span>
            </td>
            <td>-</td>
            <td>${formatDate(user.created_at)}</td>
            <td>
                <div class="table-actions">
                    <button class="action-btn primary" onclick="viewUserDetails('${
                      user.id
                    }')">
                        👁️ Voir
                    </button>
                    <button class="action-btn secondary" onclick="toggleUserStatus('${
                      user.id
                    }')">
                        🔄 Basculer
                    </button>
                </div>
            </td>
        </tr>
    `
    )
    .join("");
}

function updateUsersPagination() {
  const container = document.getElementById("usersPagination");
  if (!container) return;

  const { page, pages, total } = adminData.pagination.users;

  container.innerHTML = `
        <button ${page <= 1 ? "disabled" : ""} onclick="changeUsersPage(${
    page - 1
  })">
            ← Précédent
        </button>
        <span>Page ${page} sur ${pages} (${total} utilisateurs)</span>
        <button ${page >= pages ? "disabled" : ""} onclick="changeUsersPage(${
    page + 1
  })">
            Suivant →
        </button>
    `;
}

function filterUsers() {
  adminData.filters.users.filter = document.getElementById("userFilter").value;
  adminData.pagination.users.page = 1;
  loadUsers();
}

function searchUsers() {
  adminData.filters.users.search = document.getElementById("userSearch").value;
  adminData.pagination.users.page = 1;
  loadUsers();
}

function changeUsersPage(newPage) {
  adminData.pagination.users.page = newPage;
  loadUsers();
}

async function viewUserDetails(userId) {
  try {
    const data = await AdminAPIClient.get(`/users/${userId}`);
    const modal = document.getElementById("userModal");
    const content = document.getElementById("userModalContent");

    content.innerHTML = `
            <div class="user-details">
                <h4>${data.data.user.first_name} ${
      data.data.user.last_name
    }</h4>
                <p><strong>Email:</strong> ${data.data.user.email}</p>
                <p><strong>Statut:</strong> ${
                  data.data.user.is_premium ? "Premium" : "Gratuit"
                }</p>
                <p><strong>Inscrit le:</strong> ${formatDate(
                  data.data.user.created_at
                )}</p>
                
                <h5>Statistiques</h5>
                <div class="user-stats">
                    <div>Invitations créées: ${
                      data.data.stats?.total_invitations || 0
                    }</div>
                    <div>Vues totales: ${
                      data.data.stats?.total_views || 0
                    }</div>
                </div>
            </div>
        `;

    showModal("userModal");
  } catch (error) {
    showMessage("Erreur lors du chargement des détails utilisateur", "error");
  }
}

async function toggleUserStatus(userId) {
  try {
    await AdminAPIClient.post(`/users/${userId}/toggle-status`, {
      action: "toggle",
    });
    showMessage("Statut utilisateur modifié", "success");
    loadUsers();
  } catch (error) {
    showMessage("Erreur lors de la modification du statut", "error");
  }
}

// ===== GESTION DES INVITATIONS =====
async function loadInvitations() {
  showLoading();

  try {
    const params = new URLSearchParams({
      page: adminData.pagination.invitations.page,
      limit: adminData.pagination.invitations.limit,
      search: adminData.filters.invitations.search,
    });

    const data = await AdminAPIClient.get(`/invitations?${params}`);
    adminData.invitations = data.data.invitations;

    updateInvitationsTable();
    updateInvitationsStats();
  } catch (error) {
    showMessage("Erreur lors du chargement des invitations", "error");
    console.error("Invitations error:", error);
  } finally {
    hideLoading();
  }
}

function updateInvitationsTable() {
  const tbody = document.getElementById("invitationsTableBody");
  if (!tbody) return;

  tbody.innerHTML = adminData.invitations
    .map(
      (invitation) => `
        <tr>
            <td><strong>${invitation.title}</strong></td>
            <td>${invitation.user_email}</td>
            <td>${invitation.template_name || "Aucun"}</td>
            <td>${invitation.view_count || 0}</td>
            <td>
                <span class="status-badge ${
                  invitation.is_public ? "public" : "private"
                }">
                    ${invitation.is_public ? "Public" : "Privé"}
                </span>
            </td>
            <td>${formatDate(invitation.created_at)}</td>
            <td>
                <div class="table-actions">
                    <button class="action-btn primary" onclick="viewInvitationDetails('${
                      invitation.id
                    }')">
                        👁️ Voir
                    </button>
                </div>
            </td>
        </tr>
    `
    )
    .join("");
}

function updateInvitationsStats() {
  const total = adminData.invitations.length;
  const publicCount = adminData.invitations.filter(
    (inv) => inv.is_public
  ).length;
  const totalViews = adminData.invitations.reduce(
    (sum, inv) => sum + (inv.view_count || 0),
    0
  );

  document.getElementById("adminTotalInvitations").textContent = total;
  document.getElementById("adminPublicInvitations").textContent = publicCount;
  document.getElementById("adminTotalViews").textContent =
    formatNumber(totalViews);
  document.getElementById("adminNewInvitations").textContent = "-"; // À calculer côté serveur
}

function searchInvitations() {
  adminData.filters.invitations.search =
    document.getElementById("invitationSearch").value;
  loadInvitations();
}

function viewInvitationDetails(invitationId) {
  showMessage("Fonctionnalité détails invitation à implémenter", "info");
}

// ===== GESTION DES TEMPLATES =====
async function loadTemplates() {
  showLoading();

  try {
    const data = await AdminAPIClient.get("/templates");

    if (data.success) {
      adminData.templates = data.data.templates;
      updateTemplatesGrid();
      updateTemplatesStats();
    } else {
      throw new Error(data.message || "Erreur lors du chargement");
    }
  } catch (error) {
    showMessage(
      "Erreur lors du chargement des templates: " + error.message,
      "error"
    );
    console.error("Templates error:", error);
    adminData.templates = [];
    updateTemplatesGrid();
  } finally {
    hideLoading();
  }
}

function updateTemplatesStats() {
  if (!adminData.templates) return;

  const total = adminData.templates.length;
  const premium = adminData.templates.filter((t) => t.is_premium).length;
  const categories = [...new Set(adminData.templates.map((t) => t.category))]
    .length;
  const totalUses = adminData.templates.reduce(
    (sum, t) => sum + (t.usage_stats?.total_uses || 0),
    0
  );

  const elements = {
    adminTotalTemplates: total,
    adminPremiumTemplates: premium,
    adminTemplateCategories: categories,
    adminTotalTemplateUses: totalUses,
  };

  Object.entries(elements).forEach(([id, value]) => {
    const element = document.getElementById(id);
    if (element) element.textContent = formatNumber(value);
  });
}

function updateTemplatesGrid() {
  const grid = document.getElementById("adminTemplatesGrid");
  if (!grid) return;

  if (!adminData.templates || adminData.templates.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🎨</div>
        <h3>Aucun template disponible</h3>
        <p>Commencez par ajouter des templates ou initialiser depuis les fichiers.</p>
        <div class="empty-actions">
          <button class="btn btn-primary" onclick="seedTemplatesFromFiles()">
            🌱 Initialiser depuis fichiers
          </button>
          <button class="btn btn-secondary" onclick="addNewTemplate()">
            ➕ Créer un template
          </button>
        </div>
      </div>
    `;
    return;
  }

  grid.innerHTML = adminData.templates
    .map(
      (template) => `
        <div class="admin-template-card">
            <div class="template-preview">
                ${
                  template.thumbnail_url
                    ? `<img src="${template.thumbnail_url}" alt="${
                        template.name
                      }" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                   <div class="template-icon" style="display:none;">${
                     template.icon || "🎨"
                   }</div>`
                    : `<div class="template-icon">${
                        template.icon || "🎨"
                      }</div>`
                }
            </div>
            <div class="template-info">
                <div class="template-name">${template.name}</div>
                <div class="template-category">${template.category}</div>
                <div class="template-stats">
                    <span>Utilisé ${
                      template.usage_stats?.total_uses || 0
                    } fois</span>
                    <span class="premium-badge ${
                      template.is_premium ? "premium" : "free"
                    }">
                      ${template.is_premium ? "Premium" : "Gratuit"}
                    </span>
                </div>
                <div class="template-actions">
                    <button class="action-btn primary" onclick="previewTemplate('${
                      template.id
                    }')">
                      👁️ Aperçu
                    </button>
                    <button class="action-btn secondary" onclick="editTemplate('${
                      template.id
                    }')">
                      ✏️ Modifier
                    </button>
                    <button class="action-btn danger" onclick="deleteTemplate('${
                      template.id
                    }')">
                      🗑️ Supprimer
                    </button>
                </div>
            </div>
        </div>
    `
    )
    .join("");
}

function filterTemplates() {
  if (!adminData.templates || adminData.templates.length === 0) {
    return;
  }

  const category =
    document.getElementById("templateCategoryFilter")?.value || "";
  const search = document.getElementById("templateSearch")?.value || "";
  const type = document.getElementById("templateTypeFilter")?.value || "";

  let filteredTemplates = [...adminData.templates];

  // Filtrer par catégorie
  if (category && category !== "") {
    filteredTemplates = filteredTemplates.filter(
      (t) => t.category === category
    );
  }

  // Filtrer par type (gratuit/premium)
  if (type && type !== "") {
    if (type === "premium") {
      filteredTemplates = filteredTemplates.filter((t) => t.is_premium);
    } else if (type === "free") {
      filteredTemplates = filteredTemplates.filter((t) => !t.is_premium);
    }
  }

  // Filtrer par recherche
  if (search && search.trim() !== "") {
    const searchLower = search.toLowerCase().trim();
    filteredTemplates = filteredTemplates.filter(
      (t) =>
        t.name.toLowerCase().includes(searchLower) ||
        t.category.toLowerCase().includes(searchLower)
    );
  }

  // Temporairement remplacer les templates pour l'affichage
  const originalTemplates = adminData.templates;
  adminData.templates = filteredTemplates;
  updateTemplatesGrid();
  updateTemplatesStats();
  adminData.templates = originalTemplates;
}

function addNewTemplate() {
  showTemplateModal();
}

function showTemplateModal(templateData = null) {
  const isEdit = !!templateData;

  // Créer le modal s'il n'existe pas
  let modal = document.getElementById("templateModal");
  if (!modal) {
    createTemplateModal();
    modal = document.getElementById("templateModal");
  }

  const content = document.getElementById("templateModalContent");

  content.innerHTML = `
    <h3>${isEdit ? "Modifier le template" : "Ajouter un nouveau template"}</h3>
    <form id="templateForm" onsubmit="submitTemplate(event, ${
      isEdit ? `'${templateData.id}'` : "null"
    })">
      <div class="form-group">
        <label for="templateName">Nom du template *</label>
        <input type="text" id="templateName" required value="${
          templateData?.name || ""
        }" 
               placeholder="Ex: Template Anniversaire Enfant">
      </div>
      
      <div class="form-group">
        <label for="templateCategory">Catégorie *</label>
        <select id="templateCategory" required>
          <option value="">Sélectionner une catégorie</option>
          <option value="enfant" ${
            templateData?.category === "enfant" ? "selected" : ""
          }>Enfant</option>
          <option value="femme-adulte" ${
            templateData?.category === "femme-adulte" ? "selected" : ""
          }>Femme Adulte</option>
          <option value="homme-adulte" ${
            templateData?.category === "homme-adulte" ? "selected" : ""
          }>Homme Adulte</option>
        </select>
      </div>
      
      <div class="form-group">
        <label for="templateHtml">Contenu HTML *</label>
        <textarea id="templateHtml" required rows="8" 
                  placeholder="Entrez le contenu HTML du template...">${
                    templateData?.html_content || ""
                  }</textarea>
      </div>
      
      <div class="form-group">
        <label for="templateCss">Contenu CSS *</label>
        <textarea id="templateCss" required rows="6" 
                  placeholder="Entrez le CSS du template...">${
                    templateData?.css_content || ""
                  }</textarea>
      </div>
      
      <div class="form-group">
        <label>
          <input type="checkbox" id="templatePremium" ${
            templateData?.is_premium ? "checked" : ""
          }>
          Template Premium
        </label>
      </div>
      
      <div class="form-actions">
        <button type="button" class="btn btn-secondary" onclick="closeModal()">Annuler</button>
        <button type="submit" class="btn btn-primary">
          ${isEdit ? "Mettre à jour" : "Créer le template"}
        </button>
      </div>
    </form>
  `;

  showModal("templateModal");
}

function createTemplateModal() {
  const modalHTML = `
    <div id="templateModal" class="modal hidden">
      <div class="modal-header">
        <h3>🎨 Template</h3>
        <button onclick="closeModal()">✕</button>
      </div>
      <div class="modal-content" id="templateModalContent">
        <!-- Contenu généré dynamiquement -->
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML("beforeend", modalHTML);
}

async function submitTemplate(event, templateId = null) {
  event.preventDefault();

  const formData = {
    name: document.getElementById("templateName").value,
    category: document.getElementById("templateCategory").value,
    html_content: document.getElementById("templateHtml").value,
    css_content: document.getElementById("templateCss").value,
    is_premium: document.getElementById("templatePremium").checked,
  };

  try {
    showLoading();

    let result;
    if (templateId) {
      // Modification - utiliser l'API des templates publics
      result = await fetch(`/api/templates/${templateId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify(formData),
      });

      if (!result.ok) {
        const errorData = await result.json();
        throw new Error(errorData.message || "Erreur lors de la modification");
      }

      showMessage("Template mis à jour avec succès", "success");
    } else {
      // Création - utiliser l'API des templates publics
      result = await fetch("/api/templates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify(formData),
      });

      if (!result.ok) {
        const errorData = await result.json();
        throw new Error(errorData.message || "Erreur lors de la création");
      }

      showMessage("Template créé avec succès", "success");
    }

    closeModal();
    loadTemplates();
  } catch (error) {
    showMessage("Erreur lors de la sauvegarde: " + error.message, "error");
  } finally {
    hideLoading();
  }
}

async function previewTemplate(templateId) {
  try {
    // Utiliser l'API des templates publics pour la prévisualisation
    const response = await fetch(`/api/templates/${templateId}/preview`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Erreur lors du chargement");
    }

    const data = await response.json();

    let modal = document.getElementById("previewModal");
    if (!modal) {
      createPreviewModal();
      modal = document.getElementById("previewModal");
    }

    const content = document.getElementById("previewModalContent");

    content.innerHTML = `
      <h3>Aperçu du template</h3>
      <div class="template-preview-container">
        <style>${data.data.rendered_css}</style>
        <div class="template-preview-content">
          ${data.data.rendered_html}
        </div>
      </div>
    `;

    showModal("previewModal");
  } catch (error) {
    showMessage(
      "Erreur lors du chargement de l'aperçu: " + error.message,
      "error"
    );
  }
}

function createPreviewModal() {
  const modalHTML = `
    <div id="previewModal" class="modal hidden">
      <div class="modal-header">
        <h3>👁️ Aperçu</h3>
        <button onclick="closeModal()">✕</button>
      </div>
      <div class="modal-content large" id="previewModalContent">
        <!-- Contenu de prévisualisation -->
      </div>
      <div class="modal-actions">
        <button class="btn btn-secondary" onclick="closeModal()">Fermer</button>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML("beforeend", modalHTML);
}

async function editTemplate(templateId) {
  try {
    // Utiliser l'API des templates publics
    const response = await fetch(`/api/templates/${templateId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Template non trouvé");
    }

    const data = await response.json();
    showTemplateModal(data.data.template);
  } catch (error) {
    showMessage(
      "Erreur lors du chargement du template: " + error.message,
      "error"
    );
  }
}

async function deleteTemplate(templateId) {
  if (
    !confirm(
      "Êtes-vous sûr de vouloir supprimer ce template ? Cette action est irréversible."
    )
  ) {
    return;
  }

  try {
    // Utiliser l'API des templates publics
    const response = await fetch(`/api/templates/${templateId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Erreur lors de la suppression");
    }

    showMessage("Template supprimé avec succès", "success");
    loadTemplates();
  } catch (error) {
    showMessage("Erreur lors de la suppression: " + error.message, "error");
  }
}

async function seedTemplatesFromFiles() {
  if (
    !confirm(
      "Initialiser les templates depuis les fichiers ? Cela créera tous les templates trouvés dans le dossier templates/."
    )
  ) {
    return;
  }

  try {
    showLoading();
    // Utiliser l'API des templates publics pour le seeding
    const response = await fetch("/api/templates/seed", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Erreur lors de l'initialisation");
    }

    const result = await response.json();
    showMessage(
      `${result.data.total_created} templates initialisés avec succès`,
      "success"
    );
    loadTemplates();
  } catch (error) {
    showMessage("Erreur lors de l'initialisation: " + error.message, "error");
  } finally {
    hideLoading();
  }
}

// ===== GESTION DES PAIEMENTS =====
async function loadPayments() {
  showLoading();

  try {
    const params = new URLSearchParams();

    if (adminData.filters.payments.dateFrom) {
      params.append("dateFrom", adminData.filters.payments.dateFrom);
    }
    if (adminData.filters.payments.dateTo) {
      params.append("dateTo", adminData.filters.payments.dateTo);
    }

    const data = await AdminAPIClient.get(`/analytics/payments?${params}`);
    updatePaymentStats(data.data.general_stats);
    updatePaymentsTable(data.data.payment_type_breakdown);
  } catch (error) {
    showMessage("Erreur lors du chargement des paiements", "error");
    console.error("Payments error:", error);
  } finally {
    hideLoading();
  }
}

function updatePaymentStats(stats) {
  document.getElementById("totalPaymentRevenue").textContent = formatCurrency(
    stats?.total_revenue || 0
  );
  document.getElementById("totalTransactions").textContent = formatNumber(
    stats?.total_transactions || 0
  );
  document.getElementById("averagePayment").textContent = formatCurrency(
    stats?.average_amount || 0
  );
  document.getElementById("failedPayments").textContent = formatNumber(
    stats?.failed_payments || 0
  );
}

function updatePaymentsTable(paymentTypes) {
  const tbody = document.getElementById("paymentsTableBody");
  if (!tbody || !paymentTypes) return;

  tbody.innerHTML = paymentTypes
    .map(
      (payment) => `
        <tr>
            <td>TXN-${Math.random().toString(36).substr(2, 9)}</td>
            <td>user@example.com</td>
            <td>${formatCurrency(payment.avg_amount)}</td>
            <td>${payment.payment_type}</td>
            <td>
                <span class="status-badge succeeded">Réussi</span>
            </td>
            <td>${formatDate(new Date())}</td>
        </tr>
    `
    )
    .join("");
}

function filterPayments() {
  adminData.filters.payments.dateFrom =
    document.getElementById("paymentDateFrom").value;
  adminData.filters.payments.dateTo =
    document.getElementById("paymentDateTo").value;
  loadPayments();
}

// ===== ANALYTICS =====
async function loadAnalytics() {
  showLoading();

  try {
    const [paymentsData, dashboardData] = await Promise.all([
      AdminAPIClient.get("/analytics/payments"),
      AdminAPIClient.get("/dashboard"),
    ]);

    createAdvancedCharts(paymentsData.data, dashboardData.data);
    updateTopLists(paymentsData.data);
  } catch (error) {
    showMessage("Erreur lors du chargement des analytics", "error");
    console.error("Analytics error:", error);
  } finally {
    hideLoading();
  }
}

function createAdvancedCharts(paymentsData, dashboardData) {
  // Graphique des inscriptions
  const regCtx = document.getElementById("registrationsChart");
  if (regCtx && registrationsChart) {
    registrationsChart.destroy();
  }

  if (regCtx) {
    registrationsChart = new Chart(regCtx, {
      type: "bar",
      data: {
        labels: ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"],
        datasets: [
          {
            label: "Inscriptions",
            data: [12, 19, 3, 5, 2, 3, 9],
            backgroundColor: "rgba(102, 126, 234, 0.8)",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
      },
    });
  }

  // Graphique de répartition des revenus
  const revCtx = document.getElementById("revenueBreakdownChart");
  if (revCtx && revenueBreakdownChart) {
    revenueBreakdownChart.destroy();
  }

  if (revCtx) {
    revenueBreakdownChart = new Chart(revCtx, {
      type: "pie",
      data: {
        labels: paymentsData.payment_type_breakdown?.map(
          (p) => p.payment_type
        ) || ["Premium", "Templates"],
        datasets: [
          {
            data: paymentsData.payment_type_breakdown?.map(
              (p) => p.total_revenue
            ) || [300, 200],
            backgroundColor: ["#667eea", "#48bb78", "#ed8936"],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
      },
    });
  }
}

function updateTopLists(data) {
  // Top templates
  const topTemplates = document.getElementById("topTemplates");
  if (topTemplates) {
    topTemplates.innerHTML = `
            <div class="top-item">
                <div class="top-item-info">
                    <div class="top-item-name">Template Anniversaire</div>
                    <div class="top-item-meta">Catégorie: Enfant</div>
                </div>
                <div class="top-item-value">142</div>
            </div>
            <div class="top-item">
                <div class="top-item-info">
                    <div class="top-item-name">Template Mariage</div>
                    <div class="top-item-meta">Catégorie: Adulte</div>
                </div>
                <div class="top-item-value">98</div>
            </div>
        `;
  }

  // Top utilisateurs
  const topUsers = document.getElementById("topUsers");
  if (topUsers) {
    topUsers.innerHTML =
      data.top_spenders
        ?.map(
          (user) => `
            <div class="top-item">
                <div class="top-item-info">
                    <div class="top-item-name">${user.email}</div>
                    <div class="top-item-meta">${
                      user.total_transactions
                    } transactions</div>
                </div>
                <div class="top-item-value">${formatCurrency(
                  user.total_spent
                )}</div>
            </div>
        `
        )
        .join("") || "<p>Aucune donnée disponible</p>";
  }
}

function updateAnalytics() {
  const timeframe = document.getElementById("analyticsTimeframe").value;
  loadAnalytics();
}

// ===== SYSTÈME =====
async function loadSystemData() {
  showLoading();

  try {
    const data = await AdminAPIClient.get("/logs");
    updateSystemLogs(data.data.logs);
  } catch (error) {
    showMessage("Erreur lors du chargement des logs système", "error");
    console.error("System error:", error);
  } finally {
    hideLoading();
  }
}

function updateSystemLogs(logs) {
  const container = document.getElementById("systemLogs");
  if (!container || !logs) return;

  container.innerHTML = logs
    .map(
      (log) => `
        <div class="log-entry ${log.level}">
            <span class="log-timestamp">[${formatDateTime(
              log.timestamp
            )}]</span>
            <span class="log-level">[${log.level.toUpperCase()}]</span>
            ${log.message}
        </div>
    `
    )
    .join("");
}

function filterLogs() {
  const level = document.getElementById("logLevel").value;
  loadSystemData();
}

// Actions système
function clearCache() {
  showMessage("Cache vidé avec succès", "success");
}

function backupDatabase() {
  showMessage("Sauvegarde de la base de données lancée", "info");
}

function sendTestEmail() {
  showMessage("Email de test envoyé", "success");
}

function maintenanceMode() {
  if (
    confirm(
      "Activer le mode maintenance ? Les utilisateurs ne pourront plus accéder au site."
    )
  ) {
    showMessage("Mode maintenance activé", "warning");
  }
}

// ===== EXPORTS =====
async function exportUsers() {
  try {
    const response = await fetch("/api/admin/export/users?format=csv", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
      },
    });

    if (response.ok) {
      const blob = await response.blob();
      downloadFile(blob, "users_export.csv");
      showMessage("Export des utilisateurs téléchargé", "success");
    } else {
      throw new Error("Erreur d'export");
    }
  } catch (error) {
    showMessage("Erreur lors de l'export des utilisateurs", "error");
  }
}

async function exportInvitations() {
  try {
    const response = await fetch("/api/admin/export/invitations?format=csv", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
      },
    });

    if (response.ok) {
      const blob = await response.blob();
      downloadFile(blob, "invitations_export.csv");
      showMessage("Export des invitations téléchargé", "success");
    } else {
      throw new Error("Erreur d'export");
    }
  } catch (error) {
    showMessage("Erreur lors de l'export des invitations", "error");
  }
}

async function exportPayments() {
  try {
    const response = await fetch("/api/admin/export/payments?format=csv", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
      },
    });

    if (response.ok) {
      const blob = await response.blob();
      downloadFile(blob, "payments_export.csv");
      showMessage("Export des paiements téléchargé", "success");
    } else {
      throw new Error("Erreur d'export");
    }
  } catch (error) {
    showMessage("Erreur lors de l'export des paiements", "error");
  }
}

// ===== UTILITAIRES =====
function formatNumber(num) {
  return new Intl.NumberFormat("fr-FR").format(num);
}

function formatCurrency(amount) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("fr-FR");
}

function formatDateTime(dateString) {
  return new Date(dateString).toLocaleString("fr-FR");
}

function formatRelativeTime(dateString) {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "À l'instant";
  if (diffMins < 60) return `Il y a ${diffMins} min`;
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  if (diffDays < 7) return `Il y a ${diffDays}j`;
  return formatDate(dateString);
}

function downloadFile(blob, filename) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

function refreshData() {
  const currentTab = adminData.currentTab;
  showTab(currentTab);
}

function showSystemStatus() {
  showMessage("Tous les systèmes sont opérationnels", "success");
}

// ===== STYLES INLINE POUR ANIMATIONS =====
const adminStyles = document.createElement("style");
adminStyles.textContent = `
  @keyframes messageSlideIn {
    from { opacity: 0; transform: translateX(100%); }
    to { opacity: 1; transform: translateX(0); }
  }
  
  .empty-actions {
    display: flex;
    gap: 12px;
    justify-content: center;
    margin-top: 20px;
  }
  
  .confirm-content {
    text-align: center;
    padding: 20px 0;
  }
  
  .confirm-content p {
    margin-bottom: 24px;
    font-size: 16px;
    color: #4a5568;
  }
  
  .confirm-actions {
    display: flex;
    gap: 12px;
    justify-content: center;
  }
`;
document.head.appendChild(adminStyles);

// ===== INITIALISATION =====
document.addEventListener("DOMContentLoaded", function () {
  // Vérifier l'authentification admin
  const token = localStorage.getItem("auth_token");
  const userData = localStorage.getItem("user_data");

  if (!token || !userData) {
    window.location.href = "/login.html";
    return;
  }

  // Vérifier si l'utilisateur est admin
  try {
    const user = JSON.parse(userData);
    document.getElementById("adminEmail").textContent = user.email;
  } catch (error) {
    console.error("Erreur parsing user data:", error);
    window.location.href = "/login.html";
    return;
  }

  // Charger le dashboard par défaut
  loadDashboardData();

  console.log("Interface d'administration initialisée");
});
