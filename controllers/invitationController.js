const { validationResult } = require("express-validator");
const Invitation = require("../models/Invitation");
const Template = require("../models/Template");
const Guest = require("../models/Guest");

class InvitationController {
  // Créer une nouvelle invitation
  static async create(req, res) {
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

      const userId = req.user.userId;
      const {
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
      } = req.body;

      // Vérifier que le template existe et est accessible
      const template = await Template.findById(template_id);
      if (!template) {
        return res.status(404).json({
          success: false,
          message: "Template non trouvé",
        });
      }

      // Vérifier si l'utilisateur peut utiliser ce template
      const user = { is_premium: req.user.isPremium };
      if (!template.canBeUsedBy(user)) {
        return res.status(403).json({
          success: false,
          message: "Ce template nécessite un compte Premium",
        });
      }

      // Créer l'invitation
      const invitation = await Invitation.create({
        user_id: userId,
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
        is_public,
      });

      res.status(201).json({
        success: true,
        message: "Invitation créée avec succès",
        data: {
          invitation: invitation.toJSON(),
        },
      });
    } catch (error) {
      console.error("Erreur lors de la création de l'invitation:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la création de l'invitation",
      });
    }
  }

  // Obtenir toutes les invitations de l'utilisateur
  static async getUserInvitations(req, res) {
    try {
      const userId = req.user.userId;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      const invitations = await Invitation.findByUserId(userId, limit, offset);

      // Ajouter les statistiques RSVP pour chaque invitation
      const invitationsWithStats = await Promise.all(
        invitations.map(async (invitation) => {
          const rsvpStats = await invitation.getRSVPStats();
          return {
            ...invitation.toJSON(),
            rsvp_stats: rsvpStats,
          };
        })
      );

      res.json({
        success: true,
        data: {
          invitations: invitationsWithStats,
          pagination: {
            page,
            limit,
            hasMore: invitations.length === limit,
          },
        },
      });
    } catch (error) {
      console.error("Erreur lors de la récupération des invitations:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la récupération des invitations",
      });
    }
  }

  // Obtenir une invitation spécifique
  static async getInvitation(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;

      const invitation = await Invitation.findById(id);

      if (!invitation) {
        return res.status(404).json({
          success: false,
          message: "Invitation non trouvée",
        });
      }

      // Vérifier que l'utilisateur est propriétaire de l'invitation
      if (invitation.user_id !== userId) {
        return res.status(403).json({
          success: false,
          message: "Accès non autorisé",
        });
      }

      // Récupérer les statistiques RSVP
      const rsvpStats = await invitation.getRSVPStats();
      const recentResponses = await Guest.getRecentResponses(invitation.id);

      res.json({
        success: true,
        data: {
          invitation: invitation.toJSON(),
          rsvp_stats: rsvpStats,
          recent_responses: recentResponses.map((guest) => guest.toJSON()),
        },
      });
    } catch (error) {
      console.error("Erreur lors de la récupération de l'invitation:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la récupération de l'invitation",
      });
    }
  }

  // Mettre à jour une invitation
  static async updateInvitation(req, res) {
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
      const userId = req.user.userId;

      const invitation = await Invitation.findById(id);

      if (!invitation) {
        return res.status(404).json({
          success: false,
          message: "Invitation non trouvée",
        });
      }

      // Vérifier que l'utilisateur est propriétaire
      if (invitation.user_id !== userId) {
        return res.status(403).json({
          success: false,
          message: "Accès non autorisé",
        });
      }

      // Mettre à jour l'invitation
      const updateData = req.body;
      delete updateData.user_id; // Empêcher la modification du propriétaire
      delete updateData.unique_url; // Empêcher la modification de l'URL

      await invitation.update(updateData);

      res.json({
        success: true,
        message: "Invitation mise à jour avec succès",
        data: {
          invitation: invitation.toJSON(),
        },
      });
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'invitation:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la mise à jour de l'invitation",
      });
    }
  }

  // Supprimer une invitation
  static async deleteInvitation(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;

      const invitation = await Invitation.findById(id);

      if (!invitation) {
        return res.status(404).json({
          success: false,
          message: "Invitation non trouvée",
        });
      }

      // Vérifier que l'utilisateur est propriétaire
      if (invitation.user_id !== userId) {
        return res.status(403).json({
          success: false,
          message: "Accès non autorisé",
        });
      }

      await invitation.delete();

      res.json({
        success: true,
        message: "Invitation supprimée avec succès",
      });
    } catch (error) {
      console.error("Erreur lors de la suppression de l'invitation:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la suppression de l'invitation",
      });
    }
  }

  // Dupliquer une invitation
  static async duplicateInvitation(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;
      const { new_title } = req.body;

      const invitation = await Invitation.findById(id);

      if (!invitation) {
        return res.status(404).json({
          success: false,
          message: "Invitation non trouvée",
        });
      }

      // Vérifier que l'utilisateur est propriétaire
      if (invitation.user_id !== userId) {
        return res.status(403).json({
          success: false,
          message: "Accès non autorisé",
        });
      }

      const duplicatedInvitation = await invitation.duplicate(new_title);

      res.status(201).json({
        success: true,
        message: "Invitation dupliquée avec succès",
        data: {
          invitation: duplicatedInvitation.toJSON(),
        },
      });
    } catch (error) {
      console.error("Erreur lors de la duplication de l'invitation:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la duplication de l'invitation",
      });
    }
  }

  // Basculer le statut public/privé
  static async togglePublic(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;

      const invitation = await Invitation.findById(id);

      if (!invitation) {
        return res.status(404).json({
          success: false,
          message: "Invitation non trouvée",
        });
      }

      // Vérifier que l'utilisateur est propriétaire
      if (invitation.user_id !== userId) {
        return res.status(403).json({
          success: false,
          message: "Accès non autorisé",
        });
      }

      const newStatus = await invitation.togglePublic();

      res.json({
        success: true,
        message: `Invitation ${
          newStatus ? "publiée" : "rendue privée"
        } avec succès`,
        data: {
          is_public: newStatus,
          public_url: newStatus ? invitation.getPublicUrl() : null,
        },
      });
    } catch (error) {
      console.error("Erreur lors du basculement public/privé:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors du basculement public/privé",
      });
    }
  }

  // Afficher une invitation publique (sans authentification)
  static async getPublicInvitation(req, res) {
    try {
      const { uniqueUrl } = req.params;

      const invitationData = await Invitation.findByUniqueUrl(uniqueUrl);

      if (!invitationData) {
        return res.status(404).json({
          success: false,
          message: "Invitation non trouvée ou privée",
        });
      }

      // Incrémenter le compteur de vues
      const invitation = await Invitation.findById(invitationData.id);
      if (invitation) {
        await invitation.incrementViewCount();
        invitationData.view_count = invitation.view_count;
      }

      res.json({
        success: true,
        data: {
          invitation: {
            id: invitationData.id,
            title: invitationData.title,
            event_date: invitationData.event_date,
            event_time: invitationData.event_time,
            event_location: invitationData.event_location,
            contact_phone: invitationData.contact_phone,
            event_theme: invitationData.event_theme,
            guest_photo_url: invitationData.guest_photo_url,
            custom_message: invitationData.custom_message,
            custom_data: invitationData.custom_data,
            view_count: invitationData.view_count,
            html_content: invitationData.html_content,
            css_content: invitationData.css_content,
            template_name: invitationData.template_name,
          },
        },
      });
    } catch (error) {
      console.error(
        "Erreur lors de l'affichage de l'invitation publique:",
        error
      );
      res.status(500).json({
        success: false,
        message: "Erreur lors de l'affichage de l'invitation",
      });
    }
  }

  // Obtenir les réponses RSVP d'une invitation
  static async getRSVPResponses(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;

      const invitation = await Invitation.findById(id);

      if (!invitation) {
        return res.status(404).json({
          success: false,
          message: "Invitation non trouvée",
        });
      }

      // Vérifier que l'utilisateur est propriétaire
      if (invitation.user_id !== userId) {
        return res.status(403).json({
          success: false,
          message: "Accès non autorisé",
        });
      }

      const responses = await invitation.getRSVPResponses();
      const stats = await invitation.getRSVPStats();

      res.json({
        success: true,
        data: {
          responses: responses.map((guest) => {
            const guestObj = new Guest(guest);
            return guestObj.toJSON();
          }),
          stats,
        },
      });
    } catch (error) {
      console.error("Erreur lors de la récupération des RSVP:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la récupération des RSVP",
      });
    }
  }

  // Exporter les RSVP en CSV
  static async exportRSVP(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;

      const invitation = await Invitation.findById(id);

      if (!invitation) {
        return res.status(404).json({
          success: false,
          message: "Invitation non trouvée",
        });
      }

      // Vérifier que l'utilisateur est propriétaire
      if (invitation.user_id !== userId) {
        return res.status(403).json({
          success: false,
          message: "Accès non autorisé",
        });
      }

      const csvData = await Guest.exportToCSV(invitation.id);

      // Convertir en CSV
      const csvContent = [
        csvData.headers.join(","),
        ...csvData.rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
      ].join("\n");

      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${csvData.filename}"`
      );
      res.send(csvContent);
    } catch (error) {
      console.error("Erreur lors de l'export RSVP:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de l'export RSVP",
      });
    }
  }

  // Afficher une invitation publique (sans authentification)
  static async showPublicInvitation(req, res) {
    try {
      const { uniqueUrl } = req.params;
      const path = require("path");
      const TemplateRenderer = require("../utils/templateRenderer");

      const invitationData = await Invitation.findByUniqueUrl(uniqueUrl);

      if (!invitationData) {
        // Au lieu de sendFile qui cherche 404.html, utilisez :
        return res.status(404).send(`
        <!DOCTYPE html>
        <html>
          <head><title>Invitation non trouvée</title></head>
          <body>
            <h1>404 - Invitation non trouvée</h1>
            <p>Cette invitation n'existe pas ou est privée.</p>
            <a href="/">Retour à l'accueil</a>
          </body>
        </html>
      `);
      }

      // Incrémenter le compteur de vues
      const invitation = await Invitation.findById(invitationData.id);
      if (invitation) {
        await invitation.incrementViewCount();
      }

      // Rendre le template avec les données
      const renderedHtml = TemplateRenderer.renderTemplate(
        invitationData.html_content,
        invitationData.css_content,
        invitationData
      );

      res.send(renderedHtml);
    } catch (error) {
      console.error("Erreur lors de l'affichage de l'invitation:", error);
      res.status(500).send("Erreur serveur");
    }
  }
}

module.exports = InvitationController;
