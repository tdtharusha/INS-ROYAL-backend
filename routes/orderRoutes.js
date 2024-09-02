import express from 'express';
const router = express.Router();
import {
  calculateShippingPrice,
  createOrder,
  getOrderById,
  updateOrderStatus,
  updateOrderToPaid,
  deleteOrder,
  getMyOrders,
  getOrders,
} from '../controllers/orderController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

router.route('/shippingPrice').post(protect, calculateShippingPrice);
router.route('/').get(protect, getOrders).post(protect, createOrder);
router.route('/:id').get(protect, getOrderById).delete(protect, deleteOrder);
router.route('/:id/status').put(protect, admin, updateOrderStatus);
router.route('/:id/pay').put(protect, updateOrderToPaid);
router.route('/myorders').get(protect, getMyOrders);

export default router;
