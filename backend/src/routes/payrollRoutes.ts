import { Router } from 'express';
import * as payrollController from '../controllers/payrollController';
import { authenticateToken, authorize } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Employee routes
router.get('/my-payroll', payrollController.getMyPayroll);
router.get('/:id', payrollController.getPayrollById);
router.get('/salary/details', payrollController.getSalaryDetails);

// Admin routes
router.post('/generate', authorize('Admin'), payrollController.generatePayroll);
router.get('/', authorize('Admin'), payrollController.getAllPayroll);
router.put('/:id/mark-paid', authorize('Admin'), payrollController.markPayrollAsPaid);
router.put('/salary/:userId', authorize('Admin'), payrollController.updateSalaryStructure);

export default router;
