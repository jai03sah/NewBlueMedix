import express from 'express';
import {
  createFranchise,
  getAllFranchises,
  getFranchiseById,
  updateFranchise,
  assignManagerToFranchise,
  getFranchiseOrders,
  getFranchiseStats,
  getPublicFranchises,
  deleteFranchise
} from '../controllers/franchise.controller.js';
import { verifyToken, isAdmin, isAdminOrManager } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes (no authentication required)
router.get('/public', getPublicFranchises);

// Admin routes
router.post('/', verifyToken, isAdmin, createFranchise);
router.get('/', verifyToken, isAdmin, getAllFranchises);
router.put('/:franchiseId', verifyToken, isAdmin, updateFranchise);
router.delete('/:franchiseId', verifyToken, isAdmin, deleteFranchise);
router.post('/assign-manager', verifyToken, isAdmin, assignManagerToFranchise);

// Admin or manager routes
router.get('/:franchiseId', verifyToken, isAdminOrManager, getFranchiseById);
router.get('/:franchiseId/orders', verifyToken, isAdminOrManager, getFranchiseOrders);
router.get('/:franchiseId/stats', verifyToken, isAdminOrManager, getFranchiseStats);

export default router;