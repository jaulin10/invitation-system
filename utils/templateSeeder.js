// utils/templateSeeder.js
const Template = require("../models/Template");
const path = require("path");
const fs = require("fs").promises;

class TemplateSeeder {
  constructor() {
    this.templatesBasePath = path.join(__dirname, "../templates");
  }

  /**
   * Lire et créer tous les templates depuis les fichiers
   */
  async seedAllTemplates() {
    try {
      console.log("🌱 Début du seeding des templates...");

      const categories = await this.getTemplateCategories();
      let totalCreated = 0;

      for (const category of categories) {
        const templates = await this.seedTemplatesForCategory(category);
        totalCreated += templates.length;
        console.log(
          `✅ ${templates.length} templates créés pour la catégorie "${category}"`
        );
      }

      console.log(
        `🎉 Seeding terminé ! ${totalCreated} templates créés au total.`
      );
      return totalCreated;
    } catch (error) {
      console.error("❌ Erreur lors du seeding des templates:", error);
      throw error;
    }
  }

  /**
   * Lire les catégories disponibles depuis le dossier templates/
   */
  async getTemplateCategories() {
    try {
      const entries = await fs.readdir(this.templatesBasePath, {
        withFileTypes: true,
      });
      return entries
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name);
    } catch (error) {
      console.error("Erreur lors de la lecture des catégories:", error);
      return [];
    }
  }

  /**
   * Créer les templates pour une catégorie donnée
   */
  async seedTemplatesForCategory(category) {
    try {
      const categoryPath = path.join(this.templatesBasePath, category);
      const templateDirs = await this.getTemplateDirectories(categoryPath);
      const createdTemplates = [];

      for (const templateDir of templateDirs) {
        try {
          const template = await this.createTemplateFromDirectory(
            category,
            templateDir
          );
          if (template) {
            createdTemplates.push(template);
          }
        } catch (error) {
          console.error(
            `❌ Erreur pour le template ${templateDir}:`,
            error.message
          );
        }
      }

      return createdTemplates;
    } catch (error) {
      console.error(`Erreur pour la catégorie ${category}:`, error);
      return [];
    }
  }

  /**
   * Obtenir les dossiers de templates dans une catégorie
   */
  async getTemplateDirectories(categoryPath) {
    try {
      const entries = await fs.readdir(categoryPath, { withFileTypes: true });
      return entries
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name);
    } catch (error) {
      // Si le dossier n'existe pas, retourner une liste vide
      return [];
    }
  }

  /**
   * Créer un template depuis un dossier spécifique
   */
  async createTemplateFromDirectory(category, templateDirName) {
    const templatePath = path.join(
      this.templatesBasePath,
      category,
      templateDirName
    );

    // Chemins des fichiers
    const htmlPath = path.join(templatePath, "template.html");
    const cssPath = path.join(templatePath, "template.css");
    const previewPath = path.join(templatePath, "preview.jpg");
    const configPath = path.join(templatePath, "config.json");

    // Lire la configuration (optionnel)
    let config = {};
    try {
      const configData = await fs.readFile(configPath, "utf8");
      config = JSON.parse(configData);
    } catch (error) {
      // Pas de fichier config, utiliser les valeurs par défaut
    }

    // Lire les fichiers HTML et CSS
    const [htmlContent, cssContent] = await Promise.all([
      fs.readFile(htmlPath, "utf8"),
      fs.readFile(cssPath, "utf8"),
    ]);

    // Vérifier si preview existe
    let thumbnailUrl = null;
    try {
      await fs.access(previewPath);
      thumbnailUrl = `/templates/${category}/${templateDirName}/preview.jpg`;
    } catch (error) {
      // Pas de preview
    }

    // Générer le nom du template
    const templateName =
      config.name || this.generateTemplateName(category, templateDirName);

    // Vérifier si le template existe déjà
    const existingTemplates = await Template.findByCategory(category, true);
    const exists = existingTemplates.some((t) => t.name === templateName);

    if (exists) {
      console.log(`⏭️  Template "${templateName}" existe déjà, ignoré.`);
      return null;
    }

    // Créer le template
    const templateData = {
      name: templateName,
      category: category,
      html_content: htmlContent,
      css_content: cssContent,
      is_premium: config.is_premium || false,
      thumbnail_url: thumbnailUrl,
    };

    const template = await Template.create(templateData);
    console.log(`✨ Template "${templateName}" créé avec succès`);

    return template;
  }

  /**
   * Générer un nom de template basé sur la catégorie et le dossier
   */
  generateTemplateName(category, templateDirName) {
    const categoryNames = {
      enfant: "Enfant",
      "femme-adulte": "Femme Adulte",
      "homme-adulte": "Homme Adulte",
    };

    const categoryName = categoryNames[category] || category;
    const templateNumber = templateDirName.replace(/\D/g, "") || "1";

    return `${categoryName} - Template ${templateNumber}`;
  }

  /**
   * Créer un template spécifique depuis des fichiers
   */
  async createSingleTemplate(category, templateDirName, customConfig = {}) {
    try {
      console.log(`🔨 Création du template ${category}/${templateDirName}...`);

      const template = await this.createTemplateFromDirectory(
        category,
        templateDirName
      );

      if (template && customConfig) {
        // Appliquer les configurations personnalisées
        await template.update(customConfig);
      }

      return template;
    } catch (error) {
      console.error("Erreur lors de la création du template:", error);
      throw error;
    }
  }

  /**
   * Recréer tous les templates (supprime et recrée)
   */
  async reseedAllTemplates() {
    try {
      console.log("🔄 Suppression des anciens templates...");

      // Obtenir tous les templates existants
      const allTemplates = await Template.getAvailableForUser(true);

      // Supprimer les templates qui ne sont pas utilisés
      for (const template of allTemplates) {
        try {
          await template.delete();
          console.log(`🗑️  Template "${template.name}" supprimé`);
        } catch (error) {
          console.log(
            `⚠️  Template "${template.name}" ne peut pas être supprimé (utilisé)`
          );
        }
      }

      // Recréer tous les templates
      return await this.seedAllTemplates();
    } catch (error) {
      console.error("Erreur lors du reseeding:", error);
      throw error;
    }
  }
}

module.exports = TemplateSeeder;
