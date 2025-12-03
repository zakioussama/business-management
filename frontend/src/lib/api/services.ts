import { apiClient } from './client';
import type {
  User,
  Client,
  Supplier,
  Product,
  InventoryAccount,
  Sale,
  Ticket,
  Notification,
  AuditEntry,
  FinanceToday,
  ProfitabilityReport,
  Attendance,
  WebhookConfig,
  AdminDashboardData,
  SupervisorDashboardData,
  AgentDashboardData,
  SalesAttribute,
} from '../../types';

// Helper to transform backend user to frontend user
const transformUser = (backendUser: any): User => {
  return {
    id: String(backendUser.id),
    name: backendUser.username || backendUser.name || 'User',
    email: backendUser.email || backendUser.username || '',
    role: backendUser.role,
    createdAt: backendUser.created_at || backendUser.createdAt || new Date().toISOString(),
    updatedAt: backendUser.updated_at || backendUser.updatedAt || new Date().toISOString(),
  };
};

// Helper to transform backend client to frontend client
const transformClient = (backendClient: any): Client => {
  return {
    id: String(backendClient.id),
    name: backendClient.full_name || backendClient.name,
    email: backendClient.email || '',
    phone: backendClient.phone,
    address: backendClient.notes,
    createdAt: backendClient.created_at || backendClient.createdAt || new Date().toISOString(),
    updatedAt: backendClient.updated_at || backendClient.updatedAt || new Date().toISOString(),
  };
};

// AUTH SERVICE
export const authService = {
  async login(username: string, password: string): Promise<{ token: string; user: User }> {
    const response = await apiClient.post<{ token: string; user: { id: number; username: string; role: string } }>(
      '/auth/login',
      { username, password }
    );
    const user = transformUser(response.user);
    apiClient.setToken(response.token);
    return { token: response.token, user };
  },

  async register(data: {
    username: string;
    password: string;
    role: string;
    fullName: string;
    phone: string;
    email: string;
  }): Promise<{ token: string; user: User }> {
    await apiClient.post<{ userId: number }>('/auth/register', data);
    // After registration, login to get token
    const loginResponse = await this.login(data.username, data.password);
    return loginResponse;
  },
};

// USERS SERVICE
export const userService = {
  async getAll(): Promise<User[]> {
    const users = await apiClient.get<any[]>('/users');
    return users.map(transformUser);
  },

  async getById(id: string): Promise<User> {
    const user = await apiClient.get<any>(`/users/${id}`);
    return transformUser(user);
  },
};

