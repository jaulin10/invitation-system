const {
  initializeDatabase,
  query,
  closeDatabase,
} = require("./config/database");

async function runTests() {
  console.log("🧪 === TEST DE CONNEXION BASE DE DONNÉES ===\n");

  try {
    // Test 1: Initialisation
    await initializeDatabase();

    // Test 2: Compter les utilisateurs
    console.log("\n📊 Test des données...");
    const userCount = await query("SELECT COUNT(*) as count FROM users");
    console.log(`👥 Nombre d'utilisateurs: ${userCount.rows[0].count}`);

    // Test 3: Compter les templates
    const templateCount = await query(
      "SELECT COUNT(*) as count FROM invitation_templates"
    );
    console.log(`📄 Nombre de templates: ${templateCount.rows[0].count}`);

    // Test 4: Lister les catégories de templates
    const categories = await query(
      "SELECT DISTINCT category FROM invitation_templates ORDER BY category"
    );
    console.log(
      "📂 Catégories disponibles:",
      categories.rows.map((row) => row.category)
    );

    // Test 5: Vérifier la structure d'une table
    console.log("\n🔍 Structure de la table invitations:");
    const tableStructure = await query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'invitations' 
      ORDER BY ordinal_position
    `);

    tableStructure.rows.forEach((col) => {
      console.log(
        `  - ${col.column_name}: ${col.data_type} ${
          col.is_nullable === "NO" ? "(requis)" : "(optionnel)"
        }`
      );
    });

    console.log("\n✅ === TOUS LES TESTS RÉUSSIS! ===");
  } catch (error) {
    console.error("\n❌ === ERREUR LORS DES TESTS ===");
    console.error("Détails:", error.message);

    // Diagnostics en cas d'erreur
    console.log("\n🔧 Vérifications à faire:");
    console.log("1. PostgreSQL est-il démarré?");
    console.log('2. La base "invitation_system" existe-t-elle?');
    console.log("3. Les informations dans .env sont-elles correctes?");
    console.log("4. Les scripts SQL ont-ils été exécutés?");
  } finally {
    // Fermeture propre
    await closeDatabase();
    console.log("\n👋 Test terminé.");
    process.exit(0);
  }
}

// Lancement du test
runTests();
