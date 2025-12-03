import pool from '../config/database.js';

// The model interacts with the 'inventory_profiles' table.
class InventoryProfile {
  static async create({ accountId, profileName, status }) {
    const [result] = await pool.query(
      'INSERT INTO inventory_profiles (inventory_id, profile_name, status) VALUES (?, ?, ?)',
      [accountId, profileName, status || 'available']
    );
    return { id: result.insertId, accountId, profileName, status };
  }

  static async findAll() {
    const [rows] = await pool.query('SELECT * FROM inventory_profiles');
    return rows;
  }
  
  // Find all profiles for a specific account
  static async findByAccountId(accountId) {
    const [rows] = await pool.query('SELECT * FROM inventory_profiles WHERE inventory_id = ?', [accountId]);
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.query('SELECT * FROM inventory_profiles WHERE id = ?', [id]);
    return rows[0];
  }

  static async update(id, { profileName, status }) {
    // Note: The schema in database.sql for inventory_profiles has status ENUM('available', 'assigned')
    // It does not include 'maintenance'. The logic here respects that.
    if (status && !['available', 'assigned'].includes(status)) {
        throw new Error("Invalid status for profile. Must be 'available' or 'assigned'.");
    }

    const [result] = await pool.query(
      'UPDATE inventory_profiles SET profile_name = ?, status = ? WHERE id = ?',
      [profileName, status, id]
    );
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await pool.query('DELETE FROM inventory_profiles WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  static async findAvailableByProductId(productId) {
    const [rows] = await pool.query(
      `SELECT ip.id 
       FROM inventory_profiles ip
       JOIN inventory i ON ip.inventory_id = i.id
       WHERE i.product_id = ? AND ip.status = 'available'
       LIMIT 1`,
      [productId]
    );
    return rows[0];
  }

  static async getAvailableCountByProductId(productId) {
    const [rows] = await pool.query(
      `SELECT COUNT(ip.id) as available_count
       FROM inventory_profiles ip
       JOIN inventory i ON ip.inventory_id = i.id
       WHERE i.product_id = ? AND ip.status = 'available'`,
      [productId]
    );
    return rows[0].available_count;
  }
}

export default InventoryProfile;
