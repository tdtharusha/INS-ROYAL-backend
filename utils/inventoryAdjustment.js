import asyncHandler from 'express-async-handler';
import PreMadeFoodsInventory from '../models/PreMadeFoodsInventoryModel.js';
import MaterialsInventory from '../models/MaterialsInventoryModel.js';
import Recipe from '../models/recipeModel.js';
import InHouseMadeFoodsInventory from '../models/InHouseMadeFoodsInventoryModel.js';
import convertUnit from './unitConversion.js';
import { checkAndUpdateMaterialsForRecipe } from '../controllers/MaterialsInventoryController.js';

const adjustPreMadeFoodsInventory = asyncHandler(
  async (productName, quantity, unit) => {
    const inventoryItem = await PreMadeFoodsInventory.findOne({ productName });
    if (inventoryItem) {
      inventoryItem.quantity += quantity;
      inventoryItem.unit = unit;
      await inventoryItem.save();
    } else {
      throw new Error(`Inventory item not found for product: ${productName}`);
    }
  }
);

const adjustMaterialsInventory = asyncHandler(
  async (productName, quantity, unit) => {
    const material = await MaterialsInventory.findOne({
      productName: { $regex: new RegExp(productName, 'i') },
    });

    if (!material) {
      throw new Error(`Material ${productName} not found in inventory`);
    }

    const adjustedQuantity = convertUnit(quantity, unit, material.unit);
    material.quantity += adjustedQuantity;

    if (material.quantity < 0) {
      throw new Error(`Insufficient quantity for ${productName}`);
    }
    await material.save();
  }
);

const adjustRecipeIngredients = asyncHandler(
  async (productId, quantity, unit) => {
    const recipe = await Recipe.findOne({ productName });
    if (recipe) {
      for (const ingredient of recipe.ingredients) {
        await adjustMaterialsInventory(
          ingredient.name,
          -ingredient.quantity * quantity,
          ingredient.unit
        );
      }
    } else {
      throw new Error(`Recipe not found for product ID: ${productId}`);
    }
  }
);

const adjustInHouseMadeFoodsInventory = asyncHandler(
  async (productName, brandId, quantity, unit) => {
    // console.log('Unit passed to adjustInHouseMadeFoodsInventory:', unit);
    let inventoryItem = await InHouseMadeFoodsInventory.findOne({
      productName,
      brand: brandId,
    });
    if (inventoryItem) {
      inventoryItem.quantity = quantity;
      inventoryItem.unit = unit;
      await inventoryItem.save();
    } else {
      inventoryItem = new InHouseMadeFoodsInventory({
        productName,
        brand: brandId,
        quantity,
        unit,
      });
      await inventoryItem.save();
    }
  }
);

const produceInHouseMadeFood = asyncHandler(
  async (productName, brandId, quantity) => {
    const recipe = await Recipe.findOne({ productName, brand: brandId });

    if (!recipe) {
      throw new Error(`Recipe not found for product: ${productName}`);
    }

    // Check and update materials inventory
    await checkAndUpdateMaterialsForRecipe(recipe, quantity);

    // Add to In-house-made-foods inventory
    await adjustInHouseMadeFoodsInventory(
      productName,
      brandId,
      quantity,
      'piece'
    );
  }
);

{
  /*const adjustInventoryForDailyProduct = asyncHandler(async (req, res) => {
  if (product.category === 'Pre-made-foods') {
    await adjustInventory(product.name, -quantityChange);
  } else if (product.category === 'In-house-made-foods') {
    await adjustRecipeIngredients(product._id, quantityChange);
  }
});*/
}

export {
  adjustPreMadeFoodsInventory,
  adjustMaterialsInventory,
  adjustRecipeIngredients,
  adjustInHouseMadeFoodsInventory,
  produceInHouseMadeFood,
};