// CLIENTS SERVICE
export const clientService = {
  async getAll(): Promise<Client[]> {
    const clients = await apiClient.get<any[]>('/clients');
    return clients.map(transformClient);
  },

  async getById(id: string): Promise<Client> {
    const client = await apiClient.get<any>(`/clients/${id}`);
    return transformClient(client);
  },

  async create(data: { name: string; phone: string; email?: string; address?: string }): Promise<Client> {
    const payload = { fullName: data.name, phone: data.phone, email: data.email, notes: data.address };
    const client = await apiClient.post<any>('/clients', payload);
    return transformClient(client);
  },

  async update(id: string, data: { name?: string; phone?: string; email?: string; address?: string }): Promise<Client> {
    const payload = { fullName: data.name, phone: data.phone, email: data.email, notes: data.address };
    const client = await apiClient.put<any>(`/clients/${id}`, payload);
    return transformClient(client);
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/clients/${id}`);
  },
};

// SUPPLIERS SERVICE
export const supplierService = {
  async getAll(): Promise<Supplier[]> {
    const suppliers = await apiClient.get<any[]>('/suppliers');
    return suppliers.map((s: any) => ({
      id: String(s.id),
      name: s.name,
      contactEmail: s.contact,
      address: s.notes,
      createdAt: s.created_at || s.createdAt || new Date().toISOString(),
      updatedAt: s.updated_at || s.updatedAt || new Date().toISOString(),
    }));
  },

  async create(data: { name: string; contact?: string; notes?: string }): Promise<Supplier> {
    const supplier = await apiClient.post<any>('/suppliers', data);
    return {
      id: String(supplier.id),
      name: supplier.name,
      contactEmail: supplier.contact,
      createdAt: supplier.created_at || new Date().toISOString(),
      updatedAt: supplier.updated_at || new Date().toISOString(),
    };
  },
};

// PRODUCTS SERVICE
export const productService = {
  async getAll(): Promise<Product[]> {
    const products = await apiClient.get<any[]>('/products');
    return products.map((p: any) => ({
      id: String(p.id),
      name: p.name,
      type: p.type,
      description: p.description,
      ownership: p.ownership,
      renewable: Boolean(p.renewable),
      warranty: Boolean(p.warranty),
      cost: p.cost || 0,
      roi: p.roi,
      salesAttributes: p.sales_attributes || [],
      createdAt: p.created_at || p.createdAt || new Date().toISOString(),
      updatedAt: p.updated_at || p.updatedAt || new Date().toISOString(),
    }));
  },

  async getById(id: string): Promise<Product> {
    const p = await apiClient.get<any>(`/products/${id}`);
    return {
      id: String(p.id),
      name: p.name,
      type: p.type,
      description: p.description,
      ownership: p.ownership,
      renewable: Boolean(p.renewable),
      warranty: Boolean(p.warranty),
      cost: p.cost || 0,
      roi: p.roi,
      salesAttributes: p.sales_attributes || [],
      createdAt: p.created_at || p.createdAt || new Date().toISOString(),
      updatedAt: p.updated_at || p.updatedAt || new Date().toISOString(),
    };
  },

  async create(data: Partial<Product>): Promise<Product> {
    const product = await apiClient.post<any>('/products', data);
    return this.getById(String(product.id));
  },
};

// SALES ATTRIBUTES SERVICE
export const salesAttributeService = {
  async getByProductId(productId: string): Promise<SalesAttribute[]> {
    const attributes = await apiClient.get<any[]>(`/sales-attributes/product/${productId}`);
    return attributes;
  },
};

// INVENTORY SERVICE
export const inventoryService = {
  async getAccounts(): Promise<InventoryAccount[]> {
    const accounts = await apiClient.get<any[]>('/inventory/accounts');
    return accounts.map((acc: any) => ({
      id: String(acc.id),
      accountNumber: acc.email || acc.account_number || String(acc.id),
      profiles: acc.profiles || [],
      createdAt: acc.created_at || acc.createdAt || new Date().toISOString(),
      updatedAt: acc.updated_at || acc.updatedAt || new Date().toISOString(),
    }));
  },

  async createAccount(data: { productId: number; email: string; password: string; status: string }): Promise<InventoryAccount> {
    const account = await apiClient.post<any>('/inventory/accounts', data);
    return {
      id: String(account.id),
      accountNumber: account.email || String(account.id),
      profiles: account.profiles || [],
      createdAt: account.created_at || new Date().toISOString(),
      updatedAt: account.updated_at || new Date().toISOString(),
    };
  },

  async getProfiles(): Promise<any[]> {
    const profiles = await apiClient.get<any[]>('/inventory/profiles');
    return profiles.map((p: any) => ({
      id: String(p.id),
      accountId: String(p.account_id),
      profileNumber: p.profile_number || p.profileNumber || 1,
      status: p.status,
      createdAt: p.created_at || p.createdAt || new Date().toISOString(),
      updatedAt: p.updated_at || p.updatedAt || new Date().toISOString(),
    }));
  },
};

// SALES SERVICE
export const saleService = {
  async getAll(): Promise<Sale[]> {
    const sales = await apiClient.get<any[]>('/sales');
    return sales.map((s: any) => ({
      id: String(s.id),
      clientId: String(s.client_id),
      client: s.client ? transformClient(s.client) : undefined,
      salesAttributeId: String(s.sales_attribute_id),
      salesAttribute: s.sales_attribute,
      product: s.product,
      inventoryProfileId: String(s.inventory_profile_id),
      status: s.status || 'active',
      startDate: s.start_date || s.startDate,
      endDate: s.end_date || s.endDate,
      price: s.price || (s.sales_attribute ? s.sales_attribute.price : 0),
      history: s.history || [],
      createdAt: s.created_at || s.createdAt || new Date().toISOString(),
      updatedAt: s.updated_at || s.updatedAt || new Date().toISOString(),
    }));
  },

  async getById(id: string): Promise<Sale> {
    const s = await apiClient.get<any>(`/sales/${id}`);
    return {
      id: String(s.id),
      clientId: String(s.client_id),
      client: s.client ? transformClient(s.client) : undefined,
      salesAttributeId: String(s.sales_attribute_id),
      salesAttribute: s.sales_attribute,
      product: s.product,
      inventoryProfileId: String(s.inventory_profile_id),
      status: s.status || 'active',
      startDate: s.start_date || s.startDate,
      endDate: s.end_date || s.endDate,
      price: s.price || (s.sales_attribute ? s.sales_attribute.price : 0),
      history: s.history || [],
      createdAt: s.created_at || s.createdAt || new Date().toISOString(),
      updatedAt: s.updated_at || s.updatedAt || new Date().toISOString(),
    };
  },

  async create(data: { clientId: string; salesAttributeId: string; startDate: string }): Promise<Sale> {
    const response = await apiClient.post<any>('/sales', data);
    return this.getById(String(response.id));
  },

  async renew(id: string): Promise<Sale> {
    const sale = await apiClient.put<any>(`/sales/${id}/renew`);
    return this.getById(id);
  },

  async reactivate(id: string): Promise<Sale> {
    const sale = await apiClient.post<any>(`/sales/${id}/reactivate`);
    return this.getById(id);
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/sales/${id}`);
  },
};

