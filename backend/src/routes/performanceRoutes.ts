import { Router } from 'express';
import * as performanceController from '../controllers/performanceController';
import { authenticateToken, authorize } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Employee routes
router.get('/my-reviews', performanceController.getMyReviews);
router.get('/user/:userId', performanceController.getUserPerformanceHistory);

// Manager routes
router.post('/add-review', authorize('Manager', 'Admin'), performanceController.addReview);
router.get('/team/reviews', authorize('Manager', 'Admin'), performanceController.getTeamReviews);
router.put('/:id', authorize('Manager', 'Admin'), performanceController.updateReview);

// Admin routes
router.get('/', authorize('Admin'), performanceController.getAllReviews);
router.delete('/:id', authorize('Admin'), performanceController.deleteReview);

export default router;
