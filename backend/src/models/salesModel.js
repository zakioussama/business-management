import pool from '../config/database.js';

class Sale {
  /**
   * Creates a new sale, assigning a profile to a client in a transaction.
   */
  static async create({ clientId, agentId, profileId, salesAttributeId, startDate, endDate, cost }) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // 1. Update profile status to 'assigned'
      const [updateResult] = await connection.query(
        "UPDATE inventory_profiles SET status = 'assigned' WHERE id = ? AND status = 'available'",
        [profileId]
      );

      // If no rows were affected, the profile was not available
      if (updateResult.affectedRows === 0) {
        throw new Error('Profile is not available or does not exist.');
      }

      // 2. Create the sale record
      const [saleResult] = await connection.query(
        'INSERT INTO sales (client_id, agent_id, profile_id, sales_attribute_id, start_date, end_date, cost, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [clientId, agentId, profileId, salesAttributeId, startDate, endDate, cost, 'active']
      );
      
      await connection.commit();
      return { id: saleResult.insertId, clientId, profileId, status: 'active' };

    } catch (error) {
      await connection.rollback();
      throw error; // Re-throw to be handled by controller
    } finally {
      connection.release();
    }
  }

  static async findAll() {
    // Join with other tables to provide a comprehensive view
    const [rows] = await pool.query(`
        SELECT 
            s.id, s.start_date, s.end_date, s.status, s.cost,
            sa.price,
            c.full_name AS client_name,
            u.username AS agent_name,
            p.product_name
        FROM sales s
        JOIN clients c ON s.client_id = c.id
        JOIN users u ON s.agent_id = u.id
        JOIN sales_attributes sa ON s.sales_attribute_id = sa.id
        JOIN products p ON sa.product_id = p.id
        ORDER BY s.created_at DESC
    `);
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.query('SELECT * FROM sales WHERE id = ?', [id]);
    return rows[0];
  }

  static async findByClientId(clientId) {
    const [rows] = await pool.query(`
        SELECT 
            s.id, s.start_date, s.end_date, s.status,
            sa.price,
            u.username AS agent_name,
            p.product_name
        FROM sales s
        JOIN users u ON s.agent_id = u.id
        JOIN sales_attributes sa ON s.sales_attribute_id = sa.id
        JOIN products p ON sa.product_id = p.id
        WHERE s.client_id = ?
        ORDER BY s.created_at DESC
    `, [clientId]);
    return rows;
  }

  static async update(id, { clientId, startDate, endDate, status, price, cost }) {
    const [result] = await pool.query(
      'UPDATE sales SET client_id = ?, start_date = ?, end_date = ?, status = ?, price = ?, cost = ? WHERE id = ?',
      [clientId, startDate, endDate, status, price, cost, id]
    );
    return result.affectedRows > 0;
  }

  /**
   * Renews a sale by extending its end date.
   */
  static async renew(id, newEndDate) {
    const [result] = await pool.query(
      "UPDATE sales SET end_date = ?, status = 'active' WHERE id = ?",
      [newEndDate, id]
    );
    return result.affectedRows > 0;
  }
  
  /**
   * Reactivates an expired sale by assigning a new available profile.
   */
  static async reactivate(saleId, newProfileId) {
      const connection = await pool.getConnection();
      try {
        await connection.beginTransaction();

        // 1. Assign the new profile
        const [updateResult] = await connection.query(
            "UPDATE inventory_profiles SET status = 'assigned' WHERE id = ? AND status = 'available'",
            [newProfileId]
        );

        if (updateResult.affectedRows === 0) {
            throw new Error('New profile is not available.');
        }

        // 2. Update the sale to link the new profile and set status to active
        const [saleUpdateResult] = await connection.query(
            "UPDATE sales SET profile_id = ?, status = 'active' WHERE id = ?",
            [newProfileId, saleId]
        );

        await connection.commit();
        return saleUpdateResult.affectedRows > 0;

      } catch (error) {
          await connection.rollback();
          throw error;
      } finally {
          connection.release();
      }
  }

  /**
   * Cancels a sale and makes the associated profile available again.
   */
  static async expel(id) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // 1. Get the profile_id from the sale
      const sale = await this.findById(id);
      if (!sale) {
        throw new Error('Sale not found.');
      }
      
      // 2. Update the sale status to 'cancelled'
      await connection.query("UPDATE sales SET status = 'cancelled' WHERE id = ?", [id]);
      
      // 3. Update the profile status back to 'available'
      await connection.query("UPDATE inventory_profiles SET status = 'available' WHERE id = ?", [sale.profile_id]);
      
      await connection.commit();
      return true;

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async delete(id) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // 1. Get the profile_id from the sale before deleting
      const sale = await this.findById(id);
      if (!sale || !sale.profile_id) {
        // If sale doesn't exist, we can't proceed.
        // Returning 0 affectedRows is a way to signal failure.
        await connection.rollback();
        return 0;
      }

      // 2. Update the profile status back to 'available'
      await connection.query(
        "UPDATE inventory_profiles SET status = 'available' WHERE id = ?",
        [sale.profile_id]
      );

      // 3. Delete the sale record
      const [result] = await connection.query('DELETE FROM sales WHERE id = ?', [id]);
      
      await connection.commit();
      return result.affectedRows;

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // --- Helper methods for validation ---
  static async getClient(clientId) {
      const [rows] = await pool.query('SELECT id FROM clients WHERE id = ?', [clientId]);
      return rows[0];
  }

  static async getProfile(profileId) {
      const [rows] = await pool.query('SELECT * FROM inventory_profiles WHERE id = ?', [profileId]);
      return rows[0];
  }

  static async getInventoryDetailsFromProfile(profileId) {
      const [rows] = await pool.query(`
        SELECT i.email, i.password
        FROM inventory i
        JOIN inventory_profiles ip ON i.id = ip.inventory_id
        WHERE ip.id = ?
      `, [profileId]);
      return rows[0];
  }

  /**
   * Finds sales that are active and will expire in a specific number of days.
   * @param {number} days - The number of days from now to check for expiry.
   */
  static async findExpiringSoon(days) {
    const [rows] = await pool.query(`
        SELECT 
            s.id,
            s.end_date,
            c.id as client_id,
            c.full_name as client_name,
            c.email,
            p.product_name
        FROM sales s
        JOIN clients c ON s.client_id = c.id
        JOIN inventory_profiles ip ON s.profile_id = ip.id
        JOIN inventory i ON ip.inventory_id = i.id
        JOIN products p ON i.product_id = p.id
        WHERE s.status = 'active' AND s.end_date = DATE_ADD(CURDATE(), INTERVAL ? DAY)
    `, [days]);
    return rows;
  }
}

export default Sale;
