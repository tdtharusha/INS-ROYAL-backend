import mongoose from 'mongoose';

const materialsInventorySchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      required: true,
      unique: true,
    },
    quantity: {
      type: Number,
      required: true,
      default: 0,
    },
    unit: {
      type: String,
      required: true,
    },
    reorderLevel: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const MaterialsInventory = mongoose.model(
  'MaterialsInventory',
  materialsInventorySchema
);

export default MaterialsInventory;
