import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Package,
  Database,
  ShoppingCart,
  Kanban,
  Briefcase,
  Truck,
  UserCog,
  Settings,
  Code,
  type LucideIcon,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { ROLE_PERMISSIONS, SIDEBAR_ITEMS } from '../../utils/constants';
import { cn } from '../../utils/cn';

const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  Users,
  Package,
  Database,
  ShoppingCart,
  Kanban,
  Briefcase,
  Truck,
  UserCog,
  Settings,
  Code,
};

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return (
      <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 z-40">
        <div className="h-full flex items-center justify-center">
          <p className="text-gray-500">Loading...</p>
        </div>
      </aside>
    );
  }

  const userPermissions = ROLE_PERMISSIONS[user.role] || [];
  const allowedItems = SIDEBAR_ITEMS.filter((item) =>
    userPermissions.includes(item.id)
  );

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-full bg-white border-r border-gray-200 transition-all duration-300 z-40',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      <div className="h-full flex flex-col">
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
          {!collapsed && (
            <h1 className="text-xl font-bold text-primary-600">Ãwâllyûslùv</h1>
          )}
          <button
            onClick={onToggle}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <LayoutDashboard size={20} className="text-gray-600" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-2">
            {allowedItems.map((item) => {
              const Icon = iconMap[item.icon];
              const isActive = location.pathname === item.path;
              return (
                <li key={item.id}>
                  <Link
                    to={item.path}
                    className={cn(
                      'flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors',
                      isActive
                        ? 'bg-primary-50 text-primary-600 font-medium'
                        : 'text-gray-700 hover:bg-gray-100',
                      collapsed && 'justify-center'
                    )}
                    title={collapsed ? item.label : undefined}
                  >
                    {Icon && <Icon size={20} />}
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </aside>
  );
}

