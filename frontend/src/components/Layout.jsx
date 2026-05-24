import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import authService from '../services/auth';

const Layout = () => {
  const isAuthenticated = !!authService.getToken();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-background arabic-pattern-bg">
      <Sidebar isCollapsed={isSidebarCollapsed} onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
      <main className={`flex-1 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'} p-8 transition-all duration-300`}>
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
