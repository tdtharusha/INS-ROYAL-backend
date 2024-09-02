import express from 'express';
const router = express.Router();
import { protect, admin } from '../middleware/authMiddleware.js';
import {
  getAllMaterialsInventory,
  getMaterialsInventoryItem,
  updateMaterialsReorderLevel,
  getLowStockMaterials,
  //generateMaterialsInventoryReport,,
} from '../controllers/MaterialsInventoryController.js';

router.route('/').get(protect, admin, getAllMaterialsInventory);
router.route('/low-stock').get(protect, admin, getLowStockMaterials);
//router.route('/report').get(protect, admin, generateInventoryReport);
router.route('/:productName').get(protect, admin, getMaterialsInventoryItem);
router
  .route('/:productName/reorder-level')
  .put(protect, admin, updateMaterialsReorderLevel);

export default router;
