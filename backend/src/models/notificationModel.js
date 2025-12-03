import pool from '../config/database.js';

class Notification {
  /**
   * Creates a notification for a single user.
   */
  static async create({ userId, title, message, type }) {
    const [result] = await pool.query(
      'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)',
      [userId, title, message, type]
    );
    return { id: result.insertId };
  }
  
  /**
   * Creates notifications for all users with a specific role.
   */
  static async createForRole({ role, title, message, type }) {
    const connection = await pool.getConnection();
    try {
      const [users] = await connection.query('SELECT id FROM users WHERE role = ?', [role]);
      if (users.length === 0) return;

      const notificationData = users.map(user => [user.id, title, message, type]);
      await connection.query(
        'INSERT INTO notifications (user_id, title, message, type) VALUES ?',
        [notificationData]
      );
    } catch (error) {
        console.error(`Failed to create notifications for role '${role}':`, error.message);
    } finally {
      connection.release();
    }
  }

  /**
   * Finds all notifications for a specific user.
   */
  static async findByUser(userId) {
    const [rows] = await pool.query(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    return rows;
  }
  
  /**
   * Finds a single notification by its ID.
   */
  static async findById(id) {
    const [rows] = await pool.query('SELECT * FROM notifications WHERE id = ?', [id]);
    return rows[0];
  }

  /**
   * Marks a single notification as read.
   */
  static async markAsRead(id) {
    const [result] = await pool.query(
      'UPDATE notifications SET `read` = 1 WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }
}

export default Notification;
