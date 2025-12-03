import pool from '../config/database.js';

class Cashbox {
  /**
   * Adds or removes an amount from the cashbox.
   * @param {object} movementData - { amount, movement_type, description, createdBy }
   */
  static async logMovement({ amount, movementType, description, createdBy }) {
    const [result] = await pool.query(
      'INSERT INTO cashbox (amount, movement_type, description, created_by) VALUES (?, ?, ?, ?)',
      [amount, movementType, description, createdBy]
    );
    return { id: result.insertId };
  }

  /**
   * Gets the entire history of cashbox movements.
   */
  static async getHistory() {
    const [rows] = await pool.query(`
        SELECT c.id, c.amount, c.movement_type, c.description, c.created_at, u.username as created_by
        FROM cashbox c
        JOIN users u ON c.created_by = u.id
        ORDER BY c.created_at DESC
    `);
    return rows;
  }

  /**
   * Calculates the current balance of the cashbox.
   */
  static async getBalance() {
    const [result] = await pool.query(
      `SELECT SUM(CASE WHEN movement_type = 'ADD' THEN amount ELSE -amount END) as current_balance
       FROM cashbox`
    );
    return result[0].current_balance || 0;
  }
}

export default Cashbox;
