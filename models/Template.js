const { query } = require("../config/database");

class Template {
  constructor(templateData) {
    this.id = templateData.id;
    this.name = templateData.name;
    this.category = templateData.category;
    this.html_content = templateData.html_content;
    this.css_content = templateData.css_content;
    this.is_premium = templateData.is_premium;
    this.thumbnail_url = templateData.thumbnail_url;
    this.created_at = templateData.created_at;
    this.updated_at = templateData.updated_at;
  }

  // Créer un nouveau template
  static async create({
    name,
    category,
    html_content,
    css_content,
    is_premium = false,
    thumbnail_url = null,
  }) {
    try {
      const result = await query(
        `
        INSERT INTO invitation_templates (name, category, html_content, css_content, is_premium, thumbnail_url)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `,
        [name, category, html_content, css_content, is_premium, thumbnail_url]
      );

      return new Template(result.rows[0]);
    } catch (error) {
      console.error("Erreur lors de la création du template:", error);
      throw error;
    }
  }

  // Trouver un template par ID
  static async findById(id) {
    try {
      const result = await query(
        `
        SELECT * FROM invitation_templates WHERE id = $1
      `,
        [id]
      );

      return result.rows.length > 0 ? new Template(result.rows[0]) : null;
    } catch (error) {
      console.error("Erreur lors de la recherche par ID:", error);
      throw error;
    }
  }

  // Obtenir tous les templates par catégorie
  static async findByCategory(category, includePrivate = false) {
    try {
      let whereClause = "WHERE category = $1";
      const params = [category];

      if (!includePrivate) {
        whereClause += " AND is_premium = false";
      }

      const result = await query(
        `
        SELECT * FROM invitation_templates 
        ${whereClause}
        ORDER BY created_at DESC
      `,
        params
      );

      return result.rows.map((row) => new Template(row));
    } catch (error) {
      console.error("Erreur lors de la recherche par catégorie:", error);
      throw error;
    }
  }

  // Obtenir tous les templates disponibles pour un utilisateur
  static async getAvailableForUser(isPremium = false) {
    try {
      let whereClause = "";
      if (!isPremium) {
        whereClause = "WHERE is_premium = false";
      }

      const result = await query(`
        SELECT * FROM invitation_templates 
        ${whereClause}
        ORDER BY category, created_at DESC
      `);

      return result.rows.map((row) => new Template(row));
    } catch (error) {
      console.error("Erreur lors de la récupération des templates:", error);
      throw error;
    }
  }

