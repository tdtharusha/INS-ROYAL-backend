import asyncHandler from 'express-async-handler';
import InHouseMadeFoodsInventory from '../models/InHouseMadeFoodsInventoryModel.js';

// Get all in-house-made foods in the inventory
const getAllInHouseMadeFoods = asyncHandler(async (req, res) => {
  const inventory = await InHouseMadeFoodsInventory.find().populate(
    'brand',
    'name'
  );
  res.status(200).json(inventory);
});

// Get a specific in-house-made food item by product name
const getInHouseMadeFoodItem = asyncHandler(async (req, res) => {
  const item = await InHouseMadeFoodsInventory.findOne({
    productName: req.params.productName,
  }).populate('brand', 'name');

  if (item) {
    res.status(200).json(item);
  } else {
    res.status(404).json({ message: 'In-house-made food item not found' });
  }
});

const updateInHouseInventoryFromOrder = asyncHandler(async (orderItems) => {
  try {
    for (const item of orderItems) {
      const inventoryItem = await InHouseMadeFoodsInventory.findOne({
        productName: item.name,
      });
      if (inventoryItem) {
        inventoryItem.quantity = Math.max(
          0,
          inventoryItem.quantity - item.quantity
        );
        await inventoryItem.save();
        console.log(
          `Updated in-house inventory for ${item.name}: new quantity ${inventoryItem.quantity}`
        );
      } else {
        console.log(`In-house inventory item not found for ${item.name}`);
      }
    }
  } catch (err) {
    console.error('Error updating in-house inventory from order: ', err);
    throw err;
  }
});

// Update quantity of a specific in-house-made food item
// const updateInHouseMadeFoodItem = asyncHandler(async (req, res) => {
//   const { quantity, unit } = req.body;

//   const item = await InHouseMadeFoodsInventory.findOneAndUpdate(
//     { productName: req.params.productName },
//     { $inc: { quantity: quantity }, unit: unit, lastUpdated: Date.now() },
//     { new: true }
//   );

//   if (item) {
//     res.status(200).json(item);
//   } else {
//     res.status(404).json({ message: 'In-house-made food item not found' });
//   }
// });

const updateInHouseReorderLevel = asyncHandler(async (req, res) => {
  try {
    const { reorderLevel } = req.body;
    const { productName } = req.params;

    console.log(`Updating reorder level for ${productName} to ${reorderLevel}`);

    const item = await PreMadeFoodsInventory.findOneAndUpdate(
      { productName: productName },
      { reorderLevel: reorderLevel },
      { new: true }
    );

    if (item) {
      console.log('Item updated:', item);
      res.status(200).json(item);
    } else {
      console.log('Inventory item not found');
      res.status(404).json({ message: 'Inventory item not found' });
    }
  } catch (err) {
    console.error('Error in updateReorderLevel:', err);
    res
      .status(500)
      .json({ message: 'Error updating reorder level', error: err.message });
  }
});

export {
  getAllInHouseMadeFoods,
  getInHouseMadeFoodItem,
  updateInHouseInventoryFromOrder,
  updateInHouseReorderLevel,
  // updateInHouseMadeFoodItem,
};
