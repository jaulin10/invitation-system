const { Pool } = require("pg");
require("dotenv").config();

// Configuration de la pool de connexions PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20, // Maximum de connexions simultanées dans la pool
  idleTimeoutMillis: 30000, // Fermer les connexions inactives après 30s
  connectionTimeoutMillis: 2000, // Timeout de connexion à 2s
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

// Événements de la pool
pool.on("connect", (client) => {
  console.log("✅ Nouvelle connexion PostgreSQL établie");
});

pool.on("error", (err, client) => {
  console.error("❌ Erreur inattendue sur le client PostgreSQL:", err);
  process.exit(-1);
});

// Fonction utilitaire pour exécuter des requêtes avec logging
const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;

    // Log en mode développement
    if (process.env.NODE_ENV === "development") {
      console.log("📊 Requête exécutée:", {
        query: text.substring(0, 100) + (text.length > 100 ? "..." : ""),
        duration: duration + "ms",
        rows: res.rowCount,
      });
    }

    return res;
  } catch (err) {
    console.error("❌ Erreur dans la requête SQL:", {
      query: text,
      params,
      error: err.message,
    });
    throw err;
  }
};

// Fonction pour obtenir un client de la pool (pour les transactions)
const getClient = async () => {
  try {
    const client = await pool.connect();
    console.log("🔗 Client PostgreSQL obtenu de la pool");
    return client;
  } catch (err) {
    console.error("❌ Erreur lors de l'obtention du client:", err);
    throw err;
  }
};

// Fonction de test de connexion
const testConnection = async () => {
  try {
    console.log("🔍 Test de connexion à PostgreSQL...");
    const result = await query(
      "SELECT NOW() as current_time, version() as version"
    );
    console.log("✅ Connexion PostgreSQL réussie!");
    console.log("⏰ Heure serveur:", result.rows[0].current_time);
    console.log(
      "🗄️ Version PostgreSQL:",
      result.rows[0].version.split(" ")[0] +
        " " +
        result.rows[0].version.split(" ")[1]
    );
    return true;
  } catch (err) {
    console.error("❌ Échec de la connexion PostgreSQL:", err.message);
    return false;
  }
};

// Fonction pour vérifier que les tables existent
const checkTables = async () => {
  try {
    console.log("🔍 Vérification des tables...");
    const result = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);

    const tables = result.rows.map((row) => row.table_name);
    const expectedTables = [
      "users",
      "invitation_templates",
      "invitations",
      "payments",
      "invitation_guests",
    ];

    console.log("📋 Tables trouvées:", tables);

    const missingTables = expectedTables.filter(
      (table) => !tables.includes(table)
    );
    if (missingTables.length > 0) {
      console.warn("⚠️ Tables manquantes:", missingTables);
      return false;
    }

    console.log("✅ Toutes les tables requises sont présentes!");
    return true;
  } catch (err) {
    console.error("❌ Erreur lors de la vérification des tables:", err.message);
    return false;
  }
};

// Fonction d'initialisation complète
const initializeDatabase = async () => {
  try {
    console.log("🚀 Initialisation de la base de données...");

    // Test de connexion
    const connectionOk = await testConnection();
    if (!connectionOk) {
      throw new Error("Impossible de se connecter à PostgreSQL");
    }

    // Vérification des tables
    const tablesOk = await checkTables();
    if (!tablesOk) {
      console.warn(
        "⚠️ Certaines tables sont manquantes. Assurez-vous d'avoir exécuté les scripts SQL."
      );
    }

    console.log("🎉 Base de données initialisée avec succès!");
    return true;
  } catch (err) {
    console.error("💥 Erreur lors de l'initialisation:", err.message);
    throw err;
  }
};

// Fonction de fermeture propre
const closeDatabase = async () => {
  try {
    await pool.end();
    console.log("👋 Connexions PostgreSQL fermées proprement");
  } catch (err) {
    console.error("❌ Erreur lors de la fermeture:", err.message);
  }
};

module.exports = {
  query,
  getClient,
  pool,
  testConnection,
  checkTables,
  initializeDatabase,
  closeDatabase,
};
