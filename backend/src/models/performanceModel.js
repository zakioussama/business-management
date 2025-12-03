import pool from '../config/database.js';

class Performance {
  /**
   * Logs or updates an agent's daily performance record.
   * Uses ON DUPLICATE KEY UPDATE to avoid conflicts for the same agent on the same day.
   */
  static async logDaily({ agentId, date, salesCount, revenueGenerated, attendance, notes }) {
    const [result] = await pool.query(
      `INSERT INTO agent_performance (agent_id, date, sales_count, revenue_generated, attendance, notes)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
         sales_count = VALUES(sales_count),
         revenue_generated = VALUES(revenue_generated),
         attendance = VALUES(attendance),
         notes = VALUES(notes)
      `,
      [agentId, date, salesCount, revenueGenerated, attendance, notes]
    );
    return { id: result.insertId, affectedRows: result.affectedRows };
  }
  
  /**
   * Gets all performance records for a specific agent.
   */
  static async findByAgent(agentId) {
    const [rows] = await pool.query(
        'SELECT * FROM agent_performance WHERE agent_id = ? ORDER BY date DESC', 
        [agentId]
    );
    return rows;
  }
  
  /**
    * Gets a leaderboard of agents based on revenue and attendance.
    * This is a simplified scoring model.
    */
  static async getLeaderboard() {
      const [rows] = await pool.query(`
        SELECT 
            ap.agent_id,
            u.username as agent_name,
            SUM(ap.revenue_generated) as total_revenue,
            SUM(CASE 
                WHEN ap.attendance = 'PRESENT' THEN 2
                WHEN ap.attendance = 'LATE' THEN 1
                ELSE 0 
            END) as attendance_score,
            (SUM(ap.revenue_generated) * 0.1) + SUM(CASE WHEN ap.attendance = 'PRESENT' THEN 2 WHEN ap.attendance = 'LATE' THEN 1 ELSE 0 END) as overall_score
        FROM agent_performance ap
        JOIN users u ON ap.agent_id = u.id
        GROUP BY ap.agent_id, u.username
        ORDER BY overall_score DESC
      `);
      return rows;
  }
}

export default Performance;
