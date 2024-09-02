import express from 'express';
const router = express.Router();
import { protect, admin } from '../middleware/authMiddleware.js';
import {
  getOrderInvoice,
  getRevenueReport,
  getExpenseReport,
  getGRNInvoice,
  getInventoryReport,
  getProfitReport,
} from '../controllers/reportController.js';

router.route('/order-invoice/:orderId').get(protect, admin, getOrderInvoice);
router.route('/revenue').get(protect, admin, getRevenueReport);
router.route('/expense').get(protect, admin, getExpenseReport);
router.route('/grn-invoice/:grnId').get(protect, admin, getGRNInvoice);
router.route('/inventory-report').get(protect, admin, getInventoryReport);
router.route('/profit').get(protect, admin, getProfitReport);

export default router;
