import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { RoleGuard } from './components/auth/RoleGuard';
import { AppShell } from './components/shell/AppShell';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Clients } from './pages/Clients';
import { ClientProfile } from './pages/ClientProfile';
import { Products } from './pages/Products';
import { Suppliers } from './pages/Suppliers';
import { Inventory } from './pages/Inventory';
import { Sales } from './pages/Sales';
import { Kanban } from './pages/Kanban';
import { Office } from './pages/Office';
import { Users } from './pages/Users';
import { Settings } from './pages/Settings';
import { Playground } from './pages/Playground';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <RoleGuard allowedRoles={['admin', 'supervisor', 'agent', 'client']}>
              <AppShell>
                <Dashboard />
              </AppShell>
            </RoleGuard>
          </ProtectedRoute>
        }
      />

      <Route
        path="/clients"
        element={
          <ProtectedRoute>
            <RoleGuard allowedRoles={['admin', 'supervisor', 'agent']}>
              <AppShell>
                <Clients />
              </AppShell>
            </RoleGuard>
          </ProtectedRoute>
        }
      />

      <Route
        path="/clients/:id"
        element={
          <ProtectedRoute>
            <RoleGuard allowedRoles={['admin', 'supervisor', 'agent']}>
              <AppShell>
                <ClientProfile />
              </AppShell>
            </RoleGuard>
          </ProtectedRoute>
        }
      />

      <Route
        path="/products"
        element={
          <ProtectedRoute>
            <RoleGuard allowedRoles={['admin', 'supervisor', 'agent']}>
              <AppShell>
                <Products />
              </AppShell>
            </RoleGuard>
          </ProtectedRoute>
        }
      />

      <Route
        path="/suppliers"
        element={
          <ProtectedRoute>
            <RoleGuard allowedRoles={['admin', 'supervisor']}>
              <AppShell>
                <Suppliers />
              </AppShell>
            </RoleGuard>
          </ProtectedRoute>
        }
      />

      <Route
        path="/inventory"
        element={
          <ProtectedRoute>
            <RoleGuard allowedRoles={['admin', 'supervisor', 'agent']}>
              <AppShell>
                <Inventory />
              </AppShell>
            </RoleGuard>
          </ProtectedRoute>
        }
      />

      <Route
        path="/sales"
        element={
          <ProtectedRoute>
            <RoleGuard allowedRoles={['admin', 'supervisor', 'agent']}>
              <AppShell>
                <Sales />
              </AppShell>
            </RoleGuard>
          </ProtectedRoute>
        }
      />

      <Route
        path="/kanban"
        element={
          <ProtectedRoute>
            <RoleGuard allowedRoles={['admin', 'supervisor', 'agent']}>
              <AppShell>
                <Kanban />
              </AppShell>
            </RoleGuard>
          </ProtectedRoute>
        }
      />

      <Route
        path="/office"
        element={
          <ProtectedRoute>
            <RoleGuard allowedRoles={['admin', 'supervisor']}>
              <AppShell>
                <Office />
              </AppShell>
            </RoleGuard>
          </ProtectedRoute>
        }
      />

      <Route
        path="/users"
        element={
          <ProtectedRoute>
            <RoleGuard allowedRoles={['admin']}>
              <AppShell>
                <Users />
              </AppShell>
            </RoleGuard>
          </ProtectedRoute>
        }
      />

      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <RoleGuard allowedRoles={['admin', 'supervisor', 'agent', 'client']}>
              <AppShell>
                <Settings />
              </AppShell>
            </RoleGuard>
          </ProtectedRoute>
        }
      />

      <Route
        path="/playground"
        element={
          <ProtectedRoute>
            <RoleGuard allowedRoles={['admin', 'supervisor', 'agent', 'client']}>
              <AppShell>
                <Playground />
              </AppShell>
            </RoleGuard>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
