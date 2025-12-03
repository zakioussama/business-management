import pool from '../config/database.js';

class Attendance {
  static async create({ agent_id, date, status, comments }) {
    const [result] = await pool.query(
      'INSERT INTO agent_attendance (agent_id, date, status, comments) VALUES (?, ?, ?, ?)',
      [agent_id, date, status, comments]
    );
    return { id: result.insertId, agent_id, date, status };
  }

  static async findAll() {
    const [rows] = await pool.query('SELECT * FROM agent_attendance ORDER BY date DESC');
    return rows;
  }
}

export default Attendance;
