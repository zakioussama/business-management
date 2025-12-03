import pool from '../config/database.js';

class Supplier {
  static async create({ name, contact, notes }) {
    const [result] = await pool.query(
      'INSERT INTO suppliers (name, contact, notes) VALUES (?, ?, ?)',
      [name, contact, notes]
    );
    return { id: result.insertId, name, contact, notes };
  }

  static async findAll() {
    const [rows] = await pool.query('SELECT * FROM suppliers');
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.query('SELECT * FROM suppliers WHERE id = ?', [id]);
    return rows[0];
  }

  static async update(id, { name, contact, notes }) {
    const [result] = await pool.query(
      'UPDATE suppliers SET name = ?, contact = ?, notes = ? WHERE id = ?',
      [name, contact, notes, id]
    );
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await pool.query('DELETE FROM suppliers WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}

export default Supplier;
