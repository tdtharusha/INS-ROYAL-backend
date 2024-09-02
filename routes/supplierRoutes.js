import express from 'express';
const router = express.Router();
import { protect, admin } from '../middleware/authMiddleware.js';
import {
  getAllSuppliers,
  getSupplierById,
  registerSupplier,
  updateSupplier,
  deleteSupplier,
} from '../controllers/supplierController.js';

router
  .route('/')
  .get(protect, admin, getAllSuppliers)
  .post(protect, admin, registerSupplier);
router
  .route('/:id')
  .get(protect, admin, getSupplierById)
  .put(protect, admin, updateSupplier)
  .delete(protect, admin, deleteSupplier);

export default router;
