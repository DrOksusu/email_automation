'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, FileText, History } from 'lucide-react';

const navItems = [
  { href: '/', label: '대시보드', icon: Home },
  { href: '/employees', label: '사원관리', icon: Users },
  { href: '/payslip', label: '급여명세서', icon: FileText },
  { href: '/history', label: '발송이력', icon: History },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-xl font-bold text-blue-600">
              급여명세서 발송 시스템
            </Link>
            <div className="flex space-x-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
