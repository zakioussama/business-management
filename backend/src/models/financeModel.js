import pool from '../config/database.js';

class Finance {
  /**
   * Creates a new financial movement. Can be used within a transaction.
   * @param {object} movementData - { type, amount, source, reference_id, description, createdBy, connection? }
   */
  static async createMovement({ type, amount, source, reference_id, description, createdBy, connection }) {
    const queryable = connection || pool; // Use transaction connection if provided
    const [result] = await queryable.query(
      'INSERT INTO finance_movements (type, amount, source, reference_id, description, created_by) VALUES (?, ?, ?, ?, ?, ?)',
      [type, amount, source, reference_id, description, createdBy]
    );
    return { id: result.insertId };
  }

  static async getIncomeVsExpenses({ startDate, endDate }) {
    const [rows] = await pool.query(
      `SELECT
         type,
         SUM(amount) as total
       FROM finance_movements
       WHERE created_at BETWEEN ? AND ?
       GROUP BY type`,
      [startDate, endDate]
    );
    return rows;
  }
  static async getProductProfitability() {
    const [rows] = await pool.query(
        `SELECT 
            p.product_name,
            SUM(sa.price - p.cost) as total_profit
         FROM sales s
         JOIN sales_attributes sa ON s.sales_attribute_id = sa.id
         JOIN products p ON sa.product_id = p.id
         GROUP BY p.product_name
         ORDER BY total_profit DESC`
    );
    return rows;
  }
  
  static async getDashboardData() {
    const [totals] = await pool.query(
      `SELECT
        (SELECT SUM(amount) FROM finance_movements WHERE type = 'INCOME') as total_income,
        (SELECT SUM(amount) FROM finance_movements WHERE type = 'EXPENSE') as total_expenses
      `
    );

    const [incomePerDay] = await pool.query(
      `SELECT DATE(created_at) as date, SUM(amount) as total
       FROM finance_movements
       WHERE type = 'INCOME'
       GROUP BY DATE(created_at)
       ORDER BY date DESC
       LIMIT 30`
    );

    const [expensesPerDay] = await pool.query(
      `SELECT DATE(created_at) as date, SUM(amount) as total
       FROM finance_movements
       WHERE type = 'EXPENSE'
       GROUP BY DATE(created_at)
       ORDER BY date DESC
       LIMIT 30`
    );
    
    const productProfitability = await this.getProductProfitability();

    const [roleRevenue] = await pool.query(
        `SELECT
            u.role,
            SUM(sa.price) as total_revenue
         FROM sales s
         JOIN users u ON s.agent_id = u.id
         JOIN sales_attributes sa ON s.sales_attribute_id = sa.id
         WHERE u.role IN ('supervisor', 'agent')
         GROUP BY u.role`
    );

    return {
        total_income: totals[0].total_income || 0,
        total_expenses: totals[0].total_expenses || 0,
        net_profit: (totals[0].total_income || 0) - (totals[0].total_expenses || 0),
        income_per_day: incomePerDay,
        expenses_per_day: expensesPerDay,
        most_profitable_product: productProfitability[0] || null,
        least_profitable_product: productProfitability[productProfitability.length - 1] || null,
        role_revenue_comparison: roleRevenue
    }
  }
}

export default Finance;
