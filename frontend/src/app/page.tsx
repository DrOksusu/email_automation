'use client';

import { useEffect, useState } from 'react';
import { getEmployees, getPaySlips, getEmailLogs, Employee, PaySlip, EmailLog } from '@/lib/api';
import { Users, FileText, Mail, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    employeesWithEmail: 0,
    totalPaySlips: 0,
    sentEmails: 0,
  });
  const [recentLogs, setRecentLogs] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [empRes, payRes, logRes] = await Promise.all([
          getEmployees(),
          getPaySlips(),
          getEmailLogs(),
        ]);

        const employees = empRes.data.data || [];
        const paySlips = payRes.data.data || [];
        const logs = logRes.data.data || [];

        setStats({
          totalEmployees: employees.length,
          employeesWithEmail: employees.filter((e: Employee) => e.email).length,
          totalPaySlips: paySlips.length,
          sentEmails: logs.filter((l: EmailLog) => l.status === 'sent').length,
        });
        setRecentLogs(logs.slice(0, 5));
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const statCards = [
    { label: '총 사원수', value: stats.totalEmployees, icon: Users, color: 'blue', href: '/employees' },
    { label: '이메일 등록', value: stats.employeesWithEmail, icon: Mail, color: 'green', href: '/employees' },
    { label: '급여명세서', value: stats.totalPaySlips, icon: FileText, color: 'purple', href: '/payslip' },
    { label: '발송 완료', value: stats.sentEmails, icon: CheckCircle, color: 'emerald', href: '/history' },
  ];

  if (loading) {
    return <div className="flex justify-center items-center h-64">로딩중...</div>;
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">대시보드</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.label}
              href={card.href}
              className="bg-white rounded-xl shadow-sm p-6 border hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{card.label}</p>
                  <p className="text-3xl font-bold mt-1">{card.value}</p>
                </div>
                <div className={`p-3 bg-${card.color}-100 rounded-lg`}>
                  <Icon className={`text-${card.color}-600`} size={24} />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-lg font-semibold mb-4">최근 발송 이력</h2>
        {recentLogs.length === 0 ? (
          <p className="text-gray-500 text-center py-8">발송 이력이 없습니다.</p>
        ) : (
          <div className="space-y-3">
            {recentLogs.map((log) => (
              <div key={log.id} className="flex items-center justify-between py-3 border-b last:border-0">
                <div>
                  <p className="font-medium">{log.recipientEmail}</p>
                  <p className="text-sm text-gray-500">{log.subject}</p>
                </div>
                <div className="text-right">
                  <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                    log.status === 'sent' ? 'bg-green-100 text-green-800' :
                    log.status === 'failed' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {log.status === 'sent' ? '발송완료' : log.status === 'failed' ? '실패' : '대기중'}
                  </span>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(log.createdAt).toLocaleString('ko-KR')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
