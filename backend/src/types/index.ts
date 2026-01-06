export interface ParsedPaySlip {
  employeeCode: string;
  employeeName: string;
  hireDate: string | null;
  yearMonth: string;
  
  // 지급 내역
  basicSalary: number;
  mealAllowance: number;
  overtimePay: number;
  incentive: number;
  otherAllowance: number;
  totalPayment: number;
  
  // 공제 내역
  nationalPension: number;
  healthInsurance: number;
  employmentInsurance: number;
  longTermCare: number;
  incomeTax: number;
  localIncomeTax: number;
  totalDeduction: number;
  
  netPayment: number;
  pageNumber: number;
}

export interface EmployeeCSV {
  employeeCode: string;
  name: string;
  email: string;
  department?: string;
  position?: string;
}

export interface SendEmailRequest {
  paySlipIds: number[];
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
