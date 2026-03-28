import { Router } from 'express';
import * as userController from '../controllers/userController';
import { authenticateToken, authorize } from '../middleware/auth';

const router = Router();

// All user routes require authentication
router.use(authenticateToken);

// Get all users (Admin only)
router.get('/', authorize('Admin'), userController.getAllUsers);

// Search users
router.get('/search', userController.searchUsers);

// Get user by ID
router.get('/:id', userController.getUserById);

// Create user (Admin only)
router.post('/', authorize('Admin'), userController.createUser);

// Update user
router.put('/:id', userController.updateUser);

// Delete user (Admin only)
router.delete('/:id', authorize('Admin'), userController.deleteUser);

// Get team (for managers)
router.get('/team/members', userController.getTeam);

export default router;
