import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { parsePaySlipPdf } from '../services/pdfParser';
import { sendPaySlipEmail, generatePaySlipEmailHtml } from '../services/emailService';
import path from 'path';

export const uploadPaySlip = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'PDF 파일이 없습니다.' });
    }

    const filePath = req.file.path;
    const parsedData = await parsePaySlipPdf(filePath);

    // 배치 생성
    const batch = await prisma.paySlipBatch.create({
      data: {
        yearMonth: parsedData[0]?.yearMonth || '',
        fileName: req.file.originalname,
        filePath: filePath,
        totalCount: parsedData.length,
        parsedCount: parsedData.length,
        status: 'parsed'
      }
    });

    // 파싱된 데이터와 기존 사원 매칭
    const results = [];
    for (const slip of parsedData) {
      let employee = await prisma.employee.findUnique({
        where: { employeeCode: slip.employeeCode }
      });

      // 사원이 없으면 자동 생성
      if (!employee) {
        employee = await prisma.employee.create({
          data: {
            employeeCode: slip.employeeCode,
            name: slip.employeeName,
            hireDate: slip.hireDate ? new Date(slip.hireDate) : null
          }
        });
      }

      // 급여명세서 저장 (upsert)
      const paySlip = await prisma.paySlip.upsert({
        where: {
          employeeId_yearMonth: {
            employeeId: employee.id,
            yearMonth: slip.yearMonth
          }
        },
        update: {
          basicSalary: slip.basicSalary,
          mealAllowance: slip.mealAllowance,
          overtimePay: slip.overtimePay,
          incentive: slip.incentive,
          otherAllowance: slip.otherAllowance,
          totalPayment: slip.totalPayment,
          nationalPension: slip.nationalPension,
          healthInsurance: slip.healthInsurance,
          employmentInsurance: slip.employmentInsurance,
          longTermCare: slip.longTermCare,
          incomeTax: slip.incomeTax,
          localIncomeTax: slip.localIncomeTax,
          totalDeduction: slip.totalDeduction,
          netPayment: slip.netPayment
        },
        create: {
          employeeId: employee.id,
          yearMonth: slip.yearMonth,
          basicSalary: slip.basicSalary,
          mealAllowance: slip.mealAllowance,
          overtimePay: slip.overtimePay,
          incentive: slip.incentive,
          otherAllowance: slip.otherAllowance,
          totalPayment: slip.totalPayment,
          nationalPension: slip.nationalPension,
          healthInsurance: slip.healthInsurance,
          employmentInsurance: slip.employmentInsurance,
          longTermCare: slip.longTermCare,
          incomeTax: slip.incomeTax,
          localIncomeTax: slip.localIncomeTax,
          totalDeduction: slip.totalDeduction,
          netPayment: slip.netPayment
        },
        include: { employee: true }
      });

      results.push({
        ...paySlip,
        hasEmail: !!employee.email
      });
    }

    res.json({
      success: true,
      data: {
        batchId: batch.id,
        yearMonth: batch.yearMonth,
        totalCount: results.length,
        withEmail: results.filter(r => r.hasEmail).length,
        withoutEmail: results.filter(r => !r.hasEmail).length,
        paySlips: results
      }
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getPaySlips = async (req: Request, res: Response) => {
  try {
    const { yearMonth } = req.query;
    const where = yearMonth ? { yearMonth: yearMonth as string } : {};

    const paySlips = await prisma.paySlip.findMany({
      where,
      include: {
        employee: true,
        emailLogs: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: { employee: { employeeCode: 'asc' } }
    });

    res.json({ success: true, data: paySlips });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const sendEmails = async (req: Request, res: Response) => {
  try {
    const { paySlipIds } = req.body;

    if (!paySlipIds || !Array.isArray(paySlipIds)) {
      return res.status(400).json({ success: false, error: 'paySlipIds가 필요합니다.' });
    }

    const results = { sent: 0, failed: 0, errors: [] as string[] };

    for (const id of paySlipIds) {
      const result = await sendPaySlipEmail(id);
      if (result.success) {
        results.sent++;
      } else {
        results.failed++;
        results.errors.push(`ID ${id}: ${result.error}`);
      }
    }

    res.json({ success: true, data: results });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getEmailLogs = async (req: Request, res: Response) => {
  try {
    const logs = await prisma.emailLog.findMany({
      include: {
        paySlip: {
          include: { employee: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 100
    });
    res.json({ success: true, data: logs });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const previewEmailTemplate = async (req: Request, res: Response) => {
  try {
    const { paySlipId } = req.params;
    
    let paySlip;
    let employee;
    
    if (paySlipId && paySlipId !== 'sample') {
      // 실제 급여명세서 조회
      const data = await prisma.paySlip.findUnique({
        where: { id: parseInt(paySlipId) },
        include: { employee: true }
      });
      
      if (!data) {
        return res.status(404).json({ success: false, error: '급여명세서를 찾을 수 없습니다.' });
      }
      
      paySlip = data;
      employee = data.employee;
    } else {
      // 샘플 데이터
      paySlip = {
        yearMonth: '2024-12',
        basicSalary: 3500000,
        mealAllowance: 200000,
        overtimePay: 150000,
        incentive: 500000,
        otherAllowance: 100000,
        totalPayment: 4450000,
        nationalPension: 157500,
        healthInsurance: 124950,
        employmentInsurance: 36540,
        longTermCare: 14400,
        incomeTax: 89000,
        localIncomeTax: 8900,
        totalDeduction: 431290,
        netPayment: 4018710
      };
      employee = {
        employeeCode: 'EMP001',
        name: '홍길동'
      };
    }
    
    const html = generatePaySlipEmailHtml(paySlip, employee);
    
    res.json({ success: true, data: { html } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
