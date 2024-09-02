import asyncHandler from 'express-async-handler';
import Recipe from '../models/recipeModel.js';
import Brand from '../models/brandModel.js';
import Product from '../models/productModel.js';

// Get all recipes

const getALLRecipes = asyncHandler(async (req, res) => {
  try {
    const recipes = await Recipe.find().populate('brand', 'name');
    res.status(200).json(recipes);
  } catch (err) {
    res
      .status(500)
      .json({ message: 'Error getting recipes', error: err.message });
  }
});

// Get recipe by ID

const getRecipeById = asyncHandler(async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id).populate(
      'brand',
      'name'
    );
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    res.status(200).json(recipe);
  } catch (err) {
    res
      .status(500)
      .json({ message: 'Error getting recipes', error: err.message });
  }
});

// Create a recipe

const createRecipe = asyncHandler(async (req, res) => {
  try {
    const { brandId, productName, ...recipeData } = req.body;

    // Verify that the brand exists
    const brand = await Brand.findById(brandId);
    if (!brand) {
      return res.status(404).json({ message: 'Brand not found' });
    }

    // Find the product by name and brand, and check its category
    const product = await Product.findOne({
      name: productName,
      brand: brandId,
    });
    if (!product) {
      return res
        .status(404)
        .json({ message: 'Product not found for this brand' });
    }

    if (product.category !== 'In-house-made-foods') {
      return res
        .status(400)
        .json({ message: 'Only In-house-made-food products can have recipes' });
    }

    const recipe = new Recipe({
      ...recipeData,
      brand: brandId,
      productName,
      category: 'In-house-made-foods',
    });

    await recipe.save();
    res.status(201).json(recipe);
  } catch (err) {
    res
      .status(500)
      .json({ message: 'Error creating recipe', error: err.message });
  }
});

// Update a recipe

const updateRecipe = asyncHandler(async (req, res) => {
  try {
    const { brandId, productName, ...updateData } = req.body;

    if (brandId && productName) {
      const brand = await Brand.findById(brandId);
      if (!brand) {
        return res.status(404).json({ message: 'Brand not found' });
      }

      const product = await Product.findOne({
        name: productName,
        brand: brandId,
      });
      if (!product) {
        return res
          .status(404)
          .json({ message: 'Product not found for this brand' });
      }

      if (product.category !== 'In-house-made-foods') {
        return res.status(400).json({
          message: 'Only In-house-made-food products can have recipes',
        });
      }

      updateData.brand = brandId;
      updateData.productName = productName;
    }

    const recipe = await Recipe.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    res.status(200).json(recipe);
  } catch (err) {
    res
      .status(500)
      .json({ message: 'Error updating recipe', error: err.message });
  }
});

// Delete a recipe

const deleteRecipe = asyncHandler(async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    await recipe.deleteOne();
    res.status(200).json({ message: 'Recipe deleted successfully' });
  } catch (err) {
    res
      .status(500)
      .json({ message: 'Error deleting recipe', error: err.message });
  }
});

// Get product by brand

const getProductsAndBrand = asyncHandler(async (req, res) => {
  try {
    const products = await Product.find({
      category: 'In-house-made-foods',
    })
      .select('name brand -_id')
      .populate('brand', 'name');

    //console.log('products', products);

    if (products.length === 0) {
      return res.status(404).json({
        message: 'No in-house-made food products found',
      });
    }
    res.status(200).json(products);
  } catch (err) {
    //console.log('Error in the function', err);
    res
      .status(500)
      .json({ message: 'Error getting product names', error: err.message });
  }
});

export {
  getALLRecipes,
  getRecipeById,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  getProductsAndBrand,
};
