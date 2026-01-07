'use client';

import { useEffect, useState } from 'react';
import { getEmployees, createEmployee, updateEmployee, deleteEmployee, uploadEmployeesCsv, Employee } from '@/lib/api';
import Button from '@/components/Button';
import Table from '@/components/Table';
import toast from 'react-hot-toast';
import { Plus, Upload, Pencil, Trash2, X } from 'lucide-react';

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState({ employeeCode: '', name: '', email: '', department: '', position: '' });

  const fetchEmployees = async () => {
    try {
      const res = await getEmployees();
      setEmployees(res.data.data || []);
    } catch (error) {
      toast.error('사원 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEmployees(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingEmployee) {
        await updateEmployee(editingEmployee.id, formData);
        toast.success('사원 정보가 수정되었습니다.');
      } else {
        await createEmployee(formData);
        toast.success('사원이 등록되었습니다.');
      }
      setShowModal(false);
      setEditingEmployee(null);
      setFormData({ employeeCode: '', name: '', email: '', department: '', position: '' });
      fetchEmployees();
    } catch (error: any) {
      toast.error(error.response?.data?.error || '저장에 실패했습니다.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    try {
      await deleteEmployee(id);
      toast.success('삭제되었습니다.');
      fetchEmployees();
    } catch (error) {
      toast.error('삭제에 실패했습니다.');
    }
  };

  const handleCsvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await uploadEmployeesCsv(file);
      const data = res.data.data;
      toast.success(`생성: ${data.created}명, 수정: ${data.updated}명`);
      fetchEmployees();
    } catch (error) {
      toast.error('CSV 업로드에 실패했습니다.');
    }
    e.target.value = '';
  };

  const openEditModal = (emp: Employee) => {
    setEditingEmployee(emp);
    setFormData({ employeeCode: emp.employeeCode, name: emp.name, email: emp.email || '', department: emp.department || '', position: emp.position || '' });
    setShowModal(true);
  };

  const columns = [
    { key: 'employeeCode', header: '사원코드' },
    { key: 'name', header: '사원명' },
    { key: 'email', header: '이메일', render: (emp: Employee) => emp.email || <span className="text-red-500">미등록</span> },
    { key: 'department', header: '부서', render: (emp: Employee) => emp.department || '-' },
    { key: 'position', header: '직급', render: (emp: Employee) => emp.position || '-' },
    { key: 'actions', header: '관리', render: (emp: Employee) => (
      <div className="flex space-x-2">
        <button onClick={() => openEditModal(emp)} className="text-blue-600 hover:text-blue-800"><Pencil size={16} /></button>
        <button onClick={() => handleDelete(emp.id)} className="text-red-600 hover:text-red-800"><Trash2 size={16} /></button>
      </div>
    )},
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">사원 관리</h1>
        <div className="flex space-x-3">
          <label className="cursor-pointer">
            <input type="file" accept=".csv" onChange={handleCsvUpload} className="hidden" />
            <span className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"><Upload size={16} className="mr-2" />CSV 업로드</span>
          </label>
          <Button onClick={() => { setEditingEmployee(null); setFormData({ employeeCode: '', name: '', email: '', department: '', position: '' }); setShowModal(true); }}>
            <Plus size={16} className="mr-2" />사원 등록
          </Button>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm">
        <strong>CSV 형식:</strong> employeeCode(사원코드), name(사원명), email(이메일), department(부서), position(직급)
      </div>

      {loading ? <div className="text-center py-12">로딩중...</div> : (
        <Table columns={columns} data={employees} keyExtractor={(e) => e.id} emptyMessage="등록된 사원이 없습니다." />
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">{editingEmployee ? '사원 수정' : '사원 등록'}</h2>
              <button onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">사원코드 *</label>
                <input type="text" required value={formData.employeeCode} onChange={(e) => setFormData({...formData, employeeCode: e.target.value})} disabled={!!editingEmployee} className="w-full border rounded-lg px-3 py-2 disabled:bg-gray-100" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">사원명 *</label>
                <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full border rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">이메일</label>
                <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full border rounded-lg px-3 py-2" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">부서</label>
                  <input type="text" value={formData.department} onChange={(e) => setFormData({...formData, department: e.target.value})} className="w-full border rounded-lg px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">직급</label>
                  <input type="text" value={formData.position} onChange={(e) => setFormData({...formData, position: e.target.value})} className="w-full border rounded-lg px-3 py-2" />
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>취소</Button>
                <Button type="submit">{editingEmployee ? '수정' : '등록'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
