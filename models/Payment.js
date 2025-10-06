const { query } = require("../config/database");

class Payment {
  constructor(paymentData) {
    this.id = paymentData.id;
    this.user_id = paymentData.user_id;
    this.stripe_payment_intent_id = paymentData.stripe_payment_intent_id;
    this.amount = paymentData.amount;
    this.currency = paymentData.currency;
    this.status = paymentData.status;
    this.payment_type = paymentData.payment_type;
    this.metadata = paymentData.metadata;
    this.created_at = paymentData.created_at;
    this.updated_at = paymentData.updated_at;
  }

  // Créer un nouveau paiement
  static async create({
    user_id,
    stripe_payment_intent_id,
    amount,
    currency = "EUR",
    status,
    payment_type,
    metadata = null,
  }) {
    try {
      const result = await query(
        `
        INSERT INTO payments (user_id, stripe_payment_intent_id, amount, currency, status, payment_type, metadata)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `,
        [
          user_id,
          stripe_payment_intent_id,
          amount,
          currency,
          status,
          payment_type,
          metadata ? JSON.stringify(metadata) : null,
        ]
      );

      return new Payment(result.rows[0]);
    } catch (error) {
      console.error("Erreur lors de la création du paiement:", error);
      throw error;
    }
  }

  // Trouver un paiement par ID
  static async findById(id) {
    try {
      const result = await query(
        `
        SELECT * FROM payments WHERE id = $1
      `,
        [id]
      );

      return result.rows.length > 0 ? new Payment(result.rows[0]) : null;
    } catch (error) {
      console.error("Erreur lors de la recherche par ID:", error);
      throw error;
    }
  }

  // Trouver un paiement par Stripe Payment Intent ID
  static async findByStripeId(stripe_payment_intent_id) {
    try {
      const result = await query(
        `
        SELECT * FROM payments WHERE stripe_payment_intent_id = $1
      `,
        [stripe_payment_intent_id]
      );

      return result.rows.length > 0 ? new Payment(result.rows[0]) : null;
    } catch (error) {
      console.error("Erreur lors de la recherche par Stripe ID:", error);
      throw error;
    }
  }

  // Obtenir tous les paiements d'un utilisateur
  static async findByUserId(user_id, limit = 10, offset = 0) {
    try {
      const result = await query(
        `
        SELECT * FROM payments 
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT $2 OFFSET $3
      `,
        [user_id, limit, offset]
      );

      return result.rows.map((row) => new Payment(row));
    } catch (error) {
      console.error("Erreur lors de la recherche par utilisateur:", error);
      throw error;
    }
  }

  // Obtenir les paiements par type
  static async findByType(payment_type, limit = 50, offset = 0) {
    try {
      const result = await query(
        `
        SELECT * FROM payments 
        WHERE payment_type = $1
        ORDER BY created_at DESC
        LIMIT $2 OFFSET $3
      `,
        [payment_type, limit, offset]
      );

      return result.rows.map((row) => new Payment(row));
    } catch (error) {
      console.error("Erreur lors de la recherche par type:", error);
      throw error;
    }
  }

  // Obtenir les paiements par statut
  static async findByStatus(status, limit = 50, offset = 0) {
    try {
      const result = await query(
        `
        SELECT * FROM payments 
        WHERE status = $1
        ORDER BY created_at DESC
        LIMIT $2 OFFSET $3
      `,
        [status, limit, offset]
      );

      return result.rows.map((row) => new Payment(row));
    } catch (error) {
      console.error("Erreur lors de la recherche par statut:", error);
      throw error;
    }
  }

  // Mettre à jour le statut d'un paiement
  async updateStatus(newStatus, metadata = null) {
    try {
      const result = await query(
        `
        UPDATE payments 
        SET status = $1, metadata = $2, updated_at = CURRENT_TIMESTAMP
        WHERE id = $3
        RETURNING *
      `,
        [
          newStatus,
          metadata ? JSON.stringify(metadata) : this.metadata,
          this.id,
        ]
      );

      if (result.rows.length > 0) {
        Object.assign(this, result.rows[0]);
      }

      return this;
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut:", error);
      throw error;
    }
  }

  // Marquer comme réussi
  async markAsSucceeded(metadata = null) {
    return await this.updateStatus("succeeded", metadata);
  }

  // Marquer comme échoué
  async markAsFailed(metadata = null) {
    return await this.updateStatus("failed", metadata);
  }

  // Marquer comme remboursé
  async markAsRefunded(metadata = null) {
    return await this.updateStatus("refunded", metadata);
  }

  // Vérifier si le paiement est réussi
  isSucceeded() {
    return this.status === "succeeded";
  }

  // Vérifier si le paiement est en attente
  isPending() {
    return ["processing", "requires_action", "requires_confirmation"].includes(
      this.status
    );
  }

