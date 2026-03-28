import { Router } from 'express';
import * as attendanceController from '../controllers/attendanceController';
import { authenticateToken, authorize } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Employee routes
router.post('/check-in', attendanceController.checkIn);
router.post('/check-out', attendanceController.checkOut);
router.get('/today', attendanceController.getTodayAttendance);
router.get('/my-records', attendanceController.getAttendanceRecords);
router.get('/stats', attendanceController.getAttendanceStats);

// Manager routes
router.get('/team/attendance', authorize('Manager', 'Admin'), attendanceController.getTeamAttendance);

// Admin routes
router.get('/', authorize('Admin'), attendanceController.getAttendanceRecords);

export default router;
