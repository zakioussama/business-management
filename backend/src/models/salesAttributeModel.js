import pool from '../config/database.js';

class SalesAttribute {
  static async create({ productId, duration_days, capacity, price }) {
    const [result] = await pool.query(
      'INSERT INTO sales_attributes (product_id, duration_days, capacity, price) VALUES (?, ?, ?, ?)',
      [productId, duration_days, capacity, price]
    );
    return { id: result.insertId, productId, duration_days, capacity, price };
  }

  static async findByProductId(productId) {
    const [rows] = await pool.query('SELECT * FROM sales_attributes WHERE product_id = ?', [productId]);
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.query('SELECT * FROM sales_attributes WHERE id = ?', [id]);
    return rows[0];
  }

  static async update(id, { duration_days, capacity, price }) {
    const [result] = await pool.query(
      'UPDATE sales_attributes SET duration_days = ?, capacity = ?, price = ? WHERE id = ?',
      [duration_days, capacity, price, id]
    );
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await pool.query('DELETE FROM sales_attributes WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}

export default SalesAttribute;
