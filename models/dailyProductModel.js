import mongoose from 'mongoose';

const dailyProductSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      default: Date.now,
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Brand',
      required: true,
    },
    availableQuantity: {
      type: Number,
      required: true,
    },
    producedQuantity: {
      type: Number,
      default: 0,
    },
    defaultDailyQuantity: {
      type: Number,
      required: true,
    },
    unit: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const DailyProduct = mongoose.model('DailyProduct', dailyProductSchema);

export default DailyProduct;
