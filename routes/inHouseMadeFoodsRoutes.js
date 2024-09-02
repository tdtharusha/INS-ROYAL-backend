import express from 'express';
import {
  getAllInHouseMadeFoods,
  getInHouseMadeFoodItem,
  updateInHouseReorderLevel,
} from '../controllers/InHouseMadeFoodsController.js';

const router = express.Router();

router.route('/').get(getAllInHouseMadeFoods);

router.route('/:productName').get(getInHouseMadeFoodItem);
router.route('/:productName/reorder-level').put(updateInHouseReorderLevel);

export default router;
