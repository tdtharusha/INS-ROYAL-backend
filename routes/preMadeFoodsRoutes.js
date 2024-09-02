import express from 'express';
const router = express.Router();
import { protect, admin } from '../middleware/authMiddleware.js';
import {
  getAllInventory,
  getInventoryItem,
  updateReorderLevel,
  getLowStockItems,
  //generateInventoryReport,
  SearchInventoryByCategory,
} from '../controllers/PreMadeFoodsInventoryController.js';

router.route('/').get(getAllInventory);
router.route('/low-stock').get(protect, admin, getLowStockItems);
//router.route('/report').get(protect, admin, generateInventoryReport);
router.route('/search').get(protect, admin, SearchInventoryByCategory);
router.route('/:productName').get(getInventoryItem);
router
  .route('/:productName/reorder-level')
  .put(protect, admin, updateReorderLevel);

export default router;
