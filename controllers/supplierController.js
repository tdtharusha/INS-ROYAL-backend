import asyncHandler from 'express-async-handler';
import Supplier from '../models/suplierModel.js';

// desc - Get all suppliers
// route - Get /api/suppliers
const getAllSuppliers = asyncHandler(async (req, res) => {
  try {
    const suppliers = await Supplier.find();
    res.status(200).json(suppliers);
  } catch (err) {
    res
      .status(500)
      .json({ message: 'Error getting all suppliers', error: err.message });
  }
});

// desc - Get single supplier
// route - GET /api/suppliers/:id
const getSupplierById = asyncHandler(async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);

    if (!supplier) {
      res.status(404).json({ message: 'Supplier not found' });
    }
    res.status(200).json(supplier);
  } catch (err) {
    res
      .status(500)
      .json({ message: 'Error getting Supplier by ID', error: err.message });
  }
});

// desc - Register a new supplier
// route - POST /api/suppliers
const registerSupplier = asyncHandler(async (req, res) => {
  try {
    const { supplierName, supplierEmail, supplierAddress, supplierQuantity } =
      req.body;

    const existingSupplier = await Supplier.findById(req.params.id);
    if (existingSupplier) {
      return res.status(400).json({ message: 'Supplier already exists' });
    }

    //Create new supplier
    const newSupplier = new Supplier({
      supplierName,
      supplierEmail,
      supplierAddress,
      supplierQuantity,
    });

    //Save supplier
    const saveSupplier = await newSupplier.save();
    res.status(201).json(saveSupplier);
  } catch (err) {
    res
      .status(500)
      .json({ message: 'Error registering Supplier', error: err.message });
  }
});

// desc - Update a supplier
// route - PUT /api/suppliers/:id
const updateSupplier = asyncHandler(async (req, res) => {
  try {
    const { supplierName, supplierEmail, supplierAddress } = req.body;
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }
    supplier.supplierName = supplierName || supplier.supplierName;
    supplier.supplierEmail = supplierEmail || supplier.supplierEmail;
    supplier.supplierAddress = supplierAddress || supplier.supplierAddress;
    const updatedSupplier = await supplier.save();
    res.status(200).json(updatedSupplier);
  } catch (err) {
    res
      .status(500)
      .json({ message: 'Error updating Supplier', error: err.message });
  }
});

// desc - Delete a supplier
// route - DELETE /api/suppliers/:id

const deleteSupplier = asyncHandler(async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }
    await supplier.deleteOne();
    res.status(200).json({ message: 'Supplier deleted' });
  } catch (err) {
    res
      .status(500)
      .json({ message: 'Error deleting Supplier', error: err.message });
  }
});

export {
  getAllSuppliers,
  getSupplierById,
  registerSupplier,
  updateSupplier,
  deleteSupplier,
};
