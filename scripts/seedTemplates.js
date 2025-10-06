#!/usr/bin/env node
// scripts/seedTemplates.js

require("dotenv").config();
const TemplateSeeder = require("../utils/templateSeeder");

// Fonction d'aide
function showHelp() {
  console.log(`
📋 Script de gestion des templates

Usage: node scripts/seedTemplates.js <commande> [options]

Commandes disponibles:
  all               - Initialiser tous les templates depuis les fichiers
  single <cat> <nom> - Créer un template spécifique
  reseed            - Supprimer et recréer tous les templates  
  list              - Lister les templates disponibles dans les fichiers
  sync              - Synchroniser fichiers <-> base de données
  help              - Afficher cette aide

Exemples:
  node scripts/seedTemplates.js all
  node scripts/seedTemplates.js single enfant template1
  node scripts/seedTemplates.js reseed
  node scripts/seedTemplates.js list
`);
}

// Fonction pour lister les templates disponibles
async function listAvailableTemplates() {
  try {
    const seeder = new TemplateSeeder();
    const categories = await seeder.getTemplateCategories();

    console.log("📁 Templates disponibles dans les fichiers:\n");

    for (const category of categories) {
      console.log(`📂 ${category.toUpperCase()}`);

      const categoryPath = require("path").join(
        __dirname,
        "../templates",
        category
      );
      const templateDirs = await seeder.getTemplateDirectories(categoryPath);

      if (templateDirs.length === 0) {
        console.log("   (aucun template)");
      } else {
        for (const templateDir of templateDirs) {
          const templatePath = require("path").join(categoryPath, templateDir);

          // Vérifier les fichiers
          const fs = require("fs").promises;
          const hasHtml = await fs
            .access(require("path").join(templatePath, "template.html"))
            .then(() => true)
            .catch(() => false);
          const hasCss = await fs
            .access(require("path").join(templatePath, "template.css"))
            .then(() => true)
            .catch(() => false);
          const hasPreview = await fs
            .access(require("path").join(templatePath, "preview.jpg"))
            .then(() => true)
            .catch(() => false);

          const status = [];
          if (hasHtml) status.push("HTML");
          if (hasCss) status.push("CSS");
          if (hasPreview) status.push("Preview");

          console.log(
            `   ├── ${templateDir} (${
              status.join(", ") || "Fichiers manquants"
            })`
          );
        }
      }
      console.log("");
    }
  } catch (error) {
    console.error("❌ Erreur lors du listage:", error.message);
  }
}

// Fonction principale
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command || command === "help") {
    showHelp();
    return;
  }

  try {
    const seeder = new TemplateSeeder();

    switch (command) {
      case "all":
        console.log("🌱 Initialisation de tous les templates...");
        const totalCreated = await seeder.seedAllTemplates();
        console.log(`\n✅ Terminé ! ${totalCreated} templates créés.`);
        break;

      case "single":
        const category = args[1];
        const templateName = args[2];

        if (!category || !templateName) {
          console.error(
            "❌ Usage: node scripts/seedTemplates.js single <category> <templateName>"
          );
          console.error(
            "   Exemple: node scripts/seedTemplates.js single enfant template1"
          );
          process.exit(1);
        }

        console.log(`🔨 Création du template ${category}/${templateName}...`);
        const template = await seeder.createSingleTemplate(
          category,
          templateName
        );

        if (template) {
          console.log(
            `✅ Template "${template.name}" créé avec succès (ID: ${template.id})`
          );
        } else {
          console.log(
            "⚠️  Template non créé (existe déjà ou fichiers manquants)"
          );
        }
        break;

      case "reseed":
        console.log("🔄 Suppression et recréation de tous les templates...");
        const reseeded = await seeder.reseedAllTemplates();
        console.log(`\n✅ Reseed terminé ! ${reseeded} templates recréés.`);
        break;

      case "list":
        await listAvailableTemplates();
        break;

      case "sync":
        console.log("🔄 Synchronisation fichiers <-> base de données...");
        // Pour l'instant, juste un seed normal
        const synced = await seeder.seedAllTemplates();
        console.log(
          `\n✅ Synchronisation terminée ! ${synced} templates traités.`
        );
        break;

      default:
        console.error(`❌ Commande inconnue: ${command}`);
        showHelp();
        process.exit(1);
    }
  } catch (error) {
    console.error("❌ Erreur:", error.message);
    if (process.env.NODE_ENV === "development") {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Gestion propre des interruptions
process.on("SIGINT", () => {
  console.log("\n\n⚠️  Arrêt demandé par l'utilisateur");
  process.exit(0);
});

// Exécution
main().then(() => {
  process.exit(0);
});
