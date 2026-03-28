import { Router } from 'express';
import * as leaveController from '../controllers/leaveController';
import { authenticateToken, authorize } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Employee routes
router.post('/apply', leaveController.applyLeave);
router.get('/my-leaves', leaveController.getMyLeaves);
router.get('/balance', leaveController.getLeaveBalance);

// Manager routes
router.get('/pending', authorize('Manager', 'Admin'), leaveController.getPendingLeaves);
router.put('/:id/approve', authorize('Manager', 'Admin'), leaveController.approveLeave);
router.put('/:id/reject', authorize('Manager', 'Admin'), leaveController.rejectLeave);

// Admin routes
router.get('/', authorize('Admin'), leaveController.getAllLeaves);

export default router;
