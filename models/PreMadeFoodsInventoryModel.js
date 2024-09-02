import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      required: true,
      unique: true,
    },
    // brand: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: 'Brand',
    //   required: true,
    // },
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
    isAtReorderLevel: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

inventorySchema.methods.updateReorderStatus = function () {
  this.isAtReorderLevel = this.quantity <= this.reorderLevel;
};

inventorySchema.pre('save', function (next) {
  this.updateReorderStatus();
  next();
});

const PreMadeFoodsInventory = mongoose.model(
  'PreMadeFoodsInventory',
  inventorySchema
);

export default PreMadeFoodsInventory;
