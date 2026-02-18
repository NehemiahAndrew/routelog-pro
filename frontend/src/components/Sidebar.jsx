import { NavLink, useLocation } from 'react-router-dom';
import { useState } from 'react';
import {
  LayoutDashboard,
  Map,
  FileText,
  ShieldCheck,
  Settings,
  Truck,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard, description: 'Trip Planning' },
  { path: '/route', label: 'Route Overview', icon: Map, description: 'Map & Timeline' },
  { path: '/logs', label: 'ELD Logs', icon: FileText, description: 'Daily Log Sheets' },
  { path: '/compliance', label: 'Compliance', icon: ShieldCheck, description: 'HOS Status' },
  { path: '/settings', label: 'Settings', icon: Settings, description: 'Configuration' },
];

export default function Sidebar({ isOpen, onToggle }) {
  const location = useLocation();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden backdrop-blur-sm"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full z-50
          bg-white dark:bg-gray-800 border-r border-gray-100 dark:border-gray-700 shadow-sidebar
          transition-all duration-300 ease-in-out
          ${isOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full lg:translate-x-0 lg:w-20'}
        `}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary-800 rounded-lg flex items-center justify-center flex-shrink-0">
              <Truck className="w-5 h-5 text-white" />
            </div>
            <div className={`transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0 lg:hidden'}`}>
              <h1 className="text-base font-bold text-gray-900 dark:text-gray-100 whitespace-nowrap">RouteLog Pro</h1>
              <p className="text-[10px] text-gray-400 font-medium tracking-wide uppercase">Fleet Management</p>
            </div>
          </div>
          <button
            onClick={onToggle}
            className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-4 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => window.innerWidth < 1024 && onToggle()}
                className={`
                  group flex items-center gap-3 px-3 py-2.5 rounded-lg
                  transition-all duration-200 relative
                  ${isActive
                    ? 'bg-primary-800 text-white shadow-md'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100'
                  }
                `}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'}`} />
                <div className={`transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0 lg:hidden'} min-w-0`}>
                  <p className="text-sm font-semibold truncate">{item.label}</p>
                  <p className={`text-[10px] truncate ${isActive ? 'text-blue-200' : 'text-gray-400'}`}>
                    {item.description}
                  </p>
                </div>
                {isActive && (
                  <ChevronRight className={`w-4 h-4 ml-auto flex-shrink-0 ${isOpen ? '' : 'hidden'}`} />
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className={`absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 dark:border-gray-700 ${isOpen ? '' : 'lg:hidden'}`}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-accent-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              JD
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">John Doe</p>
              <p className="text-xs text-gray-400 truncate">CDL-A Driver</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
