import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Employee {
  id: number;
  employeeCode: string;
  name: string;
  email: string | null;
  department: string | null;
  position: string | null;
  isActive: boolean;
}

export interface PaySlip {
  id: number;
  employeeId: number;
  yearMonth: string;
  basicSalary: number;
  mealAllowance: number;
  overtimePay: number;
  incentive: number;
  otherAllowance: number;
  totalPayment: number;
  nationalPension: number;
  healthInsurance: number;
  employmentInsurance: number;
  longTermCare: number;
  incomeTax: number;
  localIncomeTax: number;
  totalDeduction: number;
  netPayment: number;
  employee: Employee;
  emailLogs?: EmailLog[];
  hasEmail?: boolean;
}

export interface EmailLog {
  id: number;
  paySlipId: number;
  recipientEmail: string;
  subject: string;
  status: string;
  errorMessage: string | null;
  sentAt: string | null;
  createdAt: string;
}

// Employee APIs
export const getEmployees = () => api.get<{success: boolean; data: Employee[]}>('/employees');
export const createEmployee = (data: Partial<Employee>) => api.post('/employees', data);
export const updateEmployee = (id: number, data: Partial<Employee>) => api.put(`/employees/${id}`, data);
export const deleteEmployee = (id: number) => api.delete(`/employees/${id}`);
export const uploadEmployeesCsv = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/employees/upload-csv', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

// PaySlip APIs
export const uploadPaySlip = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/payslips/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
export const getPaySlips = (yearMonth?: string) =>
  api.get<{success: boolean; data: PaySlip[]}>('/payslips', { params: { yearMonth } });
export const sendEmails = (paySlipIds: number[]) =>
  api.post('/payslips/send-emails', { paySlipIds });
export const getEmailLogs = () => api.get<{success: boolean; data: EmailLog[]}>('/email-logs');


// Email Template Preview
export const previewEmailTemplate = (paySlipId?: number) =>
  api.get<{success: boolean; data: {html: string}}>(`/payslips/preview-template/${paySlipId || 'sample'}`);

export default api;
