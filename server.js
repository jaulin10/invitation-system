// server.js
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");
require("dotenv").config();

// Import des routes
const authRoutes = require("./routes/auth");
const templateRoutes = require("./routes/templates");
const invitationRoutes = require("./routes/invitations");
const paymentRoutes = require("./routes/payments");
const adminRoutes = require("./routes/admin"); // AJOUT MANQUANT

// Import des middlewares
const { authenticateToken } = require("./middleware/auth");

// Import des controllers
const invitationController = require("./controllers/invitationController");

// Import du seeder de templates
const TemplateSeeder = require("./utils/templateSeeder");

const app = express();
const PORT = process.env.PORT || 3000;

// === Middlewares de sécurité ===
app.use(
  helmet({
    contentSecurityPolicy: false, // Désactivé pour permettre les styles inline si nécessaire
  })
);

app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? ["https://votre-domaine.com"]
        : ["http://localhost:3000", "http://127.0.0.1:3000"],
    credentials: true,
  })
);

// Parser JSON et urlencoded
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// === Fichiers statiques ===
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// === Routes API ===
app.use("/api/auth", authRoutes);
app.use("/api/templates", templateRoutes);
app.use("/api/invitations", invitationRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/admin", adminRoutes); // AJOUT MANQUANT

// === Routes Frontend ===

// Admin (protégé)
app.get("/admin", authenticateToken, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin.html"));
});

// Page publique des invitations
app.get("/invitation/:uniqueUrl", invitationController.showPublicInvitation);

// Page d'accueil
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// === Gestion des erreurs ===

// Routes non trouvées
app.use("*", (req, res) => {
  res.status(404).json({ error: "Route non trouvée" });
});

// Erreurs globales
app.use((err, req, res, next) => {
  console.error("❌ Erreur non gérée:", err.stack);
  res.status(500).json({
    error: "Erreur interne du serveur",
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Une erreur est survenue",
  });
});

// === Fonction d'initialisation des templates ===
async function initializeTemplates() {
  try {
    // Vérifier si on doit initialiser les templates
    const shouldSeed =
      process.env.SEED_TEMPLATES === "true" ||
      process.argv.includes("--seed-templates") ||
      process.argv.includes("--seed");

    if (shouldSeed) {
      console.log("🌱 Initialisation des templates depuis les fichiers...");
      const seeder = new TemplateSeeder();
      const totalCreated = await seeder.seedAllTemplates();
      console.log(`✅ ${totalCreated} templates initialisés avec succès`);
    }
  } catch (error) {
    console.error("❌ Erreur lors de l'initialisation des templates:", error);
    // Ne pas arrêter le serveur si l'initialisation échoue
    console.log(
      "⚠️  Le serveur continue malgré l'échec de l'initialisation des templates"
    );
  }
}

// === Fonction d'initialisation de l'application ===
async function startServer() {
  try {
    // Initialiser les templates si nécessaire
    await initializeTemplates();

    // Démarrer le serveur
    app.listen(PORT, () => {
      console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
      console.log(`🌍 Environnement: ${process.env.NODE_ENV || "development"}`);

      // Afficher les commandes disponibles
      if (process.env.NODE_ENV === "development") {
        console.log("\n📋 Commandes disponibles:");
        console.log(
          "   - Redémarrer avec seeding: npm start -- --seed-templates"
        );
        console.log("   - API templates admin: POST /api/admin/templates/seed");
        console.log("   - API templates public: POST /api/templates/seed");
        console.log("   - Script manuel: node scripts/seedTemplates.js\n");
      }
    });
  } catch (error) {
    console.error("❌ Erreur lors du démarrage du serveur:", error);
    process.exit(1);
  }
}

// === Démarrage de l'application ===
startServer();

// === Gestion propre de l'arrêt ===
process.on("SIGTERM", () => {
  console.log("SIGTERM reçu. Arrêt du serveur...");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("SIGINT reçu. Arrêt du serveur...");
  process.exit(0);
});

// === Exportation pour les tests ===
module.exports = app;