  // Obtenir tous les templates premium
  static async getPremiumTemplates() {
    try {
      const result = await query(`
        SELECT * FROM invitation_templates 
        WHERE is_premium = true
        ORDER BY category, created_at DESC
      `);

      return result.rows.map((row) => new Template(row));
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des templates premium:",
        error
      );
      throw error;
    }
  }

  // Obtenir les catégories disponibles
  static async getCategories() {
    try {
      const result = await query(`
        SELECT DISTINCT category 
        FROM invitation_templates 
        ORDER BY category
      `);

      return result.rows.map((row) => row.category);
    } catch (error) {
      console.error("Erreur lors de la récupération des catégories:", error);
      throw error;
    }
  }

  // Rechercher des templates par nom
  static async search(searchTerm, isPremium = false) {
    try {
      let whereClause = "WHERE name ILIKE $1";
      const params = [`%${searchTerm}%`];

      if (!isPremium) {
        whereClause += " AND is_premium = false";
      }

      const result = await query(
        `
        SELECT * FROM invitation_templates 
        ${whereClause}
        ORDER BY 
          CASE WHEN name ILIKE $1 THEN 1 ELSE 2 END,
          created_at DESC
      `,
        params
      );

      return result.rows.map((row) => new Template(row));
    } catch (error) {
      console.error("Erreur lors de la recherche de templates:", error);
      throw error;
    }
  }

  // Mettre à jour un template
  async update(updateData) {
    try {
      const fields = [];
      const values = [];
      let paramCount = 1;

      // Construire dynamiquement la requête UPDATE
      Object.keys(updateData).forEach((key) => {
        if (updateData[key] !== undefined && key !== "id") {
          fields.push(`${key} = $${paramCount}`);
          values.push(updateData[key]);
          paramCount++;
        }
      });

      if (fields.length === 0) {
        return this;
      }

      fields.push("updated_at = CURRENT_TIMESTAMP");
      values.push(this.id);

      const result = await query(
        `
        UPDATE invitation_templates 
        SET ${fields.join(", ")}
        WHERE id = $${paramCount}
        RETURNING *
      `,
        values
      );

      if (result.rows.length > 0) {
        Object.assign(this, result.rows[0]);
      }

      return this;
    } catch (error) {
      console.error("Erreur lors de la mise à jour du template:", error);
      throw error;
    }
  }

  // Supprimer un template
  async delete() {
    try {
      // Vérifier s'il y a des invitations qui utilisent ce template
      const usageCheck = await query(
        `
        SELECT COUNT(*) as count FROM invitations WHERE template_id = $1
      `,
        [this.id]
      );

      if (parseInt(usageCheck.rows[0].count) > 0) {
        throw new Error(
          "Impossible de supprimer ce template car il est utilisé par des invitations existantes"
        );
      }

      await query("DELETE FROM invitation_templates WHERE id = $1", [this.id]);
      return true;
    } catch (error) {
      console.error("Erreur lors de la suppression du template:", error);
      throw error;
    }
  }

  // Dupliquer un template
  async duplicate(newName) {
    try {
      const duplicateData = {
        name: newName || `Copie de ${this.name}`,
        category: this.category,
        html_content: this.html_content,
        css_content: this.css_content,
        is_premium: false, // Les copies sont gratuites par défaut
        thumbnail_url: this.thumbnail_url,
      };

      return await Template.create(duplicateData);
    } catch (error) {
      console.error("Erreur lors de la duplication du template:", error);
      throw error;
    }
  }

  // Obtenir les statistiques d'utilisation d'un template
  async getUsageStats() {
    try {
      const result = await query(
        `
        SELECT 
          COUNT(*) as total_uses,
          COUNT(CASE WHEN is_public = true THEN 1 END) as public_uses,
          COALESCE(SUM(view_count), 0) as total_views,
          COALESCE(AVG(view_count), 0) as avg_views_per_invitation
        FROM invitations 
        WHERE template_id = $1
      `,
        [this.id]
      );

      return result.rows[0];
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des stats d'utilisation:",
        error
      );
      throw error;
    }
  }

  // Remplacer les variables dans le template avec des données d'invitation
  renderWithData(invitationData) {
    try {
      let html = this.html_content;
      let css = this.css_content;

      // Variables de base
      const variables = {
        title: invitationData.title || "",
        event_date: invitationData.event_date
          ? new Date(invitationData.event_date).toLocaleDateString("fr-FR")
          : "",
        event_time: invitationData.event_time || "",
        event_location: invitationData.event_location || "",
        contact_phone: invitationData.contact_phone || "",
        event_theme: invitationData.event_theme || "",
        custom_message: invitationData.custom_message || "",
        guest_photo_url: invitationData.guest_photo_url || "",
      };

      // Ajouter les données personnalisées si elles existent
      if (invitationData.custom_data) {
        Object.assign(variables, invitationData.custom_data);
      }

      // Remplacer toutes les variables
      Object.keys(variables).forEach((key) => {
        const regex = new RegExp(`{{${key}}}`, "g");
        html = html.replace(regex, variables[key]);
        css = css.replace(regex, variables[key]);
      });

      return { html, css };
    } catch (error) {
      console.error("Erreur lors du rendu du template:", error);
      throw error;
    }
  }

  // Valider le contenu HTML et CSS
  static validateContent(html_content, css_content) {
    const errors = [];

    // Vérifier que le HTML contient au moins une variable
    if (!html_content.includes("{{")) {
      errors.push(
        "Le template HTML doit contenir au moins une variable (ex: {{title}})"
      );
    }

    // Vérifier les variables obligatoires
    const requiredVariables = ["{{title}}"];
    requiredVariables.forEach((variable) => {
      if (!html_content.includes(variable)) {
        errors.push(`Le template doit contenir la variable ${variable}`);
      }
    });

    // Vérifier que le HTML n'est pas vide
    if (!html_content || html_content.trim().length === 0) {
      errors.push("Le contenu HTML ne peut pas être vide");
    }

    // Vérifier que le CSS n'est pas vide
    if (!css_content || css_content.trim().length === 0) {
      errors.push("Le contenu CSS ne peut pas être vide");
    }

    // Vérifier la longueur maximale (éviter les templates trop gros)
    if (html_content.length > 50000) {
      errors.push("Le contenu HTML est trop volumineux (max 50KB)");
    }

    if (css_content.length > 20000) {
      errors.push("Le contenu CSS est trop volumineux (max 20KB)");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Extraire les variables utilisées dans le template
  getVariables() {
    try {
      const variables = new Set();
      const regex = /\{\{([^}]+)\}\}/g;
      let match;

      // Extraire du HTML
      while ((match = regex.exec(this.html_content)) !== null) {
        variables.add(match[1].trim());
      }

      // Extraire du CSS
      regex.lastIndex = 0; // Reset regex
      while ((match = regex.exec(this.css_content)) !== null) {
        variables.add(match[1].trim());
      }

      return Array.from(variables);
    } catch (error) {
      console.error("Erreur lors de l'extraction des variables:", error);
      return [];
    }
  }

  // Vérifier si un utilisateur peut utiliser ce template
  canBeUsedBy(user) {
    return !this.is_premium || user.is_premium;
  }

  // Méthode pour retourner les données JSON (sans le contenu pour les listes)
  toJSON(includeContent = false) {
    const data = {
      id: this.id,
      name: this.name,
      category: this.category,
      is_premium: this.is_premium,
      thumbnail_url: this.thumbnail_url,
      created_at: this.created_at,
      updated_at: this.updated_at,
    };

    if (includeContent) {
      data.html_content = this.html_content;
      data.css_content = this.css_content;
      data.variables = this.getVariables();
    }

    return data;
  }

  // Méthode pour retourner uniquement les métadonnées (pour les listes)
  toMetadata() {
    return this.toJSON(false);
  }
}

module.exports = Template;