// TICKETS SERVICE
export const ticketService = {
  async getAll(): Promise<Ticket[]> {
    const tickets = await apiClient.get<any[]>('/tickets');
    return tickets.map((t: any) => ({
      id: String(t.id),
      title: t.title || `Ticket #${t.id}`,
      description: t.description || '',
      type: t.type === 'issue' ? 'account_report' : 'account_request',
      status: t.status || 'open',
      priority: (t.priority || 'medium') as any,
      createdBy: String(t.created_by || t.user_id),
      assignedTo: t.assigned_to ? String(t.assigned_to) : undefined,
      createdAt: t.created_at || t.createdAt || new Date().toISOString(),
      updatedAt: t.updated_at || t.updated_at || new Date().toISOString(),
    }));
  },

  async getById(id: string): Promise<Ticket> {
    const ticket = await apiClient.get<any>(`/tickets/${id}`);
    return {
      id: String(ticket.id),
      title: ticket.title || `Ticket #${ticket.id}`,
      description: ticket.description || '',
      type: ticket.type === 'issue' ? 'account_report' : 'account_request',
      status: ticket.status || 'open',
      priority: (ticket.priority || 'medium') as any,
      createdBy: String(ticket.created_by || ticket.user_id),
      assignedTo: ticket.assigned_to ? String(ticket.assigned_to) : undefined,
      createdAt: ticket.created_at || ticket.createdAt || new Date().toISOString(),
      updatedAt: ticket.updated_at || ticket.updatedAt || new Date().toISOString(),
    };
  },

  async create(data: { clientId?: number; title: string; type: string; priority?: string; description: string }): Promise<Ticket> {
    const response = await apiClient.post<{ ticketId: number }>('/tickets', {
      clientId: data.clientId,
      title: data.title,
      type: data.type === 'account_report' ? 'issue' : 'request_account', // Corrected mapping
      priority: data.priority || 'medium',
      description: data.description,
    });
    return this.getById(String(response.ticketId));
  },

  async assign(id: string, userId: string): Promise<Ticket> {
    await apiClient.put(`/tickets/${id}/assign`, { assignedTo: parseInt(userId, 10) });
    return this.getById(id);
  },

  async updateStatus(id: string, status: Ticket['status']): Promise<Ticket> {
    await apiClient.put(`/tickets/${id}/status`, { status });
    return this.getById(id);
  },
};

