import cron from 'node-cron';
import Product from '../models/Product.js';
import DailyProduct from '../models/DailyProduct.js';
import {
  adjustInventory,
  adjustRecipeIngredients,
} from '../utils/inventoryAdjustment.js';

const issueDailyProducts = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  try {
    const products = await Product.find({ isActive: true });

    for (const product of products) {
      const dailyProduct = new DailyProduct({
        date: today,
        product: product._id,
        availableQuantity: product.defaultDailyQuantity,
        initialQuantity: product.defaultDailyQuantity,
      });

      await dailyProduct.save();

      if (product.category === 'Pre-made-foods') {
        await adjustInventory(product._id, -product.defaultDailyQuantity);
      }

      if (product.category === 'In-house-made-foods') {
        await adjustRecipeIngredients(
          product._id,
          product.defaultDailyQuantity
        );
      }
    }
    console.log('Daily products issued successfully');
  } catch (error) {
    console.error('Error issuing daily products:', error);
  }
};

// Schedule the job to run every day at midnight
cron.schedule('0 0 * * *', issueDailyProducts);

export default issueDailyProducts;
