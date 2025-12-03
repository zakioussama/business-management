import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Card } from '../components/ui/Card';
import { dashboardService, saleService, ticketService } from '../lib/api/services';
import type {
  AdminDashboardData,
  AgentDashboardData,
  Sale,
  SupervisorDashboardData,
  Ticket,
} from '../types';
import { Link } from 'react-router-dom';
import { ArrowRight, TrendingUp, DollarSign, Users } from 'lucide-react';

export function Dashboard() {
  const { user } = useAuth();
  const [adminData, setAdminData] = useState<AdminDashboardData | null>(null);
  const [supervisorData, setSupervisorData] = useState<SupervisorDashboardData | null>(null);
  const [agentData, setAgentData] = useState<AgentDashboardData | null>(null);

  // For client dashboard
  const [sales, setSales] = useState<Sale[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      setLoading(true);
      try {
        switch (user.role) {
          case 'admin':
            setAdminData(await dashboardService.getAdminDashboard());
            break;
          case 'supervisor':
            setSupervisorData(await dashboardService.getSupervisorDashboard());
            break;
          case 'agent':
            setAgentData(await dashboardService.getAgentDashboard());
            break;
          case 'client':
            // Client dashboard data is fetched separately
            const [salesData, ticketsData] = await Promise.all([
              saleService.getAll(),
              ticketService.getAll(),
            ]);
            setSales(salesData.filter((s) => s.clientId === user.id));
            setTickets(ticketsData.filter((t) => t.createdBy === user.id));
            break;
        }
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user]);

  if (loading) {
    return <div className="text-center text-gray-500">Loading dashboard...</div>;
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Loading user data...</p>
        </div>
      </div>
    );
  }

  if (user.role === 'admin' && adminData) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">System overview and metrics</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  ${(adminData.totalRevenue || 0).toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-primary-100 rounded-lg">
                <DollarSign className="text-primary-600" size={24} />
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Sales</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{adminData.totalSales}</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Open Tickets</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{adminData.openTickets}</p>
              </div>
              <div className="p-3 bg-accent-100 rounded-lg">
                <Users className="text-accent-600" size={24} />
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">System Health</p>
                <p className="text-2xl font-bold text-status-600 mt-1">
                  {adminData.systemHealth?.dbStatus || 'Unknown'}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (user.role === 'supervisor' && supervisorData) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Supervisor Dashboard</h1>
          <p className="text-gray-600 mt-1">Team performance and overview</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <p className="text-sm text-gray-600">Team Revenue</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              ${(supervisorData.teamRevenue || 0).toLocaleString()}
            </p>
          </Card>
          <Card>
            <p className="text-sm text-gray-600">Team Sales</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{supervisorData.teamSalesCount}</p>
          </Card>
          <Card>
            <p className="text-sm text-gray-600">Open Tickets</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{supervisorData.teamOpenTickets}</p>
          </Card>
        </div>
        <Card title="Agent Performance">
          {supervisorData.agentPerformance.map((agent) => (
            <div key={agent.agentId} className="flex justify-between items-center py-2 border-b">
              <span>{agent.agentName}</span>
              <span className="font-semibold">${(agent.totalRevenue || 0).toLocaleString()}</span>
            </div>
          ))}
        </Card>
      </div>
    );
  }

  if (user.role === 'agent' && agentData) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agent Dashboard</h1>
          <p className="text-gray-600 mt-1">Your sales and tickets overview</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <p className="text-sm text-gray-600">My Revenue</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              ${(agentData.myRevenue || 0).toLocaleString()}
            </p>
          </Card>
          <Card>
            <p className="text-sm text-gray-600">My Sales</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{agentData.mySalesCount}</p>
          </Card>
          <Card>
            <p className="text-sm text-gray-600">My Open Tickets</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{agentData.myOpenTickets}</p>
          </Card>
        </div>
        <Card title="Expiring Soon">
          <p>{agentData.expiringSoonCount} sales are expiring soon.</p>
          <Link to="/sales" className="mt-4 text-sm text-primary-600 flex items-center gap-1">
            View all <ArrowRight size={16} />
          </Link>
        </Card>
      </div>
    );
  }

  // Client dashboard
  if (user.role === 'client') {
    const today = new Date();
    const activeSales = sales.filter((s) => s.status === 'active');
    const pendingRenewals = sales.filter((s) => {
      const endDate = new Date(s.endDate);
      const daysUntilExpiry = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
    });
    const openTickets = tickets.filter(
      (t) => t.status === 'open' || t.status === 'in_progress'
    );

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Client Portal</h1>
          <p className="text-gray-600 mt-1">Your account overview</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <p className="text-sm text-gray-600">My Active Sales</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{activeSales.length}</p>
            <Link to="/sales" className="mt-4 text-sm text-primary-600 flex items-center gap-1">
              View all <ArrowRight size={16} />
            </Link>
          </Card>
          <Card>
            <p className="text-sm text-gray-600">Pending Renewals</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{pendingRenewals.length}</p>
          </Card>
          <Card>
            <p className="text-sm text-gray-600">Open Tickets</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{openTickets.length}</p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center text-gray-500">
      No dashboard data available for your role.
    </div>
  );
}

