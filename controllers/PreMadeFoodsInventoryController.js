import asyncHandler from 'express-async-handler';
import PreMadeFoodsInventory from '../models/PreMadeFoodsInventoryModel.js';

// Get all inventory items

const getAllInventory = asyncHandler(async (req, res) => {
  try {
    const inventory = await PreMadeFoodsInventory.find();
    res.status(200).json(inventory);
  } catch (err) {
    res
      .status(500)
      .json({ message: 'Error fetching inventory', error: err.message });
  }
});

// Get a single inventory item by product name

const getInventoryItem = asyncHandler(async (req, res) => {
  try {
    const item = await PreMadeFoodsInventory.findOne({
      productName: req.params.productName,
    });
    if (item) {
      res.status(200).json(item);
    } else {
      res.status(404).json({ message: 'Inventory item not found' });
    }
  } catch (err) {
    res
      .status(500)
      .json({ message: 'Error fetching item', error: err.message });
  }
});

// Update reorder level

const updateReorderLevel = asyncHandler(async (req, res) => {
  try {
    const { reorderLevel } = req.body;
    const { productName } = req.params;

    console.log(`Updating reorder level for ${productName} to ${reorderLevel}`);

    const item = await PreMadeFoodsInventory.findOneAndUpdate({
      productName: productName,
    });

    if (item) {
      item.reorderLevel = reorderLevel;
      item.updateReorderStatus();
      await item.save();
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

// Internal function to update inventory from GRN

const updateInventoryFromGRN = asyncHandler(async (items) => {
  try {
    for (const item of items) {
      await PreMadeFoodsInventory.findOneAndUpdate(
        { productName: item.productName },
        {
          $inc: { quantity: item.quantityReceived },
          $setOnInsert: {
            // brand: brandId,
            unit: item.unit,
            reorderLevel: 0,
          },
          $set: { isAtReorderLevel: false },
        },
        { upsert: true, new: true }
      );
      // console.log('updated inventory', item);
    }
  } catch (err) {
    console.error('Error updating inventory from GRN: ', err);
    throw err;
  }
});

const updatePreMadeInventoryFromOrder = asyncHandler(async (orderItems) => {
  try {
    for (const item of orderItems) {
      const inventoryItem = await PreMadeFoodsInventory.findOne({
        productName: item.name,
      });
      if (inventoryItem) {
        inventoryItem.quantity = Math.max(
          0,
          inventoryItem.quantity - item.quantity
        );
        await inventoryItem.save();
        console.log(
          `Updated pre-made inventory for ${item.name}: new quantity ${inventoryItem.quantity}`
        );
      } else {
        console.log(`Pre-made inventory item not found for ${item.name}`);
      }
    }
  } catch (err) {
    console.error('Error updating pre-made inventory from order: ', err);
    throw err;
  }
});

// Internal funcction to update inventory when GRN is deleted

const decreaseInventoryItem = asyncHandler(async (items) => {
  try {
    for (const item of items) {
      const inventoryItem = await PreMadeFoodsInventory.findOne({
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
    console.error('Error decreasing inventory from GRN: ', err);
    throw err;
  }
});

// Check low stock items

const getLowStockItems = asyncHandler(async (req, res) => {
  try {
    const lowStockItems = await PreMadeFoodsInventory.find({
      $expr: { $lte: ['$quantity', '$reorderLevel'] },
    });
    res.status(200).json(lowStockItems);
  } catch (err) {
    res
      .status(500)
      .json({ message: 'Error fetching low stock items', error: err.message });
  }
});

// Generate an inventory report

// const generateInventoryReport = asyncHandler(async (req, res) => {
//   try {
//     const inventoryItems = await PreMadeFoodsInventory.find();

//     const report = {
//       totalItems: inventoryItems.length,
//       totalQuantity: inventoryItems.reduce(
//         (sum, item) => sum + item.quantity,
//         0
//       ),
//       lowStockItems: inventoryItems.filter(
//         (item) => item.quantity <= item.reorderLevel
//       ).length,
//       categorySummary: {},
//     };

//     inventoryItems.forEach((item) => {
//       if (!report.categorySummary[item.category]) {
//         report.categorySummary[item.category] = {
//           itemCount: 0,
//           totalQuantity: 0,
//         };
//       }
//       report.categorySummary[item.category].itemCount++;
//       report.categorySummary[item.category].totalQuantity += item.quantity;
//     });

//     res.status(200).json(report);
//   } catch (err) {
//     res.status(500).json({
//       message: 'Error generating inventory report',
//       error: err.message,
//     });
//   }
// });

// Search inventory by category

const SearchInventoryByCategory = asyncHandler(async (req, res) => {
  try {
    const { category } = req.query;
    if (!category) {
      return res
        .status(400)
        .json({ message: 'Category parameter is required' });
    }

    const items = await PreMadeFoodsInventory.find({ category });
    res.status(200).json(items);
  } catch (err) {
    res
      .status(500)
      .json({ message: 'Error searching inventory', error: err.message });
  }
});

export {
  getAllInventory,
  getInventoryItem,
  updateReorderLevel,
  updateInventoryFromGRN,
  updatePreMadeInventoryFromOrder,
  decreaseInventoryItem,
  getLowStockItems,
  //generateInventoryReport,
  SearchInventoryByCategory,
};
