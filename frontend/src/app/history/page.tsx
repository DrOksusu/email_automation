'use client';

import { useEffect, useState } from 'react';
import { getEmailLogs, EmailLog } from '@/lib/api';
import Table from '@/components/Table';
import { History, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function HistoryPage() {
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLogs() {
      try {
        const res = await getEmailLogs();
        setLogs(res.data.data || []);
      } catch (error) {
        console.error('Failed to fetch email logs:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchLogs();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle size={12} className="mr-1" />
            발송완료
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle size={12} className="mr-1" />
            실패
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock size={12} className="mr-1" />
            대기중
          </span>
        );
    }
  };

  const columns = [
    {
      key: 'createdAt',
      header: '발송일시',
      render: (log: EmailLog) => new Date(log.createdAt).toLocaleString('ko-KR'),
    },
    {
      key: 'recipientEmail',
      header: '수신자',
    },
    {
      key: 'subject',
      header: '제목',
      render: (log: EmailLog) => (
        <span className="max-w-xs truncate block">{log.subject}</span>
      ),
    },
    {
      key: 'status',
      header: '상태',
      render: (log: EmailLog) => getStatusBadge(log.status),
    },
    {
      key: 'sentAt',
      header: '완료시간',
      render: (log: EmailLog) => log.sentAt ? new Date(log.sentAt).toLocaleString('ko-KR') : '-',
    },
    {
      key: 'errorMessage',
      header: '오류메시지',
      render: (log: EmailLog) => log.errorMessage ? (
        <span className="text-red-600 text-xs max-w-xs truncate block" title={log.errorMessage}>
          {log.errorMessage}
        </span>
      ) : '-',
    },
  ];

  // Stats
  const stats = {
    total: logs.length,
    sent: logs.filter(l => l.status === 'sent').length,
    failed: logs.filter(l => l.status === 'failed').length,
    pending: logs.filter(l => l.status === 'pending').length,
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">로딩중...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center">
          <History className="mr-2" size={24} />
          발송 이력
        </h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <p className="text-sm text-gray-500">전체</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <p className="text-sm text-green-600">발송완료</p>
          <p className="text-2xl font-bold text-green-600">{stats.sent}</p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <p className="text-sm text-red-600">실패</p>
          <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <p className="text-sm text-yellow-600">대기중</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
        </div>
      </div>

      {/* Logs Table */}
      <Table
        columns={columns}
        data={logs}
        keyExtractor={(log) => log.id}
        emptyMessage="발송 이력이 없습니다."
      />
    </div>
  );
}
