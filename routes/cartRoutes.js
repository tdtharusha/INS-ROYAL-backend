import express from 'express';
const router = express.Router();
import { protect } from '../middleware/authMiddleware.js';
import {
  getCart,
  addtoCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from '../controllers/cartController.js';

router
  .route('/')
  .get(protect, getCart)
  .post(protect, addtoCart)
  .delete(protect, clearCart);
router
  .route('/:productId')
  .put(protect, updateCartItem)
  .delete(protect, removeFromCart);

export default router;
