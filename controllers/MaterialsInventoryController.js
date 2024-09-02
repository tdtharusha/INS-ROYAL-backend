import asyncHandler from 'express-async-handler';
import MaterialsInventory from '../models/MaterialsInventoryModel.js';
import convertUnit from '../utils/unitConversion.js';
import { adjustMaterialsInventory } from '../utils/inventoryAdjustment.js';

// function convertUnit(value, fromUnit, toUnit) {
//   // Simple conversion for demonstration
//   if (fromUnit === toUnit) return value;
//   if (fromUnit === 'g' && toUnit === 'kg') return value / 1000;
//   if (fromUnit === 'kg' && toUnit === 'g') return value * 1000;
//   if (fromUnit === 'piece' && toUnit === 'piece') return value;
//   throw new Error(`Conversion from ${fromUnit} to ${toUnit} not supported`);
// }

const getAllMaterialsInventory = asyncHandler(async (req, res) => {
  try {
    const materialsInventory = await MaterialsInventory.find();
    res.status(200).json(materialsInventory);
  } catch (err) {
    res.status(500).json({
      message: 'Error fetching materials inventory',
      error: err.message,
    });
  }
});

const getMaterialsInventoryItem = asyncHandler(async (req, res) => {
  try {
    const item = await MaterialsInventory.findOne({
      productName: req.params.productName,
    });
    if (item) {
      res.status(200).json(item);
    } else {
      res.status(404).json({ message: 'Materials inventory item not found' });
    }
  } catch (err) {
    res
      .status(500)
      .json({ message: 'Error fetching materials item', error: err.message });
  }
});

const updateMaterialsReorderLevel = asyncHandler(async (req, res) => {
  try {
    const { reorderLevel } = req.body;
    const { productName } = req.params;

    const item = await MaterialsInventory.findOneAndUpdate(
      { productName: productName },
      { reorderLevel: reorderLevel },
      { new: true }
    );

    if (item) {
      res.status(200).json(item);
    } else {
      res.status(404).json({ message: 'Materials inventory item not found' });
    }
  } catch (err) {
    res.status(500).json({
      message: 'Error updating materials reorder level',
      error: err.message,
    });
  }
});

// Internal function to update inventory from GRN
const updateMaterialsInventoryFromGRN = asyncHandler(async (items) => {
  try {
    for (const item of items) {
      await MaterialsInventory.findOneAndUpdate(
        { productName: item.productName },
        {
          $inc: { quantity: item.quantityReceived },
          $setOnInsert: {
            unit: item.unit,
            reorderLevel: 0,
          },
        },
        { upsert: true, new: true }
      );
    }
  } catch (err) {
    console.error('Error updating materials inventory from GRN: ', err);
    throw err;
  }
});

const decreaseMaterialsInventoryItem = asyncHandler(async (items) => {
  try {
    for (const item of items) {
      const inventoryItem = await MaterialsInventory.findOne({
        productName: item.productName,
      });
      if (inventoryItem) {
        inventoryItem.quantity = Math.max(
          0,
          inventoryItem.quantity - item.quantityReceived
        );
        await inventoryItem.save();
      }
    }
  } catch (err) {
    console.error('Error decreasing materials inventory from GRN: ', err);
    throw err;
  }
});

const getLowStockMaterials = asyncHandler(async (req, res) => {
  try {
    const lowStockItems = await MaterialsInventory.find({
      $expr: { $lte: ['$quantity', '$reorderLevel'] },
    });
    res.status(200).json(lowStockItems);
  } catch (err) {
    res.status(500).json({
      message: 'Error fetching low stock materials',
      error: err.message,
    });
  }
});

const checkMaterialsAvailability = asyncHandler(async (recipe, quantity) => {
  for (const ingredient of recipe.ingredients) {
    console.log(`Checking availability for ingredient: ${ingredient.name}`);
    const materialInventory = await MaterialsInventory.findOne({
      productName: { $regex: new RegExp('^' + ingredient.name + '$', 'i') },
    });
    if (!materialInventory) {
      console.log(`Material not found in inventory: ${ingredient.name}`);
      return false;
    }

    console.log(
      `Material found: ${materialInventory.productName}, Quantity: ${materialInventory.quantity} ${materialInventory.unit}`
    );

    const requiredQuantity = ingredient.quantity * quantity;
    let availableQuantity;
    try {
      availableQuantity = convertUnit(
        materialInventory.quantity,
        materialInventory.unit,
        ingredient.unit
      );
      console.log('available quantity:', availableQuantity);
      console.log(
        `Converted quantity: ${availableQuantity} ${ingredient.unit}`
      );
    } catch (error) {
      console.log(
        `Unit conversion error for ${ingredient.name}: ${error.message}`
      );
      return false;
    }
    if (availableQuantity < requiredQuantity) {
      console.log(
        `Insufficient quantity for ${ingredient.name}: Required ${requiredQuantity} ${ingredient.unit}, Available ${availableQuantity} ${ingredient.unit}`
      );
      return false;
    }
  }
  return true;
});

// Add this function to check and update materials inventory for recipe production
const checkAndUpdateMaterialsForRecipe = asyncHandler(
  async (recipe, quantity) => {
    const materialsToUpdate = [];

    for (const ingredient of recipe.ingredients) {
      const materialInventory = await MaterialsInventory.findOne({
        productName: { $regex: new RegExp('^' + ingredient.name + '$', 'i') },
      });

      if (!materialInventory) {
        throw new Error(`Material not found in inventory: ${ingredient.name}`);
      }

      const requiredQuantity = ingredient.quantity * quantity;
      let availableQuantity;

      try {
        availableQuantity = convertUnit(
          materialInventory.quantity,
          materialInventory.unit,
          ingredient.unit
        );
      } catch (error) {
        throw new Error(
          `Unit conversion error for ${ingredient.name}: ${error.message}`
        );
      }

      if (availableQuantity < requiredQuantity) {
        throw new Error(
          `Insufficient quantity for ${ingredient.name}: Required ${requiredQuantity} ${ingredient.unit}, Available ${availableQuantity} ${ingredient.unit}`
        );
      }

      materialsToUpdate.push({
        productName: materialInventory.productName,
        quantity: -requiredQuantity,
        unit: ingredient.unit,
      });
    }

    // Update materials inventory
    for (const material of materialsToUpdate) {
      await adjustMaterialsInventory(
        material.productName,
        material.quantity,
        material.unit
      );
    }
  }
);

// const generateMaterialsInventoryReport = asyncHandler(async (req, res) => {
//   try {
//     const inventoryItems = await MaterialsInventory.find();

//     const report = {
//       totalItems: inventoryItems.length,
//       totalQuantity: inventoryItems.reduce(
//         (sum, item) => sum + item.quantity,
//         0
//       ),
//       lowStockItems: inventoryItems.filter(
//         (item) => item.quantity <= item.reorderLevel
//       ).length,
//     };

//     res.status(200).json(report);
//   } catch (err) {
//     res.status(500).json({
//       message: 'Error generating materials inventory report',
//       error: err.message,
//     });
//   }
// });

export {
  getAllMaterialsInventory,
  getMaterialsInventoryItem,
  updateMaterialsReorderLevel,
  updateMaterialsInventoryFromGRN,
  decreaseMaterialsInventoryItem,
  getLowStockMaterials,
  checkMaterialsAvailability,
  checkAndUpdateMaterialsForRecipe,
  adjustMaterialsInventory,
  //   generateMaterialsInventoryReport,
};
