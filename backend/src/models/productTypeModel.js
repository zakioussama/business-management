import pool from '../config/database.js';

class ProductType {
  static async create({ name }) {
    const [result] = await pool.query(
      'INSERT INTO product_types (name) VALUES (?)',
      [name]
    );
    return { id: result.insertId, name };
  }

  static async findAll() {
    const [rows] = await pool.query('SELECT * FROM product_types');
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.query('SELECT * FROM product_types WHERE id = ?', [id]);
    return rows[0];
  }

  static async update(id, { name }) {
    const [result] = await pool.query(
      'UPDATE product_types SET name = ? WHERE id = ?',
      [name, id]
    );
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await pool.query('DELETE FROM product_types WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}

export default ProductType;
