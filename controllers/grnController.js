import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import GRN from '../models/grnModel.js';
import Supplier from '../models/suplierModel.js';
import Brand from '../models/brandModel.js';
import Product from '../models/productModel.js';
import generateGRNNumber from '../utils/generateGRNNumber.js';
import {
  updateInventoryFromGRN,
  decreaseInventoryItem,
} from './PreMadeFoodsInventoryController.js';
import {
  updateMaterialsInventoryFromGRN,
  decreaseMaterialsInventoryItem,
} from './MaterialsInventoryController.js';

// desc - Get suppliers, brands, and their associated product names
// route - GET /api/grn/suppliers-brands-products
const getSuppliersBrandsAndProducts = asyncHandler(async (req, res) => {
  const suppliers = await Supplier.find(
    {},
    '_id supplierName supplierQuantity'
  );

  const brands = await Brand.find({}, 'name productNames');
  res.json({ suppliers, brands });
});

// New function to get supplier quantity
const getSupplierQuantity = asyncHandler(async (req, res) => {
  const supplierId = req.params.supplierId;
  const supplier = await Supplier.findById(supplierId).populate(
    'supplierQuantity.product',
    'name'
  );
  if (!supplier) {
    return res.status(404).json({ message: 'Supplier not found' });
  }
  res.json(supplier.supplierQuantity);
});

