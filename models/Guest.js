const { query } = require("../config/database");

class Guest {
  constructor(guestData) {
    this.id = guestData.id;
    this.invitation_id = guestData.invitation_id;
    this.guest_name = guestData.guest_name;
    this.guest_email = guestData.guest_email;
    this.guest_phone = guestData.guest_phone;
    this.attendance_status = guestData.attendance_status;
    this.plus_one = guestData.plus_one;
    this.dietary_restrictions = guestData.dietary_restrictions;
    this.father_name = guestData.father_name;
    this.mother_name = guestData.mother_name;
    this.children_0_2 = guestData.children_0_2;
    this.children_2_5 = guestData.children_2_5;
    this.children_5_10 = guestData.children_5_10;
    this.gift_intent = guestData.gift_intent;
    this.gift_type = guestData.gift_type;
    this.absence_reason = guestData.absence_reason;
    this.special_message = guestData.special_message;
    this.created_at = guestData.created_at;
    this.updated_at = guestData.updated_at;
  }

  // Créer une nouvelle réponse RSVP
  static async create(rsvpData) {
    try {
      const {
        invitation_id,
        guest_name,
        guest_email,
        guest_phone,
        attendance_status,
        plus_one = 0,
        dietary_restrictions,
        father_name,
        mother_name,
        children_0_2 = 0,
        children_2_5 = 0,
        children_5_10 = 0,
        gift_intent,
        gift_type,
        absence_reason,
        special_message,
      } = rsvpData;

      const result = await query(
        `
        INSERT INTO invitation_guests (
          invitation_id, guest_name, guest_email, guest_phone, attendance_status,
          plus_one, dietary_restrictions, father_name, mother_name,
          children_0_2, children_2_5, children_5_10, gift_intent, gift_type,
          absence_reason, special_message
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        RETURNING *
      `,
        [
          invitation_id,
          guest_name,
          guest_email,
          guest_phone,
          attendance_status,
          plus_one,
          dietary_restrictions,
          father_name,
          mother_name,
          children_0_2,
          children_2_5,
          children_5_10,
          gift_intent,
          gift_type,
          absence_reason,
          special_message,
        ]
      );

      return new Guest(result.rows[0]);
    } catch (error) {
      console.error("Erreur lors de la création du RSVP:", error);
      throw error;
    }
  }

  // Trouver un invité par ID
  static async findById(id) {
    try {
      const result = await query(
        `
        SELECT * FROM invitation_guests WHERE id = $1
      `,
        [id]
      );

      return result.rows.length > 0 ? new Guest(result.rows[0]) : null;
    } catch (error) {
      console.error("Erreur lors de la recherche par ID:", error);
      throw error;
    }
  }

  // Obtenir tous les invités d'une invitation
  static async findByInvitationId(invitation_id) {
    try {
      const result = await query(
        `
        SELECT * FROM invitation_guests 
        WHERE invitation_id = $1
        ORDER BY created_at DESC
      `,
        [invitation_id]
      );

      return result.rows.map((row) => new Guest(row));
    } catch (error) {
      console.error("Erreur lors de la recherche par invitation:", error);
      throw error;
    }
  }

  // Vérifier si une personne a déjà répondu
  static async findExistingRSVP(invitation_id, identifier) {
    try {
      const result = await query(
        `
        SELECT * FROM invitation_guests 
        WHERE invitation_id = $1 
        AND (guest_email = $2 OR guest_name = $2 OR father_name = $2 OR mother_name = $2)
      `,
        [invitation_id, identifier]
      );

      return result.rows.length > 0 ? new Guest(result.rows[0]) : null;
    } catch (error) {
      console.error("Erreur lors de la vérification RSVP existant:", error);
      throw error;
    }
  }

