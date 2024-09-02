{
  /*import mongoose from 'mongoose';
import Recipe from '../models/recipeModel.js';
import Brand from '../models/brandModel.js';
import Product from '../models/productModel.js';

dotenv.config();

connectDB();

const seedRecipes = async () => {
  try {
    // Assuming you have a default brand and products already in the database
    const defaultBrand = await Brand.findOne();
    const defaultProduct = await Product.findOne({
      category: 'Inhouse-made-food',
    });

    const recipes = [
      {
        brand: 'InsRoyal - Kottu',
        productName: 'Vege Kottu',
        category: 'Inhouse-made-food',
        cuisine: 'Local',
        subSection: 'Local Cusine',
        ingredients: [
          { name: 'rice', quantity: 200, unit: 'g' },
          { name: 'dhall', quantity: 150, unit: 'g' },
          { name: 'brinjals', quantity: 100, unit: 'g' },
          { name: 'green_beans', quantity: 100, unit: 'g' },
          { name: 'potato', quantity: 50, unit: 'g' },
          { name: 'onion', quantity: 20, unit: 'g' },
          { name: 'water', quantity: 150, unit: 'ml' },
          { name: 'salt', quantity: 2, unit: 'g' },
          { name: 'garlic', quantity: 2, unit: 'g' },
          { name: 'ginger', quantity: 1, unit: 'g' },
        ],
      },
      // Add more recipes here following the same structure
    ];

    await Recipe.insertMany(recipes);
    console.log('Recipes seeded successfully');
  } catch (error) {
    console.error('Error seeding recipes:', error);
  } finally {
    mongoose.disconnect();
  }
};

seedRecipes();
*/
}
