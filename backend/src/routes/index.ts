import { Router } from 'express';
import * as employeeController from '../controllers/employeeController';
import * as payslipController from '../controllers/payslipController';
import { uploadPdf, uploadCsv } from '../middlewares/upload';

const router = Router();

// Employee routes
router.get('/employees', employeeController.getAllEmployees);
router.get('/employees/:id', employeeController.getEmployee);
router.post('/employees', employeeController.createEmployee);
router.put('/employees/:id', employeeController.updateEmployee);
router.delete('/employees/:id', employeeController.deleteEmployee);
router.post('/employees/upload-csv', uploadCsv.single('file'), employeeController.uploadEmployeesCsv);

// PaySlip routes
router.post('/payslips/upload', uploadPdf.single('file'), payslipController.uploadPaySlip);
router.get('/payslips', payslipController.getPaySlips);
router.post('/payslips/send-emails', payslipController.sendEmails);
router.get('/email-logs', payslipController.getEmailLogs);
router.get('/payslips/preview-template', payslipController.previewEmailTemplate);
router.get('/payslips/preview-template/:paySlipId', payslipController.previewEmailTemplate);

export default router;
