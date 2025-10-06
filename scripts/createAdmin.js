const bcrypt = require("bcryptjs");
const { query } = require("../config/database");

async function createAdmin() {
  try {
    // Générer un vrai hash bcrypt
    const hashedPassword = await bcrypt.hash("admin123", 10);

    const result = await query(
      `
            INSERT INTO users (email, password, first_name, last_name, is_premium)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, email
        `,
      ["admin@example.com", hashedPassword, "Admin", "System", true]
    );

    console.log("✅ Admin créé avec succès:");
    console.log("   Email:", result.rows[0].email);
    console.log("   Mot de passe: admin123");
    console.log("   ID:", result.rows[0].id);

    process.exit(0);
  } catch (error) {
    console.error("❌ Erreur:", error.message);
    process.exit(1);
  }
}

createAdmin();
