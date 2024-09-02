import express from 'express';
const router = express.Router();
import { protect, admin } from '../middleware/authMiddleware.js';
import {
  getALLRecipes,
  getRecipeById,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  getProductsAndBrand,
} from '../controllers/recipeController.js';

router.get('/products', protect, admin, getProductsAndBrand);

router
  .route('/')
  .get(protect, admin, getALLRecipes)
  .post(protect, admin, createRecipe);
router
  .route('/:id')
  .get(protect, admin, getRecipeById)
  .put(protect, admin, updateRecipe)
  .delete(protect, admin, deleteRecipe);

export default router;
