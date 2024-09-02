import mongoose from 'mongoose';

const supplierQuantitySchema = new mongoose.Schema({
  product: {
    type: mongoose.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
});
const supplierSchema = new mongoose.Schema(
  {
    supplierName: {
      type: String,
      required: true,
    },
    supplierEmail: {
      type: String,
      required: true,
    },
    supplierAddress: {
      type: String,
      required: true,
    },
    supplierQuantity: [supplierQuantitySchema],
  },
  {
    timestamps: true,
  }
);

const Supplier = mongoose.model('Supplier', supplierSchema);

export default Supplier;
