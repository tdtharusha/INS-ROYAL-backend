import express from 'express';
const router = express.Router();
import { protect, admin } from '../middleware/authMiddleware.js';
import {
  getAllBrands,
  getBrandById,
  registerBrand,
  updateBrand,
  deleteBrand,
} from '../controllers/brandController.js';

router
  .route('/')
  .get(protect, admin, getAllBrands)
  .post(protect, admin, registerBrand);
router
  .route('/:id')
  .get(protect, admin, getBrandById)
  .delete(protect, admin, deleteBrand)
  .put(protect, admin, updateBrand);

export default router;
