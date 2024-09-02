import mongoose from 'mongoose';

const inHouseMadeFoodsInventorySchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      required: true,
    },
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Brand',
      required: true,
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

const InHouseMadeFoodsInventory = mongoose.model(
  'InHouseMadeFoodsInventory',
  inHouseMadeFoodsInventorySchema
);

export default InHouseMadeFoodsInventory;