// desc - create a GRN
// route - POST /api/grn
const createGRN = asyncHandler(async (req, res) => {
  try {
    const { supplier, brand, items, status, notes } = req.body;

    // Check supplier quantity
    const supplierData = await Supplier.findById(supplier).populate(
      'supplierQuantity.product',
      'name'
    );
    for (const item of items) {
      const supplierProduct = supplierData.supplierQuantity.find(
        (sq) => sq.product.name === item.productName
      );
      if (supplierProduct && item.quantityReceived > supplierProduct.quantity) {
        return res
          .status(400)
          .json({
            message: `Requested quantity for ${item.productName} exceeds supplier's available quantity.`,
          });
      }
    }

    // Generate GRN number
    const grnNumber = await generateGRNNumber();

    // Validate and get supplier
    if (!mongoose.Types.ObjectId.isValid(supplier)) {
      //console.log(supplier);
      return res.status(400).json({ message: 'Invalid supplier ID' });
    }
    const supplierExists = await Supplier.findById(supplier);
    try {
      if (!supplierExists) {
        return res.status(404).json({ message: 'Supplier not found' });
      }
    } catch {}

    // Validate brand only for Pre-made-foods
    if (items.some((item) => item.category === 'Pre-made-foods')) {
      if (!mongoose.Types.ObjectId.isValid(brand)) {
        return res
          .status(400)
          .json({ message: 'Invalid brand ID for Pre-made-foods' });
      }
      const brandExists = await Brand.findById(brand);
      if (!brandExists) {
        return res.status(404).json({ message: 'Brand not found' });
      }

      // Validate and process items for Pre-made-foods
      items.forEach((item) => {
        if (
          item.category === 'Pre-made-foods' &&
          !brandExists.productNames.includes(item.productName)
        ) {
          throw new Error(
            `Product "${item.productName}" is not associated with this brand`
          );
        }
      });
    } else if (typeof brand !== 'string') {
      return res
        .status(400)
        .json({ message: 'Brand should be a string for Materials' });
    }

    // Process items
    const processedItems = items.map((item) => ({
      ...item,
      totalPrice: item.quantityReceived * item.unitPrice,
    }));

    const newGRN = new GRN({
      grnNumber,
      supplier,
      brand,
      items: processedItems,
      status,
      notes,
    });

    const savedGRN = await newGRN.save();

    //update inventory based on category
    const preMadeFoodItems = processedItems.filter(
      (item) => item.category === 'Pre-made-foods'
    );

    const materialsItems = processedItems.filter(
      (item) => item.category === 'Materials'
    );

    if (preMadeFoodItems.length > 0) {
      await updateInventoryFromGRN(preMadeFoodItems);
    }

    if (materialsItems.length > 0) {
      await updateMaterialsInventoryFromGRN(materialsItems);
    }

    res.status(201).json(savedGRN);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// desc - Get all GRNs
// route - GET /api/grn
const getGRNs = asyncHandler(async (req, res) => {
  try {
    const grns = await GRN.find().populate('supplier', 'supplierName');

    // Manually handle brand population
    const populatedGRNs = await Promise.all(
      grns.map(async (grn) => {
        const grnObject = grn.toObject();
        if (mongoose.Types.ObjectId.isValid(grnObject.brand)) {
          const brand = await Brand.findById(grnObject.brand, 'name');
          grnObject.brand = brand;
        } else {
          grnObject.brand = { name: grnObject.brand };
        }
        return grnObject;
      })
    );

    res.status(200).json(populatedGRNs);
  } catch (err) {
    res.status(500).json({ message: 'Error getting GRNs', error: err.message });
  }
});

// desc - Get a single GRN by ID
// route - GET /api/grn/:id
const getGRNById = asyncHandler(async (req, res) => {
  try {
    const grn = await GRN.findById(req.params.id).populate(
      'supplier',
      'supplierName'
    );

    if (!grn) {
      return res.status(404).json({ message: 'GRN not found' });
    }

    const grnObject = grn.toObject();
    if (mongoose.Types.ObjectId.isValid(grnObject.brand)) {
      const brand = await Brand.findById(grnObject.brand, 'name');
      grnObject.brand = brand;
    } else {
      grnObject.brand = { name: grnObject.brand };
    }

    res.status(200).json(grnObject);
  } catch (err) {
    res.status(500).json({ message: 'Error getting GRN', error: err.message });
  }
});

// Update GRN
// route - PUT /api/grn/:id
const updateGRN = asyncHandler(async (req, res) => {
  try {
    const { items, status, notes } = req.body;
    const grn = await GRN.findById(req.params.id);

    if (!grn) {
      return res.status(404).json({ message: 'GRN not found' });
    }

    // Check if the GRN is already completed
    if (grn.status === 'Complete') {
      return res.status(400).json({ message: 'Cannot update a completed GRN' });
    }

    let processedItems = grn.items; // Initialize with current items

    if (items && items.length > 0) {
      // Validate items based on the existing GRN category and brand
      const hasPremadeFoods = items.some(
        (item) => item.category === 'Pre-made-foods'
      );

      // Validate brand only for Pre-made-foods
      if (hasPremadeFoods) {
        const brand = await Brand.findById(grn.brand);
        if (!brand) {
          return res
            .status(404)
            .json({ message: 'Associated brand not found' });
        }

        // Validate Pre-made-foods items against the existing brand
        for (const item of items) {
          if (
            item.category === 'Pre-made-foods' &&
            !brand.productNames.includes(item.productName)
          ) {
            return res.status(400).json({
              message: `Product "${item.productName}" is not associated with the GRN's brand`,
            });
          }
        }
      }

      // Process items
      processedItems = items.map((item) => ({
        ...item,
        totalPrice: item.quantityReceived * item.unitPrice,
      }));

      grn.items = processedItems;
    }

    //if (totalAmount) grn.totalAmount = totalAmount;
    if (status) grn.status = status;
    if (notes) grn.notes = notes;

    const updatedGRN = await grn.save();

    // Update inventory based on category
    const preMadeFoodItems = processedItems.filter(
      (item) => item.category === 'Pre-made-foods'
    );
    const materialsItems = processedItems.filter(
      (item) => item.category === 'Materials'
    );

    if (preMadeFoodItems.length > 0) {
      await updateInventoryFromGRN(preMadeFoodItems);
    }
    if (materialsItems.length > 0) {
      await updateMaterialsInventoryFromGRN(materialsItems);
    }

    res.status(200).json(updatedGRN);
  } catch (err) {
    res.status(400).json({ message: 'Error Updating GRN', error: err.message });
  }
});

// desc - Delete a GRN
// route - DELET /api/grn/:id
const deleteGRN = asyncHandler(async (req, res) => {
  try {
    const grn = await GRN.findById(req.params.id);
    if (!grn) {
      return res.status(404).json({ message: 'GRN not found' });
    }

    // Check if the GRN status allows deletion
    if (grn.status === 'Complete') {
      return res.status(400).json({ message: 'Cannot delete a completed GRN' });
    }

    // Decrease inventory based on category
    const preMadeFoodItems = grn.items.filter(
      (item) => item.category === 'Pre-made-foods'
    );
    const materialsItems = grn.items.filter(
      (item) => item.category === 'Materials'
    );

    if (preMadeFoodItems.length > 0) {
      await decreaseInventoryItem(preMadeFoodItems);
    }
    if (materialsItems.length > 0) {
      await decreaseMaterialsInventoryItem(materialsItems);
    }

    await grn.deleteOne();
    res.status(200).json({ message: 'GRN deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting GRN', error: err.message });
  }
});

export {
  getSuppliersBrandsAndProducts,
  getSupplierQuantity,
  createGRN,
  getGRNs,
  getGRNById,
  updateGRN,
  deleteGRN,
};
