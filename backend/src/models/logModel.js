import pool from '../config/database.js';

class Log {
  /**
   * Logs an action performed by a user.
   * @param {number} userId - The ID of the user performing the action.
   * @param {string} action - A short description of the action (e.g., 'TICKET_CREATE').
   * @param {string} details - A JSON string or text with more details about the action.
   */
  static async logAction(userId, action, details = '') {
    try {
      await pool.query(
        'INSERT INTO logs (user_id, action, details) VALUES (?, ?, ?)',
        [userId, action, details]
      );
    } catch (error) {
      // We log the error to the console but don't re-throw it,
      // as a logging failure should not crash the primary application flow.
      console.error('Failed to write to audit log:', error.message);
    }
  }

  static async findAll() {
      const [rows] = await pool.query(`
        SELECT l.id, u.username, l.action, l.details, l.created_at
        FROM logs l
        JOIN users u ON l.user_id = u.id
        ORDER BY l.created_at DESC
      `);
      return rows;
  }
}

export default Log;
