import pool from '../config/database.js';

class Product {
  static async create({ supplierId, productTypeId, productName, ownership, warranty, cost, roi_target, renewable }) {
    const [result] = await pool.query(
      'INSERT INTO products (supplier_id, product_type_id, product_name, ownership, warranty, cost, roi_target, renewable) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [supplierId, productTypeId, productName, ownership, warranty, cost, roi_target, renewable]
    );
    return { id: result.insertId, supplierId, productName, cost };
  }

  static async findAll() {
    const [rows] = await pool.query(`
        SELECT 
            p.*,
            pt.name as product_type_name,
            s.name as supplier_name
        FROM products p
        LEFT JOIN product_types pt ON p.product_type_id = pt.id
        LEFT JOIN suppliers s ON p.supplier_id = s.id
        ORDER BY p.id DESC
    `);
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
    return rows[0];
  }

  static async update(id, { supplierId, productTypeId, productName, ownership, warranty, cost, roi_target, renewable }) {
    const [result] = await pool.query(
      'UPDATE products SET supplier_id = ?, product_type_id = ?, product_name = ?, ownership = ?, warranty = ?, cost = ?, roi_target = ?, renewable = ? WHERE id = ?',
      [supplierId, productTypeId, productName, ownership, warranty, cost, roi_target, renewable, id]
    );
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await pool.query('DELETE FROM products WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  // Helper to check if a supplier exists
  static async supplierExists(supplierId) {
    const [rows] = await pool.query('SELECT id FROM suppliers WHERE id = ?', [supplierId]);
    return rows.length > 0;
  }

  // Helper to check if a product type exists
  static async productTypeExists(productTypeId) {
    const [rows] = await pool.query('SELECT id FROM product_types WHERE id = ?', [productTypeId]);
    return rows.length > 0;
  }
}

export default Product;
