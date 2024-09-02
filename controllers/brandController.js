import asyncHandler from 'express-async-handler';
import Brand from '../models/brandModel.js';

// desc - Get all brands
// route - Get /api/brands
const getAllBrands = asyncHandler(async (req, res) => {
  try {
    const brands = await Brand.find();
    res.status(200).json(brands);
  } catch (err) {
    res
      .status(500)
      .json({ message: 'Error getting all brands', error: err.message });
  }
});

// desc - Get single brand
// route - GET /api/brands/:id
const getBrandById = asyncHandler(async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);

    if (!brand) {
      res.status(404).json({ message: 'Brand not found' });
    }
    res.status(200).json(brand);
  } catch (err) {
    res
      .status(500)
      .json({ message: 'Error getting Brand by ID', error: err.message });
  }
});

// desc - Register a new brand
// route - POST /api/brands
const registerBrand = asyncHandler(async (req, res) => {
  try {
    const { name, productNames } = req.body;
    //console.log(name, productNames);
    if (!name || name.trim() === '') {
      return res.status(400).json({ message: 'Brand name is required' });
    }

    const existingBrand = await Brand.findOne({ name });
    if (existingBrand) {
      return res.status(400).json({ message: 'Brand already exists' });
    }

    //Create new brand
    const newBrand = new Brand({
      name,
      productNames,
    });

    //Save brand
    const savedBrand = await newBrand.save();
    res.status(201).json(savedBrand);
  } catch (err) {
    res
      .status(500)
      .json({ message: 'Error registering Brand', error: err.message });
  }
});

// desc - Update a brand
// route - PUT /api/brands/:id
const updateBrand = asyncHandler(async (req, res) => {
  try {
    const { name, productNames } = req.body;
    const brand = await Brand.findById(req.params.id);
    if (!brand) {
      return res.status(404).json({ message: 'Brand not found' });
    }
    brand.name = name || brand.name;
    brand.productNames = productNames || brand.productNames;
    const updatedBrand = await brand.save();
    res.status(200).json(updatedBrand);
  } catch (err) {
    res
      .status(500)
      .json({ message: 'Error updating Brand', error: err.message });
  }
});

// desc - Delete a brand
// route - DELETE /api/brands/:id

const deleteBrand = asyncHandler(async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);
    if (!brand) {
      return res.status(404).json({ message: 'Brand not found' });
    }
    await brand.deleteOne();
    res.status(200).json({ message: 'Brand deleted' });
  } catch (err) {
    res
      .status(500)
      .json({ message: 'Error deleting Brand', error: err.message });
  }
});

export { getAllBrands, getBrandById, registerBrand, updateBrand, deleteBrand };