  // Mettre à jour une réponse RSVP
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
        UPDATE invitation_guests 
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
      console.error("Erreur lors de la mise à jour du RSVP:", error);
      throw error;
    }
  }

  // Supprimer une réponse RSVP
  async delete() {
    try {
      await query("DELETE FROM invitation_guests WHERE id = $1", [this.id]);
      return true;
    } catch (error) {
      console.error("Erreur lors de la suppression du RSVP:", error);
      throw error;
    }
  }

  // Calculer le nombre total de personnes pour ce RSVP
  getTotalAttendees() {
    if (this.attendance_status !== "confirmed") {
      return 0;
    }

    let total = 1; // L'invité principal

    // Ajouter les accompagnants
    if (this.plus_one) {
      total += this.plus_one;
    }

    // Ajouter les enfants (pour les invitations enfants)
    if (this.children_0_2) total += this.children_0_2;
    if (this.children_2_5) total += this.children_2_5;
    if (this.children_5_10) total += this.children_5_10;

    return total;
  }

  // Obtenir le nom complet pour l'affichage
  getDisplayName() {
    if (this.father_name && this.mother_name) {
      return `${this.father_name} & ${this.mother_name}`;
    }
    return this.guest_name || "Invité anonyme";
  }

  // Obtenir un résumé des enfants
  getChildrenSummary() {
    const children = [];
    if (this.children_0_2 > 0)
      children.push(`${this.children_0_2} enfant(s) 0-2 ans`);
    if (this.children_2_5 > 0)
      children.push(`${this.children_2_5} enfant(s) 2-5 ans`);
    if (this.children_5_10 > 0)
      children.push(`${this.children_5_10} enfant(s) 5-10 ans`);
    return children.join(", ");
  }

  // Statistiques par invitation
  static async getStatsForInvitation(invitation_id) {
    try {
      const result = await query(
        `
        SELECT 
          COUNT(*) as total_responses,
          COUNT(CASE WHEN attendance_status = 'confirmed' THEN 1 END) as confirmed,
          COUNT(CASE WHEN attendance_status = 'declined' THEN 1 END) as declined,
          COUNT(CASE WHEN attendance_status = 'pending' THEN 1 END) as pending,
          COALESCE(SUM(
            CASE WHEN attendance_status = 'confirmed' 
            THEN 1 + COALESCE(plus_one, 0) + COALESCE(children_0_2, 0) + COALESCE(children_2_5, 0) + COALESCE(children_5_10, 0)
            ELSE 0 END
          ), 0) as total_attendees,
          COUNT(CASE WHEN gift_intent = 'yes' THEN 1 END) as gifts_planned
        FROM invitation_guests 
        WHERE invitation_id = $1
      `,
        [invitation_id]
      );

      return result.rows[0];
    } catch (error) {
      console.error("Erreur lors de la récupération des statistiques:", error);
      throw error;
    }
  }

  // Obtenir les réponses récentes
  static async getRecentResponses(invitation_id, limit = 5) {
    try {
      const result = await query(
        `
        SELECT * FROM invitation_guests 
        WHERE invitation_id = $1
        ORDER BY created_at DESC
        LIMIT $2
      `,
        [invitation_id, limit]
      );

      return result.rows.map((row) => new Guest(row));
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des réponses récentes:",
        error
      );
      throw error;
    }
  }

  // Exporter les données RSVP au format CSV
  static async exportToCSV(invitation_id) {
    try {
      const guests = await Guest.findByInvitationId(invitation_id);

      const headers = [
        "Nom",
        "Email",
        "Téléphone",
        "Statut",
        "Accompagnants",
        "Enfants 0-2",
        "Enfants 2-5",
        "Enfants 5-10",
        "Total personnes",
        "Restrictions alimentaires",
        "Cadeau prévu",
        "Type de cadeau",
        "Raison absence",
        "Message spécial",
        "Date de réponse",
      ];

      const rows = guests.map((guest) => [
        guest.getDisplayName(),
        guest.guest_email || "",
        guest.guest_phone || "",
        guest.attendance_status,
        guest.plus_one || 0,
        guest.children_0_2 || 0,
        guest.children_2_5 || 0,
        guest.children_5_10 || 0,
        guest.getTotalAttendees(),
        guest.dietary_restrictions || "",
        guest.gift_intent || "",
        guest.gift_type || "",
        guest.absence_reason || "",
        guest.special_message || "",
        guest.created_at
          ? new Date(guest.created_at).toLocaleDateString("fr-FR")
          : "",
      ]);

      return {
        headers,
        rows,
        filename: `rsvp_invitation_${invitation_id}_${new Date().getTime()}.csv`,
      };
    } catch (error) {
      console.error("Erreur lors de l'export CSV:", error);
      throw error;
    }
  }

  // Méthode pour retourner les données JSON
  toJSON() {
    return {
      id: this.id,
      invitation_id: this.invitation_id,
      display_name: this.getDisplayName(),
      guest_name: this.guest_name,
      guest_email: this.guest_email,
      guest_phone: this.guest_phone,
      attendance_status: this.attendance_status,
      plus_one: this.plus_one,
      dietary_restrictions: this.dietary_restrictions,
      father_name: this.father_name,
      mother_name: this.mother_name,
      children_0_2: this.children_0_2,
      children_2_5: this.children_2_5,
      children_5_10: this.children_5_10,
      children_summary: this.getChildrenSummary(),
      total_attendees: this.getTotalAttendees(),
      gift_intent: this.gift_intent,
      gift_type: this.gift_type,
      absence_reason: this.absence_reason,
      special_message: this.special_message,
      created_at: this.created_at,
      updated_at: this.updated_at,
    };
  }
}

module.exports = Guest;
