import pool from '../config/database.js';

class Ticket {
  static async create({ userId, clientId, type, priority, description }) {
    const [result] = await pool.query(
      'INSERT INTO tickets (user_id, client_id, type, priority, description, status) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, clientId, type, priority, description, 'open']
    );
    return { id: result.insertId };
  }

  static async findAll() {
    const [rows] = await pool.query(`
        SELECT 
            t.id, t.status, t.priority, t.type, t.created_at,
            creator.username AS created_by,
            assignee.username AS assigned_to,
            c.full_name AS client_name
        FROM tickets t
        JOIN users creator ON t.user_id = creator.id
        LEFT JOIN users assignee ON t.assigned_to = assignee.id
        LEFT JOIN clients c ON t.client_id = c.id
        ORDER BY t.updated_at DESC
    `);
    return rows;
  }
  
  static async findByCreator(userId) {
     const [rows] = await pool.query(`
        SELECT 
            t.id, t.status, t.priority, t.type, t.created_at,
            assignee.username AS assigned_to,
            c.full_name AS client_name
        FROM tickets t
        LEFT JOIN users assignee ON t.assigned_to = assignee.id
        LEFT JOIN clients c ON t.client_id = c.id
        WHERE t.user_id = ?
        ORDER BY t.updated_at DESC
    `, [userId]);
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.query(`
        SELECT 
            t.*,
            creator.username AS created_by,
            assignee.username AS assigned_to,
            c.full_name AS client_name
        FROM tickets t
        JOIN users creator ON t.user_id = creator.id
        LEFT JOIN users assignee ON t.assigned_to = assignee.id
        LEFT JOIN clients c ON t.client_id = c.id
    ORDER BY t.updated_at DESC
    `, [id]);
    return rows[0];
  }

  static async findByClientId(clientId) {
     const [rows] = await pool.query(`
        SELECT 
            t.id, t.status, t.priority, t.type, t.description, t.created_at, t.updated_at,
            assignee.username AS assigned_to
        FROM tickets t
        LEFT JOIN users assignee ON t.assigned_to = assignee.id
        WHERE t.client_id = ?
        ORDER BY t.updated_at DESC
    `, [clientId]);
    return rows;
  }

  static async assign(id, assignedTo) {
    const [result] = await pool.query(
      "UPDATE tickets SET assigned_to = ?, status = 'assigned' WHERE id = ?",
      [assignedTo, id]
    );
    return result.affectedRows > 0;
  }

  static async updateStatus(id, status) {
    const [result] = await pool.query(
      'UPDATE tickets SET status = ? WHERE id = ?',
      [status, id]
    );
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await pool.query('DELETE FROM tickets WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}

export default Ticket;
