import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  Boxes,
  Users,
  Sliders,
  ShieldAlert,
  Clock,
  ShoppingBag,
  Zap,
  Activity,
  Bell,
  Settings,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarItem {
  name: string;
  path: string;
  icon: React.ElementType;
  badge?: string;
}

const navItems: SidebarItem[] = [
  { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Events', path: '/admin/events', icon: Calendar },
  { name: 'Inventory', path: '/admin/inventory', icon: Boxes },
  { name: 'Waiting Room', path: '/admin/waiting-room', icon: Users, badge: 'LIVE' },
  { name: 'Admission Control', path: '/admin/admission-control', icon: Sliders },
  { name: 'Bot Monitoring', path: '/admin/bot-monitoring', icon: ShieldAlert },
  { name: 'Active Holds', path: '/admin/active-holds', icon: Clock },
  { name: 'Orders', path: '/admin/orders', icon: ShoppingBag },
  { name: 'Concurrency', path: '/admin/concurrency', icon: Zap, badge: '50k' },
  { name: 'Load Testing', path: '/admin/load-testing', icon: Activity },
  { name: 'Alerts', path: '/admin/alerts', icon: Bell, badge: '4' },
  { name: 'Settings', path: '/admin/settings', icon: Settings },
];

export const AdminSidebar: React.FC = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <aside className="w-64 bg-[#0B0F19] border-r border-slate-800/80 flex flex-col h-screen sticky top-0 select-none z-30">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/60 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <ShieldCheck className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-base text-white tracking-wide flex items-center gap-1.5">
              FAIRQUEUE
              <span className="text-[10px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-1.5 py-0.5 rounded font-mono font-semibold">
                ADMIN
              </span>
            </h1>
            <p className="text-xs text-slate-400 font-medium">Control & Monitoring</p>
          </div>
        </div>
      </div>

      {/* Admin User Chip */}
      <div className="px-4 py-3 mx-3 my-3 bg-slate-900/90 rounded-lg border border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center space-x-2.5 truncate">
          <div className="h-7 w-7 rounded-full bg-cyan-500/20 text-cyan-400 font-bold text-xs flex items-center justify-center border border-cyan-500/30">
            {user?.name?.charAt(0) || 'A'}
          </div>
          <div className="truncate">
            <p className="text-xs font-semibold text-slate-200 truncate">{user?.name || 'System Admin'}</p>
            <p className="text-[10px] text-slate-400 font-mono truncate">{user?.email || 'admin@fairqueue.io'}</p>
          </div>
        </div>
        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" title="Admin Token Verified"></span>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider font-mono">
          System Control UI
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-400 font-semibold border border-cyan-500/30 shadow-sm shadow-cyan-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`
              }
            >
              <div className="flex items-center space-x-3">
                <Icon className="h-4 w-4" />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
                  item.badge === 'LIVE' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                  item.badge === '50k' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                  'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                }`}>
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Logout Button */}
      <div className="p-3 border-t border-slate-800/80 bg-[#080C14]">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center space-x-2 px-3 py-2.5 rounded-lg text-xs font-semibold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-all duration-150 cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          <span>Logout Admin</span>
        </button>
      </div>
    </aside>
  );
};
