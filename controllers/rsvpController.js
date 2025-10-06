const { validationResult } = require("express-validator");
const Guest = require("../models/Guest");
const Invitation = require("../models/Invitation");

class RSVPController {
  // Soumettre une réponse RSVP (endpoint public)
  static async submitRSVP(req, res) {
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

      const { uniqueUrl } = req.params;
      const {
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
      } = req.body;

      // Vérifier que l'invitation existe et est publique
      const invitationData = await Invitation.findByUniqueUrl(uniqueUrl);
      if (!invitationData) {
        return res.status(404).json({
          success: false,
          message: "Invitation non trouvée ou privée",
        });
      }

      // Vérifier si cette personne a déjà répondu
      const identifier =
        guest_email || guest_name || father_name || mother_name;
      const existingRSVP = await Guest.findExistingRSVP(
        invitationData.id,
        identifier
      );

      if (existingRSVP) {
        return res.status(409).json({
          success: false,
          message: "Une réponse existe déjà pour cette personne",
          existing_rsvp_id: existingRSVP.id,
        });
      }

      // Créer la réponse RSVP
      const rsvp = await Guest.create({
        invitation_id: invitationData.id,
        guest_name,
        guest_email,
        guest_phone,
        attendance_status,
        plus_one: plus_one || 0,
        dietary_restrictions,
        father_name,
        mother_name,
        children_0_2: children_0_2 || 0,
        children_2_5: children_2_5 || 0,
        children_5_10: children_5_10 || 0,
        gift_intent,
        gift_type,
        absence_reason,
        special_message,
      });

      res.status(201).json({
        success: true,
        message: "Réponse enregistrée avec succès",
        data: {
          rsvp: rsvp.toJSON(),
          invitation_title: invitationData.title,
        },
      });
    } catch (error) {
      console.error("Erreur lors de la soumission RSVP:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de l'enregistrement de votre réponse",
      });
    }
  }

  // Mettre à jour une réponse RSVP (endpoint public avec token ou ID)
  static async updateRSVP(req, res) {
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

      const { rsvpId } = req.params;
      const updateData = req.body;

      const rsvp = await Guest.findById(rsvpId);
      if (!rsvp) {
        return res.status(404).json({
          success: false,
          message: "Réponse RSVP non trouvée",
        });
      }

      // Empêcher la modification de l'ID d'invitation
      delete updateData.invitation_id;

      await rsvp.update(updateData);

      res.json({
        success: true,
        message: "Réponse mise à jour avec succès",
        data: {
          rsvp: rsvp.toJSON(),
        },
      });
    } catch (error) {
      console.error("Erreur lors de la mise à jour RSVP:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la mise à jour de votre réponse",
      });
    }
  }

  // Obtenir une réponse RSVP spécifique
  static async getRSVP(req, res) {
    try {
      const { rsvpId } = req.params;

      const rsvp = await Guest.findById(rsvpId);
      if (!rsvp) {
        return res.status(404).json({
          success: false,
          message: "Réponse RSVP non trouvée",
        });
      }

      res.json({
        success: true,
        data: {
          rsvp: rsvp.toJSON(),
        },
      });
    } catch (error) {
      console.error("Erreur lors de la récupération RSVP:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la récupération de la réponse",
      });
    }
  }

  // Supprimer une réponse RSVP
  static async deleteRSVP(req, res) {
    try {
      const { rsvpId } = req.params;

      const rsvp = await Guest.findById(rsvpId);
      if (!rsvp) {
        return res.status(404).json({
          success: false,
          message: "Réponse RSVP non trouvée",
        });
      }

      await rsvp.delete();

      res.json({
        success: true,
        message: "Réponse supprimée avec succès",
      });
    } catch (error) {
      console.error("Erreur lors de la suppression RSVP:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la suppression de la réponse",
      });
    }
  }

  // Obtenir les statistiques RSVP pour une invitation publique
  static async getPublicRSVPStats(req, res) {
    try {
      const { uniqueUrl } = req.params;

      // Vérifier que l'invitation existe et est publique
      const invitationData = await Invitation.findByUniqueUrl(uniqueUrl);
      if (!invitationData) {
        return res.status(404).json({
          success: false,
          message: "Invitation non trouvée ou privée",
        });
      }

      const stats = await Guest.getStatsForInvitation(invitationData.id);

      res.json({
        success: true,
        data: {
          invitation_title: invitationData.title,
          stats: {
            total_responses: stats.total_responses,
            confirmed: stats.confirmed,
            declined: stats.declined,
            pending: stats.pending,
            total_attendees: stats.total_attendees,
          },
        },
      });
    } catch (error) {
      console.error("Erreur lors de la récupération des stats RSVP:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la récupération des statistiques",
      });
    }
  }

  // Obtenir la liste des réponses pour une invitation publique (limité)
  static async getPublicRSVPList(req, res) {
    try {
      const { uniqueUrl } = req.params;

      // Vérifier que l'invitation existe et est publique
      const invitationData = await Invitation.findByUniqueUrl(uniqueUrl);
      if (!invitationData) {
        return res.status(404).json({
          success: false,
          message: "Invitation non trouvée ou privée",
        });
      }

      const responses = await Guest.findByInvitationId(invitationData.id);

      // Retourner seulement les informations publiques (pas d'emails/téléphones)
      const publicResponses = responses
        .filter((guest) => guest.attendance_status === "confirmed")
        .map((guest) => ({
          display_name: guest.getDisplayName(),
          attendance_status: guest.attendance_status,
          total_attendees: guest.getTotalAttendees(),
          children_summary: guest.getChildrenSummary(),
          special_message: guest.special_message,
          response_date: guest.created_at,
        }));

      res.json({
        success: true,
        data: {
          invitation_title: invitationData.title,
          confirmed_guests: publicResponses,
          total_confirmed: publicResponses.length,
        },
      });
    } catch (error) {
      console.error("Erreur lors de la récupération de la liste RSVP:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la récupération de la liste",
      });
    }
  }

  // Vérifier si un email/nom a déjà répondu
  static async checkExistingRSVP(req, res) {
    try {
      const { uniqueUrl } = req.params;
      const { identifier } = req.query; // email, nom, etc.

      if (!identifier) {
        return res.status(400).json({
          success: false,
          message: "Identifiant requis (email ou nom)",
        });
      }

      // Vérifier que l'invitation existe et est publique
      const invitationData = await Invitation.findByUniqueUrl(uniqueUrl);
      if (!invitationData) {
        return res.status(404).json({
          success: false,
          message: "Invitation non trouvée ou privée",
        });
      }

      const existingRSVP = await Guest.findExistingRSVP(
        invitationData.id,
        identifier
      );

      res.json({
        success: true,
        data: {
          has_existing_rsvp: !!existingRSVP,
          existing_rsvp: existingRSVP
            ? {
                id: existingRSVP.id,
                display_name: existingRSVP.getDisplayName(),
                attendance_status: existingRSVP.attendance_status,
                response_date: existingRSVP.created_at,
              }
            : null,
        },
      });
    } catch (error) {
      console.error("Erreur lors de la vérification RSVP existant:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la vérification",
      });
    }
  }

  // Envoyer un rappel RSVP (pour le propriétaire de l'invitation)
  static async sendRSVPReminder(req, res) {
    try {
      const { id } = req.params; // ID de l'invitation
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

      // TODO: Implémenter l'envoi d'emails de rappel
      // Pour l'instant, on retourne juste les statistiques

      const stats = await Guest.getStatsForInvitation(invitation.id);

      res.json({
        success: true,
        message: "Rappels RSVP envoyés (fonctionnalité à implémenter)",
        data: {
          invitation_title: invitation.title,
          pending_responses: stats.pending,
          reminder_sent_to: stats.pending, // À implémenter
        },
      });
    } catch (error) {
      console.error("Erreur lors de l'envoi des rappels RSVP:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de l'envoi des rappels",
      });
    }
  }
}

module.exports = RSVPController;
