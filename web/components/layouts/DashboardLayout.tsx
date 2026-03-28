'use client';

import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import { useAuth } from '@/lib/useAuth';

interface SidebarItem {
  label: string;
  href: string;
  icon: string;
  role?: string[];
}

interface DashboardLayoutProps {
  children: ReactNode;
}

const sidebarItems: SidebarItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: '📊' },
  { label: 'Employees', href: '/employees', icon: '👥', role: ['Admin', 'Manager'] },
  { label: 'Attendance', href: '/attendance', icon: '📅' },
  { label: 'Leave', href: '/leave', icon: '🏖️' },
  { label: 'Payroll', href: '/payroll', icon: '💰' },
  { label: 'Performance', href: '/performance', icon: '⭐' },
  { label: 'Profile', href: '/profile', icon: '👤' },
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logout, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen bg-white">
      <Sidebar items={sidebarItems} userRole={user?.role} onLogout={logout} />
      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-6">
          <div className="mb-6 bg-white rounded-lg shadow p-4 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Welcome, {user?.firstName}!</h2>
              <p className="text-black">{user?.role} • {user?.department}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-black">{new Date().toLocaleDateString()}</p>
              <p className="text-sm font-semibold text-gray-900">{user?.email}</p>
            </div>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
