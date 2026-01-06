import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import fs from 'fs';
import { parse } from 'csv-parse/sync';

interface CsvRecord {
  employeeCode?: string;
  사원코드?: string;
  name?: string;
  사원명?: string;
  email?: string;
  이메일?: string;
  department?: string;
  부서?: string;
  position?: string;
  직급?: string;
}

export const getAllEmployees = async (req: Request, res: Response) => {
  try {
    const employees = await prisma.employee.findMany({
      where: { isActive: true },
      orderBy: { employeeCode: 'asc' }
    });
    res.json({ success: true, data: employees });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getEmployee = async (req: Request, res: Response) => {
  try {
    const employee = await prisma.employee.findUnique({
      where: { id: parseInt(req.params.id) }
    });
    if (!employee) {
      return res.status(404).json({ success: false, error: '사원을 찾을 수 없습니다.' });
    }
    res.json({ success: true, data: employee });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createEmployee = async (req: Request, res: Response) => {
  try {
    const { employeeCode, name, email, department, position } = req.body;
    const employee = await prisma.employee.create({
      data: { employeeCode, name, email, department, position }
    });
    res.json({ success: true, data: employee });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateEmployee = async (req: Request, res: Response) => {
  try {
    const { name, email, department, position } = req.body;
    const employee = await prisma.employee.update({
      where: { id: parseInt(req.params.id) },
      data: { name, email, department, position }
    });
    res.json({ success: true, data: employee });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteEmployee = async (req: Request, res: Response) => {
  try {
    await prisma.employee.update({
      where: { id: parseInt(req.params.id) },
      data: { isActive: false }
    });
    res.json({ success: true, message: '삭제되었습니다.' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const uploadEmployeesCsv = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: '파일이 없습니다.' });
    }

    const fileContent = fs.readFileSync(req.file.path, 'utf-8');
    const records: CsvRecord[] = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });

    const results = { created: 0, updated: 0, errors: [] as string[] };

    for (const record of records) {
      try {
        const empCode = record.employeeCode || record['사원코드'] || '';
        const existing = await prisma.employee.findUnique({
          where: { employeeCode: empCode }
        });

        if (existing) {
          await prisma.employee.update({
            where: { id: existing.id },
            data: {
              name: record.name || record['사원명'] || existing.name,
              email: record.email || record['이메일'] || existing.email,
              department: record.department || record['부서'] || existing.department,
              position: record.position || record['직급'] || existing.position
            }
          });
          results.updated++;
        } else {
          await prisma.employee.create({
            data: {
              employeeCode: empCode,
              name: record.name || record['사원명'] || '',
              email: record.email || record['이메일'],
              department: record.department || record['부서'],
              position: record.position || record['직급']
            }
          });
          results.created++;
        }
      } catch (err: any) {
        const empCode = record.employeeCode || record['사원코드'] || 'unknown';
        results.errors.push(`${empCode}: ${err.message}`);
      }
    }

    fs.unlinkSync(req.file.path);
    res.json({ success: true, data: results });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
