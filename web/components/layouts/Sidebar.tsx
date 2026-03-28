'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

interface SidebarItem {
  label: string;
  href: string;
  icon: string;
  role?: string[];
}

interface SidebarProps {
  items: SidebarItem[];
  userRole?: string;
  onLogout: () => void;
}

export default function Sidebar({ items, userRole, onLogout }: SidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);

  const filteredItems = items.filter((item) => !item.role || item.role.includes(userRole || ''));

  return (
    <div className={`h-screen bg-gray-900 text-white transition-all duration-300 ${isOpen ? 'w-64' : 'w-20'}`}>
      <div className="flex items-center justify-between p-4">
        {isOpen && <h1 className="text-2xl font-bold">SPMS</h1>}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 hover:bg-gray-800 rounded-lg transition"
        >
          {isOpen ? '←' : '→'}
        </button>
      </div>

      <nav className="mt-8 space-y-2 px-2">
        {filteredItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-4 px-4 py-3 rounded-lg transition ${
                isActive ? 'bg-blue-600' : 'hover:bg-gray-800'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              {isOpen && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-4 left-2 right-2">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-4 px-4 py-3 rounded-lg bg-gray-800 hover:bg-red-600 transition"
        >
          <span className="text-xl">🚪</span>
          {isOpen && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
}
