import express from 'express';
const router = express.Router();
import { protect, admin } from '../middleware/authMiddleware.js';
import {
  getSuppliersBrandsAndProducts,
  getSupplierQuantity,
  createGRN,
  getGRNs,
  getGRNById,
  updateGRN,
  deleteGRN,
} from '../controllers/grnController.js';

router.get('/supplier-quantity/:supplierId', getSupplierQuantity);
router.route('/').post(protect, admin, createGRN).get(protect, admin, getGRNs);
router
  .route('/suppliers-brands-products')
  .get(protect, admin, getSuppliersBrandsAndProducts);
router
  .route('/:id')
  .get(protect, admin, getGRNById)
  .put(protect, admin, updateGRN)
  .delete(protect, admin, deleteGRN);

export default router;
