import asyncHandler from 'express-async-handler';
import Recipe from '../models/recipeModel.js';
import { produceInHouseMadeFood } from '../utils/inventoryAdjustment.js';
import { checkAndUpdateMaterialsForRecipe } from '../controllers/MaterialsInventoryController.js';
import {
  isProductionAllowedToday,
  markProductionDone,
} from '../utils/dailyProductionTracker.js';

const produceDailyInHouseMadeFoods = asyncHandler(async (req, res) => {
  try {
    // Check if production is allowed today
    if (!(await isProductionAllowedToday())) {
      return res
        .status(400)
        .json({ message: 'Daily production has already been done today' });
    }

    const recipes = await Recipe.find();
    const productionResults = [];

    for (const recipe of recipes) {
      try {
        await produceInHouseMadeFood(
          recipe.productName,
          recipe.brand,
          recipe.defaultDailyQuantity
        );
        productionResults.push({
          productName: recipe.productName,
          status: 'success',
          quantity: recipe.defaultDailyQuantity,
        });
      } catch (error) {
        productionResults.push({
          productName: recipe.productName,
          status: 'failed',
          error: error.message,
        });
      }
    }

    // Mark production as done for today
    await markProductionDone();

    res.status(200).json(productionResults);
  } catch (err) {
    res.status(500).json({
      message: 'Error producing daily products',
      error: err.message,
    });
  }
});

const produceInHouseMadeFoodsSpecialOrder = asyncHandler(async (req, res) => {
  try {
    const { productName, brandId, quantity } = req.body;

    // Add input validation
    if (!productName || !brandId || !quantity) {
      return res.status(400).json({
        message: 'Missing required fields: productName, brandId, or quantity',
      });
    }

    // console.log(`Attempting to produce special order: ${productName}, ${brandId}, ${quantity}`);

    await produceInHouseMadeFood(productName, brandId, quantity);

    res.status(200).json({ message: 'Special order produced successfully' });
  } catch (err) {
    // console.error('Error in produceInHouseMadeFoodsSpecialOrder:', err);
    res.status(500).json({
      message: 'Error producing special order',
      error: err.message,
    });
  }
});

export { produceDailyInHouseMadeFoods, produceInHouseMadeFoodsSpecialOrder };
