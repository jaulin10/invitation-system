const { query } = require("../config/database");
const bcrypt = require("bcryptjs");

class User {
  constructor(userData) {
    this.id = userData.id;
    this.email = userData.email;
    this.first_name = userData.first_name;
    this.last_name = userData.last_name;
    this.is_premium = userData.is_premium;
    this.created_at = userData.created_at;
    this.updated_at = userData.updated_at;
  }

  // Create a new user
  static async create({ email, password, first_name, last_name }) {
    try {
      // Check if email already exists
      const existing = await this.findByEmail(email);
      if (existing) {
        throw new Error("This email is already registered.");
      }

      // Hacher le mot de passe
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Insérer le nouvel utilisateur
      const result = await query(
        `
        INSERT INTO users (email, password, first_name, last_name, is_premium)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, email, first_name, last_name, is_premium, created_at, updated_at
      `,
        [email, hashedPassword, first_name, last_name, false]
      );

      return new User(result.rows[0]);
    } catch (error) {
      console.error("Erreur lors de la création utilisateur:", error);
      throw error;
    }
  }

  // Trouver un utilisateur par email
  static async findByEmail(email) {
    try {
      const result = await query(
        `
        SELECT id, email, password, first_name, last_name, is_premium, created_at, updated_at
        FROM users 
        WHERE email = $1
      `,
        [email]
      );

      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      console.error("Erreur lors de la recherche par email:", error);
      throw error;
    }
  }

  // Trouver un utilisateur par ID
  static async findById(id) {
    try {
      const result = await query(
        `
        SELECT id, email, first_name, last_name, is_premium, created_at, updated_at
        FROM users 
        WHERE id = $1
      `,
        [id]
      );

      return result.rows.length > 0 ? new User(result.rows[0]) : null;
    } catch (error) {
      console.error("Erreur lors de la recherche par ID:", error);
      throw error;
    }
  }

  // Vérifier le mot de passe
  static async verifyPassword(plainPassword, hashedPassword) {
    try {
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      console.error("Erreur lors de la vérification du mot de passe:", error);
      return false;
    }
  }

  // Authentifier un utilisateur
  static async authenticate(email, password) {
    try {
      const userData = await this.findByEmail(email);
      if (!userData) {
        return null;
      }

      const isValid = await this.verifyPassword(password, userData.password);
      if (!isValid) {
        return null;
      }

      // Retourner l'utilisateur sans le mot de passe
      delete userData.password;
      return new User(userData);
    } catch (error) {
      console.error("Erreur lors de l'authentification:", error);
      throw error;
    }
  }

  // Mettre à jour le profil utilisateur
  async updateProfile({ first_name, last_name }) {
    try {
      const result = await query(
        `
        UPDATE users 
        SET first_name = $1, last_name = $2, updated_at = CURRENT_TIMESTAMP
        WHERE id = $3
        RETURNING id, email, first_name, last_name, is_premium, created_at, updated_at
      `,
        [first_name, last_name, this.id]
      );

      if (result.rows.length > 0) {
        const updatedData = result.rows[0];
        this.first_name = updatedData.first_name;
        this.last_name = updatedData.last_name;
        this.updated_at = updatedData.updated_at;
      }

      return this;
    } catch (error) {
      console.error("Erreur lors de la mise à jour du profil:", error);
      throw error;
    }
  }

  // Passer en premium
  async upgradeToPremium() {
    try {
      const result = await query(
        `
        UPDATE users 
        SET is_premium = true, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING is_premium, updated_at
      `,
        [this.id]
      );

      if (result.rows.length > 0) {
        this.is_premium = result.rows[0].is_premium;
        this.updated_at = result.rows[0].updated_at;
      }

      return this;
    } catch (error) {
      console.error("Erreur lors du passage en premium:", error);
      throw error;
    }
  }

  // Changer le mot de passe
  async changePassword(currentPassword, newPassword) {
    try {
      // Récupérer le mot de passe actuel
      const userData = await User.findByEmail(this.email);
      if (!userData) {
        throw new Error("Utilisateur non trouvé");
      }

      // Vérifier le mot de passe actuel
      const isCurrentValid = await User.verifyPassword(
        currentPassword,
        userData.password
      );
      if (!isCurrentValid) {
        throw new Error("Mot de passe actuel incorrect");
      }

      // Hacher le nouveau mot de passe
      const saltRounds = 12;
      const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

      // Mettre à jour le mot de passe
      await query(
        `
        UPDATE users 
        SET password = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
      `,
        [hashedNewPassword, this.id]
      );

      return true;
    } catch (error) {
      console.error("Erreur lors du changement de mot de passe:", error);
      throw error;
    }
  }

  // Obtenir les statistiques de l'utilisateur
  async getStats() {
    try {
      const result = await query(
        `
        SELECT 
          COUNT(*) as total_invitations,
          COUNT(CASE WHEN is_public = true THEN 1 END) as public_invitations,
          COALESCE(SUM(view_count), 0) as total_views
        FROM invitations 
        WHERE user_id = $1
      `,
        [this.id]
      );

      return result.rows[0];
    } catch (error) {
      console.error("Erreur lors de la récupération des stats:", error);
      throw error;
    }
  }

  // Supprimer le compte utilisateur
  async delete() {
    try {
      await query("DELETE FROM users WHERE id = $1", [this.id]);
      return true;
    } catch (error) {
      console.error("Erreur lors de la suppression du compte:", error);
      throw error;
    }
  }

  // Méthode pour retourner les données publiques (sans infos sensibles)
  toPublicJSON() {
    return {
      id: this.id,
      email: this.email,
      first_name: this.first_name,
      last_name: this.last_name,
      is_premium: this.is_premium,
      created_at: this.created_at,
    };
  }
}

module.exports = User;
