const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { validationResult } = require("express-validator");
const Payment = require("../models/Payment");
const User = require("../models/User");

class PaymentController {
  // Créer un Payment Intent pour passage en Premium
  static async createPremiumPaymentIntent(req, res) {
    try {
      const userId = req.user.userId;
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Utilisateur non trouvé",
        });
      }

      if (user.is_premium) {
        return res.status(400).json({
          success: false,
          message: "Vous êtes déjà un utilisateur Premium",
        });
      }

      // Prix du Premium (à configurer selon vos besoins)
      const premiumPrice = 999; // 9.99 EUR en centimes

      // Créer le Payment Intent avec Stripe
      const paymentIntent = await stripe.paymentIntents.create({
        amount: premiumPrice,
        currency: "eur",
        metadata: {
          user_id: userId.toString(),
          payment_type: "premium_upgrade",
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      // Enregistrer le paiement en base avec statut "processing"
      const payment = await Payment.create({
        user_id: userId,
        stripe_payment_intent_id: paymentIntent.id,
        amount: premiumPrice / 100, // Convertir en euros
        currency: "EUR",
        status: "processing",
        payment_type: "premium_upgrade",
      });

      res.json({
        success: true,
        data: {
          client_secret: paymentIntent.client_secret,
          payment_id: payment.id,
          amount: payment.getFormattedAmount(),
        },
      });
    } catch (error) {
      console.error(
        "Erreur lors de la création du Payment Intent Design:",
        error
      );
      res.status(500).json({
        success: false,
        message: "Erreur lors de la création du paiement",
      });
    }
  }

  // Webhook Stripe pour traiter les événements de paiement
  static async handleStripeWebhook(req, res) {
    try {
      const sig = req.headers["stripe-signature"];
      const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

      let event;

      try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
      } catch (err) {
        console.error("Erreur de vérification webhook:", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
      }

      // Traiter l'événement
      switch (event.type) {
        case "payment_intent.succeeded":
          await PaymentController.handlePaymentSuccess(event.data.object);
          break;

        case "payment_intent.payment_failed":
          await PaymentController.handlePaymentFailure(event.data.object);
          break;

        case "payment_intent.canceled":
          await PaymentController.handlePaymentCancellation(event.data.object);
          break;

        default:
          console.log(`Événement non géré: ${event.type}`);
      }

      res.json({ received: true });
    } catch (error) {
      console.error("Erreur lors du traitement du webhook:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors du traitement du webhook",
      });
    }
  }

  // Gérer le succès d'un paiement
  static async handlePaymentSuccess(paymentIntent) {
    try {
      const payment = await Payment.findByStripeId(paymentIntent.id);

      if (!payment) {
        console.error("Paiement non trouvé:", paymentIntent.id);
        return;
      }

      // Marquer le paiement comme réussi
      await payment.markAsSucceeded();

      // Traitement spécifique selon le type de paiement
      switch (payment.payment_type) {
        case "premium_upgrade":
          // Passer l'utilisateur en Premium
          const user = await User.findById(payment.user_id);
          if (user) {
            await user.upgradeToPremium();
            console.log(`✅ Utilisateur ${user.email} passé en Premium`);
          }
          break;

        case "template_purchase":
          // Donner accès au template (à implémenter selon vos besoins)
          console.log(
            `✅ Achat de template confirmé pour l'utilisateur ${payment.user_id}`
          );
          break;

        case "custom_design":
          // Déclencher le processus de design personnalisé
          console.log(
            `✅ Commande de design personnalisé confirmée pour l'utilisateur ${payment.user_id}`
          );
          break;
      }
    } catch (error) {
      console.error("Erreur lors du traitement du paiement réussi:", error);
    }
  }

  // Gérer l'échec d'un paiement
  static async handlePaymentFailure(paymentIntent) {
    try {
      const payment = await Payment.findByStripeId(paymentIntent.id);

      if (payment) {
        await payment.markAsFailed({
          failure_reason:
            paymentIntent.last_payment_error?.message || "Échec du paiement",
        });
        console.log(`❌ Paiement échoué: ${paymentIntent.id}`);
      }
    } catch (error) {
      console.error("Erreur lors du traitement de l'échec du paiement:", error);
    }
  }

  // Gérer l'annulation d'un paiement
  static async handlePaymentCancellation(paymentIntent) {
    try {
      const payment = await Payment.findByStripeId(paymentIntent.id);

      if (payment) {
        await payment.updateStatus("canceled");
        console.log(`🚫 Paiement annulé: ${paymentIntent.id}`);
      }
    } catch (error) {
      console.error(
        "Erreur lors du traitement de l'annulation du paiement:",
        error
      );
    }
  }

  // Obtenir l'historique des paiements de l'utilisateur
  static async getUserPayments(req, res) {
    try {
      const userId = req.user.userId;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      const payments = await Payment.findByUserId(userId, limit, offset);

      res.json({
        success: true,
        data: {
          payments: payments.map((p) => p.toJSON()),
          pagination: {
            page,
            limit,
            hasMore: payments.length === limit,
          },
        },
      });
    } catch (error) {
      console.error("Erreur lors de la récupération des paiements:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la récupération de l'historique",
      });
    }
  }

  // Obtenir un paiement spécifique
  static async getPayment(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;

      const payment = await Payment.findById(id);

      if (!payment) {
        return res.status(404).json({
          success: false,
          message: "Paiement non trouvé",
        });
      }

      // Vérifier que l'utilisateur est propriétaire du paiement
      if (payment.user_id !== userId) {
        return res.status(403).json({
          success: false,
          message: "Accès non autorisé",
        });
      }

      res.json({
        success: true,
        data: {
          payment: payment.toJSON(),
        },
      });
    } catch (error) {
      console.error("Erreur lors de la récupération du paiement:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la récupération du paiement",
      });
    }
  }

  // Annuler un paiement (si possible)
  static async cancelPayment(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;

      const payment = await Payment.findById(id);

      if (!payment) {
        return res.status(404).json({
          success: false,
          message: "Paiement non trouvé",
        });
      }

      // Vérifier que l'utilisateur est propriétaire du paiement
      if (payment.user_id !== userId) {
        return res.status(403).json({
          success: false,
          message: "Accès non autorisé",
        });
      }

      // Vérifier que le paiement peut être annulé
      if (!payment.isPending()) {
        return res.status(400).json({
          success: false,
          message: "Ce paiement ne peut pas être annulé",
        });
      }

      // Annuler le Payment Intent sur Stripe
      await stripe.paymentIntents.cancel(payment.stripe_payment_intent_id);

      // Mettre à jour le statut en base
      await payment.updateStatus("canceled");

      res.json({
        success: true,
        message: "Paiement annulé avec succès",
        data: {
          payment: payment.toJSON(),
        },
      });
    } catch (error) {
      console.error("Erreur lors de l'annulation du paiement:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de l'annulation du paiement",
      });
    }
  }

  // Obtenir les tarifs actuels
  static async getPricing(req, res) {
    try {
      const pricing = {
        premium_upgrade: {
          amount: 9.99,
          currency: "EUR",
          description:
            "Accès illimité aux templates premium et fonctionnalités avancées",
        },
        template_purchase: {
          amount: 2.99,
          currency: "EUR",
          description: "Achat d'un template premium individuel",
        },
        custom_design: {
          amount: 49.99,
          currency: "EUR",
          description: "Design d'invitation personnalisé créé par nos experts",
        },
      };

      res.json({
        success: true,
        data: {
          pricing,
        },
      });
    } catch (error) {
      console.error("Erreur lors de la récupération des tarifs:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la récupération des tarifs",
      });
    }
  }

  // Statistiques des paiements (admin)
  static async getPaymentStats(req, res) {
    try {
      const { dateFrom, dateTo } = req.query;

      const stats = await Payment.getStats(dateFrom, dateTo);
      const monthlyRevenue = await Payment.getMonthlyRevenue();
      const topSpenders = await Payment.getTopSpenders(5);

      res.json({
        success: true,
        data: {
          overall_stats: stats,
          monthly_revenue: monthlyRevenue,
          top_spenders: topSpenders,
        },
      });
    } catch (error) {
      console.error("Erreur lors de la récupération des stats:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la récupération des statistiques",
      });
    }
  }

  // Rembourser un paiement (admin)
  static async refundPayment(req, res) {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const payment = await Payment.findById(id);

      if (!payment) {
        return res.status(404).json({
          success: false,
          message: "Paiement non trouvé",
        });
      }

      if (!payment.isSucceeded()) {
        return res.status(400).json({
          success: false,
          message: "Seuls les paiements réussis peuvent être remboursés",
        });
      }

      // Créer le remboursement sur Stripe
      const refund = await stripe.refunds.create({
        payment_intent: payment.stripe_payment_intent_id,
        reason: "requested_by_customer",
      });

      // Mettre à jour le statut en base
      await payment.markAsRefunded({
        refund_id: refund.id,
        refund_reason: reason || "Remboursement demandé",
      });

      // Traitement spécifique selon le type
      if (payment.payment_type === "premium_upgrade") {
        // Révoquer le statut Premium (optionnel, selon votre politique)
        const user = await User.findById(payment.user_id);
        if (user && user.is_premium) {
          // await user.downgradeToPremium(); // À implémenter si nécessaire
        }
      }

      res.json({
        success: true,
        message: "Paiement remboursé avec succès",
        data: {
          payment: payment.toJSON(),
          refund_id: refund.id,
        },
      });
    } catch (error) {
      console.error("Erreur lors du remboursement:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors du remboursement",
      });
    }
  }

  // Ajouter après createPremiumPaymentIntent
  static async createTemplatePaymentIntent(req, res) {
    try {
      const userId = req.user.userId;
      const { template_id } = req.body;

      // Prix d'un template premium
      const templatePrice = 299; // 2.99 EUR en centimes

      const paymentIntent = await stripe.paymentIntents.create({
        amount: templatePrice,
        currency: "eur",
        metadata: {
          user_id: userId.toString(),
          payment_type: "template_purchase",
          template_id: template_id?.toString() || "",
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      const payment = await Payment.create({
        user_id: userId,
        stripe_payment_intent_id: paymentIntent.id,
        amount: templatePrice / 100,
        currency: "EUR",
        status: "processing",
        payment_type: "template_purchase",
      });

      res.json({
        success: true,
        data: {
          client_secret: paymentIntent.client_secret,
          payment_id: payment.id,
          amount: payment.getFormattedAmount(),
        },
      });
    } catch (error) {
      console.error(
        "Erreur lors de la création du Payment Intent Template:",
        error
      );
      res.status(500).json({
        success: false,
        message: "Erreur lors de la création du paiement",
      });
    }
  }

  static async createCustomDesignPaymentIntent(req, res) {
    try {
      const userId = req.user.userId;
      const { design_requirements } = req.body;

      // Prix d'un design personnalisé
      const designPrice = 4999; // 49.99 EUR en centimes

      const paymentIntent = await stripe.paymentIntents.create({
        amount: designPrice,
        currency: "eur",
        metadata: {
          user_id: userId.toString(),
          payment_type: "custom_design",
          requirements: design_requirements || "",
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      const payment = await Payment.create({
        user_id: userId,
        stripe_payment_intent_id: paymentIntent.id,
        amount: designPrice / 100,
        currency: "EUR",
        status: "processing",
        payment_type: "custom_design",
      });

      res.json({
        success: true,
        data: {
          client_secret: paymentIntent.client_secret,
          payment_id: payment.id,
          amount: payment.getFormattedAmount(),
        },
      });
    } catch (error) {
      console.error(
        "Erreur lors de la création du Payment Intent Design:",
        error
      );
      res.status(500).json({
        success: false,
        message: "Erreur lors de la création du paiement",
      });
    }
  }
}
module.exports = PaymentController;
