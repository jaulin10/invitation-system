const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// Configuration des prix (en centimes)
const PRICING = {
  PREMIUM_UPGRADE: 999, // 9.99 EUR
  TEMPLATE_PURCHASE: 299, // 2.99 EUR
  CUSTOM_DESIGN: 4999, // 49.99 EUR
};

// Configuration Stripe
const stripeConfig = {
  apiVersion: "2023-10-16",
  maxNetworkRetries: 3,
  timeout: 10000, // 10 secondes
};

// Appliquer la configuration
Object.keys(stripeConfig).forEach((key) => {
  stripe[key] = stripeConfig[key];
});

// Fonction utilitaire pour créer un Payment Intent
const createPaymentIntent = async (amount, currency = "eur", metadata = {}) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      metadata,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return paymentIntent;
  } catch (error) {
    console.error("Erreur lors de la création du Payment Intent:", error);
    throw error;
  }
};

// Fonction utilitaire pour confirmer un paiement
const confirmPaymentIntent = async (
  paymentIntentId,
  paymentMethodId = null
) => {
  try {
    const confirmParams = {};
    if (paymentMethodId) {
      confirmParams.payment_method = paymentMethodId;
    }

    const paymentIntent = await stripe.paymentIntents.confirm(
      paymentIntentId,
      confirmParams
    );

    return paymentIntent;
  } catch (error) {
    console.error("Erreur lors de la confirmation du paiement:", error);
    throw error;
  }
};

// Fonction utilitaire pour créer un remboursement
const createRefund = async (
  paymentIntentId,
  amount = null,
  reason = "requested_by_customer"
) => {
  try {
    const refundParams = {
      payment_intent: paymentIntentId,
      reason,
    };

    if (amount) {
      refundParams.amount = amount;
    }

    const refund = await stripe.refunds.create(refundParams);
    return refund;
  } catch (error) {
    console.error("Erreur lors de la création du remboursement:", error);
    throw error;
  }
};

// Fonction utilitaire pour récupérer un paiement
const retrievePaymentIntent = async (paymentIntentId) => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return paymentIntent;
  } catch (error) {
    console.error("Erreur lors de la récupération du paiement:", error);
    throw error;
  }
};

// Fonction utilitaire pour annuler un paiement
const cancelPaymentIntent = async (paymentIntentId) => {
  try {
    const paymentIntent = await stripe.paymentIntents.cancel(paymentIntentId);
    return paymentIntent;
  } catch (error) {
    console.error("Erreur lors de l'annulation du paiement:", error);
    throw error;
  }
};

// Fonction pour créer un Customer Stripe (pour les utilisateurs récurrents)
const createCustomer = async (email, name, metadata = {}) => {
  try {
    const customer = await stripe.customers.create({
      email,
      name,
      metadata,
    });

    return customer;
  } catch (error) {
    console.error("Erreur lors de la création du customer:", error);
    throw error;
  }
};

// Fonction pour mettre à jour un Customer
const updateCustomer = async (customerId, updateData) => {
  try {
    const customer = await stripe.customers.update(customerId, updateData);
    return customer;
  } catch (error) {
    console.error("Erreur lors de la mise à jour du customer:", error);
    throw error;
  }
};

// Fonction pour gérer les webhooks
const constructWebhookEvent = (payload, signature, secret) => {
  try {
    const event = stripe.webhooks.constructEvent(payload, signature, secret);
    return event;
  } catch (error) {
    console.error("Erreur lors de la vérification du webhook:", error);
    throw error;
  }
};

// Fonction pour formater les montants
const formatAmount = (amount, currency = "EUR") => {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: currency,
  }).format(amount / 100);
};

// Fonction pour valider une signature webhook
const validateWebhookSignature = (payload, signature, secret) => {
  try {
    const event = stripe.webhooks.constructEvent(payload, signature, secret);
    return { valid: true, event };
  } catch (error) {
    return { valid: false, error: error.message };
  }
};

// Fonction pour obtenir les méthodes de paiement d'un customer
const getCustomerPaymentMethods = async (customerId, type = "card") => {
  try {
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type,
    });

    return paymentMethods;
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des méthodes de paiement:",
      error
    );
    throw error;
  }
};

// Fonction pour créer un Setup Intent (pour sauvegarder les méthodes de paiement)
const createSetupIntent = async (customerId, metadata = {}) => {
  try {
    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      metadata,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return setupIntent;
  } catch (error) {
    console.error("Erreur lors de la création du Setup Intent:", error);
    throw error;
  }
};

