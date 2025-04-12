import express from 'express';
import {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus, 
  updatePaymentStatus,
  getUserOrders,
  generateInvoice
} from '../controllers/order.controller.js';
import { verifyToken, isAdmin, isAdminOrManager } from '../middleware/auth.middleware.js';

const router = express.Router();

// User routes
router.post('/', verifyToken, createOrder);
router.get('/my-orders', verifyToken, getUserOrders);

// Admin or manager routes
router.get('/', verifyToken, isAdminOrManager, getAllOrders);
router.patch('/:orderId/status', verifyToken, isAdminOrManager, updateOrderStatus);
router.post('/:orderId/invoice', verifyToken, isAdminOrManager, generateInvoice);

// Order details route - accessible to all authenticated users
// The controller will handle permission checks to ensure users can only see their own orders
router.get('/:orderId', verifyToken, getOrderById);

// Admin only routes
router.patch('/:orderId/payment', verifyToken, isAdmin, updatePaymentStatus);

export default router;