// NOTIFICATIONS SERVICE
export const notificationService = {
  async getAll(): Promise<Notification[]> {
    const notifications = await apiClient.get<any[]>('/notifications');
    return notifications.map((n: any) => ({
      id: String(n.id),
      userId: String(n.user_id),
      title: n.title || '',
      message: n.message || n.description || '',
      type: (n.type || 'info') as 'info' | 'success' | 'warning' | 'error',
      read: Boolean(n.is_read || n.read),
      link: n.link,
      createdAt: n.created_at || n.createdAt || new Date().toISOString(),
    }));
  },

  async markAsRead(id: string): Promise<Notification> {
    await apiClient.put(`/notifications/${id}/read`);
    const notifications = await this.getAll();
    const notification = notifications.find((n) => n.id === id);
    if (!notification) throw new Error('Notification not found');
    return notification;
  },
};

// LOGS/AUDIT SERVICE
export const auditService = {
  async getAll(): Promise<AuditEntry[]> {
    // Assuming the endpoint is /audit-logs as per README.md
    const logs = await apiClient.get<any[]>('/audit-logs');
    return logs.map((log: any) => ({
      id: String(log.id),
      userId: String(log.user_id),
      action: log.action_type,
      targetType: log.target_type,
      targetId: String(log.target_id),
      details: {
        before: log.data_before,
        after: log.data_after,
      },
      timestamp: log.timestamp || log.created_at || new Date().toISOString(),
    }));
  },
};

// OFFICE & FINANCE SERVICE
export const officeService = {
  async getFinanceToday(): Promise<FinanceToday> {
    return apiClient.get('/office/finance/today');
  },

  async getProfitabilityReport(): Promise<ProfitabilityReport[]> {
    return apiClient.get('/office/finance/profitability');
  },

  async getAttendance(): Promise<Attendance[]> {
    return apiClient.get('/office/attendance');
  },

  async addAttendance(data: { agent_id: number; date: string; status: string; comments?: string }): Promise<Attendance> {
    return apiClient.post('/office/attendance', data);
  },

  async getPettyCashMovements(): Promise<any[]> {
    return apiClient.get('/office/petty-cash');
  },

  async addPettyCash(data: { amount: number; movementType: 'ADD' | 'WITHDRAW'; description: string }): Promise<any> {
    return apiClient.post('/office/petty-cash', data);
  },
};

// DASHBOARDS SERVICE
export const dashboardService = {
  async getAdminDashboard(): Promise<AdminDashboardData> {
    return apiClient.get('/dashboard/admin');
  },

  async getSupervisorDashboard(): Promise<SupervisorDashboardData> {
    return apiClient.get('/dashboard/supervisor');
  },

  async getAgentDashboard(): Promise<AgentDashboardData> {
    return apiClient.get('/dashboard/agent');
  },
};

// Webhook Services (local storage based - no backend endpoint)
export const webhookService = {
  async getConfigs(): Promise<WebhookConfig[]> {
    const stored = localStorage.getItem('webhook_configs');
    if (stored) {
      return JSON.parse(stored);
    }
    return [];
  },

  async saveConfig(config: WebhookConfig): Promise<WebhookConfig> {
    const configs = await this.getConfigs();
    const index = configs.findIndex((c) => c.id === config.id);
    if (index >= 0) {
      configs[index] = { ...config, updatedAt: new Date().toISOString() };
    } else {
      configs.push(config);
    }
    localStorage.setItem('webhook_configs', JSON.stringify(configs));
    return config;
  },

  async deleteConfig(id: string): Promise<void> {
    const configs = await this.getConfigs();
    const filtered = configs.filter((c) => c.id !== id);
    localStorage.setItem('webhook_configs', JSON.stringify(filtered));
  },

  async testWebhook(endpoint: string, payload: unknown): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      return {
        success: response.ok,
        message: response.ok ? 'Webhook sent successfully' : `Error: ${response.statusText}`,
      };
    } catch (error) {
      return {
        success: false,
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  },
};

// SEARCH SERVICE
export const searchService = {
  async search(query: string): Promise<Array<{ id: string; name: string; type: string }>> {
    if (!query.trim()) {
      return [];
    }
    // This endpoint is not in the postman collection, assuming it exists
    const results = await apiClient.get<any[]>(`/search?q=${encodeURIComponent(query)}`);
    return results.map(r => ({
      id: String(r.id),
      name: r.name,
      type: r.type,
    }));
  }
};
