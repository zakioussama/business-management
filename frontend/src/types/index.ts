import type { Role } from '../utils/constants';
import { TICKET_PRIORITY, TICKET_STATUS, SALE_STATUS, INVENTORY_STATUS } from '../utils/constants';

export type { Role };

export interface User {
  id: string;
  name: string;
  fullName?: string;
  email: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductType {
  id: string;
  name: string;
  description?: string;
}

export interface SalesAttribute {
  id: string;
  productId: string;
  price: number;
  duration: number; // in days
  capacity: number;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  type: string;
  description?: string;
  ownership: 'RENTED' | 'OWNED';
  renewable: boolean;
  warranty: boolean;
  cost: number;
  roi?: number;
  salesAttributes?: SalesAttribute[];
  createdAt: string;
  updatedAt: string;
}

export interface InventoryAccount {
  id: string;
  accountNumber: string;
  profiles: InventoryProfile[];
  createdAt: string;
  updatedAt: string;
}

export interface InventoryProfile {
  id: string;
  accountId: string;
  profileNumber: number;
  status: typeof INVENTORY_STATUS[keyof typeof INVENTORY_STATUS];
  createdAt: string;
  updatedAt: string;
}

export interface Sale {
  id: string;
  clientId: string;
  client?: Client;
  salesAttributeId: string;
  salesAttribute?: SalesAttribute;
  inventoryProfileId: string; // Still needed for linking
  product?: Product;
  status: typeof SALE_STATUS[keyof typeof SALE_STATUS];
  startDate: string;
  endDate: string;
  price: number;
  history: SaleHistoryEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface SaleHistoryEntry {
  id: string;
  saleId: string;
  action: string;
  performedBy: string;
  timestamp: string;
  details?: Record<string, unknown>;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  type: 'account_request' | 'account_report';
  status: typeof TICKET_STATUS[keyof typeof TICKET_STATUS];
  priority: typeof TICKET_PRIORITY[keyof typeof TICKET_PRIORITY];
  createdBy: string;
  createdByUser?: User;
  assignedTo?: string;
  assignedToUser?: User;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | string; // Allow for custom types
  read: boolean;
  link?: string;
  createdAt: string;
}

export interface AuditEntry {
  id: string;
  userId: string;
  user?: User;
  action: string;
  targetType: string;
  targetId: string;
  details?: {
    before?: Record<string, unknown>;
    after?: Record<string, unknown>;
  };
  timestamp: string;
}

export interface WebhookConfig {
  id: string;
  endpoint: string;
  events: string[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FinanceToday {
  income: number;
  expenses: number;
  net: number;
}

export interface ProfitabilityReport {
  productId: string;
  productName: string;
  totalRevenue: number;
  totalCost: number;
  profit: number;
}

export interface Attendance {
  id: string;
  agentId: string;
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'ON_LEAVE';
  comments?: string;
}

// Deprecated
export interface FinanceData {
  revenue: number;
  expenses: number;
  profit: number;
  period: string;
}

export interface PerformanceData {
  userId: string;
  userName: string;
  salesCount: number;
  revenue: number;
  period: string;
}

// --- Dashboard Specific Types ---
export interface AdminDashboardData {
  totalUsers: number;
  totalClients: number;
  totalProducts: number;
  totalSales: number;
  totalRevenue: number;
  openTickets: number;
  systemHealth: {
    dbStatus: string;
    uptime: number;
  };
}

export interface SupervisorDashboardData {
  teamSalesCount: number;
  teamRevenue: number;
  teamOpenTickets: number;
  agentPerformance: Array<{
    agentId: string;
    agentName: string;
    salesCount: number;
    totalRevenue: number;
  }>;
  ticketStatusCounts: Record<string, number>;
}

export interface AgentDashboardData {
  mySalesCount: number;
  myRevenue: number;
  myOpenTickets: number;
  expiringSoonCount: number;
  recentSales: Sale[];
  myTickets: Ticket[];
}
