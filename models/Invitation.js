const { query } = require("../config/database");
const crypto = require("crypto");

class Invitation {
  constructor(invitationData) {
    this.id = invitationData.id;
    this.user_id = invitationData.user_id;
    this.template_id = invitationData.template_id;
    this.title = invitationData.title;
    this.event_date = invitationData.event_date;
    this.event_time = invitationData.event_time;
    this.event_location = invitationData.event_location;
    this.contact_phone = invitationData.contact_phone;
    this.event_theme = invitationData.event_theme;
    this.guest_photo_url = invitationData.guest_photo_url;
    this.custom_message = invitationData.custom_message;
    this.custom_data = invitationData.custom_data;
    this.is_public = invitationData.is_public;
    this.view_count = invitationData.view_count || 0;
    this.unique_url = invitationData.unique_url;
    this.created_at = invitationData.created_at;
    this.updated_at = invitationData.updated_at;
  }

  // Générer une URL unique
  static generateUniqueUrl(title) {
    const baseUrl = title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, "-")
      .substring(0, 30);

    const randomString = crypto.randomBytes(4).toString("hex");
    return `${baseUrl}-${randomString}`;
  }

  // Créer une nouvelle invitation
  static async create({
    user_id,
    template_id,
    title,
    event_date,
    event_time,
    event_location,
    contact_phone,
    event_theme,
    guest_photo_url,
    custom_message,
    custom_data,
    is_public = false,
  }) {
    try {
      // Générer une URL unique
      let unique_url = this.generateUniqueUrl(title);

      // Vérifier l'unicité de l'URL
      let urlExists = true;
      while (urlExists) {
        const existing = await query(
          "SELECT id FROM invitations WHERE unique_url = $1",
          [unique_url]
        );
        if (existing.rows.length === 0) {
          urlExists = false;
        } else {
          unique_url = this.generateUniqueUrl(title);
        }
      }

      const result = await query(
        `
        INSERT INTO invitations (
          user_id, template_id, title, event_date, event_time, event_location,
          contact_phone, event_theme, guest_photo_url, custom_message, 
          custom_data, is_public, unique_url
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING *
      `,
        [
          user_id,
          template_id,
          title,
          event_date,
          event_time,
          event_location,
          contact_phone,
          event_theme,
          guest_photo_url,
          custom_message,
          custom_data ? JSON.stringify(custom_data) : null,
          is_public,
          unique_url,
        ]
      );

      return new Invitation(result.rows[0]);
    } catch (error) {
      console.error("Erreur lors de la création de l'invitation:", error);
      throw error;
    }
  }

  // Trouver une invitation par ID
  static async findById(id) {
    try {
      const result = await query(
        `
        SELECT i.*, t.name as template_name, t.category as template_category
        FROM invitations i
        LEFT JOIN invitation_templates t ON i.template_id = t.id
        WHERE i.id = $1
      `,
        [id]
      );

      return result.rows.length > 0 ? new Invitation(result.rows[0]) : null;
    } catch (error) {
      console.error("Erreur lors de la recherche par ID:", error);
      throw error;
    }
  }

  // Trouver une invitation par URL unique
  static async findByUniqueUrl(unique_url) {
    try {
      const result = await query(
        `
        SELECT i.*, t.html_content, t.css_content, t.name as template_name
        FROM invitations i
        LEFT JOIN invitation_templates t ON i.template_id = t.id
        WHERE i.unique_url = $1 AND i.is_public = true
      `,
        [unique_url]
      );

      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      console.error("Erreur lors de la recherche par URL:", error);
      throw error;
    }
  }

  // Obtenir toutes les invitations d'un utilisateur
  static async findByUserId(user_id, limit = 10, offset = 0) {
    try {
      const result = await query(
        `
        SELECT i.*, t.name as template_name, t.category as template_category
        FROM invitations i
        LEFT JOIN invitation_templates t ON i.template_id = t.id
        WHERE i.user_id = $1
        ORDER BY i.created_at DESC
        LIMIT $2 OFFSET $3
      `,
        [user_id, limit, offset]
      );

      return result.rows.map((row) => new Invitation(row));
    } catch (error) {
      console.error("Erreur lors de la recherche par utilisateur:", error);
      throw error;
    }
  }

  // Mettre à jour une invitation
  async update(updateData) {
    try {
      const fields = [];
      const values = [];
      let paramCount = 1;

      // Construire dynamiquement la requête UPDATE
      Object.keys(updateData).forEach((key) => {
        if (updateData[key] !== undefined && key !== "id") {
          fields.push(`${key} = $${paramCount}`);
          values.push(
            key === "custom_data" && typeof updateData[key] === "object"
              ? JSON.stringify(updateData[key])
              : updateData[key]
          );
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
        UPDATE invitations 
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
      console.error("Erreur lors de la mise à jour de l'invitation:", error);
      throw error;
    }
  }

  // Incrémenter le compteur de vues
  async incrementViewCount() {
    try {
      const result = await query(
        `
        UPDATE invitations 
        SET view_count = view_count + 1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING view_count
      `,
        [this.id]
      );

      if (result.rows.length > 0) {
        this.view_count = result.rows[0].view_count;
      }

      return this.view_count;
    } catch (error) {
      console.error("Erreur lors de l'incrémentation des vues:", error);
      throw error;
    }
  }

  // Publier/dépublier une invitation
  async togglePublic() {
    try {
      const result = await query(
        `
        UPDATE invitations 
        SET is_public = NOT is_public, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING is_public
      `,
        [this.id]
      );

      if (result.rows.length > 0) {
        this.is_public = result.rows[0].is_public;
      }

      return this.is_public;
    } catch (error) {
      console.error("Erreur lors du toggle public:", error);
      throw error;
    }
  }

  // Obtenir les réponses RSVP pour cette invitation
  async getRSVPResponses() {
    try {
      const result = await query(
        `
        SELECT * FROM invitation_guests 
        WHERE invitation_id = $1
        ORDER BY created_at DESC
      `,
        [this.id]
      );

      return result.rows;
    } catch (error) {
      console.error("Erreur lors de la récupération des RSVP:", error);
      throw error;
    }
  }

  // Obtenir les statistiques RSVP
  async getRSVPStats() {
    try {
      const result = await query(
        `
        SELECT 
          COUNT(*) as total_responses,
          COUNT(CASE WHEN attendance_status = 'confirmed' THEN 1 END) as confirmed,
          COUNT(CASE WHEN attendance_status = 'declined' THEN 1 END) as declined,
          COUNT(CASE WHEN attendance_status = 'pending' THEN 1 END) as pending,
          COALESCE(SUM(CASE WHEN attendance_status = 'confirmed' THEN plus_one + 1 ELSE 0 END), 0) as total_attendees
        FROM invitation_guests 
        WHERE invitation_id = $1
      `,
        [this.id]
      );

      return result.rows[0];
    } catch (error) {
      console.error("Erreur lors de la récupération des stats RSVP:", error);
      throw error;
    }
  }

  // Supprimer une invitation
  async delete() {
    try {
      await query("DELETE FROM invitations WHERE id = $1", [this.id]);
      return true;
    } catch (error) {
      console.error("Erreur lors de la suppression de l'invitation:", error);
      throw error;
    }
  }

  // Dupliquer une invitation
  async duplicate(newTitle) {
    try {
      const duplicateData = {
        user_id: this.user_id,
        template_id: this.template_id,
        title: newTitle || `Copie de ${this.title}`,
        event_date: this.event_date,
        event_time: this.event_time,
        event_location: this.event_location,
        contact_phone: this.contact_phone,
        event_theme: this.event_theme,
        guest_photo_url: this.guest_photo_url,
        custom_message: this.custom_message,
        custom_data: this.custom_data,
        is_public: false, // Les copies sont privées par défaut
      };

      return await Invitation.create(duplicateData);
    } catch (error) {
      console.error("Erreur lors de la duplication de l'invitation:", error);
      throw error;
    }
  }

  // Obtenir l'URL complète de l'invitation
  getPublicUrl(baseUrl = process.env.BASE_URL) {
    return `${baseUrl}/invitation/${this.unique_url}`;
  }

  // Méthode pour retourner les données JSON
  toJSON() {
    return {
      id: this.id,
      user_id: this.user_id,
      template_id: this.template_id,
      title: this.title,
      event_date: this.event_date,
      event_time: this.event_time,
      event_location: this.event_location,
      contact_phone: this.contact_phone,
      event_theme: this.event_theme,
      guest_photo_url: this.guest_photo_url,
      custom_message: this.custom_message,
      custom_data: this.custom_data,
      is_public: this.is_public,
      view_count: this.view_count,
      unique_url: this.unique_url,
      public_url: this.getPublicUrl(),
      created_at: this.created_at,
      updated_at: this.updated_at,
    };
  }
}

module.exports = Invitation;
