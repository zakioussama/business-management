import type {
  User,
  Client,
  Supplier,
  ProductType,
  Product,
  InventoryAccount,
  InventoryProfile,
  Sale,
  Ticket,
  Notification,
  AuditEntry,
  FinanceData,
  PerformanceData,
} from '../types';
import { SALE_STATUS, TICKET_STATUS, TICKET_PRIORITY, INVENTORY_STATUS } from '../utils/constants';

// Users
export const sampleUsers: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Supervisor User',
    email: 'supervisor@example.com',
    role: 'supervisor',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '3',
    name: 'Agent User',
    email: 'agent@example.com',
    role: 'agent',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '4',
    name: 'Client User',
    email: 'client@example.com',
    role: 'client',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

// Clients
export const sampleClients: Client[] = [
  {
    id: '1',
    name: 'Acme Corporation',
    email: 'contact@acme.com',
    phone: '+1234567890',
    address: '123 Business St, City, State 12345',
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
  },
  {
    id: '2',
    name: 'Tech Solutions Inc',
    email: 'info@techsolutions.com',
    phone: '+1234567891',
    address: '456 Tech Ave, City, State 12345',
    createdAt: '2024-02-01T00:00:00Z',
    updatedAt: '2024-02-01T00:00:00Z',
  },
  {
    id: '3',
    name: 'Global Enterprises',
    email: 'hello@global.com',
    phone: '+1234567892',
    address: '789 Global Blvd, City, State 12345',
    createdAt: '2024-02-15T00:00:00Z',
    updatedAt: '2024-02-15T00:00:00Z',
  },
];

