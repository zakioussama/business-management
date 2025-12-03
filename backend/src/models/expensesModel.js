import pool from '../config/database.js';
import Finance from './financeModel.js'; // Will be used to register the expense as a financial movement

class Expense {
  /**
   * Creates a new expense and registers it as a financial movement in a transaction.
   * @param {object} expenseData - { category, amount, description, createdBy }
   */
  static async create({ category, amount, description, createdBy }) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // 1. Create the expense record
      const [result] = await connection.query(
        'INSERT INTO expenses (category, amount, description, created_by) VALUES (?, ?, ?, ?)',
        [category, amount, description, createdBy]
      );
      const expenseId = result.insertId;

      // 2. Register this as a financial movement
      await Finance.createMovement({
        type: 'EXPENSE',
        amount,
        source: 'OPERATIONAL', // Or map from category
        reference_id: expenseId,
        description: `Expense: ${description}`,
        createdBy,
        connection // Pass the connection to use in the transaction
      });

      await connection.commit();
      return { id: expenseId, category, amount };

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async findAll() {
    const [rows] = await pool.query(`
        SELECT e.id, e.category, e.amount, e.description, e.created_at, u.username as created_by
        FROM expenses e
        JOIN users u ON e.created_by = u.id
        ORDER BY e.created_at DESC
    `);
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.query('SELECT * FROM expenses WHERE id = ?', [id]);
    return rows[0];
  }

  static async delete(id) {
    // Note: Deleting an expense should ideally also reverse the financial movement or be handled carefully.
    // For now, it's a hard delete.
    const [result] = await pool.query('DELETE FROM expenses WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}

export default Expense;
