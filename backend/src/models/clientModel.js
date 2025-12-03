import pool from '../config/database.js';

class Client {
  static async create({ fullName, phone, email, notes, createdBy, userId, connection }) {
    const queryable = connection || pool;
    const [result] = await queryable.query(
      'INSERT INTO clients (full_name, phone, email, notes, created_by, user_id) VALUES (?, ?, ?, ?, ?, ?)',
      [fullName, phone, email, notes, createdBy, userId]
    );
    return { id: result.insertId, fullName, phone, email, notes, createdBy, userId };
  }

  static async findAll() {
    const [rows] = await pool.query('SELECT * FROM clients');
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.query('SELECT * FROM clients WHERE id = ?', [id]);
    return rows[0];
  }

  static async findByUserId(userId) {
    const [rows] = await pool.query('SELECT * FROM clients WHERE user_id = ?', [userId]);
    return rows[0];
  }

  static async update(id, { fullName, phone, email, notes }) {
    const [result] = await pool.query(
      'UPDATE clients SET full_name = ?, phone = ?, email = ?, notes = ? WHERE id = ?',
      [fullName, phone, email, notes, id]
    );
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await pool.query('DELETE FROM clients WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  // --- Reporting Methods ---

  /**
   * Finds clients with at least one 'expired' sale.
   */
  static async findDebtors() {
    const [rows] = await pool.query(`
        SELECT DISTINCT
            c.id,
            c.full_name,
            c.phone,
            c.email
        FROM clients c
        JOIN sales s ON c.id = s.client_id
        WHERE s.status = 'expired'
    `);
    return rows;
  }

  /**
   * Finds the oldest clients based on their creation date.
   * @param {number} limit - The number of clients to return.
   */
  static async findOldest(limit = 10) {
    const [rows] = await pool.query(
      'SELECT id, full_name, phone, email, created_at FROM clients ORDER BY created_at ASC LIMIT ?',
      [limit]
    );
    return rows;
  }
}

export default Client;