// Fonction pour créer une facture
const createInvoice = async (customerId, items = [], metadata = {}) => {
  try {
    // Créer d'abord les éléments de facture
    for (const item of items) {
      await stripe.invoiceItems.create({
        customer: customerId,
        amount: item.amount,
        currency: item.currency || "eur",
        description: item.description,
      });
    }

    // Créer la facture
    const invoice = await stripe.invoices.create({
      customer: customerId,
      metadata,
      auto_advance: true,
    });

    return invoice;
  } catch (error) {
    console.error("Erreur lors de la création de la facture:", error);
    throw error;
  }
};

// Statistiques Stripe
const getStripeBalance = async () => {
  try {
    const balance = await stripe.balance.retrieve();
    return balance;
  } catch (error) {
    console.error("Erreur lors de la récupération du solde:", error);
    throw error;
  }
};

// Fonction pour tester la connexion Stripe
const testStripeConnection = async () => {
  try {
    const balance = await stripe.balance.retrieve();
    console.log("✅ Connexion Stripe réussie");
    console.log(
      "💰 Solde disponible:",
      formatAmount(balance.available[0]?.amount || 0)
    );
    return true;
  } catch (error) {
    console.error("❌ Erreur de connexion Stripe:", error.message);
    return false;
  }
};

// Fonction pour obtenir les transactions récentes
const getRecentCharges = async (limit = 10) => {
  try {
    const charges = await stripe.charges.list({
      limit,
      expand: ["data.payment_intent"],
    });

    return charges.data.map((charge) => ({
      id: charge.id,
      amount: charge.amount,
      currency: charge.currency,
      status: charge.status,
      description: charge.description,
      created: new Date(charge.created * 1000),
      payment_intent_id: charge.payment_intent?.id,
    }));
  } catch (error) {
    console.error("Erreur lors de la récupération des charges:", error);
    throw error;
  }
};

// Fonction pour obtenir les disputes/chargebacks
const getDisputes = async (limit = 10) => {
  try {
    const disputes = await stripe.disputes.list({ limit });
    return disputes.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des disputes:", error);
    throw error;
  }
};

// Fonction pour créer un produit Stripe (pour les abonnements futurs)
const createProduct = async (name, description, metadata = {}) => {
  try {
    const product = await stripe.products.create({
      name,
      description,
      metadata,
    });

    return product;
  } catch (error) {
    console.error("Erreur lors de la création du produit:", error);
    throw error;
  }
};

// Fonction pour créer un prix pour un produit
const createPrice = async (
  productId,
  unitAmount,
  currency = "eur",
  recurring = null
) => {
  try {
    const priceData = {
      product: productId,
      unit_amount: unitAmount,
      currency,
    };

    if (recurring) {
      priceData.recurring = recurring;
    }

    const price = await stripe.prices.create(priceData);
    return price;
  } catch (error) {
    console.error("Erreur lors de la création du prix:", error);
    throw error;
  }
};

// Fonction de nettoyage - supprimer les PaymentIntents abandonnés
const cleanupAbandonedPayments = async (olderThanHours = 24) => {
  try {
    const cutoffTime = Math.floor(
      (Date.now() - olderThanHours * 60 * 60 * 1000) / 1000
    );

    const paymentIntents = await stripe.paymentIntents.list({
      created: { lt: cutoffTime },
      limit: 100,
    });

    const canceledCount = 0;
    for (const pi of paymentIntents.data) {
      if (
        pi.status === "requires_payment_method" ||
        pi.status === "requires_confirmation"
      ) {
        try {
          await stripe.paymentIntents.cancel(pi.id);
          canceledCount++;
        } catch (error) {
          console.error(
            `Impossible d'annuler le PaymentIntent ${pi.id}:`,
            error.message
          );
        }
      }
    }

    console.log(`🧹 ${canceledCount} PaymentIntents abandonnés nettoyés`);
    return canceledCount;
  } catch (error) {
    console.error("Erreur lors du nettoyage:", error);
    throw error;
  }
};

module.exports = {
  stripe,
  PRICING,

  // Fonctions principales
  createPaymentIntent,
  confirmPaymentIntent,
  createRefund,
  retrievePaymentIntent,
  cancelPaymentIntent,

  // Gestion des customers
  createCustomer,
  updateCustomer,
  getCustomerPaymentMethods,
  createSetupIntent,

  // Webhooks
  constructWebhookEvent,
  validateWebhookSignature,

  // Facturation
  createInvoice,

  // Produits et prix
  createProduct,
  createPrice,

  // Utilitaires
  formatAmount,
  testStripeConnection,
  getStripeBalance,
  getRecentCharges,
  getDisputes,
  cleanupAbandonedPayments,
};
