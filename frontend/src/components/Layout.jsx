import { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-gray-900 transition-colors duration-300">
      <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />

      {/* Main content - shifts based on sidebar */}
      <div className="lg:ml-20 transition-all duration-300">
        <Header onMenuToggle={toggleSidebar} />
        <main className="p-4 sm:p-6 lg:p-8 max-w-[1280px] mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
