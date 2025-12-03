import pool from '../config/database.js';

class Dashboard {
  /**
   * Fetches all KPIs for the Agent Dashboard.
   * @param {number} agentId - The ID of the agent.
   */
  static async getAgentStats(agentId) {
    const queries = [
      // 1. Sales expiring today for this agent
      pool.query("SELECT COUNT(*) as count FROM sales WHERE end_date = CURDATE() AND agent_id = ?", [agentId]),
      // 2. Open support tickets created by this agent
      pool.query("SELECT COUNT(*) as count FROM tickets WHERE status != 'closed' AND user_id = ?", [agentId]),
      // 3. New sales made today by this agent (list view)
      pool.query("SELECT s.id, c.full_name as client_name, sa.price FROM sales s JOIN clients c ON s.client_id = c.id JOIN sales_attributes sa ON s.sales_attribute_id = sa.id WHERE DATE(s.created_at) = CURDATE() AND s.agent_id = ?", [agentId]),
      // 4. Pending account requests created by this agent
      pool.query("SELECT COUNT(*) as count FROM tickets WHERE type = 'request_account' AND status != 'closed' AND user_id = ?", [agentId])
    ];

    const results = await Promise.all(queries.map(p => p.catch(e => e)));
    const [salesExpiring, openTickets, newSales, pendingRequests] = results;

    return {
      sales_expiring_today: salesExpiring[0][0].count || 0,
      open_support_tickets: openTickets[0][0].count || 0,
      new_sales_today: newSales[0],
      pending_account_requests: pendingRequests[0][0].count || 0
    };
  }

  /**
   * Fetches all KPIs for the Supervisor Dashboard.
   */
  static async getSupervisorStats() {
    const queries = [
        // 1. Pending agent account requests
        pool.query("SELECT COUNT(*) as count FROM tickets WHERE type = 'request_account' AND status != 'closed'"),
        // 2. Team performance summary for today
        pool.query("SELECT COUNT(DISTINCT agent_id) as active_agents, AVG(sales_count) as avg_sales_per_agent, SUM(revenue_generated) as total_revenue_today FROM agent_performance WHERE date = CURDATE()"),
        // 3. Income vs. expenses for the day
        pool.query("SELECT SUM(CASE WHEN type = 'INCOME' THEN amount ELSE 0 END) as income_today, SUM(CASE WHEN type = 'EXPENSE' THEN amount ELSE 0 END) as expenses_today FROM finance_movements WHERE DATE(created_at) = CURDATE()"),
        // 4. Critical open tickets
        pool.query("SELECT COUNT(*) as count FROM tickets WHERE priority = 'high' AND status != 'closed'")
    ];

    const results = await Promise.all(queries.map(p => p.catch(e => e)));
    const [pendingRequests, teamPerf, todayFinance, criticalTickets] = results;

    return {
      pending_agent_account_requests: pendingRequests[0][0].count || 0,
      team_performance_summary: teamPerf[0][0],
      income_vs_expenses_today: todayFinance[0][0],
      critical_tickets_count: criticalTickets[0][0].count || 0,
    };
  }

  /**
   * Fetches all KPIs for the Admin Dashboard.
   */
  static async getAdminStats() {
    // For admin, we can reuse supervisor stats and add more
    const supervisorStats = await this.getSupervisorStats();

    const queries = [
        // 1. System logs summary (e.g., count by action type in the last 24 hours)
        pool.query("SELECT action, COUNT(*) as count FROM audit_logs WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR) GROUP BY action"),
        // 2. Total users
        pool.query("SELECT COUNT(*) as count FROM users"),
        // 3. Inventory health (count of accounts by status)
        pool.query("SELECT status, COUNT(*) as count FROM inventory GROUP BY status"),
        // 4. Overall sales statistics (total volume and revenue)
        pool.query("SELECT COUNT(*) as total_sales_volume, SUM(sa.price) as total_sales_revenue FROM sales s JOIN sales_attributes sa ON s.sales_attribute_id = sa.id")
    ];

    const results = await Promise.all(queries.map(p => p.catch(e => e)));
    const [logsSummary, usersCount, inventoryHealth, salesStats] = results;

    return {
      office_kpis: {
          pending_agent_account_requests: supervisorStats.pending_agent_account_requests,
          team_performance_summary: supervisorStats.team_performance_summary,
          income_vs_expenses_today: supervisorStats.income_vs_expenses_today,
          critical_tickets_count: supervisorStats.critical_tickets_count
      },
      system_logs_summary: logsSummary[0],
      total_users: usersCount[0][0].count || 0,
      inventory_health: inventoryHealth[0],
      sales_statistics: salesStats[0][0]
    };
  }
}

export default Dashboard;
