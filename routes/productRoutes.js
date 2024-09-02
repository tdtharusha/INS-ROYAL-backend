import express from 'express';
const router = express.Router();
import { protect, admin } from '../middleware/authMiddleware.js';
import {
  getProducts,
  createProduct,
  getProductById,
  deleteProduct,
  updateProduct,
  createProductReview,
  getTopProducts,
  getProductsByBrand,
  // getInHouseMadedFoods,
  getInHouseMadeProducts,
} from '../controllers/productController.js';

router.route('/in-house-foods').get(protect, admin, getInHouseMadeProducts);
router.route('/top-products').get(getTopProducts);
router.route('/').get(getProducts).post(protect, admin, createProduct);
router
  .route('/:id')
  .get(getProductById)
  .delete(protect, admin, deleteProduct)
  .put(protect, admin, updateProduct);
router.route('/:id/reviews').post(protect, createProductReview);
router.route('/brands/:id', getProductsByBrand);
// router.get('/in-house-made-products', getInHouseMadeProducts);

export default router;
