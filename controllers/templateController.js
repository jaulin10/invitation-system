const { validationResult } = require("express-validator");
const Template = require("../models/Template");
const TemplateSeeder = require("../utils/templateSeeder");
const path = require("path");
const fs = require("fs").promises;

class TemplateController {
  /**
   * Initialiser les templates depuis les fichiers (admin seulement)
   * POST /api/templates/seed
   */
  static async seedTemplatesFromFiles(req, res) {
    try {
      const seeder = new TemplateSeeder();
      const totalCreated = await seeder.seedAllTemplates();

      res.json({
        success: true,
        message: `Templates initialisés avec succès`,
        data: {
          total_created: totalCreated,
        },
      });
    } catch (error) {
      console.error("Erreur lors du seeding des templates:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de l'initialisation des templates",
      });
    }
  }

  /**
   * Créer un template à partir de fichiers uploadés
   * POST /api/templates/from-files
   */
  static async createTemplateFromFiles(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Données invalides",
          errors: errors.array(),
        });
      }

      const { category, templateDirName, customConfig } = req.body;

      if (!category || !templateDirName) {
        return res.status(400).json({
          success: false,
          message: "Catégorie et nom du dossier requis",
        });
      }

      const seeder = new TemplateSeeder();
      const template = await seeder.createSingleTemplate(
        category,
        templateDirName,
        customConfig
      );

      if (!template) {
        return res.status(400).json({
          success: false,
          message: "Le template existe déjà ou ne peut pas être créé",
        });
      }

      res.status(201).json({
        success: true,
        message: "Template créé depuis les fichiers avec succès",
        data: {
          template: template.toJSON(true),
        },
      });
    } catch (error) {
      console.error("Erreur lors de la création depuis fichiers:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la création du template depuis les fichiers",
      });
    }
  }

  /**
   * Sauvegarder un template en fichiers
   * POST /api/templates/:id/save-to-files
   */
  static async saveTemplateToFiles(req, res) {
    try {
      const { id } = req.params;
      const { directoryName } = req.body;

      const template = await Template.findById(id);
      if (!template) {
        return res.status(404).json({
          success: false,
          message: "Template non trouvé",
        });
      }

      // Créer le dossier de destination
      const templateDir = path.join(
        __dirname,
        "../templates",
        template.category,
        directoryName || `template_${id}`
      );

      try {
        await fs.mkdir(templateDir, { recursive: true });
      } catch (error) {
        // Le dossier existe déjà
      }

      // Sauvegarder les fichiers
      const htmlPath = path.join(templateDir, "template.html");
      const cssPath = path.join(templateDir, "template.css");
      const configPath = path.join(templateDir, "config.json");

      // Configuration du template
      const config = {
        name: template.name,
        category: template.category,
        is_premium: template.is_premium,
        created_from_db: true,
        original_id: template.id,
        created_at: new Date().toISOString(),
      };

      await Promise.all([
        fs.writeFile(htmlPath, template.html_content, "utf8"),
        fs.writeFile(cssPath, template.css_content, "utf8"),
        fs.writeFile(configPath, JSON.stringify(config, null, 2), "utf8"),
      ]);

      res.json({
        success: true,
        message: "Template sauvegardé en fichiers avec succès",
        data: {
          template_id: template.id,
          saved_to: templateDir,
          files_created: ["template.html", "template.css", "config.json"],
        },
      });
    } catch (error) {
      console.error("Erreur lors de la sauvegarde en fichiers:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la sauvegarde en fichiers",
      });
    }
  }

  /**
   * Lister les templates disponibles dans les fichiers
   * GET /api/templates/available-files
   */
  static async getAvailableTemplateFiles(req, res) {
    try {
      const seeder = new TemplateSeeder();
      const categories = await seeder.getTemplateCategories();

      const availableTemplates = {};

      for (const category of categories) {
        const categoryPath = path.join(__dirname, "../templates", category);
        const templateDirs = await seeder.getTemplateDirectories(categoryPath);

        availableTemplates[category] = [];

        for (const templateDir of templateDirs) {
          const templatePath = path.join(categoryPath, templateDir);

          // Vérifier les fichiers requis
          const htmlExists = await fs
            .access(path.join(templatePath, "template.html"))
            .then(() => true)
            .catch(() => false);
          const cssExists = await fs
            .access(path.join(templatePath, "template.css"))
            .then(() => true)
            .catch(() => false);
          const previewExists = await fs
            .access(path.join(templatePath, "preview.jpg"))
            .then(() => true)
            .catch(() => false);

          // Lire la config si elle existe
          let config = {};
          try {
            const configData = await fs.readFile(
              path.join(templatePath, "config.json"),
              "utf8"
            );
            config = JSON.parse(configData);
          } catch (error) {
            // Pas de config
          }

          availableTemplates[category].push({
            directory_name: templateDir,
            name: config.name || `Template ${templateDir}`,
            has_html: htmlExists,
            has_css: cssExists,
            has_preview: previewExists,
            is_premium: config.is_premium || false,
            config: config,
          });
        }
      }

      res.json({
        success: true,
        data: {
          available_templates: availableTemplates,
          total_categories: categories.length,
        },
      });
    } catch (error) {
      console.error("Erreur lors de la lecture des fichiers templates:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la lecture des fichiers templates",
      });
    }
  }

  /**
   * Synchroniser les templates (fichiers <-> base de données)
   * POST /api/templates/sync
   */
  static async syncTemplates(req, res) {
    try {
      const { direction = "files-to-db" } = req.body; // 'files-to-db' ou 'db-to-files'

      if (direction === "files-to-db") {
        const seeder = new TemplateSeeder();
        const totalCreated = await seeder.seedAllTemplates();

        res.json({
          success: true,
          message: `Synchronisation fichiers -> DB terminée`,
          data: {
            direction: "files-to-db",
            templates_created: totalCreated,
          },
        });
      } else if (direction === "db-to-files") {
        // Exporter tous les templates de la DB vers les fichiers
        const allTemplates = await Template.getAvailableForUser(true);
        let savedCount = 0;

        for (const template of allTemplates) {
          try {
            const templateDir = path.join(
              __dirname,
              "../templates",
              template.category,
              `template_${template.id}`
            );
            await fs.mkdir(templateDir, { recursive: true });

            const htmlPath = path.join(templateDir, "template.html");
            const cssPath = path.join(templateDir, "template.css");
            const configPath = path.join(templateDir, "config.json");

            const config = {
              name: template.name,
              category: template.category,
              is_premium: template.is_premium,
              exported_from_db: true,
              original_id: template.id,
              exported_at: new Date().toISOString(),
            };

            await Promise.all([
              fs.writeFile(htmlPath, template.html_content, "utf8"),
              fs.writeFile(cssPath, template.css_content, "utf8"),
              fs.writeFile(configPath, JSON.stringify(config, null, 2), "utf8"),
            ]);

            savedCount++;
          } catch (error) {
            console.error(`Erreur pour le template ${template.id}:`, error);
          }
        }

        res.json({
          success: true,
          message: `Synchronisation DB -> fichiers terminée`,
          data: {
            direction: "db-to-files",
            templates_exported: savedCount,
            total_templates: allTemplates.length,
          },
        });
      } else {
        res.status(400).json({
          success: false,
          message:
            "Direction invalide. Utilisez 'files-to-db' ou 'db-to-files'",
        });
      }
    } catch (error) {
      console.error("Erreur lors de la synchronisation:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la synchronisation des templates",
      });
    }
  }

  // ... (Gardez toutes vos autres méthodes existantes)

  // Méthodes existantes : getAvailableTemplates, getTemplate, getCategories,
  // searchTemplates, getPremiumTemplates, previewTemplate, createTemplate,
  // updateTemplate, duplicateTemplate, deleteTemplate, getTemplateStats

  // Obtenir tous les templates disponibles pour l'utilisateur
  static async getAvailableTemplates(req, res) {
    try {
      const isPremium = req.user ? req.user.isPremium : false;
      const category = req.query.category;

      let templates;

      if (category) {
        templates = await Template.findByCategory(category, isPremium);
      } else {
        templates = await Template.getAvailableForUser(isPremium);
      }

      // Grouper par catégorie pour une meilleure organisation
      const templatesByCategory = templates.reduce((acc, template) => {
        if (!acc[template.category]) {
          acc[template.category] = [];
        }
        acc[template.category].push(template.toMetadata());
        return acc;
      }, {});

      res.json({
        success: true,
        data: {
          templates: templatesByCategory,
          total_count: templates.length,
          user_is_premium: isPremium,
        },
      });
    } catch (error) {
      console.error("Erreur lors de la récupération des templates:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la récupération des templates",
      });
    }
  }

  // Obtenir un template spécifique avec son contenu
  static async getTemplate(req, res) {
    try {
      const { id } = req.params;
      const isPremium = req.user ? req.user.isPremium : false;

      const template = await Template.findById(id);

      if (!template) {
        return res.status(404).json({
          success: false,
          message: "Template non trouvé",
        });
      }

      // Vérifier si l'utilisateur peut accéder à ce template
      const user = { is_premium: isPremium };
      if (!template.canBeUsedBy(user)) {
        return res.status(403).json({
          success: false,
          message: "Ce template nécessite un compte Premium",
          requires_premium: true,
        });
      }

      // Récupérer les statistiques d'utilisation
      const usageStats = await template.getUsageStats();

      res.json({
        success: true,
        data: {
          template: template.toJSON(true), // Inclure le contenu
          usage_stats: usageStats,
        },
      });
    } catch (error) {
      console.error("Erreur lors de la récupération du template:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la récupération du template",
      });
    }
  }

  // Obtenir les catégories disponibles
  static async getCategories(req, res) {
    try {
      const categories = await Template.getCategories();

      res.json({
        success: true,
        data: {
          categories,
        },
      });
    } catch (error) {
      console.error("Erreur lors de la récupération des catégories:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la récupération des catégories",
      });
    }
  }

  // Rechercher des templates
  static async searchTemplates(req, res) {
    try {
      const { q } = req.query;
      const isPremium = req.user ? req.user.isPremium : false;

      if (!q || q.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: "Le terme de recherche doit contenir au moins 2 caractères",
        });
      }

      const templates = await Template.search(q.trim(), isPremium);

      res.json({
        success: true,
        data: {
          templates: templates.map((t) => t.toMetadata()),
          search_term: q.trim(),
          total_results: templates.length,
        },
      });
    } catch (error) {
      console.error("Erreur lors de la recherche de templates:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la recherche de templates",
      });
    }
  }

  // Obtenir les templates premium (pour les utilisateurs non-premium)
  static async getPremiumTemplates(req, res) {
    try {
      const templates = await Template.getPremiumTemplates();

      res.json({
        success: true,
        data: {
          templates: templates.map((t) => t.toMetadata()),
          total_count: templates.length,
          message: "Passez en Premium pour accéder à ces templates exclusifs",
        },
      });
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des templates premium:",
        error
      );
      res.status(500).json({
        success: false,
        message: "Erreur lors de la récupération des templates premium",
      });
    }
  }

  // Prévisualiser un template avec des données d'exemple
  static async previewTemplate(req, res) {
    try {
      const { id } = req.params;
      const isPremium = req.user ? req.user.isPremium : false;

      const template = await Template.findById(id);

      if (!template) {
        return res.status(404).json({
          success: false,
          message: "Template non trouvé",
        });
      }

      // Vérifier si l'utilisateur peut accéder à ce template
      const user = { is_premium: isPremium };
      if (!template.canBeUsedBy(user)) {
        return res.status(403).json({
          success: false,
          message: "Ce template nécessite un compte Premium",
        });
      }

      // Données d'exemple pour la prévisualisation
      const sampleData = {
        title: "Événement Exemple",
        event_date: "2024-12-31",
        event_time: "19:00",
        event_location: "Paris, France",
        contact_phone: "01 23 45 67 89",
        event_theme: "Célébration",
        custom_message: "Rejoignez-nous pour une soirée inoubliable !",
        guest_photo_url: "/assets/images/sample-photo.jpg",
      };

      // Ajouter des données personnalisées selon la catégorie
      if (template.category === "enfant") {
        sampleData.guest_name = "Sophie";
        sampleData.guest_age = "8 ans";
      }

      const rendered = template.renderWithData(sampleData);

      res.json({
        success: true,
        data: {
          template_info: template.toMetadata(),
          rendered_html: rendered.html,
          rendered_css: rendered.css,
          sample_data: sampleData,
          variables_used: template.getVariables(),
        },
      });
    } catch (error) {
      console.error("Erreur lors de la prévisualisation du template:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la prévisualisation du template",
      });
    }
  }

  // Créer un nouveau template (admin seulement)
  static async createTemplate(req, res) {
    try {
      // Vérifier les erreurs de validation
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Données invalides",
          errors: errors.array(),
        });
      }

      const {
        name,
        category,
        html_content,
        css_content,
        is_premium = false,
        thumbnail_url,
      } = req.body;

      // Valider le contenu du template
      const validation = Template.validateContent(html_content, css_content);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: "Contenu du template invalide",
          errors: validation.errors,
        });
      }

      const template = await Template.create({
        name,
        category,
        html_content,
        css_content,
        is_premium,
        thumbnail_url,
      });

      res.status(201).json({
        success: true,
        message: "Template créé avec succès",
        data: {
          template: template.toJSON(true),
        },
      });
    } catch (error) {
      console.error("Erreur lors de la création du template:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la création du template",
      });
    }
  }

  // Mettre à jour un template (admin seulement)
  static async updateTemplate(req, res) {
    try {
      // Vérifier les erreurs de validation
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Données invalides",
          errors: errors.array(),
        });
      }

      const { id } = req.params;
      const updateData = req.body;

      const template = await Template.findById(id);

      if (!template) {
        return res.status(404).json({
          success: false,
          message: "Template non trouvé",
        });
      }

      // Valider le contenu si modifié
      if (updateData.html_content || updateData.css_content) {
        const htmlContent = updateData.html_content || template.html_content;
        const cssContent = updateData.css_content || template.css_content;

        const validation = Template.validateContent(htmlContent, cssContent);
        if (!validation.isValid) {
          return res.status(400).json({
            success: false,
            message: "Contenu du template invalide",
            errors: validation.errors,
          });
        }
      }

      await template.update(updateData);

      res.json({
        success: true,
        message: "Template mis à jour avec succès",
        data: {
          template: template.toJSON(true),
        },
      });
    } catch (error) {
      console.error("Erreur lors de la mise à jour du template:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la mise à jour du template",
      });
    }
  }

  // Dupliquer un template (admin seulement)
  static async duplicateTemplate(req, res) {
    try {
      const { id } = req.params;
      const { new_name } = req.body;

      const template = await Template.findById(id);

      if (!template) {
        return res.status(404).json({
          success: false,
          message: "Template non trouvé",
        });
      }

      const duplicatedTemplate = await template.duplicate(new_name);

      res.status(201).json({
        success: true,
        message: "Template dupliqué avec succès",
        data: {
          template: duplicatedTemplate.toJSON(true),
        },
      });
    } catch (error) {
      console.error("Erreur lors de la duplication du template:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la duplication du template",
      });
    }
  }

  // Supprimer un template (admin seulement)
  static async deleteTemplate(req, res) {
    try {
      const { id } = req.params;

      const template = await Template.findById(id);

      if (!template) {
        return res.status(404).json({
          success: false,
          message: "Template non trouvé",
        });
      }

      await template.delete();

      res.json({
        success: true,
        message: "Template supprimé avec succès",
      });
    } catch (error) {
      console.error("Erreur lors de la suppression du template:", error);

      if (error.message.includes("utilisé par des invitations")) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: "Erreur lors de la suppression du template",
      });
    }
  }

  // Obtenir les statistiques d'utilisation d'un template
  static async getTemplateStats(req, res) {
    try {
      const { id } = req.params;

      const template = await Template.findById(id);

      if (!template) {
        return res.status(404).json({
          success: false,
          message: "Template non trouvé",
        });
      }

      const stats = await template.getUsageStats();

      res.json({
        success: true,
        data: {
          template_info: template.toMetadata(),
          usage_stats: stats,
        },
      });
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des stats du template:",
        error
      );
      res.status(500).json({
        success: false,
        message: "Erreur lors de la récupération des statistiques",
      });
    }
  }
}

module.exports = TemplateController;
