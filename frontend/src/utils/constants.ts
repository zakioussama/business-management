export const API_BASE_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'http://localhost:3000/api';

export type Role = 'admin' | 'supervisor' | 'agent' | 'client';

export const ROLE_PERMISSIONS: Record<Role, string[]> = {
  admin: [
    'dashboard',
    'clients',
    'products',
    'inventory',
    'sales',
    'kanban',
    'office',
    'suppliers',
    'users',
    'settings',
    'playground',
  ],
  supervisor: [
    'dashboard',
    'clients',
    'products',
    'inventory',
    'sales',
    'kanban',
    'office',
    'suppliers',
    'settings',
  ],
  agent: [
    'dashboard',
    'clients',
    'products',
    'inventory',
    'sales',
    'kanban',
    'settings',
  ],
  client: [
    'dashboard',
    'settings',
  ],
};

export const SIDEBAR_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard', path: '/' },
  { id: 'clients', label: 'Clients', icon: 'Users', path: '/clients' },
  { id: 'products', label: 'Products', icon: 'Package', path: '/products' },
  { id: 'inventory', label: 'Inventory', icon: 'Database', path: '/inventory' },
  { id: 'sales', label: 'Sales', icon: 'ShoppingCart', path: '/sales' },
  { id: 'kanban', label: 'Tickets', icon: 'Kanban', path: '/kanban' },
  { id: 'office', label: 'Office', icon: 'Briefcase', path: '/office' },
  { id: 'suppliers', label: 'Suppliers', icon: 'Truck', path: '/suppliers' },
  { id: 'users', label: 'Users', icon: 'UserCog', path: '/users' },
  { id: 'settings', label: 'Settings', icon: 'Settings', path: '/settings' },
  { id: 'playground', label: 'Playground', icon: 'Code', path: '/playground' },
] as const;

export const WEBHOOK_EVENTS = [
  { id: 'sale.created', label: 'Sale Created' },
  { id: 'sale.renewed', label: 'Sale Renewed' },
  { id: 'ticket.created', label: 'Ticket Created' },
] as const;

export const INVENTORY_STATUS = {
  AVAILABLE: 'Available',
  OCCUPIED: 'Occupied',
  UNDER_MAINTENANCE: 'Under Maintenance',
} as const;

export const TICKET_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
} as const;

export const TICKET_STATUS = {
  OPEN: 'open',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
} as const;

export const SALE_STATUS = {
  ACTIVE: 'active',
  EXPIRED: 'expired',
  CANCELLED: 'cancelled',
  EVICTED: 'evicted',
} as const;

