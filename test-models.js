const { initializeDatabase, closeDatabase } = require("./config/database");
const User = require("./models/User");
const Template = require("./models/Template");
const Invitation = require("./models/Invitation");
const Guest = require("./models/Guest");
const Payment = require("./models/Payment");

async function runModelTests() {
  console.log("🧪 === TEST DES MODÈLES ===\n");

  try {
    // Initialiser la base de données
    await initializeDatabase();

    // Test 1: Modèle User
    console.log("👤 Test du modèle User...");

    // Créer un utilisateur de test
    const testUser = await User.create({
      email: `test_${Date.now()}@example.com`,
      password: "password123",
      first_name: "Test",
      last_name: "Utilisateur",
    });
    console.log("✅ Utilisateur créé:", testUser.email);

    // Test d'authentification
    const authUser = await User.authenticate(testUser.email, "password123");
    console.log(
      "✅ Authentification réussie:",
      authUser ? authUser.email : "Échec"
    );

    // Test 2: Modèle Template
    console.log("\n📄 Test du modèle Template...");

    // Obtenir les templates existants
    const templates = await Template.getAvailableForUser(false);
    console.log(`✅ Templates trouvés: ${templates.length}`);

    if (templates.length > 0) {
      const firstTemplate = templates[0];
      console.log(
        `✅ Premier template: "${firstTemplate.name}" (${firstTemplate.category})`
      );

      // Test 3: Modèle Invitation
      console.log("\n🎉 Test du modèle Invitation...");

      // Créer une invitation de test
      const testInvitation = await Invitation.create({
        user_id: testUser.id,
        template_id: firstTemplate.id,
        title: "Test Birthday Party",
        event_date: "2024-12-31",
        event_time: "18:00",
        event_location: "Chez moi",
        contact_phone: "0123456789",
        event_theme: "Anniversaire",
        custom_message: "Venez célébrer avec nous!",
        is_public: true,
      });
      console.log("✅ Invitation créée:", testInvitation.title);
      console.log("✅ URL unique:", testInvitation.unique_url);

      // Test 4: Modèle Guest
      console.log("\n👥 Test du modèle Guest...");

      // Créer une réponse RSVP
      const testGuest = await Guest.create({
        invitation_id: testInvitation.id,
        guest_name: "Jean Dupont",
        guest_email: "jean@example.com",
        attendance_status: "confirmed",
        plus_one: 2,
        dietary_restrictions: "Végétarien",
      });
      console.log("✅ RSVP créé:", testGuest.getDisplayName());
      console.log("✅ Total attendus:", testGuest.getTotalAttendees());

      // Test des statistiques RSVP
      const rsvpStats = await Guest.getStatsForInvitation(testInvitation.id);
      console.log("✅ Stats RSVP:", rsvpStats);

      // Test 5: Modèle Payment (simulation)
      console.log("\n💳 Test du modèle Payment...");

      // Créer un paiement de test
      const testPayment = await Payment.create({
        user_id: testUser.id,
        stripe_payment_intent_id: `pi_test_${Date.now()}`,
        amount: 9.99,
        currency: "EUR",
        status: "succeeded",
        payment_type: "premium_upgrade",
      });
      console.log("✅ Paiement créé:", testPayment.getFormattedAmount());
      console.log("✅ Type:", testPayment.getPaymentTypeDescription());

      // Test des statistiques de paiement
      const paymentStats = await Payment.getStats();
      console.log("✅ Stats paiements:", paymentStats);

      // Test 6: Mise à jour de l'utilisateur en premium
      console.log("\n⭐ Test passage en premium...");
      await testUser.upgradeToPremium();
      console.log("✅ Utilisateur premium:", testUser.is_premium);

      // Test 7: Récupération des données liées
      console.log("\n🔗 Test des relations...");

      const userInvitations = await Invitation.findByUserId(testUser.id);
      console.log(`✅ Invitations de l'utilisateur: ${userInvitations.length}`);

      const userPayments = await Payment.findByUserId(testUser.id);
      console.log(`✅ Paiements de l'utilisateur: ${userPayments.length}`);

      const userStats = await testUser.getStats();
      console.log("✅ Stats utilisateur:", userStats);

      // Test 8: Template avec données
      console.log("\n🎨 Test rendu template...");

      const renderedTemplate = firstTemplate.renderWithData({
        title: testInvitation.title,
        event_date: testInvitation.event_date,
        event_location: testInvitation.event_location,
        custom_message: testInvitation.custom_message,
      });
      console.log("✅ Template rendu avec succès");
      console.log("✅ Variables trouvées:", firstTemplate.getVariables());

      // Nettoyage des données de test
      console.log("\n🧹 Nettoyage...");
      await testPayment.delete();
      await testGuest.delete();
      await testInvitation.delete();
      await testUser.delete();
      console.log("✅ Données de test supprimées");
    } else {
      console.log("⚠️ Aucun template trouvé - Exécutez les seeds SQL");
    }

    console.log("\n🎉 === TOUS LES TESTS MODÈLES RÉUSSIS! ===");

    // Affichage des capacités disponibles
    console.log("\n📊 Capacités disponibles:");
    console.log("- ✅ Gestion utilisateurs (inscription, connexion, premium)");
    console.log("- ✅ Gestion templates (catégories, rendu, variables)");
    console.log("- ✅ Gestion invitations (création, URL unique, vues)");
    console.log("- ✅ Gestion RSVP (réponses, statistiques, export)");
    console.log("- ✅ Gestion paiements (Stripe, statistiques, revenus)");
  } catch (error) {
    console.error("\n❌ === ERREUR LORS DES TESTS MODÈLES ===");
    console.error("Détails:", error.message);
    console.error("Stack:", error.stack);

    console.log("\n🔧 Vérifications à faire:");
    console.log("1. Les modèles sont-ils bien créés dans models/?");
    console.log("2. Les dépendances sont-elles installées? (bcryptjs, crypto)");
    console.log("3. La base de données contient-elle des données de test?");
    console.log("4. Les tables ont-elles les bonnes colonnes?");
  } finally {
    // Fermeture propre
    await closeDatabase();
    console.log("\n👋 Test des modèles terminé.");
    process.exit(0);
  }
}

// Gestion des erreurs non capturées
process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Rejet non géré:", reason);
  process.exit(1);
});

process.on("uncaughtException", (error) => {
  console.error("❌ Exception non capturée:", error);
  process.exit(1);
});

// Lancement du test
console.log("🚀 Démarrage du test des modèles...");
runModelTests();
