import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['Pre-made-foods', 'Materials'],
    },
    quantityReceived: {
      type: Number,
      required: true,
    },
    unit: {
      type: String,
      required: true,
    },
    unitPrice: {
      type: Number,
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
  },
  { _id: false }
);

const grnSchema = new mongoose.Schema(
  {
    grnNumber: {
      type: String,
      required: true,
      unique: true,
    },
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier',
      required: true,
    },
    brand: {
      type: mongoose.Schema.Types.Mixed,
      ref: 'Brand',
      required: function () {
        return this.items.some((item) => item.category === 'Pre-made-foods');
      },
    },
    dateReceived: {
      type: Date,
      required: true,
      default: Date.now,
    },
    items: [itemSchema],
    status: {
      type: String,
      enum: ['Pending', 'Complete', 'Cancelled'],
      default: 'Pending',
    },
    notes: String,
  },
  {
    timestamps: true,
  }
);

const GRN = mongoose.model('GRN', grnSchema);

export default GRN;
