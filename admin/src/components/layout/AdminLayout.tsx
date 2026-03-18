import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAdminStore } from '../../store/adminStore';
import {
  HomeIcon, ShoppingBagIcon, ClipboardDocumentListIcon,
  UsersIcon, TagIcon, ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';

const NAV = [
  { to: '/', label: 'Dashboard', icon: HomeIcon, exact: true },
  { to: '/products', label: 'Products', icon: ShoppingBagIcon },
  { to: '/orders', label: 'Orders', icon: ClipboardDocumentListIcon },
  { to: '/users', label: 'Users', icon: UsersIcon },
  { to: '/categories', label: 'Categories', icon: TagIcon },
];

export default function AdminLayout() {
  const { user, logout } = useAdminStore();

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-60 bg-gray-900 text-white flex flex-col flex-shrink-0">
        <div className="px-5 py-6 border-b border-gray-800">
          <h1 className="text-xl font-bold text-primary-400">Agrawal.co</h1>
          <p className="text-xs text-gray-400 mt-0.5">Admin Panel</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map(({ to, label, icon: Icon, exact }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`
              }
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-gray-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-sm font-bold">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors w-full"
          >
            <ArrowRightOnRectangleIcon className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
