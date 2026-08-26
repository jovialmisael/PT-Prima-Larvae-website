import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import './layout.css';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="layout-container">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="layout-main">
        <Header onMenuClick={toggleSidebar} />
        <main className="layout-content">
          {children}
        </main>
      </div>
    </div>
  );
}