// Suppliers
export const sampleSuppliers: Supplier[] = [
  {
    id: '1',
    name: 'Supplier One',
    contactEmail: 'contact@supplier1.com',
    contactPhone: '+1987654321',
    address: '100 Supplier Lane',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Supplier Two',
    contactEmail: 'info@supplier2.com',
    contactPhone: '+1987654322',
    address: '200 Supplier Road',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

// Product Types
export const sampleProductTypes: ProductType[] = [
  { id: '1', name: 'Hosting', description: 'Web hosting services' },
  { id: '2', name: 'Domain', description: 'Domain registration' },
  { id: '3', name: 'SSL Certificate', description: 'SSL security certificates' },
];

// Products
export const sampleProducts: Product[] = [
  {
    id: '1',
    productTypeId: '1',
    productType: sampleProductTypes[0],
    name: 'Basic Hosting',
    description: 'Basic web hosting plan',
    duration: 12,
    capacity: '10GB',
    renewable: true,
    warranty: 6,
    cost: 50,
    roi: 200,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    productTypeId: '1',
    productType: sampleProductTypes[0],
    name: 'Premium Hosting',
    description: 'Premium web hosting plan',
    duration: 12,
    capacity: '50GB',
    renewable: true,
    warranty: 12,
    cost: 100,
    roi: 300,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '3',
    productTypeId: '2',
    productType: sampleProductTypes[1],
    name: 'Domain Registration',
    description: 'Domain name registration',
    duration: 12,
    renewable: true,
    cost: 15,
    roi: 50,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

// Inventory Accounts and Profiles
const createProfiles = (accountId: string, count: number): InventoryProfile[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `${accountId}-profile-${i + 1}`,
    accountId,
    profileNumber: i + 1,
    status: i === 0 ? INVENTORY_STATUS.OCCUPIED : INVENTORY_STATUS.AVAILABLE,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  }));
};

export const sampleInventoryAccounts: InventoryAccount[] = [
  {
    id: '1',
    accountNumber: 'ACC-001',
    profiles: createProfiles('1', 3),
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    accountNumber: 'ACC-002',
    profiles: createProfiles('2', 2),
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '3',
    accountNumber: 'ACC-003',
    profiles: createProfiles('3', 3),
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

// Sales
export const sampleSales: Sale[] = [
  {
    id: '1',
    clientId: '1',
    client: sampleClients[0],
    productId: '1',
    product: sampleProducts[0],
    inventoryProfileId: '1-profile-1',
    inventoryProfile: sampleInventoryAccounts[0].profiles[0],
    status: SALE_STATUS.ACTIVE,
    startDate: '2024-01-01T00:00:00Z',
    endDate: '2024-12-31T23:59:59Z',
    price: 600,
    history: [
      {
        id: '1',
        saleId: '1',
        action: 'created',
        performedBy: '1',
        timestamp: '2024-01-01T00:00:00Z',
      },
    ],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    clientId: '2',
    client: sampleClients[1],
    productId: '2',
    product: sampleProducts[1],
    inventoryProfileId: '2-profile-1',
    inventoryProfile: sampleInventoryAccounts[1].profiles[0],
    status: SALE_STATUS.ACTIVE,
    startDate: '2024-02-01T00:00:00Z',
    endDate: '2025-01-31T23:59:59Z',
    price: 1200,
    history: [
      {
        id: '2',
        saleId: '2',
        action: 'created',
        performedBy: '1',
        timestamp: '2024-02-01T00:00:00Z',
      },
    ],
    createdAt: '2024-02-01T00:00:00Z',
    updatedAt: '2024-02-01T00:00:00Z',
  },
  {
    id: '3',
    clientId: '1',
    client: sampleClients[0],
    productId: '3',
    product: sampleProducts[2],
    inventoryProfileId: '3-profile-1',
    inventoryProfile: sampleInventoryAccounts[2].profiles[0],
    status: SALE_STATUS.EXPIRED,
    startDate: '2023-01-01T00:00:00Z',
    endDate: '2023-12-31T23:59:59Z',
    price: 180,
    history: [
      {
        id: '3',
        saleId: '3',
        action: 'created',
        performedBy: '1',
        timestamp: '2023-01-01T00:00:00Z',
      },
      {
        id: '4',
        saleId: '3',
        action: 'expired',
        performedBy: 'system',
        timestamp: '2024-01-01T00:00:00Z',
      },
    ],
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

// Tickets
export const sampleTickets: Ticket[] = [
  {
    id: '1',
    title: 'Account Request - New Client',
    description: 'New client requesting account setup',
    type: 'account_request',
    status: TICKET_STATUS.OPEN,
    priority: TICKET_PRIORITY.HIGH,
    createdBy: '3',
    createdByUser: sampleUsers[2],
    assignedTo: '3',
    assignedToUser: sampleUsers[2],
    createdAt: '2024-03-01T00:00:00Z',
    updatedAt: '2024-03-01T00:00:00Z',
  },
  {
    id: '2',
    title: 'Account Issue - Downtime',
    description: 'Client reporting account downtime',
    type: 'account_report',
    status: TICKET_STATUS.IN_PROGRESS,
    priority: TICKET_PRIORITY.CRITICAL,
    createdBy: '4',
    createdByUser: sampleUsers[3],
    assignedTo: '3',
    assignedToUser: sampleUsers[2],
    createdAt: '2024-03-02T00:00:00Z',
    updatedAt: '2024-03-02T00:00:00Z',
  },
  {
    id: '3',
    title: 'Account Request - Upgrade',
    description: 'Client requesting account upgrade',
    type: 'account_request',
    status: TICKET_STATUS.RESOLVED,
    priority: TICKET_PRIORITY.MEDIUM,
    createdBy: '4',
    createdByUser: sampleUsers[3],
    assignedTo: '3',
    assignedToUser: sampleUsers[2],
    createdAt: '2024-02-28T00:00:00Z',
    updatedAt: '2024-03-01T00:00:00Z',
  },
];

// Notifications
export const sampleNotifications: Notification[] = [
  {
    id: '1',
    userId: '3',
    title: 'New Sale Created',
    message: 'A new sale has been created for Acme Corporation',
    type: 'success',
    read: false,
    link: '/sales/1',
    createdAt: '2024-03-01T10:00:00Z',
  },
  {
    id: '2',
    userId: '3',
    title: 'Ticket Assigned',
    message: 'You have been assigned to ticket #2',
    type: 'info',
    read: false,
    link: '/kanban',
    createdAt: '2024-03-02T08:00:00Z',
  },
  {
    id: '3',
    userId: '2',
    title: 'Sale Expiring Soon',
    message: 'Sale #1 is expiring in 7 days',
    type: 'warning',
    read: true,
    link: '/sales/1',
    createdAt: '2024-03-20T00:00:00Z',
  },
];

// Audit Entries
export const sampleAuditEntries: AuditEntry[] = [
  {
    id: '1',
    userId: '1',
    user: sampleUsers[0],
    action: 'sale.created',
    targetType: 'sale',
    targetId: '1',
    details: { clientId: '1', productId: '1' },
    timestamp: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    userId: '1',
    user: sampleUsers[0],
    action: 'sale.created',
    targetType: 'sale',
    targetId: '2',
    details: { clientId: '2', productId: '2' },
    timestamp: '2024-02-01T00:00:00Z',
  },
  {
    id: '3',
    userId: '3',
    user: sampleUsers[2],
    action: 'ticket.created',
    targetType: 'ticket',
    targetId: '1',
    details: { type: 'account_request' },
    timestamp: '2024-03-01T00:00:00Z',
  },
];

// Finance Data
export const sampleFinanceData: FinanceData[] = [
  { revenue: 50000, expenses: 30000, profit: 20000, period: '2024-01' },
  { revenue: 55000, expenses: 32000, profit: 23000, period: '2024-02' },
  { revenue: 60000, expenses: 35000, profit: 25000, period: '2024-03' },
];

// Performance Data
export const samplePerformanceData: PerformanceData[] = [
  {
    userId: '3',
    userName: 'Agent User',
    salesCount: 5,
    revenue: 3000,
    period: '2024-03',
  },
  {
    userId: '2',
    userName: 'Supervisor User',
    salesCount: 3,
    revenue: 2000,
    period: '2024-03',
  },
];

