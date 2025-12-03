# TP DEV Frontend

A complete React + Vite + TypeScript frontend application for business management with role-based access control.

## Features

- **Role-Based Access Control**: Admin, Supervisor, Agent, and Client roles with tailored dashboards
- **Complete CRUD Operations**: Clients, Products, Suppliers, Inventory, Sales, Tickets
- **Kanban Board**: Drag-and-drop ticket management
- **Sales Lifecycle**: Renew, Reactivate, Evict, and Delete sales
- **Inventory Management**: Account and profile management with CSV upload
- **Finance Dashboard**: Revenue vs expenses charts and team performance
- **Webhook Configuration**: Configure Make.com/webhook endpoints
- **Notifications**: Real-time notification system (WebSocket/SSE placeholder)
- **Audit Log**: Immutable action logging

## Tech Stack

- React 19
- Vite 7
- TypeScript (strict mode)
- Tailwind CSS
- React Router
- Axios
- Lucide React (icons)
- @dnd-kit (Kanban drag-and-drop)
- Recharts (charts)
- Vitest (testing)

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Testing

```bash
npm run test
```

## Role-Based Access

### Admin
- Full access to all features
- User management
- System settings

### Supervisor
- Dashboard, Clients, Products, Inventory, Sales, Tickets, Office, Suppliers, Settings
- Team performance monitoring
- Finance overview

### Agent
- Dashboard, Clients, Products, Inventory, Sales, Tickets, Settings
- Create and manage sales
- Handle tickets

### Client
- Dashboard (portal view)
- View purchases
- Request renewals
- Report issues

## Routes Manual

| Route | Description | Allowed Roles | Notes |
| --- | --- | --- | --- |
| `/login` | Demo auth screen with role selector | Public | Choose any role, email/password can be dummy values |
| `/` | Role-aware dashboard (Admin/Supervisor/Agent/Client variants) | Admin, Supervisor, Agent, Client | Default landing page after login |
| `/clients` | Client list with CRUD actions | Admin, Supervisor, Agent | Uses sample data or backend `/clients` |
| `/clients/:id` | Client profile with sales history + quick actions | Admin, Supervisor, Agent | Uses sale lifecycle actions, links to audit log |
| `/products` | Product catalog management | Admin, Supervisor, Agent | Shows product types, renewable flag, ROI |
| `/suppliers` | Supplier management table | Admin, Supervisor | Simple CRUD placeholders |
| `/inventory` | Inventory accounts + profile manager | Admin, Supervisor, Agent | Includes CSV upload modal (demo parser) |
| `/sales` | Sales list + multi-step creation wizard | Admin, Supervisor, Agent | Renew / Reactivate / Evict / Delete actions logged |
| `/kanban` | Ticket board with drag-and-drop columns | Admin, Supervisor, Agent | Uses `@dnd-kit` and assignment modal |
| `/office` | Finance overview (revenue vs expenses, team perf) | Admin, Supervisor | Uses mocked Recharts data |
| `/users` | RBAC management table | Admin | Placeholder for hierarchical assignments |
| `/settings` | System/webhook settings | Admin, Supervisor, Agent, Client (limited) | Configure Make.com endpoints, test webhooks |
| `/playground` | Component showcase + role switcher | Admin, Supervisor, Agent, Client | Useful for demo scenarios and QA |

- **Navigation**: Sidebar items auto-hide based on role via `ROLE_PERMISSIONS`.
- **Guards**: Routes use `RoleGuard` (component) and `ProtectedRoute` (inside `App.tsx`) to block unauthorized access and redirect to `/login`.
- **Client Portal**: Clients only see `/` (portal dashboard) and `/settings` (limited preferences).

## Demo Mode

The application includes a demo mode with sample data. When the backend is unreachable, the app falls back to in-memory sample data.

### Login

1. Go to `/login`
2. Select a role from the dropdown
3. Enter any email and password
4. Click "Sign in"

### Role Switching

1. Navigate to `/playground`
2. Click "Switch Role"
3. Select a new role
4. The sidebar and available pages will update automatically

## Project Structure

```
src/
├── components/
│   ├── auth/          # Authentication components
│   ├── kanban/        # Kanban board components
│   ├── inventory/     # Inventory components
│   ├── notifications/ # Notification components
│   ├── sales/         # Sales components
│   ├── shell/         # App shell (Sidebar, Topbar, AppShell)
│   └── ui/            # Reusable UI components
├── hooks/              # Custom React hooks
├── lib/
│   ├── api/           # API client and services
│   └── sample-data.ts # Sample data for demo
├── pages/              # Page components
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── test/               # Test setup
```

## Color System

The application uses a three-color system:

- **Primary**: #3B82F6 (blue) - Primary CTAs and important badges
- **Accent**: #8B5CF6 (purple) - Subtle highlights
- **Status**: #10B981 (emerald) - Success/available badges

## API Integration

The frontend is configured to connect to the backend at `http://localhost:5000/api` by default. You can override this by setting the `VITE_API_BASE_URL` environment variable.

The API client automatically falls back to in-memory sample data when the backend is unreachable.

## Webhook Configuration

1. Navigate to `/settings`
2. Enter a webhook endpoint (e.g., `https://hook.make.com/...`)
3. Select events to subscribe to
4. Click "Save Webhook"
5. Use "Test" button to verify webhook functionality

## Customization

### Colors

Edit `tailwind.config.ts` to customize the color system:

```typescript
colors: {
  primary: { DEFAULT: '#3B82F6', ... },
  accent: { DEFAULT: '#8B5CF6', ... },
  status: { DEFAULT: '#10B981', ... },
}
```

### Role Permissions

Edit `src/utils/constants.ts` to modify role permissions:

```typescript
export const ROLE_PERMISSIONS: Record<Role, string[]> = {
  // ...
};
```

## Testing

The project includes Vitest and React Testing Library. Example test for the Card component is included in `src/components/ui/__tests__/Card.test.tsx`.

## Code Quality

- TypeScript strict mode enabled
- ESLint configured (optional)
- Prettier support (optional)

## License

Private project - All rights reserved
