import pool from '../config/database.js';

// The model interacts with the 'inventory' table, which conceptually represents 'Inventory Accounts'.
class InventoryAccount {
  /**
   * Creates a new inventory account and its associated profiles within a transaction.
   */
  static async createWithProfiles({ email, password, productId, status, capacity }) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // 1. Create the inventory account
      const [accountResult] = await connection.query(
        'INSERT INTO inventory (product_id, email, password, status) VALUES (?, ?, ?, ?)',
        [productId, email, password, status || 'available']
      );
      const accountId = accountResult.insertId;

      // 2. Generate and insert profiles based on product capacity
      if (capacity > 0) {
        const profileData = [];
        for (let i = 1; i <= capacity; i++) {
          profileData.push([accountId, `Profile ${i}`, 'available']);
        }
        
        await connection.query(
          'INSERT INTO inventory_profiles (inventory_id, profile_name, status) VALUES ?',
          [profileData]
        );
      }

      await connection.commit();
      return { id: accountId, email, productId, capacity };

    } catch (error) {
      await connection.rollback();
      // Re-throw the error to be caught by the controller
      throw error;
    } finally {
      connection.release();
    }
  }

  static async findAll() {
    const [rows] = await pool.query('SELECT * FROM inventory');
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.query('SELECT * FROM inventory WHERE id = ?', [id]);
    return rows[0];
  }

  /**
   * Helper to get product capacity. This is needed for auto-generating profiles.
   */
  static async getProductCapacity(productId) {
    const [rows] = await pool.query('SELECT capacity FROM products WHERE id = ?', [productId]);
    if (rows.length === 0) {
      return null;
    }
    return rows[0].capacity;
  }

  static async update(id, { productId, email, password, status }) {
    const [result] = await pool.query(
      'UPDATE inventory SET product_id = ?, email = ?, password = ?, status = ? WHERE id = ?',
      [productId, email, password, status, id]
    );
    return result.affectedRows > 0;
  }

  static async delete(id) {
     const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      // Before deleting the account, we must delete its profiles to avoid foreign key constraint errors.
      await connection.query('DELETE FROM inventory_profiles WHERE inventory_id = ?', [id]);
      const [result] = await connection.query('DELETE FROM inventory WHERE id = ?', [id]);
      
      await connection.commit();
      return result.affectedRows > 0;

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}

export default InventoryAccount;
