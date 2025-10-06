const { validationResult } = require("express-validator");
const User = require("../models/User");
const Invitation = require("../models/Invitation");
const Template = require("../models/Template");
const Payment = require("../models/Payment");
const Guest = require("../models/Guest");

class AdminController {
  // Dashboard principal avec statistiques générales
  static async getDashboard(req, res) {
    try {
      // Statistiques utilisateurs
      const userStats = await AdminController.getUserStats();

      // Statistiques invitations
      const invitationStats = await AdminController.getInvitationStats();

      // Statistiques paiements
      const paymentStats = await Payment.getStats();

      // Revenus mensuels
      const monthlyRevenue = await Payment.getMonthlyRevenue();

      // Activité récente
      const recentActivity = await AdminController.getRecentActivity();

      res.json({
        success: true,
        data: {
          users: userStats,
          invitations: invitationStats,
          payments: paymentStats,
          monthly_revenue: monthlyRevenue,
          recent_activity: recentActivity,
        },
      });
    } catch (error) {
      console.error("Erreur lors de la récupération du dashboard:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la récupération du dashboard",
      });
    }
  }

  // Obtenir les statistiques des utilisateurs
  static async getUserStats() {
    try {
      const { query } = require("../config/database");

      const result = await query(`
        SELECT 
          COUNT(*) as total_users,
          COUNT(CASE WHEN is_premium = true THEN 1 END) as premium_users,
          COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as new_users_last_month,
          COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as new_users_last_week
        FROM users
      `);

      return result.rows[0];
    } catch (error) {
      console.error("Erreur lors des stats utilisateurs:", error);
      return null;
    }
  }

  // Obtenir les statistiques des invitations
  static async getInvitationStats() {
    try {
      const { query } = require("../config/database");

      const result = await query(`
        SELECT 
          COUNT(*) as total_invitations,
          COUNT(CASE WHEN is_public = true THEN 1 END) as public_invitations,
          COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as new_invitations_last_month,
          COALESCE(SUM(view_count), 0) as total_views,
          COALESCE(AVG(view_count), 0) as avg_views_per_invitation
        FROM invitations
      `);

      return result.rows[0];
    } catch (error) {
      console.error("Erreur lors des stats invitations:", error);
      return null;
    }
  }

  // Obtenir l'activité récente
  static async getRecentActivity() {
    try {
      const { query } = require("../config/database");

      // Nouvelles inscriptions
      const newUsers = await query(`
        SELECT email, first_name, last_name, created_at, 'user_registration' as type
        FROM users 
        WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
        ORDER BY created_at DESC
        LIMIT 5
      `);

      // Nouvelles invitations
      const newInvitations = await query(`
        SELECT title, created_at, 'invitation_created' as type
        FROM invitations 
        WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
        ORDER BY created_at DESC
        LIMIT 5
      `);

      // Paiements récents
      const recentPayments = await query(`
        SELECT amount, currency, payment_type, status, created_at, 'payment' as type
        FROM payments 
        WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
        ORDER BY created_at DESC
        LIMIT 5
      `);

      // Combiner et trier par date
      const allActivity = [
        ...newUsers.rows,
        ...newInvitations.rows,
        ...recentPayments.rows,
      ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      return allActivity.slice(0, 10);
    } catch (error) {
      console.error(
        "Erreur lors de la récupération de l'activité récente:",
        error
      );
      return [];
    }
  }

  // Gestion des utilisateurs
  static async getUsers(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const search = req.query.search || "";
      const filter = req.query.filter || "all"; // all, premium, regular

      const { query } = require("../config/database");

      let whereClause = "WHERE 1=1";
      const params = [];
      let paramCount = 1;

      // Recherche
      if (search) {
        whereClause += ` AND (email ILIKE $${paramCount} OR first_name ILIKE $${paramCount} OR last_name ILIKE $${paramCount})`;
        params.push(`%${search}%`);
        paramCount++;
      }

      // Filtre
      if (filter === "premium") {
        whereClause += " AND is_premium = true";
      } else if (filter === "regular") {
        whereClause += " AND is_premium = false";
      }

      // Pagination
      const offset = (page - 1) * limit;
      whereClause += ` ORDER BY created_at DESC LIMIT $${paramCount} OFFSET $${
        paramCount + 1
      }`;
      params.push(limit, offset);

      const result = await query(
        `
        SELECT id, email, first_name, last_name, is_premium, created_at, updated_at
        FROM users
        ${whereClause}
      `,
        params
      );

      // Compter le total
      const countResult = await query(
        `
        SELECT COUNT(*) as total
        FROM users
        ${whereClause.replace(/ORDER BY.*/, "").replace(/LIMIT.*/, "")}
      `,
        params.slice(0, -2)
      );

      res.json({
        success: true,
        data: {
          users: result.rows,
          pagination: {
            page,
            limit,
            total: parseInt(countResult.rows[0].total),
            pages: Math.ceil(countResult.rows[0].total / limit),
          },
        },
      });
    } catch (error) {
      console.error("Erreur lors de la récupération des utilisateurs:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la récupération des utilisateurs",
      });
    }
  }

  // Détails d'un utilisateur spécifique
  static async getUserDetails(req, res) {
    try {
      const { id } = req.params;

      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Utilisateur non trouvé",
        });
      }

      // Statistiques de l'utilisateur
      const userStats = await user.getStats();

      // Invitations récentes
      const recentInvitations = await Invitation.findByUserId(id, 5);

      // Paiements récents
      const recentPayments = await Payment.findByUserId(id, 5);

      res.json({
        success: true,
        data: {
          user: user.toPublicJSON(),
          stats: userStats,
          recent_invitations: recentInvitations.map((i) => i.toJSON()),
          recent_payments: recentPayments.map((p) => p.toJSON()),
        },
      });
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des détails utilisateur:",
        error
      );
      res.status(500).json({
        success: false,
        message: "Erreur lors de la récupération des détails",
      });
    }
  }

  // Suspendre/réactiver un utilisateur
  static async toggleUserStatus(req, res) {
    try {
      const { id } = req.params;
      const { action } = req.body; // 'suspend' ou 'activate'

      // Note: Il faudrait ajouter un champ 'is_active' à la table users pour cette fonctionnalité
      // Pour l'instant, on simule avec is_premium

      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Utilisateur non trouvé",
        });
      }

      res.json({
        success: true,
        message: `Fonctionnalité de ${action} à implémenter`,
        data: {
          user: user.toPublicJSON(),
        },
      });
    } catch (error) {
      console.error("Erreur lors du changement de statut utilisateur:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors du changement de statut",
      });
    }
  }

  // Gestion des templates
  static async getTemplates(req, res) {
    try {
      const category = req.query.category;
      const includePrivate = true; // Admin voit tous les templates

      let templates;
      if (category) {
        templates = await Template.findByCategory(category, includePrivate);
      } else {
        templates = await Template.getAvailableForUser(includePrivate);
      }

      // Ajouter les statistiques d'utilisation pour chaque template
      const templatesWithStats = await Promise.all(
        templates.map(async (template) => {
          try {
            const stats = await template.getUsageStats();
            return {
              id: template.id,
              name: template.name,
              category: template.category,
              is_premium: template.is_premium,
              thumbnail_url: template.thumbnail_url,
              created_at: template.created_at,
              updated_at: template.updated_at,
              icon:
                template.category === "enfant"
                  ? "🎈"
                  : template.category === "femme-adulte"
                  ? "👩"
                  : template.category === "homme-adulte"
                  ? "👨"
                  : "🎨",
              usage_stats: stats,
            };
          } catch (error) {
            console.error(`Erreur stats pour template ${template.id}:`, error);
            return {
              id: template.id,
              name: template.name,
              category: template.category,
              is_premium: template.is_premium,
              thumbnail_url: template.thumbnail_url,
              created_at: template.created_at,
              updated_at: template.updated_at,
              icon: "🎨",
              usage_stats: { total_uses: 0, public_uses: 0, total_views: 0 },
            };
          }
        })
      );

      res.json({
        success: true,
        data: {
          templates: templatesWithStats,
          total_count: templates.length,
        },
      });
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des templates admin:",
        error
      );
      res.status(500).json({
        success: false,
        message: "Erreur lors de la récupération des templates",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }

  // Gestion des invitations
  static async getInvitations(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const search = req.query.search || "";

      const { query } = require("../config/database");

      let whereClause = "WHERE 1=1";
      const params = [];
      let paramCount = 1;

      // Recherche
      if (search) {
        whereClause += ` AND (i.title ILIKE $${paramCount} OR u.email ILIKE $${paramCount})`;
        params.push(`%${search}%`);
        paramCount++;
      }

      // Pagination
      const offset = (page - 1) * limit;
      whereClause += ` ORDER BY i.created_at DESC LIMIT $${paramCount} OFFSET $${
        paramCount + 1
      }`;
      params.push(limit, offset);

      const result = await query(
        `
        SELECT 
          i.id, i.title, i.is_public, i.view_count, i.created_at,
          u.email as user_email, u.first_name, u.last_name,
          t.name as template_name, t.category as template_category
        FROM invitations i
        JOIN users u ON i.user_id = u.id
        LEFT JOIN invitation_templates t ON i.template_id = t.id
        ${whereClause}
      `,
        params
      );

      res.json({
        success: true,
        data: {
          invitations: result.rows,
          pagination: {
            page,
            limit,
            hasMore: result.rows.length === limit,
          },
        },
      });
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des invitations admin:",
        error
      );
      res.status(500).json({
        success: false,
        message: "Erreur lors de la récupération des invitations",
      });
    }
  }

  // Statistiques détaillées des paiements
  static async getPaymentAnalytics(req, res) {
    try {
      const { dateFrom, dateTo } = req.query;

      // Statistiques générales
      const generalStats = await Payment.getStats(dateFrom, dateTo);

      // Revenus mensuels
      const monthlyRevenue = await Payment.getMonthlyRevenue();

      // Top utilisateurs
      const topSpenders = await Payment.getTopSpenders(10);

      // Répartition par type de paiement
      const { query } = require("../config/database");

      let dateFilter = "";
      const params = [];
      if (dateFrom && dateTo) {
        dateFilter = "WHERE created_at BETWEEN $1 AND $2";
        params.push(dateFrom, dateTo);
      }

      const typeBreakdown = await query(
        `
        SELECT 
          payment_type,
          COUNT(*) as count,
          COALESCE(SUM(CASE WHEN status = 'succeeded' THEN amount ELSE 0 END), 0) as total_revenue,
          COALESCE(AVG(CASE WHEN status = 'succeeded' THEN amount ELSE NULL END), 0) as avg_amount
        FROM payments
        ${dateFilter}
        GROUP BY payment_type
        ORDER BY total_revenue DESC
      `,
        params
      );

      res.json({
        success: true,
        data: {
          general_stats: generalStats,
          monthly_revenue: monthlyRevenue,
          top_spenders: topSpenders,
          payment_type_breakdown: typeBreakdown.rows,
        },
      });
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des analytics paiements:",
        error
      );
      res.status(500).json({
        success: false,
        message: "Erreur lors de la récupération des analytics",
      });
    }
  }

  // Exporter des données
  static async exportData(req, res) {
    try {
      const { type } = req.params; // 'users', 'invitations', 'payments'
      const { format } = req.query; // 'csv', 'json'

      let data = [];
      let filename = "";

      switch (type) {
        case "users":
          const { query: userQuery } = require("../config/database");
          const users = await userQuery(
            "SELECT * FROM users ORDER BY created_at DESC"
          );
          data = users.rows;
          filename = `users_export_${new Date().getTime()}.${format || "csv"}`;
          break;

        case "invitations":
          const { query: invQuery } = require("../config/database");
          const invitations = await invQuery(`
            SELECT i.*, u.email as user_email, t.name as template_name
            FROM invitations i
            JOIN users u ON i.user_id = u.id
            LEFT JOIN invitation_templates t ON i.template_id = t.id
            ORDER BY i.created_at DESC
          `);
          data = invitations.rows;
          filename = `invitations_export_${new Date().getTime()}.${
            format || "csv"
          }`;
          break;

        case "payments":
          const payments = await Payment.findByStatus("succeeded", 1000);
          data = payments.map((p) => p.toJSON());
          filename = `payments_export_${new Date().getTime()}.${
            format || "csv"
          }`;
          break;

        default:
          return res.status(400).json({
            success: false,
            message: "Type d'export invalide",
          });
      }

      if (format === "json") {
        res.setHeader("Content-Type", "application/json");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${filename}"`
        );
        res.send(JSON.stringify(data, null, 2));
      } else {
        // Export CSV basique
        if (data.length === 0) {
          return res.status(404).json({
            success: false,
            message: "Aucune donnée à exporter",
          });
        }

        const headers = Object.keys(data[0]);
        const csvContent = [
          headers.join(","),
          ...data.map((row) =>
            headers.map((header) => `"${row[header] || ""}"`).join(",")
          ),
        ].join("\n");

        res.setHeader("Content-Type", "text/csv");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${filename}"`
        );
        res.send(csvContent);
      }
    } catch (error) {
      console.error("Erreur lors de l'export de données:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de l'export de données",
      });
    }
  }

  // Logs système (simulation)
  static async getSystemLogs(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;
      const level = req.query.level || "all"; // all, error, warning, info

      // Simulation de logs - Dans une vraie app, ceci viendrait d'un système de logging
      const logs = [
        {
          timestamp: new Date(),
          level: "info",
          message: "Nouveau paiement traité avec succès",
          details: { payment_id: 123, amount: 9.99 },
        },
        {
          timestamp: new Date(Date.now() - 3600000),
          level: "warning",
          message: "Tentative de connexion échouée",
          details: { email: "test@example.com", ip: "192.168.1.1" },
        },
        {
          timestamp: new Date(Date.now() - 7200000),
          level: "error",
          message: "Erreur lors de l'envoi d'email",
          details: { error: "SMTP timeout" },
        },
      ];

      const filteredLogs =
        level === "all" ? logs : logs.filter((log) => log.level === level);

      res.json({
        success: true,
        data: {
          logs: filteredLogs,
          pagination: {
            page,
            limit,
            total: filteredLogs.length,
            pages: Math.ceil(filteredLogs.length / limit),
          },
        },
      });
    } catch (error) {
      console.error("Erreur lors de la récupération des logs:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la récupération des logs",
      });
    }
  }
}

module.exports = AdminController;
