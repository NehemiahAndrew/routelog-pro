import { useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, Bell, Search } from 'lucide-react';
import { TripContext } from '../App';

const pageTitles = {
  '/': 'Dashboard',
  '/route': 'Route Overview',
  '/logs': 'ELD Daily Logs',
  '/compliance': 'Compliance Overview',
  '/settings': 'Settings',
};

const pageDescriptions = {
  '/': 'Plan and generate your next trip route',
  '/route': 'View your route map and trip timeline',
  '/logs': 'FMCSA-compliant daily log sheets',
  '/compliance': 'Hours of Service compliance status',
  '/settings': 'Manage your profile and preferences',
};

export default function Header({ onMenuToggle }) {
  const location = useLocation();
  const { tripData } = useContext(TripContext);

  const title = pageTitles[location.pathname] || 'Dashboard';
  const description = pageDescriptions[location.pathname] || '';

  return (
    <header className="h-14 sm:h-16 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between px-3 sm:px-6 sticky top-0 z-30 transition-colors duration-300">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100">{title}</h2>
          <p className="text-xs text-gray-400 hidden sm:block">{description}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {tripData && (
          <span className="badge-success text-xs hidden sm:inline-flex">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5" />
            Trip Active
          </span>
        )}

        <div className="hidden md:flex items-center bg-surface-50 dark:bg-gray-700 rounded-lg px-3 py-2 gap-2 border border-gray-100 dark:border-gray-600">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent text-sm text-gray-600 dark:text-gray-300 placeholder-gray-400 outline-none w-40"
          />
        </div>

        <button className="relative p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        <div className="w-8 h-8 rounded-full bg-primary-800 flex items-center justify-center text-white text-xs font-bold lg:hidden">
          JD
        </div>
      </div>
    </header>
  );
}
