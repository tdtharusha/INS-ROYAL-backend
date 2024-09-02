import express from 'express';
const router = express.Router();
import { protect, admin } from '../middleware/authMiddleware.js';
import {
  produceInHouseMadeFoodsSpecialOrder,
  produceDailyInHouseMadeFoods,
} from '../controllers/dailyProductController.js';
// import { handleSpecialOrder } from '../controllers/dailyProductController.js';
router
  .route('/special-order')
  .post(protect, admin, produceInHouseMadeFoodsSpecialOrder);
router
  .route('/produce-daily')
  .post(protect, admin, produceDailyInHouseMadeFoods);
// router.post('/special-order', handleSpecialOrder);

export default router;