  // Vérifier si le paiement a échoué
  isFailed() {
    return ["failed", "canceled"].includes(this.status);
  }

  // Obtenir le montant formaté
  getFormattedAmount() {
    const formatter = new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: this.currency,
    });
    return formatter.format(this.amount);
  }

  // Obtenir la description du type de paiement
  getPaymentTypeDescription() {
    const descriptions = {
      premium_upgrade: "Passage en Premium",
      template_purchase: "Achat de template",
      custom_design: "Design personnalisé",
    };
    return descriptions[this.payment_type] || this.payment_type;
  }

  // Obtenir la description du statut
  getStatusDescription() {
    const descriptions = {
      succeeded: "Réussi",
      failed: "Échoué",
      processing: "En cours",
      requires_action: "Action requise",
      requires_confirmation: "Confirmation requise",
      canceled: "Annulé",
      refunded: "Remboursé",
    };
    return descriptions[this.status] || this.status;
  }

  // Statistiques des paiements
  static async getStats(dateFrom = null, dateTo = null) {
    try {
      let whereClause = "";
      const params = [];

      if (dateFrom && dateTo) {
        whereClause = "WHERE created_at BETWEEN $1 AND $2";
        params.push(dateFrom, dateTo);
      }

      const result = await query(
        `
        SELECT 
          COUNT(*) as total_payments,
          COUNT(CASE WHEN status = 'succeeded' THEN 1 END) as successful_payments,
          COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_payments,
          COALESCE(SUM(CASE WHEN status = 'succeeded' THEN amount ELSE 0 END), 0) as total_revenue,
          COALESCE(AVG(CASE WHEN status = 'succeeded' THEN amount ELSE NULL END), 0) as avg_payment_amount,
          COUNT(CASE WHEN payment_type = 'premium_upgrade' THEN 1 END) as premium_upgrades,
          COUNT(CASE WHEN payment_type = 'template_purchase' THEN 1 END) as template_purchases,
          COUNT(CASE WHEN payment_type = 'custom_design' THEN 1 END) as custom_designs
        FROM payments
        ${whereClause}
      `,
        params
      );

      return result.rows[0];
    } catch (error) {
      console.error("Erreur lors de la récupération des statistiques:", error);
      throw error;
    }
  }

  // Revenus par mois
  static async getMonthlyRevenue(year = new Date().getFullYear()) {
    try {
      const result = await query(
        `
        SELECT 
          EXTRACT(MONTH FROM created_at) as month,
          COUNT(*) as payment_count,
          COALESCE(SUM(CASE WHEN status = 'succeeded' THEN amount ELSE 0 END), 0) as revenue
        FROM payments
        WHERE EXTRACT(YEAR FROM created_at) = $1
        GROUP BY EXTRACT(MONTH FROM created_at)
        ORDER BY month
      `,
        [year]
      );

      return result.rows;
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des revenus mensuels:",
        error
      );
      throw error;
    }
  }

  // Top des utilisateurs par dépenses
  static async getTopSpenders(limit = 10) {
    try {
      const result = await query(
        `
        SELECT 
          p.user_id,
          u.first_name,
          u.last_name,
          u.email,
          COUNT(*) as payment_count,
          COALESCE(SUM(CASE WHEN p.status = 'succeeded' THEN p.amount ELSE 0 END), 0) as total_spent
        FROM payments p
        JOIN users u ON p.user_id = u.id
        WHERE p.status = 'succeeded'
        GROUP BY p.user_id, u.first_name, u.last_name, u.email
        ORDER BY total_spent DESC
        LIMIT $1
      `,
        [limit]
      );

      return result.rows;
    } catch (error) {
      console.error(
        "Erreur lors de la récupération du top des dépensiers:",
        error
      );
      throw error;
    }
  }

  // Supprimer un paiement (seulement si échec ou test)
  async delete() {
    try {
      if (this.isSucceeded()) {
        throw new Error("Impossible de supprimer un paiement réussi");
      }

      await query("DELETE FROM payments WHERE id = $1", [this.id]);
      return true;
    } catch (error) {
      console.error("Erreur lors de la suppression du paiement:", error);
      throw error;
    }
  }

  // Méthode pour retourner les données JSON
  toJSON() {
    return {
      id: this.id,
      user_id: this.user_id,
      stripe_payment_intent_id: this.stripe_payment_intent_id,
      amount: this.amount,
      formatted_amount: this.getFormattedAmount(),
      currency: this.currency,
      status: this.status,
      status_description: this.getStatusDescription(),
      payment_type: this.payment_type,
      payment_type_description: this.getPaymentTypeDescription(),
      metadata: this.metadata,
      is_succeeded: this.isSucceeded(),
      is_pending: this.isPending(),
      is_failed: this.isFailed(),
      created_at: this.created_at,
      updated_at: this.updated_at,
    };
  }
}

module.exports = Payment;
