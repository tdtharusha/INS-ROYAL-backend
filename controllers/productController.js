import asyncHandler from 'express-async-handler';
import Product from '../models/productModel.js';
import Brand from '../models/brandModel.js';

// desc - Get all products
// route - GET /api/products
const getProducts = asyncHandler(async (req, res) => {
  try {
    const products = await Product.find()
      .populate('brand', 'name')
      .select('name brand category image unitPrice description reviews');
    res.status(200).json(products);
  } catch (err) {
    res
      .status(500)
      .json({ message: 'Error getting all products', error: err.message });
  }
});

// desc - Get single product
// route - GET /api/products/:id

const getProductById = asyncHandler(async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('brand', 'name')
      .select('name brand category image unitPrice description reviews');
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json(product);
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error fetching product', error: error.message });
  }
});

// desc - Create a product
// route - POST /api/products

const createProduct = asyncHandler(async (req, res) => {
  try {
    const { name, brandId, category, image, unitPrice, description } = req.body;

    // Check if the brand exists
    const brand = await Brand.findById(brandId);
    if (!brand) {
      return res.status(404).json({ message: 'Brand not found' });
    }

    // Check if the product name is associated with the brand
    if (!brand.productNames.includes(name)) {
      return res
        .status(400)
        .json({ message: 'Product name not associated with the brand' });
    }

    const newProduct = new Product({
      name,
      brand: brandId,
      category,
      image,
      unitPrice,
      description,
    });
    const saveProduct = await newProduct.save();
    res.status(201).json(saveProduct);
  } catch (err) {
    res
      .status(500)
      .json({ message: 'Error registering product', error: err.message });
  }
});

const getProductsByBrand = asyncHandler(async (req, res) => {
  try {
    const { brandId } = req.params;
    const products = await Product.find({ brand: brandId }).populate(
      'brand',
      'name'
    );
    res.status(200).json(products);
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error fetching products', error: error.message });
  }
});

// const getInHouseMadedFoods = asyncHandler(async (req, res) => {
//   try {
//     if (category == 'In-house-made-foods') {
//       const products = await Product.find()
//         .populate('brand', 'name')
//         .select('name brand category image unitPrice description reviews');
//       res.status(200).json(products);
//     }
//   } catch (err) {
//     res
//       .status(500)
//       .json({ message: 'Error getting all products', error: err.message });
//   }
// });

// desc - Update a product
// route - PUT /api/products/:id

const updateProduct = asyncHandler(async (req, res) => {
  console.log('Received update request for product:', req.params.id);
  console.log('Update data:', req.body);
  const product = await Product.findById(req.params.id);

  if (product) {
    product.name = req.body.name || product.name;
    product.brand = req.body.brand || product.brand;
    product.category = req.body.category || product.category;
    product.image = req.body.image || product.image;
    product.unitPrice = req.body.unitPrice || product.unitPrice;
    product.description = req.body.description || product.description;
    const updateProduct = await product.save();
    console.log('Product updated:', updateProduct);

    const populatedProduct = await Product.findById(updateProduct._id).populate(
      'brand',
      'name'
    );
    res.status(200).json(populatedProduct);
    console.log('updated product:', populatedProduct);
  } else {
    console.log('Product not found:', req.params.id);
    res.status(404);
    throw new Error('Product not found');
  }
});

// desc - Delete a product
// route - DELETE /api/products/:id

const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    await product.deleteOne();
    res.status(200).json({ message: 'Product deleted' });
  } else {
    res.status(404);
    throw new Error('Products not found');
  }
});

// desc - Create new review
// route - POST /api/products/:id/reviews

const createProductReview = asyncHandler(async (req, res) => {
  const { text, rating, user } = req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      res.status(400);
      throw new Error('Product already reviewd');
    }

    const review = {
      text,
      rating: Number(rating),
      user: req.user._id,
    };

    console.log(review);
    product.reviews.push(review);

    // Save the product
    await product.save();
    res.status(201).json({
      message: 'Review successfully added',
      numberOfReviews: product.numberOfReviews,
      averageRating: product.averageRating,
    });
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// desc - Get top products
// route - PUT /api/products/top-products

const getTopProducts = asyncHandler(async (req, res) => {
  //console.log('getTopProducts endpoint called');
  try {
    const products = await Product.find({}).sort({ rating: -1 }).limit(2);
    res.status(200).json(products);
  } catch (err) {
    console.log('Error fetching top products:', err.message);
    res
      .status(500)
      .json({ message: 'Error fetching top products', error: err.message });
  }
});

const getInHouseMadeProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ category: 'In-house-made-foods' })
    .select('name brand')
    .populate('brand', 'name');

  if (products) {
    res.json(products);
  } else {
    res.status(404);
    throw new Error('No in-house made products found');
  }
});

export {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  getTopProducts,
  getProductsByBrand,
  // getInHouseMadedFoods,
  getInHouseMadeProducts,
};
